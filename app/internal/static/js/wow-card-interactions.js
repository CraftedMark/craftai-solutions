/**
 * WOW Card Interactions
 * Mind-blowing animations and effects for project showcase
 */

(function() {
    'use strict';

    class WowProjectCards {
        constructor() {
            this.cards = [];
            this.mousePosition = { x: 0, y: 0 };
            this.init();
        }

        init() {
            this.setupCards();
            this.createParticles();
            this.initMouseTracking();
            this.initScrollAnimations();
            this.initIconAnimations();
        }

        setupCards() {
            const cards = document.querySelectorAll('.project-card');

            cards.forEach((card, index) => {
                // Add index for stagger animations
                card.style.setProperty('--card-index', index);

                // Create card data object
                const cardData = {
                    element: card,
                    index: index,
                    particles: [],
                    isHovered: false
                };

                this.cards.push(cardData);

                // Add project number
                this.addProjectNumber(card, index);

                // Add grid overlay
                this.addGridOverlay(card);

                // Setup hover effects
                this.setupHoverEffects(card, cardData);

                // Add icon based on project
                this.addProjectIcon(card, index);
            });
        }

        addProjectNumber(card, index) {
            const number = document.createElement('div');
            number.className = 'project-number';
            number.textContent = `0${index + 1}`;
            card.querySelector('.project-card-content').prepend(number);
        }

        addGridOverlay(card) {
            const overlay = document.createElement('div');
            overlay.className = 'project-grid-overlay';
            card.appendChild(overlay);
        }

        addProjectIcon(card, index) {
            const icons = ['🚀', '🧠', '📧', '📱'];
            const iconElement = document.createElement('div');
            iconElement.className = 'project-icon';
            iconElement.textContent = icons[index % icons.length];
            card.appendChild(iconElement);
        }

        createParticles() {
            this.cards.forEach(cardData => {
                const particleContainer = document.createElement('div');
                particleContainer.className = 'project-particles';

                // Create 20 particles per card
                for (let i = 0; i < 20; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.left = `${Math.random() * 100}%`;
                    particle.style.top = `${Math.random() * 100}%`;
                    particle.style.animationDelay = `${Math.random() * 3}s`;
                    particle.style.animationDuration = `${3 + Math.random() * 2}s`;

                    particleContainer.appendChild(particle);
                    cardData.particles.push(particle);
                }

                cardData.element.appendChild(particleContainer);
            });
        }

        setupHoverEffects(card, cardData) {
            // Enhanced 3D tilt effect
            card.addEventListener('mouseenter', (e) => {
                cardData.isHovered = true;
                card.style.transition = 'transform 0.3s ease';
                this.animateParticles(cardData);
                this.glowEffect(card, true);
            });

            card.addEventListener('mousemove', (e) => {
                if (!cardData.isHovered) return;

                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -15;
                const rotateY = ((x - centerX) / centerX) * 15;

                card.style.transform = `
                    perspective(1000px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    translateZ(30px)
                    scale(1.05)
                `;

                // Move gradient based on mouse
                this.updateGradient(card, x, y, rect.width, rect.height);
            });

            card.addEventListener('mouseleave', () => {
                cardData.isHovered = false;
                card.style.transform = '';
                card.style.transition = 'transform 0.6s ease';
                this.glowEffect(card, false);
            });

            // Click effect
            card.addEventListener('click', () => {
                this.pulseEffect(card);
                this.createRipple(card, event);
            });
        }

        animateParticles(cardData) {
            cardData.particles.forEach((particle, i) => {
                setTimeout(() => {
                    particle.style.opacity = '1';
                    const randomX = (Math.random() - 0.5) * 100;
                    const randomY = -Math.random() * 100 - 50;
                    particle.style.transform = `translate(${randomX}px, ${randomY}px)`;
                }, i * 50);
            });

            setTimeout(() => {
                cardData.particles.forEach(particle => {
                    particle.style.opacity = '0';
                    particle.style.transform = 'translate(0, 0)';
                });
            }, 2000);
        }

        updateGradient(card, x, y, width, height) {
            const xPercent = (x / width) * 100;
            const yPercent = (y / height) * 100;

            const bg = card.querySelector('.project-card-bg');
            if (bg) {
                bg.style.background = `
                    radial-gradient(circle at ${xPercent}% ${yPercent}%,
                        rgba(96, 165, 250, 0.3) 0%,
                        rgba(167, 139, 250, 0.2) 30%,
                        transparent 70%)
                `;
            }
        }

        glowEffect(card, active) {
            if (active) {
                card.style.boxShadow = `
                    0 30px 60px rgba(96, 165, 250, 0.4),
                    0 40px 80px rgba(167, 139, 250, 0.3),
                    inset 0 0 60px rgba(255, 255, 255, 0.1)
                `;
            } else {
                card.style.boxShadow = '';
            }
        }

        pulseEffect(card) {
            card.style.animation = 'pulse 0.3s ease';
            setTimeout(() => {
                card.style.animation = '';
            }, 300);
        }

        createRipple(card, event) {
            const ripple = document.createElement('div');
            ripple.className = 'ripple';

            const rect = card.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            card.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        }

        initMouseTracking() {
            document.addEventListener('mousemove', (e) => {
                this.mousePosition.x = e.clientX;
                this.mousePosition.y = e.clientY;

                // Parallax effect for project icons
                this.cards.forEach(cardData => {
                    const icon = cardData.element.querySelector('.project-icon');
                    if (icon && cardData.isHovered) {
                        const rect = cardData.element.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;

                        const deltaX = (this.mousePosition.x - centerX) * 0.05;
                        const deltaY = (this.mousePosition.y - centerY) * 0.05;

                        icon.style.transform = `
                            translate(${deltaX}px, ${deltaY}px)
                            rotateZ(${deltaX * 0.5}deg)
                        `;
                    }
                });
            });
        }

        initScrollAnimations() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');

                        // Animate tech tags
                        const tags = entry.target.querySelectorAll('.tech-tag');
                        tags.forEach((tag, i) => {
                            setTimeout(() => {
                                tag.style.animation = 'fadeInUp 0.5s ease forwards';
                            }, i * 100);
                        });
                    }
                });
            }, {
                threshold: 0.2,
                rootMargin: '50px'
            });

            this.cards.forEach(cardData => {
                observer.observe(cardData.element);
            });
        }

        initIconAnimations() {
            // Continuous floating animation for icons
            this.cards.forEach(cardData => {
                const icon = cardData.element.querySelector('.project-icon');
                if (icon) {
                    // Random delay for organic movement
                    icon.style.animationDelay = `${Math.random() * 2}s`;

                    // Add glow pulse
                    setInterval(() => {
                        if (!cardData.isHovered) {
                            icon.style.boxShadow = '0 10px 40px rgba(102, 126, 234, 0.6)';
                            setTimeout(() => {
                                icon.style.boxShadow = '0 10px 40px rgba(102, 126, 234, 0.4)';
                            }, 1000);
                        }
                    }, 3000);
                }
            });
        }
    }

    // Additional CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(0.98); }
            100% { transform: scale(1); }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .ripple {
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle,
                rgba(255, 255, 255, 0.5) 0%,
                transparent 70%);
            transform: scale(0);
            animation: ripple-effect 0.6s ease-out;
            pointer-events: none;
        }

        @keyframes ripple-effect {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new WowProjectCards();
        });
    } else {
        new WowProjectCards();
    }

    console.log('🎨 WOW Card Interactions initialized');
})();