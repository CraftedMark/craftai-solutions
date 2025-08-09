/**
 * GPU-Computed Gravity Simulation
 * Matches webgl-shaders.com/gravity-example.html implementation
 * Uses Three.js with GPUComputationRenderer for texture-based physics
 */

(function() {
    'use strict';

    // Configuration matching reference
    const CONFIG = {
        textureWidth: 64,  // 64x64 = 4096 particles on desktop
        mobileTextureWidth: 32,  // 32x32 = 1024 particles on mobile
        particleSize: 2.0,
        gravityConstant: 100.0,
        damping: 0.99
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
            
            this.init();
        }

        init() {
            // Check for mobile
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            this.textureWidth = isMobile ? CONFIG.mobileTextureWidth : CONFIG.textureWidth;
            this.particleCount = this.textureWidth * this.textureWidth;

            // Create container
            this.container = document.createElement('div');
            this.container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
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
            
            this.animate();
        }

        initThree() {
            // Camera
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 5, 15000);
            this.camera.position.z = 500;

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
                // Spherical distribution like reference
                const radius = (0.5 + Math.random() * 0.5) * 200;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                
                data[i + 0] = radius * Math.sin(phi) * Math.cos(theta);
                data[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
                data[i + 2] = radius * Math.cos(phi);
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
                
                const float width = resolution.x;
                const float height = resolution.y;
                
                void main() {
                    vec2 uv = gl_FragCoord.xy / resolution.xy;
                    float idParticle = uv.y * width + uv.x;
                    
                    vec4 tmpPos = texture2D(texturePosition, uv);
                    vec3 pos = tmpPos.xyz;
                    vec4 tmpVel = texture2D(textureVelocity, uv);
                    vec3 vel = tmpVel.xyz;
                    
                    // Gravity to center
                    vec3 direction = normalize(-pos);
                    float distSquared = dot(pos, pos);
                    float gravity = gravityConstant / (distSquared + 10.0);
                    vel += direction * gravity;
                    
                    // Mouse attraction
                    vec3 mouseDir = mousePos - pos;
                    float mouseDist = length(mouseDir);
                    if (mouseDist < 200.0 && mouseDist > 0.01) {
                        mouseDir = normalize(mouseDir);
                        float mouseGravity = gravityConstant * 2.0 / (mouseDist * mouseDist + 10.0);
                        vel += mouseDir * mouseGravity;
                    }
                    
                    // Apply damping
                    vel *= damping;
                    
                    // Limit velocity
                    float speed = length(vel);
                    if (speed > 10.0) {
                        vel = normalize(vel) * 10.0;
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
    }

    // Load Three.js and GPUComputationRenderer
    function loadScripts(callback) {
        const scripts = [
            'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
            'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/misc/GPUComputationRenderer.js'
        ];
        
        let loaded = 0;
        scripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                loaded++;
                if (loaded === scripts.length) {
                    callback();
                }
            };
            document.head.appendChild(script);
        });
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