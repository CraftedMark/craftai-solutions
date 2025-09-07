/**
 * EXCEPTIONAL INTERACTIONS
 * Premium animations and interactions for award-winning experience
 */

(function() {
    'use strict';

    // 1. SMOOTH SCROLL WITH LENIS-LIKE EFFECT
    class SmoothScroll {
        constructor() {
            this.current = 0;
            this.target = 0;
            this.ease = 0.075;
            this.rafId = null;
            this.init();
        }

        init() {
            // Prevent native smooth scroll
            document.documentElement.style.scrollBehavior = 'auto';
            
            // Listen for scroll events
            window.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
            window.addEventListener('touchmove', this.onTouchMove.bind(this));
            
            // Start animation loop
            this.animate();
        }

        onWheel(e) {
            e.preventDefault();
            this.target += e.deltaY * 0.5;
            this.target = Math.max(0, Math.min(this.target, document.body.scrollHeight - window.innerHeight));
        }

        onTouchMove(e) {
            // Handle touch scrolling
        }

        animate() {
            this.current += (this.target - this.current) * this.ease;
            window.scrollTo(0, this.current);
            
            // Continue animation
            this.rafId = requestAnimationFrame(this.animate.bind(this));
        }
    }

    // 2. NUMBER COUNT-UP ANIMATION
    class CountUp {
        constructor(element) {
            this.element = element;
            this.target = parseInt(element.textContent);
            this.current = 0;
            this.duration = 2000;
            this.startTime = null;
            this.suffix = element.textContent.replace(/[0-9]/g, '');
            this.observed = false;
        }

        start() {
            if (this.observed) return;
            this.observed = true;
            this.startTime = performance.now();
            this.animate();
        }

        animate() {
            const now = performance.now();
            const progress = Math.min((now - this.startTime) / this.duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            this.current = Math.floor(this.target * easeOutQuart);
            
            this.element.textContent = this.current + this.suffix;
            
            if (progress < 1) {
                requestAnimationFrame(this.animate.bind(this));
            }
        }
    }

    // 3. MAGNETIC CURSOR EFFECT
    class MagneticCursor {
        constructor() {
            this.buttons = document.querySelectorAll('.btn-primary, button[type="submit"]');
            this.init();
        }

        init() {
            this.buttons.forEach(button => {
                button.addEventListener('mousemove', this.magnetize.bind(this));
                button.addEventListener('mouseleave', this.reset.bind(this));
            });
        }

        magnetize(e) {
            const button = e.currentTarget;
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.02)`;
        }

        reset(e) {
            e.currentTarget.style.transform = '';
        }
    }

    // 4. STAGGERED REVEAL ANIMATIONS
    class RevealAnimations {
        constructor() {
            this.elements = document.querySelectorAll('.service-card, .work-card, .capability-card, .reveal-up, .reveal-scale');
            this.init();
        }

        init() {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry, index) => {
                        if (entry.isIntersecting) {
                            setTimeout(() => {
                                entry.target.classList.add('active');
                            }, index * 100);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.1, rootMargin: '50px' }
            );

            this.elements.forEach(el => observer.observe(el));
        }
    }

    // 5. PARALLAX SCROLLING
    class ParallaxEffect {
        constructor() {
            this.elements = document.querySelectorAll('[data-parallax]');
            this.init();
        }

        init() {
            window.addEventListener('scroll', this.updateParallax.bind(this));
            this.updateParallax();
        }

        updateParallax() {
            const scrolled = window.pageYOffset;
            
            this.elements.forEach(el => {
                const speed = el.dataset.parallax || 0.5;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        }
    }

    // 6. INTERACTIVE PARTICLE RESPONSE
    class ParticleInteraction {
        constructor() {
            this.canvas = document.getElementById('gravity-canvas');
            if (!this.canvas) return;
            
            this.init();
        }

        init() {
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        }

        handleMouseMove(e) {
            // Send mouse position to particle system
            if (window.particleSystem) {
                window.particleSystem.mouseX = e.clientX;
                window.particleSystem.mouseY = e.clientY;
            }
        }
    }

    // 7. ENHANCED NAVIGATION
    class Navigation {
        constructor() {
            this.navbar = document.querySelector('.navbar');
            this.lastScroll = 0;
            this.init();
        }

        init() {
            window.addEventListener('scroll', this.handleScroll.bind(this));
        }

        handleScroll() {
            const currentScroll = window.pageYOffset;
            
            // Add scrolled class
            if (currentScroll > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
            
            // Hide/show on scroll
            if (currentScroll > this.lastScroll && currentScroll > 100) {
                this.navbar.style.transform = 'translateY(-100%)';
            } else {
                this.navbar.style.transform = 'translateY(0)';
            }
            
            this.lastScroll = currentScroll;
        }
    }

    // 8. TEXT SCRAMBLE EFFECT
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }

        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }

        update() {
            let output = '';
            let complete = 0;
            
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span class="scramble">${char}</span>`;
                } else {
                    output += from;
                }
            }
            
            this.el.innerHTML = output;
            
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }

        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }

    // 9. LOADING ANIMATION
    class LoadingAnimation {
        constructor() {
            this.createLoader();
        }

        createLoader() {
            const loader = document.createElement('div');
            loader.className = 'loading-overlay';
            loader.innerHTML = '<div class="loading-spinner"></div>';
            document.body.appendChild(loader);
            
            // Remove loader when page is ready
            window.addEventListener('load', () => {
                setTimeout(() => {
                    loader.classList.add('hidden');
                    setTimeout(() => loader.remove(), 500);
                }, 500);
            });
        }
    }

    // 10. CURSOR GLOW EFFECT
    class CursorGlow {
        constructor() {
            this.glow = document.createElement('div');
            this.glow.className = 'cursor-glow';
            this.glow.style.cssText = `
                position: fixed;
                width: 400px;
                height: 400px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 0;
                background: radial-gradient(circle, rgba(96, 165, 250, 0.03), transparent);
                transition: opacity 0.3s ease;
                opacity: 0;
            `;
            document.body.appendChild(this.glow);
            this.init();
        }

        init() {
            document.addEventListener('mousemove', (e) => {
                this.glow.style.left = e.clientX - 200 + 'px';
                this.glow.style.top = e.clientY - 200 + 'px';
                this.glow.style.opacity = '1';
            });

            document.addEventListener('mouseleave', () => {
                this.glow.style.opacity = '0';
            });
        }
    }

    // INITIALIZE ALL FEATURES
    document.addEventListener('DOMContentLoaded', function() {
        // Core features
        // new SmoothScroll(); // Uncomment for smooth scroll
        new Navigation();
        new RevealAnimations();
        new MagneticCursor();
        new ParallaxEffect();
        new ParticleInteraction();
        new CursorGlow();
        new LoadingAnimation();

        // Count-up animations
        const counters = document.querySelectorAll('.metric-value');
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    new CountUp(entry.target).start();
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));

        // Text scramble for hero title
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const scramble = new TextScramble(heroTitle);
            setTimeout(() => {
                scramble.setText(heroTitle.textContent);
            }, 500);
        }

        // Add data attributes for parallax
        document.querySelectorAll('.hero-section').forEach(el => {
            el.setAttribute('data-parallax', '0.3');
        });

        // Enhanced hover effects for cards
        document.querySelectorAll('.service-card, .work-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
            });
        });

        // Smooth anchor scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offset = 80;
                    const targetPosition = target.offsetTop - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        console.log('🚀 Exceptional interactions initialized');
    });

})();