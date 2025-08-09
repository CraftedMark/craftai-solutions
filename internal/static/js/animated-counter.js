/**
 * Animated Counter Component
 * Replicates the Next.js AnimatedCounter functionality
 */
class AnimatedCounter {
    constructor(element, options = {}) {
        this.element = element;
        this.value = parseInt(options.value) || 0;
        this.prefix = options.prefix || '';
        this.suffix = options.suffix || '';
        this.duration = options.duration || 2000;
        this.decimals = options.decimals || 0;
        this.startValue = 0;
        this.hasAnimated = false;
        
        this.init();
    }
    
    init() {
        // Create intersection observer for triggering animation when in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.animate();
                    this.hasAnimated = true;
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(this.element);
    }
    
    animate() {
        const startTime = Date.now();
        const endValue = this.value;
        
        const updateCount = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / this.duration, 1);
            
            // Easing function for smooth animation (easeOutQuart)
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = easeOutQuart * endValue;
            
            // Update the element content
            this.element.textContent = this.prefix + currentValue.toFixed(this.decimals) + this.suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        };
        
        requestAnimationFrame(updateCount);
    }
}

// Initialize all animated counters when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const counters = document.querySelectorAll('[data-animate-counter]');
    
    counters.forEach(counter => {
        const value = counter.getAttribute('data-value');
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = parseInt(counter.getAttribute('data-duration')) || 2000;
        const decimals = parseInt(counter.getAttribute('data-decimals')) || 0;
        
        new AnimatedCounter(counter, {
            value: value,
            prefix: prefix,
            suffix: suffix,
            duration: duration,
            decimals: decimals
        });
    });
});