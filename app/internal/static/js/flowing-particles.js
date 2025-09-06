/**
 * Flowing Particles - Simple continuous animation
 * Particles that constantly flow across the screen
 */

(function() {
    'use strict';

    class FlowingParticles {
        constructor() {
            this.particles = [];
            this.particleCount = 50; // Fewer particles for better performance
            this.canvas = null;
            this.ctx = null;
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            
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
                opacity: 0.5;
            `;
            document.body.insertBefore(this.canvas, document.body.firstChild);
            
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            
            // Initialize particles with different speeds and directions
            for (let i = 0; i < this.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 1, // Constant horizontal velocity
                    vy: (Math.random() - 0.5) * 1, // Constant vertical velocity
                    size: Math.random() * 3 + 1,
                    alpha: Math.random() * 0.5 + 0.3
                });
            }
            
            // Event listeners
            window.addEventListener('resize', () => this.resize());
            
            // Start animation
            this.animate();
        }

        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        }

        updateParticles() {
            this.particles.forEach(particle => {
                // Simple constant movement
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around screen edges
                if (particle.x < -50) particle.x = this.width + 50;
                if (particle.x > this.width + 50) particle.x = -50;
                if (particle.y < -50) particle.y = this.height + 50;
                if (particle.y > this.height + 50) particle.y = -50;
                
                // Slowly change alpha for twinkling effect
                particle.alpha += (Math.random() - 0.5) * 0.02;
                particle.alpha = Math.max(0.1, Math.min(0.8, particle.alpha));
            });
        }

        render() {
            // Clear canvas with solid black
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Draw particles
            this.particles.forEach(particle => {
                // Draw particle with glow
                const gradient = this.ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 4
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.alpha})`);
                gradient.addColorStop(0.5, `rgba(255, 255, 255, ${particle.alpha * 0.5})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw bright core
                this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha * 1.5})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            
            // Draw connections between nearby particles
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 0.5;
            
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const dx = this.particles[i].x - this.particles[j].x;
                    const dy = this.particles[i].y - this.particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 150) {
                        this.ctx.globalAlpha = (1 - distance / 150) * 0.2;
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                        this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                        this.ctx.stroke();
                    }
                }
            }
            
            this.ctx.globalAlpha = 1;
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
            window.flowingParticles = new FlowingParticles();
        });
    } else {
        window.flowingParticles = new FlowingParticles();
    }
})();