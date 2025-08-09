// Montfort-inspired Particle Animation System

class ParticleSystem {
    constructor(container, options = {}) {
        this.container = container;
        this.particles = [];
        this.options = {
            particleCount: options.particleCount || 50,
            colors: options.colors || ['rgba(90, 200, 255, 0.6)', 'rgba(140, 90, 255, 0.6)', 'rgba(255, 255, 255, 0.8)'],
            sizes: options.sizes || ['small', 'medium', 'large'],
            speed: options.speed || 1,
            interactive: options.interactive !== false
        };
        
        this.init();
        if (this.options.interactive) {
            this.bindEvents();
        }
    }
    
    init() {
        this.createParticles();
        this.animate();
    }
    
    createParticles() {
        for (let i = 0; i < this.options.particleCount; i++) {
            const particle = this.createParticle(i);
            this.particles.push(particle);
            this.container.appendChild(particle.element);
        }
    }
    
    createParticle(index) {
        const element = document.createElement('div');
        const size = this.options.sizes[Math.floor(Math.random() * this.options.sizes.length)];
        const color = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
        
        element.className = `particle particle-${size} particle-dynamic-${index}`;
        element.style.background = color;
        
        // Random starting position
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        
        // Create particle object with properties
        const particle = {
            element: element,
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * this.options.speed,
            vy: (Math.random() - 0.5) * this.options.speed - 1, // Slight upward bias
            size: size,
            opacity: Math.random() * 0.5 + 0.3,
            pulse: Math.random() * Math.PI * 2
        };
        
        return particle;
    }
    
    animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Pulse effect
            particle.pulse += 0.02;
            const pulseScale = 1 + Math.sin(particle.pulse) * 0.1;
            
            // Wrap around screen
            if (particle.x < -50) particle.x = window.innerWidth + 50;
            if (particle.x > window.innerWidth + 50) particle.x = -50;
            if (particle.y < -50) particle.y = window.innerHeight + 50;
            if (particle.y > window.innerHeight + 50) particle.y = -50;
            
            // Apply transforms
            particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px) scale(${pulseScale})`;
            particle.element.style.opacity = particle.opacity + Math.sin(particle.pulse) * 0.1;
        });
    }
    
    bindEvents() {
        // Mouse interaction
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            this.particles.forEach(particle => {
                const dx = mouseX - particle.x;
                const dy = mouseY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    // Repel particles from mouse
                    const force = (100 - distance) / 100;
                    particle.vx -= (dx / distance) * force * 0.5;
                    particle.vy -= (dy / distance) * force * 0.5;
                    
                    // Limit velocity
                    particle.vx = Math.max(-3, Math.min(3, particle.vx));
                    particle.vy = Math.max(-3, Math.min(3, particle.vy));
                }
            });
        });
        
        // Parallax on scroll
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            this.particles.forEach((particle, index) => {
                const parallaxSpeed = 0.5 + (index % 3) * 0.2;
                particle.element.style.transform = `translate(${particle.x}px, ${particle.y - scrollY * parallaxSpeed}px)`;
            });
        });
    }
    
    destroy() {
        cancelAnimationFrame(this.animationFrame);
        this.particles.forEach(particle => {
            particle.element.remove();
        });
        this.particles = [];
    }
    
    // Add burst effect on click
    burst(x, y) {
        for (let i = 0; i < 10; i++) {
            const particle = this.createParticle(this.particles.length);
            particle.x = x;
            particle.y = y;
            particle.vx = (Math.random() - 0.5) * 10;
            particle.vy = (Math.random() - 0.5) * 10;
            particle.element.style.transition = 'opacity 1s';
            
            this.particles.push(particle);
            this.container.appendChild(particle.element);
            
            // Fade out and remove after animation
            setTimeout(() => {
                particle.element.style.opacity = '0';
                setTimeout(() => {
                    const index = this.particles.indexOf(particle);
                    if (index > -1) {
                        this.particles.splice(index, 1);
                        particle.element.remove();
                    }
                }, 1000);
            }, 100);
        }
    }
}

// Initialize particle system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if hero section exists
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        // Add animated background structure
        heroSection.classList.add('hero-animated-bg');
        
        // Create background layers
        const layers = [
            { class: 'mountain-layer mountain-layer-1 parallax-back' },
            { class: 'mountain-layer mountain-layer-2 parallax-mid' },
            { class: 'mountain-layer mountain-layer-3 parallax-front' },
            { class: 'grid-overlay' }
        ];
        
        layers.forEach(layer => {
            const div = document.createElement('div');
            div.className = layer.class;
            heroSection.insertBefore(div, heroSection.firstChild);
        });
        
        // Create glow orbs
        const orbs = [
            { class: 'glow-orb glow-orb-1' },
            { class: 'glow-orb glow-orb-2' },
            { class: 'glow-orb glow-orb-3' }
        ];
        
        orbs.forEach(orb => {
            const div = document.createElement('div');
            div.className = orb.class;
            heroSection.insertBefore(div, heroSection.firstChild);
        });
        
        // Create animated lines
        const lines = [
            { class: 'animated-line animated-line-1' },
            { class: 'animated-line animated-line-2' },
            { class: 'animated-line animated-line-3' }
        ];
        
        lines.forEach(line => {
            const div = document.createElement('div');
            div.className = line.class;
            heroSection.insertBefore(div, heroSection.firstChild);
        });
        
        // Create particles container
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-container';
        heroSection.insertBefore(particlesContainer, heroSection.firstChild);
        
        // Initialize particle system
        const particleSystem = new ParticleSystem(particlesContainer, {
            particleCount: window.innerWidth > 768 ? 30 : 15,
            colors: [
                'rgba(90, 200, 255, 0.7)',
                'rgba(140, 90, 255, 0.7)',
                'rgba(255, 255, 255, 0.9)'
            ],
            speed: 0.5,
            interactive: true
        });
        
        // Add click burst effect
        heroSection.addEventListener('click', (e) => {
            const rect = heroSection.getBoundingClientRect();
            particleSystem.burst(e.clientX - rect.left, e.clientY - rect.top);
        });
        
        // Performance optimization - reduce particles if performance is poor
        let lastTime = performance.now();
        let frames = 0;
        
        function checkPerformance() {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                const fps = frames;
                frames = 0;
                lastTime = currentTime;
                
                // If FPS drops below 30, reduce particle count
                if (fps < 30 && particleSystem.particles.length > 10) {
                    for (let i = 0; i < 5; i++) {
                        const particle = particleSystem.particles.pop();
                        if (particle) particle.element.remove();
                    }
                }
            }
            
            requestAnimationFrame(checkPerformance);
        }
        
        checkPerformance();
    }
});

// Parallax scrolling effect
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const parallaxElements = document.querySelectorAll('.parallax-layer');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + index * 0.1;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});