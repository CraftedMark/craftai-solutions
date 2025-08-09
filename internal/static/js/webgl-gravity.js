/**
 * WebGL Gravity Animation Background
 * Creates an interactive particle system with gravity effects
 */

class WebGLGravityBackground {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.particles = [];
        this.particleCount = 500;
        this.time = 0;
        this.mouse = { x: 0.5, y: 0.5 };
        this.attractors = [];
        
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
        this.initAttractors();
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
        
        // Vertex shader
        const vertexShaderSource = `
            precision mediump float;
            
            attribute vec2 a_position;
            attribute vec2 a_velocity;
            attribute float a_size;
            attribute float a_life;
            
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;
            
            varying float v_life;
            
            void main() {
                vec2 position = a_position;
                
                // Apply gravity towards mouse
                vec2 toMouse = u_mouse - position;
                float dist = length(toMouse);
                vec2 gravity = normalize(toMouse) * (0.001 / (dist * dist + 0.1));
                
                // Update position with velocity and gravity
                position += a_velocity * 0.01 + gravity;
                
                // Convert to clip space
                vec2 clipSpace = ((position / u_resolution) * 2.0 - 1.0) * vec2(1, -1);
                
                gl_Position = vec4(clipSpace, 0, 1);
                gl_PointSize = a_size * (1.0 + sin(u_time * 0.001) * 0.2) * a_life;
                v_life = a_life;
            }
        `;
        
        // Fragment shader
        const fragmentShaderSource = `
            precision mediump float;
            
            varying float v_life;
            uniform float u_time;
            
            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                
                if (dist > 0.5) {
                    discard;
                }
                
                float alpha = (1.0 - dist * 2.0) * v_life * 0.8;
                
                // Color gradient based on life and time
                vec3 color1 = vec3(0.2, 0.5, 1.0); // Blue
                vec3 color2 = vec3(0.5, 0.2, 0.9); // Purple
                vec3 color3 = vec3(0.9, 0.3, 0.4); // Red
                
                float t = sin(u_time * 0.001 + v_life * 3.14159) * 0.5 + 0.5;
                vec3 color = mix(color1, mix(color2, color3, t), v_life);
                
                gl_FragColor = vec4(color, alpha);
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
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        
        // Clear color
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
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                life: Math.random()
            });
        }
    }
    
    initAttractors() {
        // Create gravity points
        this.attractors = [
            { x: 0.25, y: 0.25, strength: 0.5 },
            { x: 0.75, y: 0.25, strength: 0.5 },
            { x: 0.5, y: 0.75, strength: 0.8 }
        ];
    }
    
    updateParticles() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.particles.forEach(particle => {
            // Apply gravity from attractors
            this.attractors.forEach(attractor => {
                const dx = attractor.x * width - particle.x;
                const dy = attractor.y * height - particle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 10) {
                    const force = attractor.strength / (dist * 0.01);
                    particle.vx += (dx / dist) * force;
                    particle.vy += (dy / dist) * force;
                }
            });
            
            // Apply mouse gravity
            const mouseDx = this.mouse.x * width - particle.x;
            const mouseDy = this.mouse.y * height - particle.y;
            const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
            
            if (mouseDist > 10 && mouseDist < 200) {
                const mouseForce = 2.0 / (mouseDist * 0.01);
                particle.vx += (mouseDx / mouseDist) * mouseForce;
                particle.vy += (mouseDy / mouseDist) * mouseForce;
            }
            
            // Apply friction
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = width;
            if (particle.x > width) particle.x = 0;
            if (particle.y < 0) particle.y = height;
            if (particle.y > height) particle.y = 0;
            
            // Update life
            particle.life -= 0.002;
            if (particle.life <= 0) {
                particle.life = 1;
                particle.x = Math.random() * width;
                particle.y = Math.random() * height;
                particle.vx = (Math.random() - 0.5) * 2;
                particle.vy = (Math.random() - 0.5) * 2;
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
        const mouseLocation = gl.getUniformLocation(this.program, 'u_mouse');
        
        gl.uniform2f(resolutionLocation, window.innerWidth, window.innerHeight);
        gl.uniform1f(timeLocation, this.time);
        gl.uniform2f(mouseLocation, this.mouse.x * window.innerWidth, this.mouse.y * window.innerHeight);
        
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
        
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1
            });
        }
        
        const animateFallback = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
            
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
                if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;
                
                ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
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