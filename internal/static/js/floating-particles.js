/**
 * Floating Particles System
 * Replicates the Next.js hero section floating particles
 */
class FloatingParticles {
    constructor(container, options = {}) {
        this.container = container;
        this.particleCount = options.count || 40;
        this.colors = options.colors || ['#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#2dd4bf'];
        this.particles = [];
        
        this.init();
    }
    
    init() {
        // Create particles container (global overlay if body is target)
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'floating-particles-container';
        const isBody = this.container === document.body;
        particlesContainer.style.cssText = `
            position: ${isBody ? 'fixed' : 'absolute'};
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: ${isBody ? 0 : 1};
        `;

        // Ensure main content sits above global overlay
        if (isBody) {
            document.documentElement.style.background = 'transparent';
            document.body.style.background = 'transparent';
            const main = document.querySelector('.main-content');
            if (main && getComputedStyle(main).position === 'static') {
                main.style.position = 'relative';
            }
            const nav = document.querySelector('.navbar');
            if (nav) nav.style.position = 'relative';
        }

        this.container.appendChild(particlesContainer);
        
        // Create individual particles
        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle(particlesContainer, i);
        }
    }
    
    createParticle(container, index) {
        const particle = document.createElement('div');
        const color = this.colors[index % this.colors.length];
        const size = Math.random() * 4 + 2; // 2px to 6px
        const blur = Math.random() * 2; // 0px to 2px blur
        const delay = Math.random() * 20; // 0 to 20 second delay
        const duration = Math.random() * 20 + 20; // 20 to 40 second duration
        const startX = Math.random() * 100; // 0% to 100% of container width
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: 50%;
            filter: blur(${blur}px);
            left: ${startX}%;
            bottom: -20px;
            opacity: 0;
            animation: floatUp ${duration}s linear ${delay}s infinite;
        `;
        
        container.appendChild(particle);
        this.particles.push(particle);
    }
}

// Initialize floating particles when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const bodyParticles = document.body && document.body.dataset.siteParticles === 'on';
    if (bodyParticles) {
        // Render a subtle, site-wide layer
        new FloatingParticles(document.body, {
            count: window.innerWidth > 1024 ? 70 : 35,
            colors: ['rgba(90,200,255,0.6)','rgba(140,90,255,0.6)','rgba(255,255,255,0.55)']
        });
    }

    // Optional: denser particles in hero if explicitly requested
    const heroSection = document.querySelector('.hero-section');
    if (heroSection && heroSection.dataset.heroAnimation === 'floating' && !bodyParticles) {
        new FloatingParticles(heroSection);
    }
});