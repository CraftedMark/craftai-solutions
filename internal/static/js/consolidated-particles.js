/**
 * CraftAI Solutions - Consolidated Particle System
 * Single, optimized particle animation for background effect
 * Version: 2025-08-11
 */

(function() {
    'use strict';

    class ParticleSystem {
        constructor(options = {}) {
            this.options = {
                particleCount: options.particleCount || 50,
                maxSpeed: options.maxSpeed || 1,
                minSpeed: options.minSpeed || 0.3,
                particleSize: options.particleSize || 2,
                opacity: options.opacity || 0.4,
                color: options.color || 'rgba(96, 165, 250, 0.8)',
                connectionDistance: options.connectionDistance || 120,
                showConnections: options.showConnections || true,
                enableMouse: options.enableMouse || true,
                mouseRadius: options.mouseRadius || 150,
                enableResize: options.enableResize || true,
                fps: options.fps || 60,
                ...options
            };

            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.mouse = { x: null, y: null };
            this.animationId = null;
            this.lastTime = 0;
            this.frameInterval = 1000 / this.options.fps;
            
            // Performance monitoring
            this.frameCount = 0;
            this.lastFPSUpdate = 0;
            this.currentFPS = 0;
            
            this.init();
        }

        init() {
            this.createCanvas();
            this.setupEventListeners();
            this.createParticles();
            this.startAnimation();
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
                opacity: ${this.options.opacity};
            `;
            this.canvas.id = 'particles-canvas';
            
            // Insert at the beginning of body to ensure it's behind everything
            document.body.insertBefore(this.canvas, document.body.firstChild);
            
            this.ctx = this.canvas.getContext('2d');
            this.resize();
        }

        setupEventListeners() {
            if (this.options.enableResize) {
                window.addEventListener('resize', this.debounce(() => {
                    this.resize();
                    this.createParticles(); // Recreate particles on resize
                }, 250));
            }

            if (this.options.enableMouse) {
                window.addEventListener('mousemove', (e) => {
                    this.mouse.x = e.clientX;
                    this.mouse.y = e.clientY;
                });

                window.addEventListener('mouseleave', () => {
                    this.mouse.x = null;
                    this.mouse.y = null;
                });
            }

            // Pause animation when page is not visible (performance optimization)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseAnimation();
                } else {
                    this.resumeAnimation();
                }
            });
        }

        resize() {
            const dpr = window.devicePixelRatio || 1;
            const rect = this.canvas.getBoundingClientRect();
            
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            
            this.ctx.scale(dpr, dpr);
            
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
            
            this.width = rect.width;
            this.height = rect.height;
        }

        createParticles() {
            this.particles = [];
            
            // Adjust particle count based on screen size (performance optimization)
            let particleCount = this.options.particleCount;
            if (window.innerWidth < 768) {
                particleCount = Math.floor(particleCount * 0.5); // Reduce particles on mobile
            } else if (window.innerWidth < 1024) {
                particleCount = Math.floor(particleCount * 0.75); // Reduce particles on tablet
            }

            for (let i = 0; i < particleCount; i++) {
                this.particles.push(this.createParticle());
            }
        }

        createParticle() {
            const speed = this.random(this.options.minSpeed, this.options.maxSpeed);
            const angle = this.random(0, Math.PI * 2);
            
            return {
                x: this.random(0, this.width),
                y: this.random(0, this.height),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: this.random(1, this.options.particleSize),
                opacity: this.random(0.3, 1),
                originalSize: this.random(1, this.options.particleSize)
            };
        }

        updateParticles() {
            this.particles.forEach(particle => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Wrap around screen edges
                if (particle.x > this.width) particle.x = 0;
                if (particle.x < 0) particle.x = this.width;
                if (particle.y > this.height) particle.y = 0;
                if (particle.y < 0) particle.y = this.height;

                // Mouse interaction
                if (this.options.enableMouse && this.mouse.x !== null && this.mouse.y !== null) {
                    const dx = this.mouse.x - particle.x;
                    const dy = this.mouse.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < this.options.mouseRadius) {
                        const force = (this.options.mouseRadius - distance) / this.options.mouseRadius;
                        const angle = Math.atan2(dy, dx);
                        
                        // Attract particles to mouse (gentle effect)
                        particle.vx += Math.cos(angle) * force * 0.01;
                        particle.vy += Math.sin(angle) * force * 0.01;
                        
                        // Scale particle based on proximity
                        particle.size = particle.originalSize * (1 + force * 0.5);
                        particle.opacity = Math.min(1, particle.opacity + force * 0.2);
                    } else {
                        // Return to normal size and velocity
                        particle.size = this.lerp(particle.size, particle.originalSize, 0.05);
                        particle.opacity = this.lerp(particle.opacity, 0.6, 0.02);
                        
                        // Slight damping to prevent infinite acceleration
                        particle.vx *= 0.99;
                        particle.vy *= 0.99;
                    }
                }

                // Keep velocities within bounds
                const maxVel = this.options.maxSpeed;
                particle.vx = Math.max(-maxVel, Math.min(maxVel, particle.vx));
                particle.vy = Math.max(-maxVel, Math.min(maxVel, particle.vy));
            });
        }

        drawParticles() {
            this.ctx.fillStyle = this.options.color;
            
            this.particles.forEach(particle => {
                this.ctx.globalAlpha = particle.opacity;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            
            this.ctx.globalAlpha = 1;
        }

        drawConnections() {
            if (!this.options.showConnections) return;

            this.ctx.strokeStyle = this.options.color;
            this.ctx.lineWidth = 0.5;

            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const dx = this.particles[i].x - this.particles[j].x;
                    const dy = this.particles[i].y - this.particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < this.options.connectionDistance) {
                        const opacity = (1 - distance / this.options.connectionDistance) * 0.3;
                        this.ctx.globalAlpha = opacity;
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                        this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                        this.ctx.stroke();
                    }
                }
            }
            
            this.ctx.globalAlpha = 1;
        }

        render() {
            // Clear canvas
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            // Update and draw particles
            this.updateParticles();
            this.drawConnections();
            this.drawParticles();
            
            // Update FPS counter
            this.updateFPS();
        }

        updateFPS() {
            this.frameCount++;
            const now = Date.now();
            
            if (now - this.lastFPSUpdate >= 1000) {
                this.currentFPS = this.frameCount;
                this.frameCount = 0;
                this.lastFPSUpdate = now;
                
                // Optional: Log FPS for debugging (remove in production)
                if (this.options.debug) {
                    console.log(`Particle System FPS: ${this.currentFPS}`);
                }
            }
        }

        animate(currentTime) {
            if (!this.canvas || !this.ctx) return;

            // Frame rate limiting
            if (currentTime - this.lastTime >= this.frameInterval) {
                this.render();
                this.lastTime = currentTime;
            }

            this.animationId = requestAnimationFrame((time) => this.animate(time));
        }

        startAnimation() {
            if (this.animationId) return; // Already running
            this.animationId = requestAnimationFrame((time) => this.animate(time));
        }

        pauseAnimation() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }

        resumeAnimation() {
            if (!this.animationId) {
                this.startAnimation();
            }
        }

        destroy() {
            this.pauseAnimation();
            
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
            
            // Remove event listeners
            window.removeEventListener('resize', this.resize);
            window.removeEventListener('mousemove', this.handleMouseMove);
            window.removeEventListener('mouseleave', this.handleMouseLeave);
        }

        // Utility functions
        random(min, max) {
            return Math.random() * (max - min) + min;
        }

        lerp(start, end, factor) {
            return start + (end - start) * factor;
        }

        debounce(func, wait) {
            let timeout;
            return function executedFunction() {
                const later = () => {
                    clearTimeout(timeout);
                    func.apply(this, arguments);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    }

    // Initialize particle system when DOM is ready
    function initParticleSystem() {
        // Check if user prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            console.log('Particle system disabled: user prefers reduced motion');
            return;
        }

        // Check if device has limited resources (basic performance check)
        const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
        const isSlowConnection = navigator.connection && navigator.connection.effectiveType === 'slow-2g';
        
        const particleOptions = {
            particleCount: isLowEndDevice ? 30 : 50,
            maxSpeed: 1,
            minSpeed: 0.3,
            particleSize: 2,
            opacity: 0.4,
            color: 'rgba(96, 165, 250, 0.8)',
            connectionDistance: isLowEndDevice ? 100 : 120,
            showConnections: !isSlowConnection,
            enableMouse: !isLowEndDevice,
            mouseRadius: 150,
            fps: isLowEndDevice ? 30 : 60,
            debug: false // Set to true for FPS logging
        };

        // Create the particle system
        window.particleSystem = new ParticleSystem(particleOptions);
        
        console.log('Particle system initialized with', particleOptions.particleCount, 'particles');
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initParticleSystem);
    } else {
        initParticleSystem();
    }

    // Expose ParticleSystem class globally for external use
    window.ParticleSystem = ParticleSystem;

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        if (window.particleSystem && window.particleSystem.destroy) {
            window.particleSystem.destroy();
        }
    });

})();