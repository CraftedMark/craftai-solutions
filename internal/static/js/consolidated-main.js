/**
 * CraftAI Solutions - Consolidated Main JavaScript
 * Core functionality, form handling, and base interactions
 * Version: 2025-08-11
 */

(function() {
    'use strict';

    // === UTILITY FUNCTIONS === //
    
    function debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // === CORE APPLICATION CLASS === //
    
    class CraftAIApp {
        constructor() {
            this.isInitialized = false;
            this.scrollElements = [];
            this.currentSection = 'top';
            
            this.init();
        }

        init() {
            if (this.isInitialized) return;
            
            this.bindEvents();
            this.initSmoothScroll();
            this.initScrollAnimations();
            this.initStickyHeader();
            this.initScrollProgress();
            this.initChaptersNavigation();
            this.initContactForm();
            this.initMobileMenu();
            
            this.isInitialized = true;
            console.log('CraftAI App initialized successfully');
        }

        bindEvents() {
            // Resize handler
            window.addEventListener('resize', debounce(this.handleResize.bind(this), 250));
            
            // Scroll handler
            window.addEventListener('scroll', throttle(this.handleScroll.bind(this), 16));
            
            // Load handler
            window.addEventListener('load', this.handleLoad.bind(this));
            
            // Focus management for accessibility
            document.addEventListener('keydown', this.handleKeydown.bind(this));
        }

        handleResize() {
            // Recalculate scroll elements on resize
            this.initScrollAnimations();
        }

        handleScroll() {
            this.updateScrollProgress();
            this.updateActiveSection();
            this.handleRevealAnimations();
        }

        handleLoad() {
            // Handle any post-load initialization
            this.revealInitialContent();
        }

        handleKeydown(e) {
            // Handle keyboard navigation
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        }

        // === SMOOTH SCROLLING === //
        
        initSmoothScroll() {
            const links = document.querySelectorAll('a[href^="#"]');
            
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    const target = link.getAttribute('href');
                    if (target === '#') return;
                    
                    e.preventDefault();
                    const targetElement = document.querySelector(target);
                    
                    if (targetElement) {
                        const offsetTop = targetElement.offsetTop - 100; // Account for fixed header
                        
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                        
                        // Close mobile menu if open
                        this.closeMobileMenu();
                    }
                });
            });
        }

        // === SCROLL ANIMATIONS === //
        
        initScrollAnimations() {
            const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale, [data-animate-when-visible]');
            
            this.scrollElements = Array.from(elements).map(el => ({
                element: el,
                isVisible: false,
                threshold: 0.1
            }));

            this.handleRevealAnimations();
        }

        handleRevealAnimations() {
            this.scrollElements.forEach(item => {
                if (item.isVisible) return;

                const rect = item.element.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const elementTop = rect.top;
                const elementHeight = rect.height;

                if (elementTop < windowHeight - (elementHeight * item.threshold)) {
                    item.isVisible = true;
                    item.element.classList.add('visible');
                    
                    // Add staggered animation delay for grid items
                    if (item.element.closest('.services-grid, .projects-grid, .capabilities-showcase')) {
                        const siblings = Array.from(item.element.parentNode.children);
                        const index = siblings.indexOf(item.element);
                        item.element.style.transitionDelay = `${index * 0.1}s`;
                    }
                }
            });
        }

        revealInitialContent() {
            // Reveal hero content on load
            const heroElements = document.querySelectorAll('.hero-title, .hero-description, .hero-cta, .hero-stats');
            heroElements.forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('visible');
                }, index * 200);
            });
        }

        // === STICKY HEADER === //
        
        initStickyHeader() {
            const navbar = document.querySelector('.navbar');
            if (!navbar) return;

            let lastScrollY = window.scrollY;
            let ticking = false;

            const updateNavbar = () => {
                const currentScrollY = window.scrollY;
                
                if (currentScrollY > 10) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }

                // Hide navbar when scrolling down, show when scrolling up
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }

                lastScrollY = currentScrollY;
                ticking = false;
            };

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(updateNavbar);
                    ticking = true;
                }
            });
        }

        // === SCROLL PROGRESS === //
        
        initScrollProgress() {
            // Create scroll progress indicator
            const progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress-bar';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 0%;
                height: 2px;
                background: linear-gradient(90deg, #3b82f6, #6366f1);
                z-index: 1100;
                transition: width 0.1s ease;
            `;
            document.body.appendChild(progressBar);

            this.progressBar = progressBar;
        }

        updateScrollProgress() {
            if (!this.progressBar) return;

            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            const scrollPercent = scrollTop / (docHeight - winHeight);
            const scrollPercentRounded = Math.round(scrollPercent * 100);

            this.progressBar.style.width = scrollPercentRounded + '%';
        }

        // === CHAPTERS NAVIGATION === //
        
        initChaptersNavigation() {
            const chaptersNav = document.querySelector('.chapters-nav');
            if (!chaptersNav) return;

            const dots = chaptersNav.querySelectorAll('.chapters-dot');
            this.chaptersDots = dots;
        }

        updateActiveSection() {
            const sections = document.querySelectorAll('section[id]');
            let currentSection = 'top';

            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom >= 150) {
                    currentSection = section.id;
                }
            });

            if (currentSection !== this.currentSection) {
                this.currentSection = currentSection;
                
                // Update chapters navigation
                if (this.chaptersDots) {
                    this.chaptersDots.forEach(dot => {
                        const target = dot.getAttribute('data-target');
                        if (target === currentSection || (currentSection === 'top' && target === 'top')) {
                            dot.classList.add('active');
                        } else {
                            dot.classList.remove('active');
                        }
                    });
                }
            }
        }

        // === MOBILE MENU === //
        
        initMobileMenu() {
            const toggle = document.querySelector('.mobile-menu-toggle');
            const menu = document.querySelector('.nav-menu');
            
            if (!toggle || !menu) return;

            // Toggle menu
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('active');
                toggle.setAttribute('aria-expanded', menu.classList.contains('active'));
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });

            // Close menu on window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 768) {
                    this.closeMobileMenu();
                }
            });
        }

        closeMobileMenu() {
            const menu = document.querySelector('.nav-menu');
            const toggle = document.querySelector('.mobile-menu-toggle');
            
            if (menu) {
                menu.classList.remove('active');
            }
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
            }
        }

        // === CONTACT FORM === //
        
        initContactForm() {
            const form = document.getElementById('contact-form');
            if (!form) return;

            form.addEventListener('submit', this.handleContactSubmit.bind(this));

            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', this.validateField.bind(this));
                input.addEventListener('input', debounce(this.clearFieldError.bind(this), 300));
            });
        }

        async handleContactSubmit(e) {
            e.preventDefault();
            
            const form = e.target;
            const formData = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            const resultDiv = document.getElementById('contact-result');
            
            // Validate form
            if (!this.validateForm(form)) {
                this.showFormResult('Please fill in all required fields correctly.', 'error');
                return;
            }
            
            // Show loading state
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                <div class="loading-spinner"></div>
                <span>Sending...</span>
            `;
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    this.showFormResult('Thank you! Your message has been sent successfully. We\'ll get back to you soon.', 'success');
                    form.reset();
                    
                    // Track successful form submission
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'form_submit', {
                            event_category: 'Contact',
                            event_label: 'Contact Form'
                        });
                    }
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } catch (error) {
                console.error('Contact form error:', error);
                this.showFormResult('Sorry, there was an error sending your message. Please try again or email us directly.', 'error');
            } finally {
                // Restore button state
                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }, 2000);
            }
        }

        validateForm(form) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!this.validateField({ target: field })) {
                    isValid = false;
                }
            });

            return isValid;
        }

        validateField(e) {
            const field = e.target;
            const value = field.value.trim();
            const fieldName = field.name;
            let isValid = true;
            let errorMessage = '';

            // Clear previous errors
            this.clearFieldError(e);

            // Required field validation
            if (field.hasAttribute('required') && !value) {
                errorMessage = 'This field is required';
                isValid = false;
            }

            // Email validation
            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
            }

            // Name validation
            if (fieldName === 'name' && value && value.length < 2) {
                errorMessage = 'Name must be at least 2 characters long';
                isValid = false;
            }

            // Message validation
            if (fieldName === 'message' && value && value.length < 10) {
                errorMessage = 'Message must be at least 10 characters long';
                isValid = false;
            }

            if (!isValid) {
                this.showFieldError(field, errorMessage);
            }

            return isValid;
        }

        showFieldError(field, message) {
            field.classList.add('error');
            
            let errorDiv = field.parentNode.querySelector('.field-error');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'field-error';
                errorDiv.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem;';
                field.parentNode.appendChild(errorDiv);
            }
            errorDiv.textContent = message;
        }

        clearFieldError(e) {
            const field = e.target;
            field.classList.remove('error');
            
            const errorDiv = field.parentNode.querySelector('.field-error');
            if (errorDiv) {
                errorDiv.remove();
            }
        }

        showFormResult(message, type) {
            const resultDiv = document.getElementById('contact-result');
            if (!resultDiv) return;

            resultDiv.textContent = message;
            resultDiv.className = `form-result ${type}`;
            resultDiv.style.cssText = `
                padding: 1rem;
                border-radius: 8px;
                margin-top: 1rem;
                background: ${type === 'success' ? '#10b981' : '#ef4444'};
                color: white;
                opacity: 1;
                transition: opacity 0.3s ease;
            `;

            // Auto-hide success messages
            if (type === 'success') {
                setTimeout(() => {
                    resultDiv.style.opacity = '0';
                    setTimeout(() => {
                        resultDiv.textContent = '';
                        resultDiv.style.cssText = '';
                    }, 300);
                }, 5000);
            }
        }

        // === PUBLIC METHODS === //
        
        scrollToSection(sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                const offsetTop = section.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }

        showLoading(element, text = 'Loading...') {
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            spinner.innerHTML = `
                <div class="spinner"></div>
                <span>${text}</span>
            `;
            element.appendChild(spinner);
        }

        hideLoading(element) {
            const spinner = element.querySelector('.loading-spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }

    // === GLOBAL FUNCTIONS === //
    
    // Mobile menu toggle (called from HTML)
    window.toggleMobileMenu = function() {
        const app = window.craftaiApp;
        if (app) {
            const menu = document.querySelector('.nav-menu');
            if (menu) {
                menu.classList.toggle('active');
            }
        }
    };

    // Smooth scroll to section (callable from anywhere)
    window.scrollToSection = function(sectionId) {
        const app = window.craftaiApp;
        if (app) {
            app.scrollToSection(sectionId);
        }
    };

    // === INITIALIZATION === //
    
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize the main application
        window.craftaiApp = new CraftAIApp();
        
        // Add loading complete class to body
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 500);

        // Initialize other components
        if (typeof initializeAICapabilities === 'function') {
            initializeAICapabilities();
        }
        
        // Console message for developers
        console.log('%c🤖 CraftAI Solutions %c- Powered by AI & Innovation', 
            'color: #3b82f6; font-weight: bold; font-size: 16px;',
            'color: #6366f1; font-size: 14px;'
        );
    });

    // === ERROR HANDLING === //
    
    window.addEventListener('error', function(e) {
        console.error('JavaScript Error:', e.error);
        
        // Optional: Send error to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: e.error.toString(),
                fatal: false
            });
        }
    });

    // === PERFORMANCE MONITORING === //
    
    if ('performance' in window && 'navigation' in performance) {
        window.addEventListener('load', function() {
            // Log performance metrics
            setTimeout(function() {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page Load Time:', Math.round(perfData.loadEventEnd - perfData.loadEventStart), 'ms');
            }, 0);
        });
    }

})();