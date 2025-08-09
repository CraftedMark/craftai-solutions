// Montfort-style Simple Floating Dots Animation

(function() {
    'use strict';
    
    // Configuration
    const config = {
        dotCount: 20,
        dotSizes: ['small', 'medium', 'large'],
        baseSpeed: 20000, // Base animation duration in ms
        speedVariation: 5000, // Random variation in speed
    };
    
    // Initialize on DOM ready
    function init() {
        // Create background container
        const bgContainer = document.createElement('div');
        bgContainer.className = 'montfort-bg';
        
        // Create floating elements container
        const floatingContainer = document.createElement('div');
        floatingContainer.className = 'floating-elements';
        
        // Create mist layer
        const mistLayer = document.createElement('div');
        mistLayer.className = 'mist-layer';
        
        // Create gradient overlay
        const gradientOverlay = document.createElement('div');
        gradientOverlay.className = 'gradient-overlay';
        
        // Create mountain silhouette
        const mountainSilhouette = document.createElement('div');
        mountainSilhouette.className = 'mountain-silhouette';
        
        // Create floating dots
        for (let i = 1; i <= config.dotCount; i++) {
            const dot = createDot(i);
            floatingContainer.appendChild(dot);
        }
        
        // Assemble the background
        bgContainer.appendChild(mistLayer);
        bgContainer.appendChild(floatingContainer);
        bgContainer.appendChild(mountainSilhouette);
        bgContainer.appendChild(gradientOverlay);
        
        // Insert at the beginning of body
        document.body.insertBefore(bgContainer, document.body.firstChild);
        
        // Make sure main content is above the background
        const mainContent = document.querySelector('.navbar');
        if (mainContent) {
            mainContent.style.position = 'relative';
            mainContent.style.zIndex = '10';
        }
        
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.position = 'relative';
            heroSection.style.zIndex = '10';
            heroSection.style.background = 'transparent';
        }
    }
    
    function createDot(index) {
        const dot = document.createElement('div');
        const size = config.dotSizes[Math.floor(Math.random() * config.dotSizes.length)];
        
        dot.className = `floating-dot ${size} dot-${index}`;
        
        // Randomize some properties via inline styles for variety
        const opacity = 0.3 + Math.random() * 0.4;
        const blur = Math.random() > 0.7 ? 1 : 0;
        
        dot.style.opacity = opacity;
        if (blur) {
            dot.style.filter = `blur(${blur}px)`;
        }
        
        return dot;
    }
    
    // Advanced: Add interactive glow on mouse move (optional)
    function addMouseInteraction() {
        const container = document.querySelector('.montfort-bg');
        if (!container) return;
        
        const glowElement = document.createElement('div');
        glowElement.style.cssText = `
            position: absolute;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(90, 200, 255, 0.1) 0%, transparent 70%);
            pointer-events: none;
            transition: opacity 0.3s ease;
            opacity: 0;
            filter: blur(40px);
        `;
        container.appendChild(glowElement);
        
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left - 100;
            const y = e.clientY - rect.top - 100;
            
            glowElement.style.transform = `translate(${x}px, ${y}px)`;
            glowElement.style.opacity = '1';
        });
        
        container.addEventListener('mouseleave', () => {
            glowElement.style.opacity = '0';
        });
    }
    
    // Check if document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            addMouseInteraction();
        });
    } else {
        init();
        addMouseInteraction();
    }
})();