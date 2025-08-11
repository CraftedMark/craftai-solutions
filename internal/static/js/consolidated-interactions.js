/**
 * CraftAI Solutions - Consolidated UI Interactions
 * All user interface interactions and AI capabilities demonstrations
 * Version: 2025-08-11
 */

(function() {
    'use strict';

    // === AI CAPABILITIES INTERACTIVE SHOWCASE === //
    
    class AICapabilitiesShowcase {
        constructor() {
            this.capabilities = [];
            this.isInitialized = false;
            this.init();
        }

        init() {
            if (this.isInitialized) return;
            
            const capabilityCards = document.querySelectorAll('.capability-card');
            if (capabilityCards.length === 0) {
                console.log('No AI capability cards found');
                return;
            }

            this.setupCapabilityCards(capabilityCards);
            this.startAllDemonstrations();
            this.isInitialized = true;
            
            console.log('AI Capabilities Showcase initialized with', capabilityCards.length, 'capabilities');
        }

        setupCapabilityCards(cards) {
            cards.forEach(card => {
                const capability = card.dataset.capability;
                
                // Make cards visible (fix opacity:0 issue)
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                
                // Add click interaction
                card.addEventListener('click', () => {
                    this.activateCapability(card, capability);
                });
                
                // Add hover effects
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-2px)';
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0)';
                });
                
                this.capabilities.push({ card, capability });
            });
        }

        startAllDemonstrations() {
            this.capabilities.forEach(({ card, capability }) => {
                switch(capability) {
                    case 'nlp':
                        this.initNLPDemo(card);
                        break;
                    case 'vision':
                        this.initVisionDemo(card);
                        break;
                    case 'analytics':
                        this.initAnalyticsDemo(card);
                        break;
                    case 'automation':
                        this.initAutomationDemo(card);
                        break;
                    default:
                        console.log('Unknown capability:', capability);
                }
            });
        }

        // NLP Typing Animation
        initNLPDemo(card) {
            const typingElement = card.querySelector('.typing-demo');
            if (!typingElement) return;

            const text = typingElement.dataset.text || "Analyzing sentiment and extracting key insights...";
            this.typeText(typingElement, text);

            // Initialize analysis results
            const resultElement = card.querySelector('.analysis-result');
            if (resultElement) {
                this.animateAnalysisResults(resultElement);
            }
        }

        // Vision Detection Animation
        initVisionDemo(card) {
            const cells = card.querySelectorAll('.vision-cell');
            if (cells.length === 0) return;

            this.animateVisionDetection(cells);
        }

        // Analytics Chart Animation
        initAnalyticsDemo(card) {
            const bars = card.querySelectorAll('.bar');
            if (bars.length === 0) return;

            this.animateChart(bars);
        }

        // Automation Workflow Animation
        initAutomationDemo(card) {
            const steps = card.querySelectorAll('.workflow-step');
            if (steps.length === 0) return;

            this.animateWorkflow(steps);
        }

        // Animation Methods
        typeText(element, text) {
            let index = 0;
            element.textContent = '';
            
            const type = () => {
                if (index < text.length) {
                    element.textContent += text.charAt(index);
                    index++;
                    setTimeout(type, 50 + Math.random() * 50); // Variable typing speed
                } else {
                    // Reset after completion
                    setTimeout(() => {
                        index = 0;
                        element.textContent = '';
                        type();
                    }, 3000);
                }
            };
            
            type();
        }

        animateAnalysisResults(element) {
            const tags = element.querySelectorAll('.tag');
            tags.forEach((tag, index) => {
                setTimeout(() => {
                    tag.style.opacity = '1';
                    tag.style.transform = 'translateY(0)';
                }, index * 500);
            });
        }

        animateVisionDetection(cells) {
            const detectNext = () => {
                // Reset all cells
                cells.forEach(cell => {
                    cell.classList.remove('detected');
                    cell.style.background = 'rgba(255, 255, 255, 0.05)';
                });
                
                // Randomly select cells to detect
                const detectCount = Math.floor(Math.random() * 3) + 3;
                const indices = [];
                
                while (indices.length < detectCount) {
                    const randomIndex = Math.floor(Math.random() * cells.length);
                    if (!indices.includes(randomIndex)) {
                        indices.push(randomIndex);
                    }
                }
                
                // Animate detection
                indices.forEach((index, i) => {
                    setTimeout(() => {
                        cells[index].classList.add('detected');
                        cells[index].style.background = 'rgba(59, 130, 246, 0.3)';
                        cells[index].style.border = '1px solid #3b82f6';
                    }, i * 200);
                });
                
                // Update stats
                const parentDemo = cells[0].closest('.capability-demo');
                const statsElement = parentDemo ? parentDemo.querySelector('.vision-stats') : null;
                if (statsElement) {
                    setTimeout(() => {
                        const accuracy = (95 + Math.random() * 4).toFixed(1);
                        statsElement.innerHTML = `<span>Objects: ${detectCount}</span><span>Accuracy: ${accuracy}%</span>`;
                    }, detectCount * 200);
                }
                
                setTimeout(detectNext, 3000);
            };
            
            detectNext();
        }

        animateChart(bars) {
            const updateChart = () => {
                bars.forEach((bar, index) => {
                    const isHistorical = index < bars.length - 2;
                    let height;
                    
                    if (isHistorical) {
                        height = 30 + Math.random() * 40;
                        bar.style.background = 'rgba(255, 255, 255, 0.3)';
                    } else {
                        height = 60 + Math.random() * 30;
                        bar.style.background = 'linear-gradient(to top, #3b82f6, #60a5fa)';
                    }
                    
                    bar.style.height = height + '%';
                    bar.style.transition = 'height 0.5s ease, background 0.5s ease';
                });
                
                setTimeout(updateChart, 4000);
            };
            
            updateChart();
        }

        animateWorkflow(steps) {
            let currentStep = 0;
            
            const activateNextStep = () => {
                // Reset all steps
                steps.forEach((step, index) => {
                    step.classList.remove('active');
                    step.style.background = 'rgba(255, 255, 255, 0.05)';
                    step.style.color = 'rgba(255, 255, 255, 0.6)';
                });
                
                // Activate steps sequentially
                for (let i = 0; i <= currentStep; i++) {
                    if (steps[i]) {
                        setTimeout(() => {
                            steps[i].classList.add('active');
                            steps[i].style.background = 'rgba(59, 130, 246, 0.2)';
                            steps[i].style.color = 'rgba(255, 255, 255, 0.9)';
                            steps[i].style.border = '1px solid #3b82f6';
                        }, i * 300);
                    }
                }
                
                currentStep++;
                if (currentStep >= steps.length) {
                    currentStep = 0;
                }
                
                setTimeout(activateNextStep, 2000 + (steps.length * 300));
            };
            
            activateNextStep();
        }

        activateCapability(card, capability) {
            // Add active state with pulse effect
            card.classList.add('active');
            card.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.4)';
            
            // Enhanced animation on click
            const icon = card.querySelector('.capability-icon, .ai-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }, 300);
            }
            
            // Trigger specific capability effect
            this.triggerCapabilityEffect(card, capability);
            
            // Remove active state after animation
            setTimeout(() => {
                card.classList.remove('active');
                card.style.boxShadow = '';
            }, 1000);
        }

        triggerCapabilityEffect(card, capability) {
            switch(capability) {
                case 'nlp':
                    const result = card.querySelector('.analysis-result');
                    if (result) {
                        result.style.animation = 'fadeInUp 0.5s ease';
                        setTimeout(() => result.style.animation = '', 500);
                    }
                    break;
                    
                case 'vision':
                    const cells = card.querySelectorAll('.vision-cell');
                    cells.forEach((cell, index) => {
                        setTimeout(() => {
                            cell.style.transform = 'scale(1.1)';
                            cell.style.background = 'rgba(59, 130, 246, 0.4)';
                            setTimeout(() => {
                                cell.style.transform = 'scale(1)';
                                cell.style.background = '';
                            }, 200);
                        }, index * 50);
                    });
                    break;
                    
                case 'analytics':
                    const bars = card.querySelectorAll('.bar');
                    bars.forEach(bar => {
                        const originalHeight = bar.style.height;
                        bar.style.height = '90%';
                        bar.style.background = 'linear-gradient(to top, #10b981, #34d399)';
                        setTimeout(() => {
                            bar.style.height = originalHeight;
                            bar.style.background = '';
                        }, 600);
                    });
                    break;
                    
                case 'automation':
                    const workflowSteps = card.querySelectorAll('.workflow-step');
                    workflowSteps.forEach((step, index) => {
                        setTimeout(() => {
                            step.style.transform = 'scale(1.05)';
                            step.style.background = 'rgba(16, 185, 129, 0.3)';
                            setTimeout(() => {
                                step.style.transform = 'scale(1)';
                                step.style.background = '';
                            }, 300);
                        }, index * 100);
                    });
                    break;
            }
        }
    }

    // === ENHANCED CARD INTERACTIONS === //
    
    class CardInteractions {
        constructor() {
            this.init();
        }

        init() {
            this.setupServiceCards();
            this.setupProjectCards();
            this.setupHoverEffects();
        }

        setupServiceCards() {
            const serviceCards = document.querySelectorAll('.service-card');
            serviceCards.forEach(card => {
                this.addCardInteractions(card);
            });
        }

        setupProjectCards() {
            const projectCards = document.querySelectorAll('.project-card');
            projectCards.forEach(card => {
                this.addCardInteractions(card);
            });
        }

        addCardInteractions(card) {
            // Mouse enter effect
            card.addEventListener('mouseenter', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Create spotlight effect
                card.style.background = `
                    radial-gradient(circle at ${x}px ${y}px, 
                        rgba(59, 130, 246, 0.1) 0%, 
                        rgba(255, 255, 255, 0.03) 40%, 
                        rgba(255, 255, 255, 0.03) 100%)
                `;
                
                // Animate service icon
                const icon = card.querySelector('.service-icon svg');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                }
            });

            // Mouse move effect (subtle follow)
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const deltaX = (x - centerX) / centerX;
                const deltaY = (y - centerY) / centerY;
                
                card.style.transform = `
                    translateY(-4px) 
                    rotateX(${deltaY * 2}deg) 
                    rotateY(${deltaX * 2}deg)
                `;
            });

            // Mouse leave effect
            card.addEventListener('mouseleave', () => {
                card.style.background = '';
                card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
                
                const icon = card.querySelector('.service-icon svg');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        }

        setupHoverEffects() {
            // Button magnetic effect
            const buttons = document.querySelectorAll('.btn, .hero-cta, .footer-contact-btn');
            buttons.forEach(button => {
                button.addEventListener('mouseenter', () => {
                    button.style.transform = 'translateY(-2px) scale(1.02)';
                });
                
                button.addEventListener('mouseleave', () => {
                    button.style.transform = 'translateY(0) scale(1)';
                });
            });

            // Link hover effects
            const links = document.querySelectorAll('.service-link');
            links.forEach(link => {
                link.addEventListener('mouseenter', () => {
                    link.style.color = '#3b82f6';
                    link.style.transform = 'translateX(5px)';
                });
                
                link.addEventListener('mouseleave', () => {
                    link.style.color = '';
                    link.style.transform = 'translateX(0)';
                });
            });
        }
    }

    // === SCROLL ANIMATIONS CONTROLLER === //
    
    class ScrollAnimations {
        constructor() {
            this.elements = [];
            this.init();
        }

        init() {
            this.setupIntersectionObserver();
            this.collectAnimatedElements();
        }

        setupIntersectionObserver() {
            const options = {
                threshold: [0.1, 0.5, 0.9],
                rootMargin: '0px 0px -50px 0px'
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.animateElement(entry.target, entry.intersectionRatio);
                    }
                });
            }, options);
        }

        collectAnimatedElements() {
            const selectors = [
                '.reveal-up',
                '.reveal-left', 
                '.reveal-right',
                '.reveal-scale',
                '[data-animate-when-visible]'
            ];

            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    this.elements.push(el);
                    this.observer.observe(el);
                });
            });
        }

        animateElement(element, ratio) {
            // Different animation based on ratio for smoother effects
            if (ratio >= 0.1) {
                element.classList.add('visible');
                
                // Add stagger delay for grid items
                const parent = element.closest('.services-grid, .projects-grid, .capabilities-showcase');
                if (parent) {
                    const siblings = Array.from(parent.children);
                    const index = siblings.indexOf(element);
                    element.style.transitionDelay = `${index * 0.1}s`;
                }
            }
        }
    }

    // === PERFORMANCE MONITOR === //
    
    class PerformanceMonitor {
        constructor() {
            this.startTime = performance.now();
            this.init();
        }

        init() {
            if ('performance' in window) {
                this.monitorPageLoad();
                this.monitorInteractions();
            }
        }

        monitorPageLoad() {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        const metrics = {
                            loadTime: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                            domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                            firstPaint: this.getFirstPaint(),
                            totalLoadTime: Math.round(performance.now() - this.startTime)
                        };
                        
                        console.log('Page Performance Metrics:', metrics);
                        
                        // Optional: Send to analytics
                        this.sendMetricsToAnalytics(metrics);
                    }
                }, 0);
            });
        }

        getFirstPaint() {
            const paintEntries = performance.getEntriesByType('paint');
            const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
            return firstPaint ? Math.round(firstPaint.startTime) : null;
        }

        monitorInteractions() {
            // Monitor click response times
            document.addEventListener('click', (e) => {
                const startTime = performance.now();
                
                // Measure time until next frame
                requestAnimationFrame(() => {
                    const responseTime = performance.now() - startTime;
                    if (responseTime > 100) {
                        console.warn('Slow interaction detected:', responseTime + 'ms', e.target);
                    }
                });
            });
        }

        sendMetricsToAnalytics(metrics) {
            // Send to Google Analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_performance', {
                    event_category: 'Performance',
                    custom_map: {
                        'metric1': 'load_time',
                        'metric2': 'dom_ready_time'
                    },
                    'load_time': metrics.loadTime,
                    'dom_ready_time': metrics.domContentLoaded
                });
            }
        }
    }

    // === INITIALIZATION === //
    
    function initializeInteractions() {
        // Initialize all interaction systems
        const aiCapabilities = new AICapabilitiesShowcase();
        const cardInteractions = new CardInteractions();
        const scrollAnimations = new ScrollAnimations();
        const performanceMonitor = new PerformanceMonitor();
        
        // Make AI capabilities visible by ensuring section is shown
        const capabilitiesSection = document.getElementById('ai-capabilities');
        if (capabilitiesSection) {
            capabilitiesSection.style.opacity = '1';
            capabilitiesSection.style.visibility = 'visible';
            
            // Ensure all capability cards are visible
            const cards = capabilitiesSection.querySelectorAll('.capability-card');
            cards.forEach(card => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
        }
        
        console.log('All UI interactions initialized successfully');
        
        // Store references globally for debugging
        window.uiSystems = {
            aiCapabilities,
            cardInteractions,
            scrollAnimations,
            performanceMonitor
        };
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeInteractions);
    } else {
        initializeInteractions();
    }

    // Expose initialization function globally
    window.initializeAICapabilities = function() {
        if (window.uiSystems && window.uiSystems.aiCapabilities) {
            window.uiSystems.aiCapabilities.init();
        } else {
            initializeInteractions();
        }
    };

})();