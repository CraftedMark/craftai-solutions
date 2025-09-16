/**
 * Polish Interactions - Professional refinements for CraftAI website
 * Smooth animations, counters, and enhanced user experience
 */

(function() {
    'use strict';

    // ==========================================
    // Smooth Counter Animation
    // ==========================================

    class SmoothCounter {
        constructor(element, target, duration = 2000) {
            this.element = element;
            this.target = parseInt(target);
            this.duration = duration;
            this.startTime = null;
            this.started = false;
        }

        start() {
            if (this.started) return;
            this.started = true;
            this.element.setAttribute('data-counting', 'true');
            this.animate();
        }

        animate() {
            if (!this.startTime) this.startTime = Date.now();

            const progress = Math.min((Date.now() - this.startTime) / this.duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
            const current = Math.floor(this.target * easeOut);

            // Handle percentage vs regular numbers
            const suffix = this.element.textContent.includes('%') ? '%' :
                          this.element.textContent.includes('+') ? '+' : '';

            this.element.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(() => this.animate());
            } else {
                this.element.textContent = this.target + suffix;
                this.element.removeAttribute('data-counting');
            }
        }
    }

    // ==========================================
    // Intersection Observer for Animations
    // ==========================================

    const observerOptions = {
        threshold: 0.2,
        rootMargin: '50px'
    };

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add revealed class for animations
                entry.target.classList.add('revealed');

                // Start counter if it's a stat number
                if (entry.target.classList.contains('stat-number')) {
                    const text = entry.target.textContent;
                    const number = parseInt(text.replace(/\D/g, ''));
                    if (number && !entry.target.hasAttribute('data-counted')) {
                        entry.target.setAttribute('data-counted', 'true');
                        const counter = new SmoothCounter(entry.target, number);
                        counter.start();
                    }
                }

                // Stop observing after animation
                if (!entry.target.hasAttribute('data-repeat-animation')) {
                    animationObserver.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);

    // ==========================================
    // Smooth Scroll Enhancement
    // ==========================================

    function enhanceSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 80; // Account for fixed header
                    const targetPosition = target.offsetTop - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without jumping
                    history.pushState(null, null, href);
                }
            });
        });
    }

    // ==========================================
    // Parallax Effects for Hero
    // ==========================================

    function initParallax() {
        const parallaxElements = document.querySelectorAll('[data-depth]');

        if (parallaxElements.length === 0) return;

        let ticking = false;

        function updateParallax() {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const depth = element.getAttribute('data-depth');
                const movement = -(scrolled * depth);
                const translate3d = `translate3d(0, ${movement}px, 0)`;

                element.style.transform = translate3d;
            });

            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick);
    }

    // ==========================================
    // Enhanced Hover Effects
    // ==========================================

    function initHoverEffects() {
        // 3D tilt effect for cards
        const cards = document.querySelectorAll('.project-card, .service-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ==========================================
    // Stagger Animation for Grid Items
    // ==========================================

    function initStaggerAnimations() {
        const grids = document.querySelectorAll('.projects-grid, .services-grid');

        grids.forEach(grid => {
            const items = grid.querySelectorAll('.project-card, .service-card');
            items.forEach((item, index) => {
                item.style.setProperty('--card-index', index);
            });
        });
    }

    // ==========================================
    // Fix Service Links
    // ==========================================

    function fixServiceLinks() {
        document.querySelectorAll('.service-link').forEach(link => {
            if (link.getAttribute('href') === '#') {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Scroll to contact section instead
                    const contactSection = document.querySelector('#contact');
                    if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            }
        });
    }

    // ==========================================
    // Loading State Management
    // ==========================================

    function initLoadingState() {
        // Add loading class to body
        document.body.classList.add('is-loading');

        // Remove loading class when everything is loaded
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.classList.remove('is-loading');
                document.body.classList.add('is-loaded');

                // Start observing elements for animations
                document.querySelectorAll('.reveal-up, .stat-number').forEach(el => {
                    animationObserver.observe(el);
                });
            }, 100);
        });
    }

    // ==========================================
    // Performance Monitoring
    // ==========================================

    function monitorPerformance() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                // Log performance metrics
                if (window.performance && performance.timing) {
                    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    console.log(`🚀 Page load time: ${loadTime}ms`);
                }
            });
        }
    }

    // ==========================================
    // Accessibility Enhancements
    // ==========================================

    function enhanceAccessibility() {
        // Add keyboard navigation for cards
        document.querySelectorAll('.project-card, .service-card').forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'article');

            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });

        // Announce dynamic content changes
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);
    }

    // ==========================================
    // Initialize Everything
    // ==========================================

    function init() {
        // Core enhancements
        enhanceSmoothScroll();
        initParallax();
        initHoverEffects();
        initStaggerAnimations();
        fixServiceLinks();
        initLoadingState();
        enhanceAccessibility();

        // Performance monitoring in development
        if (window.location.hostname === 'localhost') {
            monitorPerformance();
        }

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause animations when tab is not visible
                document.querySelectorAll('[data-animating]').forEach(el => {
                    el.style.animationPlayState = 'paused';
                });
            } else {
                // Resume animations
                document.querySelectorAll('[data-animating]').forEach(el => {
                    el.style.animationPlayState = 'running';
                });
            }
        });

        console.log('✨ Polish interactions initialized');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();