/**
 * WebGL Gravity Animation
 * Pure particle physics simulation with gravitational forces
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        particleCount: 4000,
        gravityStrength: 0.5,
        mouseInfluence: 100,
        particleSize: 2.5,
        fadeSpeed: 0.0003,
        velocityDamping: 0.995,
        maxVelocity: 3,
        respawnEdgeOffset: 100
    };

    class GravityParticleSystem {
        constructor() {
            this.canvas = null;
            this.gl = null;
            this.program = null;
            this.particles = [];
            this.time = 0;
            this.mouse = { x: 0, y: 0 };
            this.animationId = null;
            
            this.init();
        }

        init() {
            // Create and setup canvas
            this.createCanvas();
            
            // Initialize WebGL
            if (!this.initWebGL()) {
                console.warn('WebGL not supported');
                return;
            }
            
            // Setup shaders and particles
            this.setupShaders();
            this.initParticles();
            
            // Start animation
            this.animate();
            
            // Setup event listeners
            this.setupEventListeners();
        }

        createCanvas() {
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                pointer-events: none;
                background: #000000;
            `;
            document.body.insertBefore(this.canvas, document.body.firstChild);
            this.resize();
        }

        initWebGL() {
            this.gl = this.canvas.getContext('webgl', {
                alpha: true,
                antialias: false,
                depth: false,
                stencil: false,
                premultipliedAlpha: false
            });
            
            if (!this.gl) {
                this.gl = this.canvas.getContext('experimental-webgl');
            }
            
            if (!this.gl) {
                return false;
            }
            
            const gl = this.gl;
            
            // Set clear color to black
            gl.clearColor(0, 0, 0, 1);
            
            // Enable blending for particle transparency
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // Additive blending for glow
            
            return true;
        }

        setupShaders() {
            const gl = this.gl;
            
            // Vertex shader
            const vertexShaderSource = `
                attribute vec2 a_position;
                attribute float a_size;
                attribute float a_opacity;
                
                uniform vec2 u_resolution;
                
                varying float v_opacity;
                
                void main() {
                    vec2 position = (a_position / u_resolution) * 2.0 - 1.0;
                    position.y = -position.y;
                    
                    gl_Position = vec4(position, 0.0, 1.0);
                    gl_PointSize = a_size;
                    v_opacity = a_opacity;
                }
            `;
            
            // Fragment shader
            const fragmentShaderSource = `
                precision mediump float;
                
                varying float v_opacity;
                
                void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    
                    if (dist > 0.5) {
                        discard;
                    }
                    
                    // Smooth particle edge
                    float alpha = 1.0 - smoothstep(0.1, 0.5, dist);
                    alpha *= v_opacity;
                    
                    // Pure white color
                    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
                }
            `;
            
            // Create shaders
            const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
            
            // Create program
            this.program = gl.createProgram();
            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragmentShader);
            gl.linkProgram(this.program);
            
            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
                console.error('Unable to initialize shader program:', gl.getProgramInfoLog(this.program));
                return;
            }
            
            gl.useProgram(this.program);
            
            // Get attribute and uniform locations
            this.attributes = {
                position: gl.getAttribLocation(this.program, 'a_position'),
                size: gl.getAttribLocation(this.program, 'a_size'),
                opacity: gl.getAttribLocation(this.program, 'a_opacity')
            };
            
            this.uniforms = {
                resolution: gl.getUniformLocation(this.program, 'u_resolution')
            };
            
            // Enable attributes
            gl.enableVertexAttribArray(this.attributes.position);
            gl.enableVertexAttribArray(this.attributes.size);
            gl.enableVertexAttribArray(this.attributes.opacity);
        }

        createShader(type, source) {
            const gl = this.gl;
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            
            return shader;
        }

        initParticles() {
            const width = this.canvas.width;
            const height = this.canvas.height;
            
            this.particles = [];
            
            for (let i = 0; i < CONFIG.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    size: Math.random() * CONFIG.particleSize + 1,
                    opacity: Math.random(),
                    life: Math.random()
                });
            }
        }

        updateParticles(deltaTime) {
            const width = this.canvas.width;
            const height = this.canvas.height;
            const dt = Math.min(deltaTime * 0.01, 0.1); // Cap delta time
            
            // Gravity centers
            const gravityCenters = [
                { x: width * 0.5, y: height * 0.3, strength: 0.8 },
                { x: width * 0.2, y: height * 0.6, strength: 0.5 },
                { x: width * 0.8, y: height * 0.7, strength: 0.5 },
                { x: width * 0.5, y: height * 0.9, strength: 0.6 }
            ];
            
            this.particles.forEach(particle => {
                // Apply gravity from centers
                gravityCenters.forEach(center => {
                    const dx = center.x - particle.x;
                    const dy = center.y - particle.y;
                    const distSq = dx * dx + dy * dy;
                    const dist = Math.sqrt(distSq);
                    
                    if (dist > 10 && dist < width * 0.5) {
                        const force = (center.strength * CONFIG.gravityStrength * 1000) / distSq;
                        particle.vx += (dx / dist) * force * dt;
                        particle.vy += (dy / dist) * force * dt;
                    }
                });
                
                // Mouse influence
                if (this.mouse.x > 0 && this.mouse.y > 0) {
                    const dx = this.mouse.x - particle.x;
                    const dy = this.mouse.y - particle.y;
                    const distSq = dx * dx + dy * dy;
                    const dist = Math.sqrt(distSq);
                    
                    if (dist > 5 && dist < CONFIG.mouseInfluence) {
                        const force = 50 / distSq;
                        particle.vx += (dx / dist) * force * dt;
                        particle.vy += (dy / dist) * force * dt;
                    }
                }
                
                // Apply velocity damping
                particle.vx *= CONFIG.velocityDamping;
                particle.vy *= CONFIG.velocityDamping;
                
                // Limit velocity
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                if (speed > CONFIG.maxVelocity) {
                    particle.vx = (particle.vx / speed) * CONFIG.maxVelocity;
                    particle.vy = (particle.vy / speed) * CONFIG.maxVelocity;
                }
                
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges
                const edge = CONFIG.respawnEdgeOffset;
                if (particle.x < -edge) particle.x = width + edge;
                if (particle.x > width + edge) particle.x = -edge;
                if (particle.y < -edge) particle.y = height + edge;
                if (particle.y > height + edge) particle.y = -edge;
                
                // Update life and opacity
                particle.life -= CONFIG.fadeSpeed;
                if (particle.life <= 0) {
                    particle.life = 1;
                    particle.opacity = 1;
                    // Respawn at random position
                    particle.x = Math.random() * width;
                    particle.y = Math.random() * height;
                    particle.vx = (Math.random() - 0.5) * 2;
                    particle.vy = (Math.random() - 0.5) * 2;
                } else {
                    particle.opacity = particle.life;
                }
            });
        }

        render() {
            const gl = this.gl;
            
            // Clear canvas
            gl.clear(gl.COLOR_BUFFER_BIT);
            
            // Update uniforms
            gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
            
            // Prepare data arrays
            const positions = [];
            const sizes = [];
            const opacities = [];
            
            this.particles.forEach(particle => {
                positions.push(particle.x, particle.y);
                sizes.push(particle.size);
                opacities.push(particle.opacity);
            });
            
            // Update position attribute
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.attributes.position, 2, gl.FLOAT, false, 0, 0);
            
            // Update size attribute
            const sizeBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.attributes.size, 1, gl.FLOAT, false, 0, 0);
            
            // Update opacity attribute
            const opacityBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, opacityBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(opacities), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.attributes.opacity, 1, gl.FLOAT, false, 0, 0);
            
            // Draw particles
            gl.drawArrays(gl.POINTS, 0, this.particles.length);
        }

        animate() {
            let lastTime = performance.now();
            
            const frame = (currentTime) => {
                const deltaTime = currentTime - lastTime;
                lastTime = currentTime;
                
                this.time += deltaTime * 0.001;
                this.updateParticles(deltaTime);
                this.render();
                
                this.animationId = requestAnimationFrame(frame);
            };
            
            this.animationId = requestAnimationFrame(frame);
        }

        resize() {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            this.canvas.width = width;
            this.canvas.height = height;
            
            if (this.gl) {
                this.gl.viewport(0, 0, width, height);
            }
        }

        setupEventListeners() {
            // Window resize
            window.addEventListener('resize', () => this.resize());
            
            // Mouse movement
            document.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            
            // Touch movement for mobile
            document.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    this.mouse.x = e.touches[0].clientX;
                    this.mouse.y = e.touches[0].clientY;
                }
            });
        }

        destroy() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.gravityParticleSystem = new GravityParticleSystem();
        });
    } else {
        window.gravityParticleSystem = new GravityParticleSystem();
    }
})();