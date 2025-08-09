/**
 * WebGL Gravity Animation Background
 * Simulates gravitational particle system with white particles on black background
 */

class WebGLGravityBackground {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.particles = [];
        this.particleCount = 2000; // More particles for better effect
        this.time = 0;
        this.mouse = { x: 0.5, y: 0.5 };
        this.gravityPoints = [];
        
        this.init();
    }
    
    init() {
        // Create canvas
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
        
        // Get WebGL context
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.warn('WebGL not supported, falling back to canvas');
            this.fallbackAnimation();
            return;
        }
        
        // Setup WebGL
        this.setupGL();
        this.initParticles();
        this.initGravityPoints();
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.resize());
        this.resize();
        
        // Track mouse for interaction
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX / window.innerWidth;
            this.mouse.y = 1.0 - (e.clientY / window.innerHeight);
        });
    }
    
    setupGL() {
        const gl = this.gl;
        
        // Vertex shader - handles particle positions
        const vertexShaderSource = `
            precision mediump float;
            
            attribute vec2 a_position;
            attribute vec2 a_velocity;
            attribute float a_size;
            attribute float a_life;
            
            uniform vec2 u_resolution;
            uniform float u_time;
            
            varying float v_life;
            
            void main() {
                // Convert to clip space
                vec2 clipSpace = ((a_position / u_resolution) * 2.0 - 1.0) * vec2(1, -1);
                
                gl_Position = vec4(clipSpace, 0, 1);
                
                // Particle size with slight pulsing
                gl_PointSize = a_size * (1.0 + sin(u_time * 0.001) * 0.1) * a_life;
                v_life = a_life;
            }
        `;
        
        // Fragment shader - white particles with glow
        const fragmentShaderSource = `
            precision mediump float;
            
            varying float v_life;
            
            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                
                if (dist > 0.5) {
                    discard;
                }
                
                // Soft white glow
                float alpha = (1.0 - dist * 2.0) * v_life;
                alpha = alpha * alpha; // Make edges softer
                
                // Pure white particles
                gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.7);
            }
        `;
        
        // Create and compile shaders
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
        
        // Enable blending for transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // Additive blending for glow effect
        
        // Clear color - pure black
        gl.clearColor(0, 0, 0, 1);
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
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        for (let i = 0; i < this.particleCount; i++) {
            // Random position in a circle pattern
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * Math.min(width, height) * 0.5;
            
            this.particles.push({
                x: width / 2 + Math.cos(angle) * radius,
                y: height / 2 + Math.sin(angle) * radius,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 0.5,
                life: Math.random()
            });
        }
    }
    
    initGravityPoints() {
        // Create multiple gravity centers
        this.gravityPoints = [
            { x: 0.5, y: 0.5, strength: 1.0, radius: 0.3 },  // Center
            { x: 0.2, y: 0.3, strength: 0.5, radius: 0.2 },  // Top left
            { x: 0.8, y: 0.7, strength: 0.5, radius: 0.2 },  // Bottom right
        ];
    }
    
    updateParticles() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const damping = 0.99; // Friction
        
        this.particles.forEach(particle => {
            // Apply gravity from fixed points
            this.gravityPoints.forEach(point => {
                const dx = point.x * width - particle.x;
                const dy = point.y * height - particle.y;
                const distSq = dx * dx + dy * dy;
                const dist = Math.sqrt(distSq);
                
                if (dist > 5 && dist < point.radius * width) {
                    const force = point.strength * 50 / distSq;
                    particle.vx += (dx / dist) * force;
                    particle.vy += (dy / dist) * force;
                }
            });
            
            // Apply mouse gravity (weaker)
            const mouseDx = this.mouse.x * width - particle.x;
            const mouseDy = this.mouse.y * height - particle.y;
            const mouseDistSq = mouseDx * mouseDx + mouseDy * mouseDy;
            const mouseDist = Math.sqrt(mouseDistSq);
            
            if (mouseDist > 10 && mouseDist < 200) {
                const mouseForce = 30 / mouseDistSq;
                particle.vx += (mouseDx / mouseDist) * mouseForce;
                particle.vy += (mouseDy / mouseDist) * mouseForce;
            }
            
            // Apply damping
            particle.vx *= damping;
            particle.vy *= damping;
            
            // Limit velocity
            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            if (speed > 5) {
                particle.vx = (particle.vx / speed) * 5;
                particle.vy = (particle.vy / speed) * 5;
            }
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges smoothly
            if (particle.x < -50) particle.x = width + 50;
            if (particle.x > width + 50) particle.x = -50;
            if (particle.y < -50) particle.y = height + 50;
            if (particle.y > height + 50) particle.y = -50;
            
            // Update life (fade in and out)
            particle.life -= 0.001;
            if (particle.life <= 0) {
                particle.life = 1;
                // Respawn at random edge
                const edge = Math.floor(Math.random() * 4);
                switch(edge) {
                    case 0: // top
                        particle.x = Math.random() * width;
                        particle.y = -20;
                        break;
                    case 1: // right
                        particle.x = width + 20;
                        particle.y = Math.random() * height;
                        break;
                    case 2: // bottom
                        particle.x = Math.random() * width;
                        particle.y = height + 20;
                        break;
                    case 3: // left
                        particle.x = -20;
                        particle.y = Math.random() * height;
                        break;
                }
                particle.vx = (Math.random() - 0.5) * 0.5;
                particle.vy = (Math.random() - 0.5) * 0.5;
            }
        });
    }
    
    render() {
        const gl = this.gl;
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Create arrays for WebGL
        const positions = [];
        const velocities = [];
        const sizes = [];
        const lives = [];
        
        this.particles.forEach(particle => {
            positions.push(particle.x, particle.y);
            velocities.push(particle.vx, particle.vy);
            sizes.push(particle.size);
            lives.push(particle.life);
        });
        
        // Set uniforms
        const resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
        const timeLocation = gl.getUniformLocation(this.program, 'u_time');
        
        gl.uniform2f(resolutionLocation, window.innerWidth, window.innerHeight);
        gl.uniform1f(timeLocation, this.time);
        
        // Set attributes
        this.setVertexAttribute('a_position', new Float32Array(positions), 2);
        this.setVertexAttribute('a_velocity', new Float32Array(velocities), 2);
        this.setVertexAttribute('a_size', new Float32Array(sizes), 1);
        this.setVertexAttribute('a_life', new Float32Array(lives), 1);
        
        // Draw
        gl.drawArrays(gl.POINTS, 0, this.particles.length);
    }
    
    setVertexAttribute(name, data, size) {
        const gl = this.gl;
        const location = gl.getAttribLocation(this.program, name);
        
        if (location === -1) return;
        
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    }
    
    animate() {
        this.time++;
        this.updateParticles();
        this.render();
        requestAnimationFrame(() => this.animate());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        if (this.gl) {
            this.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
        }
    }
    
    fallbackAnimation() {
        // Simple canvas fallback for browsers without WebGL
        const ctx = this.canvas.getContext('2d');
        const particles = [];
        
        for (let i = 0; i < 200; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 0.5
            });
        }
        
        const animateFallback = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
            
            particles.forEach(particle => {
                // Simple gravity toward center
                const dx = window.innerWidth / 2 - particle.x;
                const dy = window.innerHeight / 2 - particle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 10) {
                    particle.vx += (dx / dist) * 0.05;
                    particle.vy += (dy / dist) * 0.05;
                }
                
                particle.vx *= 0.99;
                particle.vy *= 0.99;
                
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around
                if (particle.x < 0) particle.x = window.innerWidth;
                if (particle.x > window.innerWidth) particle.x = 0;
                if (particle.y < 0) particle.y = window.innerHeight;
                if (particle.y > window.innerHeight) particle.y = 0;
                
                // Draw white particle
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            requestAnimationFrame(animateFallback);
        };
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        animateFallback();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new WebGLGravityBackground();
});