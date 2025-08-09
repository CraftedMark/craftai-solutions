/**
 * Animated Icon System
 * Adds hover animations and effects to icons throughout the site
 */
class AnimatedIcon {
    constructor() {
        this.init();
    }
    
    init() {
        // Add hover effects to all icons with data-animate attribute
        const animatedIcons = document.querySelectorAll('[data-animate-icon]');
        animatedIcons.forEach(icon => this.enhanceIcon(icon));
        
        // Add pulse glow effect to icons with pulse-glow class
        this.addPulseGlowStyles();
    }
    
    enhanceIcon(icon) {
        const animationType = icon.getAttribute('data-animate-icon') || 'scale';
        
        // Add base transition styles
        icon.style.transition = 'all 0.3s ease-in-out';
        
        // Add hover event listeners
        icon.addEventListener('mouseenter', () => {
            this.triggerAnimation(icon, animationType, true);
        });
        
        icon.addEventListener('mouseleave', () => {
            this.triggerAnimation(icon, animationType, false);
        });
    }
    
    triggerAnimation(icon, type, isHover) {
        switch (type) {
            case 'scale':
                icon.style.transform = isHover ? 'scale(1.1)' : 'scale(1)';
                break;
            case 'rotate':
                icon.style.transform = isHover ? 'rotate(10deg) scale(1.05)' : 'rotate(0deg) scale(1)';
                break;
            case 'pulse':
                if (isHover) {
                    icon.classList.add('pulse-glow');
                } else {
                    icon.classList.remove('pulse-glow');
                }
                break;
            case 'bounce':
                if (isHover) {
                    icon.style.animation = 'bounce 0.5s ease-in-out';
                } else {
                    icon.style.animation = '';
                }
                break;
            default:
                icon.style.transform = isHover ? 'scale(1.1)' : 'scale(1)';
        }
    }
    
    addPulseGlowStyles() {
        // Add pulse glow keyframes if not already present
        if (!document.querySelector('#pulse-glow-styles')) {
            const style = document.createElement('style');
            style.id = 'pulse-glow-styles';
            style.textContent = `
                @keyframes pulseGlow {
                    0%, 100% {
                        opacity: 1;
                        filter: drop-shadow(0 0 8px currentColor);
                    }
                    50% {
                        opacity: 0.7;
                        filter: drop-shadow(0 0 12px currentColor);
                    }
                }
                
                .pulse-glow {
                    animation: pulseGlow 2s ease-in-out infinite;
                }
                
                @keyframes bounce {
                    0%, 20%, 60%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    40% {
                        transform: translateY(-10px) scale(1.05);
                    }
                    80% {
                        transform: translateY(-5px) scale(1.02);
                    }
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