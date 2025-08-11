/**
 * Simple Gravity Particle System
 * A working implementation with visible particles
 */

(function() {
    'use strict';

    class SimpleGravitySystem {
        constructor() {
            this.particles = [];
            this.particleCount = 100; // Reduced for better performance
            this.canvas = null;
            this.ctx = null;
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.mouse = { x: this.width / 2, y: this.height / 2 };
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
                opacity: 0.6;
            `;
            document.body.insertBefore(this.canvas, document.body.firstChild);
            
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            
            // Initialize gravity points with stronger forces
            this.gravityPoints = [
                { x: this.width * 0.5, y: this.height * 0.3, strength: 200 },
                { x: this.width * 0.2, y: this.height * 0.6, strength: 150 },
                { x: this.width * 0.8, y: this.height * 0.7, strength: 150 },
                { x: this.width * 0.5, y: this.height * 0.8, strength: 180 }
            ];
            
            // Initialize particles with more initial velocity
            for (let i = 0; i < this.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 2, // More initial velocity
                    vy: (Math.random() - 0.5) * 2, // More initial velocity
                    size: Math.random() * 2 + 1, // Bigger particles
                    alpha: Math.random() * 0.3 + 0.7 // More visible
                });
            }
            
            // Event listeners
            window.addEventListener('resize', () => this.resize());
            document.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            
            // Start animation
            this.animate();
        }

        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            
            // Update gravity points
            if (this.gravityPoints.length > 0) {
                this.gravityPoints[0] = { x: this.width * 0.5, y: this.height * 0.3, strength: 80 };
                this.gravityPoints[1] = { x: this.width * 0.2, y: this.height * 0.6, strength: 60 };
                this.gravityPoints[2] = { x: this.width * 0.8, y: this.height * 0.7, strength: 60 };
                this.gravityPoints[3] = { x: this.width * 0.5, y: this.height * 0.8, strength: 70 };
            }
        }

        updateParticles() {
            const damping = 0.995; // Less damping to keep movement
            const mouseStrength = 200;
            const maxSpeed = 8; // Higher max speed
            
            this.particles.forEach(particle => {
                // Apply gravity from fixed points
                this.gravityPoints.forEach(point => {
                    const dx = point.x - particle.x;
                    const dy = point.y - particle.y;
                    const distSq = dx * dx + dy * dy;
                    const dist = Math.sqrt(distSq);
                    
                    if (dist > 10 && dist < 500) {
                        const force = point.strength / distSq;
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
                }
                
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
                if (particle.x < 0) particle.x = this.width;
                if (particle.x > this.width) particle.x = 0;
                if (particle.y < 0) particle.y = this.height;
                if (particle.y > this.height) particle.y = 0;
                
                // Fade in/out
                particle.alpha += (Math.random() - 0.5) * 0.01;
                particle.alpha = Math.max(0.2, Math.min(1, particle.alpha));
            });
        }

        render() {
            // Clear canvas with solid black
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Draw particles with glow effect
            this.particles.forEach(particle => {
                // Glow effect
                const gradient = this.ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 3
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.alpha})`);
                gradient.addColorStop(0.5, `rgba(255, 255, 255, ${particle.alpha * 0.5})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Core particle
                this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
        }

        animate() {
            this.updateParticles();
            this.render();
            requestAnimationFrame(() => this.animate());
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.simpleGravitySystem = new SimpleGravitySystem();
        });
    } else {
        window.simpleGravitySystem = new SimpleGravitySystem();
    }
})();