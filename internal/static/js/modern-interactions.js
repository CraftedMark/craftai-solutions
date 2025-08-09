/**
 * Modern UI Interactions for CraftAI.Solutions
 * Enhanced animations and interactions for 2025 standards
 */

// Smooth scroll indicator
function initScrollIndicator() {
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    document.body.appendChild(scrollIndicator);

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.offsetHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = scrollTop / (docHeight - winHeight);
        const scrollPercentRounded = Math.round(scrollPercent * 100);
        scrollIndicator.style.width = scrollPercentRounded + '%';
    });
}

// Add sticky header behavior (adds .scrolled on navbar)
function initStickyHeader() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    const onScroll = () => {
        if (window.scrollY > 10) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

// Enhanced intersection observer with stagger animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.dataset.delay || index * 100;
                
                setTimeout(() => {
                    element.style.transform = 'translateY(0)';
                    element.style.opacity = '1';
                    element.classList.add('animate-visible');
                }, delay);
                
                animateOnScroll.unobserve(element);
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.animate-on-scroll, .card-hover, .service-card, .case-study-card, .project-card, .reveal-up').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        animateOnScroll.observe(el);
    });

    // Scroll-animate cards grid (stagger in)
    document.querySelectorAll('[data-scroll-animate="cards"] .project-card.modern-card').forEach((card, idx) => {
        card.style.transitionDelay = `${Math.min(idx * 70, 400)}ms`;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    card.classList.add('is-visible');
                    observer.unobserve(card);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
        observer.observe(card);
    });
}

// Magnetic button effect
function initMagneticButtons() {
    const magneticButtons = document.querySelectorAll('.btn-magnetic, .btn-primary');
    
    magneticButtons.forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            button.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        });

        button.addEventListener('mousemove', (e) => {
            const buttonRect = button.getBoundingClientRect();
            const buttonCenterX = buttonRect.left + buttonRect.width / 2;
            const buttonCenterY = buttonRect.top + buttonRect.height / 2;
            
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            const deltaX = (mouseX - buttonCenterX) * 0.1;
            const deltaY = (mouseY - buttonCenterY) * 0.1;
            
            button.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.02)`;
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0px, 0px) scale(1)';
        });
    });
}

// Enhanced card tilt effect
function initCardTiltEffect() {
    const cards = document.querySelectorAll('.card-premium, .card-hover');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.3s ease-out';
        });

        card.addEventListener('mousemove', (e) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            const rotateX = (mouseY - cardCenterY) / cardRect.height * -10;
            const rotateY = (mouseX - cardCenterX) / cardRect.width * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
}

// Parallax effect for hero elements
function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.organic-shape-1, .organic-shape-2, .mesh-bg-animated');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach((element, index) => {
            const rate = scrolled * -0.5 * (index + 1);
            element.style.transform = `translateY(${rate}px)`;
        });
    });
}

// Enhanced counter animation with easing
function animateCounterEnhanced(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    const suffix = element.dataset.suffix || '';
    
    function easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const current = Math.floor(start + (target - start) * easedProgress);
        
        element.textContent = current + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Toast notification system
function showToast(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-weight: 600;">${message}</div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Loading state management
function initLoadingStates() {
    // Add loading states to forms
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = `
                    <div class="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    Processing...
                `;
                submitBtn.disabled = true;
                
                // Re-enable after 3 seconds (adjust based on actual form processing)
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    });
}

// Keyboard navigation enhancements
function initKeyboardNavigation() {
    // Add focus indicators
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
}

// Performance monitoring
function initPerformanceMonitoring() {
    // Monitor Core Web Vitals
    function getCLS(onReport) {
        let clsValue = 0;
        let clsEntries = [];
        
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    const firstSessionEntry = clsEntries[0];
                    const lastSessionEntry = clsEntries[clsEntries.length - 1];
                    
                    if (clsEntries.length === 0 || 
                        entry.startTime - lastSessionEntry.startTime < 1000 ||
                        entry.startTime - firstSessionEntry.startTime < 5000) {
                        clsEntries.push(entry);
                        clsValue += entry.value;
                    } else {
                        clsEntries = [entry];
                        clsValue = entry.value;
                    }
                    
                    onReport(clsValue);
                }
            }
        });
        
        observer.observe({entryTypes: ['layout-shift']});
    }
    
    // Only monitor in development
    if (window.location.hostname === 'localhost') {
        getCLS(console.log);
    }
}

// Initialize all interactions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initScrollIndicator();
    initScrollAnimations();
    initMagneticButtons();
    initCardTiltEffect();
    initParallaxEffect();
    initSmoothScrolling();
    initLoadingStates();
    initKeyboardNavigation();
    initPerformanceMonitoring();
    initStickyHeader();
    initParallaxHeroDecorations();  // Hero decoration parallax (non-tilting)
    // Disable 3D tilt by default to avoid "upside down" effect.
    // Re-enable only if explicitly opted-in via data attribute.
    const heroSection = document.querySelector('.hero-section');
    if (heroSection && heroSection.dataset.heroTilt === 'on') {
        initHero3DParallax();
    }

    // Enhanced counter animations
    document.querySelectorAll('[data-animate-counter]').forEach(counter => {
        const target = parseInt(counter.dataset.value);
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounterEnhanced(counter, target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
    
    // Add floating animation to hero icons
    document.querySelectorAll('.hero-badge-icon, .service-icon').forEach((icon, index) => {
        icon.style.animationDelay = `${index * 0.2}s`;
        icon.classList.add('animate-float');
    });
    
    console.log('🚀 Modern UI interactions initialized');
});

// Add CSS for keyboard navigation
const keyboardNavCSS = `
.keyboard-navigation *:focus {
    outline: 2px solid var(--primary-500) !important;
    outline-offset: 2px !important;
}
`;

const style = document.createElement('style');
style.textContent = keyboardNavCSS;
document.head.appendChild(style);

// Parallax effect for hero decoration layers
function initParallaxHeroDecorations() {
    const layers = document.querySelectorAll('.hero-decoration');
    if (!layers.length) return;

    // Hint GPU acceleration for smoother transforms
    layers.forEach(el => {
        el.style.willChange = 'transform';
    });

    const onScroll = () => {
        const scrolled = window.pageYOffset || window.scrollY || 0;
        // Different layers move at slightly different rates for depth
        layers.forEach((el, idx) => {
            const rate = (idx % 2 === 0 ? 0.15 : 0.08);
            const translateY = Math.round(scrolled * -rate);
            el.style.transform = `translate3d(0, ${translateY}px, 0)`;
        });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

function initHero3DParallax() {
    const section = document.querySelector('.hero-section.has-3d');
    if (!section) return;

    const layers = section.querySelectorAll('.hero-layer[data-depth]');
    const content = section.querySelector('.hero-content');
    if (!layers.length || !content) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let enabled = !reduceMotion.matches;

    // Update enabled state on preference change
    if (reduceMotion.addEventListener) {
        reduceMotion.addEventListener('change', (e) => { enabled = !e.matches; });
    } else if (reduceMotion.addListener) {
        reduceMotion.addListener((e) => { enabled = !e.matches; });
    }

    // Setup perspective
    section.style.perspective = '1000px';
    section.style.perspectiveOrigin = '50% 30%';

    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let mouseX = cx;
    let mouseY = cy;
    let scrollY = window.pageYOffset || 0;
    const maxTilt = 6; // degrees

    const onMouseMove = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    };
    const onScroll = () => {
        scrollY = window.pageYOffset || 0;
    };
    const onResize = () => {
        cx = window.innerWidth / 2;
        cy = window.innerHeight / 2;
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Animation loop
    const animate = () => {
        if (enabled) {
            const normX = (mouseX - cx) / cx;
            const normY = (mouseY - cy) / cy;

            // Tilt hero content slightly
            const rotateY = normX * maxTilt;
            const rotateX = -normY * maxTilt;
            content.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
            content.style.transformStyle = 'preserve-3d';

            // Move layers at different depths
            layers.forEach(layer => {
                const d = parseFloat(layer.getAttribute('data-depth')) || 1;
                // Higher depth -> closer to camera, moves more with cursor; lower depth -> farther
                const tx = -normX * 30 * d;
                const ty = -normY * 18 * d + (scrollY * -0.02 * (1 - d));
                const tz = (1 - d) * -120; // push far layers back a bit
                layer.style.transform = `translate3d(${tx}px, ${ty}px, ${tz}px)`;
            });
        } else {
            // Reset when disabled
            content.style.transform = '';
            layers.forEach(layer => { layer.style.transform = ''; });
        }
        requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
}

// Chapters dot nav activation
(function initChaptersDots(){
    document.addEventListener('DOMContentLoaded', () => {
        const dots = document.querySelectorAll('.chapters-dot');
        if (!dots.length) return;
        const anchors = Array.from(dots).map(d => {
            const hash = d.getAttribute('href') || '#';
            return { dot: d, el: hash === '#' ? document.body : document.querySelector(hash) };
        });
        function updateActive() {
            const scroll = window.scrollY || 0;
            let active = anchors[0];
            anchors.forEach(a => {
                if (!a.el) return;
                const top = a.el.getBoundingClientRect().top + scroll;
                if (scroll + 200 >= top) active = a; // 200px offset
            });
            dots.forEach(d => d.classList.remove('active'));
            if (active && active.dot) active.dot.classList.add('active');
        }
        updateActive();
        window.addEventListener('scroll', updateActive, { passive: true });
    });
})();

// Cursor + sound UI
(function initCursorAndSound(){
    document.addEventListener('DOMContentLoaded', () => {
        // Cursor
        const dot = document.createElement('div'); dot.className = 'cursor-dot';
        const ring = document.createElement('div'); ring.className = 'cursor-dot-outline';
        document.body.appendChild(dot); document.body.appendChild(ring);
        let x = window.innerWidth/2, y = window.innerHeight/2;
        let rx = x, ry = y;
        function move(e){ x = e.clientX; y = e.clientY; dot.style.left = x+'px'; dot.style.top = y+'px'; }
        function loop(){ ry += (y-ry)*0.15; rx += (x-rx)*0.15; ring.style.left = rx+'px'; ring.style.top = ry+'px'; requestAnimationFrame(loop);} loop();
        document.addEventListener('mousemove', move, { passive: true });

        // Sound button (visual only; no audio yet)
        const ui = document.createElement('div'); ui.className = 'ui-overlay';
        const btn = document.createElement('button'); btn.className = 'sound-btn'; btn.setAttribute('aria-label','Toggle sound'); btn.innerHTML = '🔊';
        btn.addEventListener('click', () => btn.classList.toggle('active'));
        ui.appendChild(btn); document.body.appendChild(ui);
    });
})();

// Animate section titles underline on enter
(function initSectionTitleUnderline(){
    document.addEventListener('DOMContentLoaded', () => {
        const headers = document.querySelectorAll('.section-header h2, .section-header .section-title');
        const obs = new IntersectionObserver((entries)=>{
            entries.forEach(entry=>{
                if(entry.isIntersecting){ entry.target.classList.add('section-title-underline','is-visible'); obs.unobserve(entry.target); }
            });
        }, { threshold: 0.6 });
        headers.forEach(h=>obs.observe(h));
    });
})();