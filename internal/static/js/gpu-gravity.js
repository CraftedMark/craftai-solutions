/**
 * GPU-Computed Gravity Simulation
 * Matches webgl-shaders.com/gravity-example.html implementation
 * Uses Three.js with GPUComputationRenderer for texture-based physics
 */

(function() {
    'use strict';

    // Configuration optimized for performance
    const CONFIG = {
        textureWidth: 48,  // 48x48 = 2304 particles on desktop (optimized)
        mobileTextureWidth: 24,  // 24x24 = 576 particles on mobile (optimized)
        particleSize: 2.5,  // Slightly larger for better visibility
        gravityConstant: 100.0,
        damping: 0.985,  // Slightly less damping for smoother motion
        targetFPS: 60  // Target frame rate
    };

    class GPUGravitySimulation {
        constructor() {
            this.renderer = null;
            this.scene = null;
            this.camera = null;
            this.gpuCompute = null;
            this.particleSystem = null;
            this.positionVariable = null;
            this.velocityVariable = null;
            this.particleUniforms = null;
            this.effectController = {
                gravityConstant: CONFIG.gravityConstant,
                damping: CONFIG.damping
            };
            this.mouse = new THREE.Vector2(0, 0);
            this.raycaster = new THREE.Raycaster();
            this.scrollOffset = 0;
            this.lastScrollPosition = 0;
            
            this.init();
        }

        init() {
            // Check for mobile
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            this.textureWidth = isMobile ? CONFIG.mobileTextureWidth : CONFIG.textureWidth;
            this.particleCount = this.textureWidth * this.textureWidth;

            // Create container
            this.container = document.createElement('div');
            this.container.className = 'gpu-gravity-container';
            this.container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 0;
                background: #000000;
                pointer-events: none;
            `;
            document.body.insertBefore(this.container, document.body.firstChild);

            this.initThree();
            this.initComputeRenderer();
            this.initParticles();
            
            window.addEventListener('resize', () => this.onWindowResize(), false);
            document.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
            document.addEventListener('touchmove', (e) => this.onTouchMove(e), false);
            window.addEventListener('scroll', (e) => this.onScroll(e), false);
            
            this.animate();
        }

        initThree() {
            // Camera
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 5, 15000);
            this.camera.position.z = 800;

            // Scene
            this.scene = new THREE.Scene();

            // Renderer
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: false,
                alpha: false
            });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setClearColor(0x000000, 1);
            this.container.appendChild(this.renderer.domElement);
        }

        initComputeRenderer() {
            this.gpuCompute = new THREE.GPUComputationRenderer(this.textureWidth, this.textureWidth, this.renderer);

            if (this.renderer.capabilities.isWebGL2 === false) {
                this.gpuCompute.setDataType(THREE.HalfFloatType);
            }

            // Create position and velocity textures
            const dtPosition = this.gpuCompute.createTexture();
            const dtVelocity = this.gpuCompute.createTexture();
            
            this.fillPositionTexture(dtPosition);
            this.fillVelocityTexture(dtVelocity);

            // Add position variable
            this.positionVariable = this.gpuCompute.addVariable(
                'texturePosition',
                this.getPositionShader(),
                dtPosition
            );
            this.positionVariable.material.uniforms['textureVelocity'] = { value: null };
            this.positionVariable.wrapS = THREE.RepeatWrapping;
            this.positionVariable.wrapT = THREE.RepeatWrapping;

            // Add velocity variable
            this.velocityVariable = this.gpuCompute.addVariable(
                'textureVelocity',
                this.getVelocityShader(),
                dtVelocity
            );
            this.velocityVariable.material.uniforms['texturePosition'] = { value: null };
            this.velocityVariable.material.uniforms['gravityConstant'] = { value: CONFIG.gravityConstant };
            this.velocityVariable.material.uniforms['damping'] = { value: CONFIG.damping };
            this.velocityVariable.material.uniforms['mousePos'] = { value: new THREE.Vector3(0, 0, 0) };
            this.velocityVariable.material.uniforms['scrollOffset'] = { value: 0.0 };
            this.velocityVariable.wrapS = THREE.RepeatWrapping;
            this.velocityVariable.wrapT = THREE.RepeatWrapping;

            // Add dependencies
            this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable]);
            this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable]);

            const error = this.gpuCompute.init();
            if (error !== null) {
                console.error('GPU Compute Error:', error);
            }
        }

        fillPositionTexture(texture) {
            const data = texture.image.data;
            
            for (let i = 0, l = data.length; i < l; i += 4) {
                // Distribute particles across entire viewport
                const spread = 800;
                data[i + 0] = (Math.random() - 0.5) * spread;
                data[i + 1] = (Math.random() - 0.5) * spread;
                data[i + 2] = (Math.random() - 0.5) * spread * 0.5;
                data[i + 3] = 1;
            }
        }

        fillVelocityTexture(texture) {
            const data = texture.image.data;
            
            for (let i = 0, l = data.length; i < l; i += 4) {
                data[i + 0] = (Math.random() - 0.5) * 0.1;
                data[i + 1] = (Math.random() - 0.5) * 0.1;
                data[i + 2] = (Math.random() - 0.5) * 0.1;
                data[i + 3] = 0;
            }
        }

        getPositionShader() {
            return `
                uniform float delta;
                
                void main() {
                    vec2 uv = gl_FragCoord.xy / resolution.xy;
                    vec4 tmpPos = texture2D(texturePosition, uv);
                    vec3 pos = tmpPos.xyz;
                    vec4 tmpVel = texture2D(textureVelocity, uv);
                    vec3 vel = tmpVel.xyz;
                    
                    pos += vel * delta;
                    
                    gl_FragColor = vec4(pos, 1.0);
                }
            `;
        }

        getVelocityShader() {
            return `
                uniform float gravityConstant;
                uniform float damping;
                uniform vec3 mousePos;
                uniform float scrollOffset;
                
                const float width = resolution.x;
                const float height = resolution.y;
                
                void main() {
                    vec2 uv = gl_FragCoord.xy / resolution.xy;
                    float idParticle = uv.y * width + uv.x;
                    
                    vec4 tmpPos = texture2D(texturePosition, uv);
                    vec3 pos = tmpPos.xyz;
                    vec4 tmpVel = texture2D(textureVelocity, uv);
                    vec3 vel = tmpVel.xyz;
                    
                    // Multiple gravity points
                    vec3 gravity1 = vec3(0.0, 0.0, 0.0);
                    vec3 gravity2 = vec3(300.0, 200.0, 0.0);
                    vec3 gravity3 = vec3(-300.0, -200.0, 0.0);
                    vec3 gravity4 = vec3(-200.0, 300.0, 0.0);
                    vec3 gravity5 = vec3(200.0, -300.0, 0.0);
                    
                    // Apply gravity from multiple points
                    vec3 gravityPoints[5];
                    gravityPoints[0] = gravity1;
                    gravityPoints[1] = gravity2;
                    gravityPoints[2] = gravity3;
                    gravityPoints[3] = gravity4;
                    gravityPoints[4] = gravity5;
                    
                    for (int i = 0; i < 5; i++) {
                        vec3 direction = gravityPoints[i] - pos;
                        float dist = length(direction);
                        if (dist > 0.01 && dist < 1000.0) {
                            direction = normalize(direction);
                            float force = gravityConstant / (dist * dist + 50.0);
                            vel += direction * force;
                        }
                    }
                    
                    // Mouse attraction
                    vec3 mouseDir = mousePos - pos;
                    float mouseDist = length(mouseDir);
                    if (mouseDist < 300.0 && mouseDist > 0.01) {
                        mouseDir = normalize(mouseDir);
                        float mouseGravity = gravityConstant * 3.0 / (mouseDist * mouseDist + 10.0);
                        vel += mouseDir * mouseGravity;
                    }
                    
                    // Add scroll effect
                    vel.y += scrollOffset * 50.0;
                    
                    // Apply damping
                    vel *= damping;
                    
                    // Limit velocity
                    float speed = length(vel);
                    if (speed > 15.0) {
                        vel = normalize(vel) * 15.0;
                    }
                    
                    gl_FragColor = vec4(vel, 0.0);
                }
            `;
        }

        initParticles() {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(this.particleCount * 3);
            const uvs = new Float32Array(this.particleCount * 2);
            
            let p = 0;
            for (let j = 0; j < this.textureWidth; j++) {
                for (let i = 0; i < this.textureWidth; i++) {
                    uvs[p++] = i / (this.textureWidth - 1);
                    uvs[p++] = j / (this.textureWidth - 1);
                }
            }
            
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
            
            // Particle shader material
            this.particleUniforms = {
                texturePosition: { value: null },
                cameraConstant: { value: this.getCameraConstant() },
                particleSize: { value: CONFIG.particleSize }
            };
            
            const material = new THREE.ShaderMaterial({
                uniforms: this.particleUniforms,
                vertexShader: this.getParticleVertexShader(),
                fragmentShader: this.getParticleFragmentShader(),
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true
            });
            
            this.particleSystem = new THREE.Points(geometry, material);
            this.particleSystem.matrixAutoUpdate = false;
            this.particleSystem.updateMatrix();
            
            this.scene.add(this.particleSystem);
        }

        getParticleVertexShader() {
            return `
                uniform sampler2D texturePosition;
                uniform float cameraConstant;
                uniform float particleSize;
                
                varying float vDistance;
                
                void main() {
                    vec4 posTemp = texture2D(texturePosition, uv);
                    vec3 pos = posTemp.xyz;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    vDistance = -mvPosition.z;
                    
                    gl_PointSize = particleSize * cameraConstant / vDistance;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `;
        }

        getParticleFragmentShader() {
            return `
                varying float vDistance;
                
                void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    
                    if (dist > 0.5) {
                        discard;
                    }
                    
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    alpha *= 1.0 - smoothstep(100.0, 600.0, vDistance);
                    
                    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
                }
            `;
        }

        getCameraConstant() {
            return window.innerHeight / (Math.tan(THREE.MathUtils.DEG2RAD * 0.5 * this.camera.fov));
        }

        animate() {
            requestAnimationFrame(() => this.animate());
            this.render();
        }

        render() {
            // Update GPU computation
            this.gpuCompute.compute();
            
            // Update particle positions from GPU texture
            this.particleUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
            
            // Update mouse position in velocity shader
            const mouseWorld = new THREE.Vector3(
                (this.mouse.x * 2 - 1) * 300,
                (-this.mouse.y * 2 + 1) * 300,
                0
            );
            this.velocityVariable.material.uniforms.mousePos.value = mouseWorld;
            
            // Update scroll offset
            this.velocityVariable.material.uniforms.scrollOffset.value = this.scrollOffset;
            
            // Decay scroll offset
            this.scrollOffset *= 0.95;
            
            // Render scene
            this.renderer.render(this.scene, this.camera);
        }

        onWindowResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.particleUniforms.cameraConstant.value = this.getCameraConstant();
        }

        onMouseMove(event) {
            this.mouse.x = event.clientX / window.innerWidth;
            this.mouse.y = event.clientY / window.innerHeight;
        }

        onTouchMove(event) {
            if (event.touches.length === 1) {
                event.preventDefault();
                this.mouse.x = event.touches[0].pageX / window.innerWidth;
                this.mouse.y = event.touches[0].pageY / window.innerHeight;
            }
        }

        onScroll(event) {
            // Calculate scroll velocity
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            const scrollDelta = currentScroll - this.lastScrollPosition || 0;
            this.lastScrollPosition = currentScroll;
            
            // Smooth scroll offset
            this.scrollOffset = scrollDelta * 0.01;
        }
    }

    // Load Three.js and GPUComputationRenderer
    function loadScripts(callback) {
        // First load Three.js
        const threeScript = document.createElement('script');
        threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        threeScript.onload = function() {
            // Then load GPUComputationRenderer after Three.js is loaded
            const gpuScript = document.createElement('script');
            gpuScript.src = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/misc/GPUComputationRenderer.js';
            gpuScript.onload = function() {
                callback();
            };
            document.head.appendChild(gpuScript);
        };
        document.head.appendChild(threeScript);
    }

    // Initialize when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadScripts(() => {
                window.gpuGravitySimulation = new GPUGravitySimulation();
            });
        });
    } else {
        loadScripts(() => {
            window.gpuGravitySimulation = new GPUGravitySimulation();
        });
    }
})();