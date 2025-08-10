/**
 * Colored Gravity Particle System
 * Beautiful colored particles with gravity physics for site background
 */

(function() {
    'use strict';

    class ColoredGravitySystem {
        constructor() {
            this.particles = [];
            const isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) || window.innerWidth < 768;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const BASE_COUNT = isMobile ? 220 : 520;
            this.particleCount = Math.floor(BASE_COUNT / dpr);
            if (prefersReducedMotion) this.particleCount = Math.floor(this.particleCount * 0.6);
            this.canvas = null;
            this.ctx = null;
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.mouse = { x: this.width / 2, y: this.height / 2 };
            this.gravityPoints = [];
            this.scrollOffset = 0;
            this.lastScrollPosition = 0;
            
            // Color palettes
            this.colors = [
                { r: 59, g: 130, b: 246 },   // Blue
                { r: 168, g: 85, b: 247 },   // Purple
                { r: 236, g: 72, b: 153 },   // Pink
                { r: 34, g: 197, b: 94 },    // Green
                { r: 251, g: 146, b: 60 },   // Orange
                { r: 99, g: 102, b: 241 },   // Indigo
                { r: 250, g: 204, b: 21 }    // Yellow
            ];
            
            this.init();
        }

        init() {
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'gravity-background-canvas';
            this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                pointer-events: none;
            `;
            document.body.insertBefore(this.canvas, document.body.firstChild);
            
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            
            // Initialize gravity points - more distributed for better coverage
            this.gravityPoints = [
                { x: this.width * 0.5, y: this.height * 0.2, strength: 45 },
                { x: this.width * 0.2, y: this.height * 0.4, strength: 40 },
                { x: this.width * 0.8, y: this.height * 0.4, strength: 40 },
                { x: this.width * 0.5, y: this.height * 0.5, strength: 50 },  // Center point
                { x: this.width * 0.3, y: this.height * 0.7, strength: 45 },
                { x: this.width * 0.7, y: this.height * 0.7, strength: 45 },
                { x: this.width * 0.5, y: this.height * 0.9, strength: 40 }
            ];
            
            // Initialize particles with colors
            for (let i = 0; i < this.particleCount; i++) {
                const color = this.colors[Math.floor(Math.random() * this.colors.length)];
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    size: Math.random() * 1.2 + 0.4,
                    alpha: Math.random() * 0.3 + 0.2,
                    color: color,
                    targetColor: color,
                    colorTransition: 0
                });
            }
            
            // Event listeners
            window.addEventListener('resize', () => this.resize());
            document.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            
            // Scroll listener for parallax effect
            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                const scrollDelta = currentScroll - this.lastScrollPosition;
                this.lastScrollPosition = currentScroll;
                this.scrollOffset = scrollDelta * 0.3;
            });
            
            // Touch support
            document.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    this.mouse.x = e.touches[0].clientX;
                    this.mouse.y = e.touches[0].clientY;
                }
            });
            
            // Start animation
            this.animate();
        }

        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            
            // Update gravity points with better distribution
            if (this.gravityPoints.length > 0) {
                this.gravityPoints[0] = { x: this.width * 0.5, y: this.height * 0.2, strength: 45 };
                this.gravityPoints[1] = { x: this.width * 0.2, y: this.height * 0.4, strength: 40 };
                this.gravityPoints[2] = { x: this.width * 0.8, y: this.height * 0.4, strength: 40 };
                this.gravityPoints[3] = { x: this.width * 0.5, y: this.height * 0.5, strength: 50 };
                this.gravityPoints[4] = { x: this.width * 0.3, y: this.height * 0.7, strength: 45 };
                this.gravityPoints[5] = { x: this.width * 0.7, y: this.height * 0.7, strength: 45 };
                this.gravityPoints[6] = { x: this.width * 0.5, y: this.height * 0.9, strength: 40 };
            }
        }

        updateParticles() {
            const damping = 0.99;
            const mouseStrength = 80;
            const maxSpeed = 3;
            
            this.particles.forEach((particle, index) => {
                // Apply gravity from fixed points
                this.gravityPoints.forEach(point => {
                    const dx = point.x - particle.x;
                    const dy = point.y - particle.y;
                    const distSq = dx * dx + dy * dy;
                    const dist = Math.sqrt(distSq);
                    
                    if (dist > 10 && dist < 800) {  // Increased range for better coverage
                        const force = (point.strength * 0.7) / (distSq + 100);  // Reduced overall pull to lower activity
                        particle.vx += (dx / dist) * force;
                        particle.vy += (dy / dist) * force;
                    }
                });
                
                // Mouse attraction
                const mdx = this.mouse.x - particle.x;
                const mdy = this.mouse.y - particle.y;
                const mdistSq = mdx * mdx + mdy * mdy;
                const mdist = Math.sqrt(mdistSq);
                
                if (mdist > 5 && mdist < 200) {
                    const mforce = mouseStrength / mdistSq;
                    particle.vx += (mdx / mdist) * mforce;
                    particle.vy += (mdy / mdist) * mforce;
                    
                    // Change color when near mouse
                    if (mdist < 100) {
                        particle.targetColor = this.colors[(index + Math.floor(Date.now() / 1000)) % this.colors.length];
                        particle.colorTransition = 1;
                    }
                }
                
                // Add slight random drift to prevent dead zones
                particle.vx += (Math.random() - 0.5) * 0.05;
                particle.vy += (Math.random() - 0.5) * 0.05;
                
                // Apply scroll offset
                particle.vy -= this.scrollOffset * 0.5;
                
                // Apply damping
                particle.vx *= damping;
                particle.vy *= damping;
                
                // Limit speed
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                if (speed > maxSpeed) {
                    particle.vx = (particle.vx / speed) * maxSpeed;
                    particle.vy = (particle.vy / speed) * maxSpeed;
                }
                
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges
                if (particle.x < -50) particle.x = this.width + 50;
                if (particle.x > this.width + 50) particle.x = -50;
                if (particle.y < -50) particle.y = this.height + 50;
                if (particle.y > this.height + 50) particle.y = -50;
                
                // Fade in/out
                particle.alpha += (Math.random() - 0.5) * 0.006;
                particle.alpha = Math.max(0.2, Math.min(0.8, particle.alpha));
                
                // Color transition
                if (particle.colorTransition > 0) {
                    particle.colorTransition -= 0.02;
                    particle.color = {
                        r: particle.color.r + (particle.targetColor.r - particle.color.r) * 0.05,
                        g: particle.color.g + (particle.targetColor.g - particle.color.g) * 0.05,
                        b: particle.color.b + (particle.targetColor.b - particle.color.b) * 0.05
                    };
                }
            });
            
            // Decay scroll offset
            this.scrollOffset *= 0.95;
        }

        render() {
            // Clear canvas with slight fade for trails
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Draw particles with glow effect
            this.particles.forEach(particle => {
                const { r, g, b } = particle.color;
                
                // Outer glow
                this.ctx.globalAlpha = particle.alpha * 0.2;
                this.ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Inner particle
                this.ctx.globalAlpha = particle.alpha;
                this.ctx.fillStyle = `rgb(${Math.floor(r * 1.2)}, ${Math.floor(g * 1.2)}, ${Math.floor(b * 1.2)})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            
            this.ctx.globalAlpha = 1;
        }

        animate() {
            this.updateParticles();
            this.render();
            requestAnimationFrame(() => this.animate());
        }

        // Method to temporarily boost particle activity
        boost() {
            this.particles.forEach(particle => {
                particle.vx += (Math.random() - 0.5) * 10;
                particle.vy += (Math.random() - 0.5) * 10;
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.coloredGravitySystem = new ColoredGravitySystem();
            
            // Remove old gravity systems if they exist
            if (window.gpuGravitySimulation) {
                if (window.gpuGravitySimulation.destroy) {
                    window.gpuGravitySimulation.destroy();
                }
                window.gpuGravitySimulation = null;
            }
            
            // Remove any existing gravity containers
            const oldContainers = document.querySelectorAll('.gpu-gravity-container');
            oldContainers.forEach(container => container.remove());
        });
    } else {
        window.coloredGravitySystem = new ColoredGravitySystem();
        
        // Remove old gravity systems
        if (window.gpuGravitySimulation) {
            if (window.gpuGravitySimulation.destroy) {
                window.gpuGravitySimulation.destroy();
            }
            window.gpuGravitySimulation = null;
        }
        
        const oldContainers = document.querySelectorAll('.gpu-gravity-container');
        oldContainers.forEach(container => container.remove());
    }
})();