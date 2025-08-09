/**
 * Three.js Gravity Simulation
 * Based on webgl-shaders.com gravity example
 */

(function() {
    'use strict';

    // Configuration
    const PARTICLE_COUNT = 5000;
    const GRAVITY_CONSTANT = 0.001;
    const DAMPING = 0.995;

    class GravitySimulation {
        constructor() {
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.particles = null;
            this.particleSystem = null;
            this.mouse = new THREE.Vector2(0, 0);
            this.attractors = [];
            this.time = 0;
            
            this.init();
        }

        init() {
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

            // Initialize Three.js
            this.initThree();
            this.createParticles();
            this.createAttractors();
            this.animate();

            // Event listeners
            window.addEventListener('resize', () => this.onResize(), false);
            document.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        }

        initThree() {
            // Scene
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.Fog(0x000000, 1, 1000);

            // Camera
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                1,
                10000
            );
            this.camera.position.z = 500;

            // Renderer
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: false,
                alpha: true 
            });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setClearColor(0x000000, 1);
            this.container.appendChild(this.renderer.domElement);
        }

        createParticles() {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(PARTICLE_COUNT * 3);
            const velocities = new Float32Array(PARTICLE_COUNT * 3);
            const colors = new Float32Array(PARTICLE_COUNT * 3);
            const sizes = new Float32Array(PARTICLE_COUNT);

            // Initialize particle data
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const i3 = i * 3;
                
                // Random position in sphere
                const radius = Math.random() * 400;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                
                positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i3 + 2] = radius * Math.cos(phi);
                
                // Random velocity
                velocities[i3] = (Math.random() - 0.5) * 0.1;
                velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
                velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
                
                // White color
                colors[i3] = 1.0;
                colors[i3 + 1] = 1.0;
                colors[i3 + 2] = 1.0;
                
                // Random size
                sizes[i] = Math.random() * 3 + 1;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

            // Store velocities for physics
            this.velocities = velocities;

            // Particle material with glow
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    fogColor: { value: new THREE.Color(0x000000) },
                    fogNear: { value: 1 },
                    fogFar: { value: 1000 }
                },
                vertexShader: `
                    attribute float size;
                    varying vec3 vColor;
                    varying float vOpacity;
                    
                    void main() {
                        vColor = color;
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        float depth = -mvPosition.z;
                        vOpacity = 1.0 - smoothstep(200.0, 600.0, depth);
                        gl_PointSize = size * (300.0 / depth);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    uniform vec3 fogColor;
                    varying vec3 vColor;
                    varying float vOpacity;
                    
                    void main() {
                        vec2 xy = gl_PointCoord.xy - vec2(0.5);
                        float r = dot(xy, xy);
                        if (r > 0.25) discard;
                        
                        float opacity = (1.0 - smoothstep(0.0, 0.25, r)) * vOpacity;
                        gl_FragColor = vec4(vColor, opacity);
                    }
                `,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true,
                vertexColors: true
            });

            this.particleSystem = new THREE.Points(geometry, material);
            this.scene.add(this.particleSystem);
        }

        createAttractors() {
            // Create invisible attractor points
            this.attractors = [
                { position: new THREE.Vector3(0, 0, 0), strength: 2.0 },
                { position: new THREE.Vector3(200, 100, 0), strength: 1.0 },
                { position: new THREE.Vector3(-200, -100, 0), strength: 1.0 },
                { position: new THREE.Vector3(0, 200, 100), strength: 0.8 },
                { position: new THREE.Vector3(0, -200, -100), strength: 0.8 }
            ];
        }

        updatePhysics() {
            const positions = this.particleSystem.geometry.attributes.position.array;
            const mouseAttractor = new THREE.Vector3(
                this.mouse.x * 400,
                this.mouse.y * 300,
                0
            );

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const i3 = i * 3;
                const px = positions[i3];
                const py = positions[i3 + 1];
                const pz = positions[i3 + 2];
                
                let fx = 0, fy = 0, fz = 0;
                
                // Apply gravity from attractors
                this.attractors.forEach(attractor => {
                    const dx = attractor.position.x - px;
                    const dy = attractor.position.y - py;
                    const dz = attractor.position.z - pz;
                    const distSq = dx * dx + dy * dy + dz * dz + 10; // Avoid singularity
                    const dist = Math.sqrt(distSq);
                    const force = (attractor.strength * GRAVITY_CONSTANT * 1000) / distSq;
                    
                    fx += (dx / dist) * force;
                    fy += (dy / dist) * force;
                    fz += (dz / dist) * force;
                });
                
                // Mouse attractor
                const mdx = mouseAttractor.x - px;
                const mdy = mouseAttractor.y - py;
                const mdz = mouseAttractor.z - pz;
                const mdistSq = mdx * mdx + mdy * mdy + mdz * mdz + 10;
                const mdist = Math.sqrt(mdistSq);
                if (mdist < 300) {
                    const mforce = (GRAVITY_CONSTANT * 500) / mdistSq;
                    fx += (mdx / mdist) * mforce;
                    fy += (mdy / mdist) * mforce;
                    fz += (mdz / mdist) * mforce;
                }
                
                // Update velocity
                this.velocities[i3] += fx;
                this.velocities[i3 + 1] += fy;
                this.velocities[i3 + 2] += fz;
                
                // Apply damping
                this.velocities[i3] *= DAMPING;
                this.velocities[i3 + 1] *= DAMPING;
                this.velocities[i3 + 2] *= DAMPING;
                
                // Limit velocity
                const speed = Math.sqrt(
                    this.velocities[i3] * this.velocities[i3] +
                    this.velocities[i3 + 1] * this.velocities[i3 + 1] +
                    this.velocities[i3 + 2] * this.velocities[i3 + 2]
                );
                if (speed > 5) {
                    this.velocities[i3] = (this.velocities[i3] / speed) * 5;
                    this.velocities[i3 + 1] = (this.velocities[i3 + 1] / speed) * 5;
                    this.velocities[i3 + 2] = (this.velocities[i3 + 2] / speed) * 5;
                }
                
                // Update position
                positions[i3] += this.velocities[i3];
                positions[i3 + 1] += this.velocities[i3 + 1];
                positions[i3 + 2] += this.velocities[i3 + 2];
                
                // Boundary check - wrap around
                const boundary = 600;
                if (positions[i3] > boundary) positions[i3] = -boundary;
                if (positions[i3] < -boundary) positions[i3] = boundary;
                if (positions[i3 + 1] > boundary) positions[i3 + 1] = -boundary;
                if (positions[i3 + 1] < -boundary) positions[i3 + 1] = boundary;
                if (positions[i3 + 2] > boundary) positions[i3 + 2] = -boundary;
                if (positions[i3 + 2] < -boundary) positions[i3 + 2] = boundary;
            }
            
            this.particleSystem.geometry.attributes.position.needsUpdate = true;
        }

        animate() {
            requestAnimationFrame(() => this.animate());
            
            this.time += 0.01;
            
            // Update physics
            this.updatePhysics();
            
            // Rotate camera slightly for depth
            this.camera.position.x = Math.sin(this.time * 0.1) * 50;
            this.camera.position.y = Math.cos(this.time * 0.1) * 50;
            this.camera.lookAt(this.scene.position);
            
            // Update shader uniforms
            this.particleSystem.material.uniforms.time.value = this.time;
            
            // Render
            this.renderer.render(this.scene, this.camera);
        }

        onResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        onMouseMove(event) {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }
    }

    // Load Three.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = function() {
        // Initialize simulation when Three.js is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.gravitySimulation = new GravitySimulation();
            });
        } else {
            window.gravitySimulation = new GravitySimulation();
        }
    };
    document.head.appendChild(script);
})();