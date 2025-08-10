/**
 * Animated Icon System
 * Adds hover animations and effects to icons throughout the site
 */
class AnimatedIcon {
    constructor() {
        this.init();
    }
    
    init() {
        // Add entrance animations to service icons
        this.addEntranceAnimations();
        
        // Add subtle interaction styles
        this.addInteractionStyles();
    }
    
    addEntranceAnimations() {
        const serviceIcons = document.querySelectorAll('.service-icon');
        
        // Create intersection observer for entrance animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add staggered entrance animation
                    setTimeout(() => {
                        entry.target.classList.add('icon-visible');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });
        
        serviceIcons.forEach(icon => {
            icon.classList.add('icon-entrance');
            observer.observe(icon);
        });
    }
    
    addInteractionStyles() {
        // Add CSS for entrance animations and interactions
        if (!document.querySelector('#icon-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'icon-animation-styles';
            style.textContent = `
                /* Entrance animation for icons */
                .icon-entrance {
                    opacity: 0;
                    transform: translateY(20px) scale(0.9);
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .icon-entrance.icon-visible {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                
                /* Subtle glow on hover */
                @keyframes subtleGlow {
                    0% {
                        box-shadow: 0 0 20px rgba(56, 189, 248, 0.2);
                    }
                    100% {
                        box-shadow: 0 0 30px rgba(56, 189, 248, 0.3),
                                    0 0 40px rgba(168, 85, 247, 0.2);
                    }
                }
                
                .service-icon:hover {
                    animation: subtleGlow 0.5s ease-in-out forwards;
                    box-shadow: 0 0 30px rgba(56, 189, 248, 0.3),
                                0 0 40px rgba(168, 85, 247, 0.2);
                }
                
                /* Icon lift on hover - no continuous animation */
                .service-card:hover .service-icon svg {
                    transform: translateY(-3px) scale(1.05);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize animated icons when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new AnimatedIcon();
});