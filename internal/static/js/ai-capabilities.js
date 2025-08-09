// AI Capabilities Interactive Showcase
document.addEventListener('DOMContentLoaded', function() {
    // Initialize capability cards
    const capabilityCards = document.querySelectorAll('.capability-card');
    
    capabilityCards.forEach(card => {
        const capability = card.dataset.capability;
        
        // Add click interaction
        card.addEventListener('click', function() {
            activateCapability(this, capability);
        });
        
        // Initialize animations on page load
        if (capability === 'nlp') {
            initializeNLPDemo(card);
        } else if (capability === 'vision') {
            initializeVisionDemo(card);
        } else if (capability === 'analytics') {
            initializeAnalyticsDemo(card);
        } else if (capability === 'automation') {
            initializeAutomationDemo(card);
        }
    });
    
    // NLP Typing Animation
    function initializeNLPDemo(card) {
        const typingElement = card.querySelector('.typing-demo');
        if (typingElement) {
            const text = typingElement.dataset.text;
            typeText(typingElement, text);
        }
    }
    
    // Vision Detection Animation
    function initializeVisionDemo(card) {
        const cells = card.querySelectorAll('.vision-cell');
        animateVisionDetection(cells);
    }
    
    // Analytics Chart Animation
    function initializeAnalyticsDemo(card) {
        const bars = card.querySelectorAll('.bar');
        animateChart(bars);
    }
    
    // Automation Workflow Animation
    function initializeAutomationDemo(card) {
        const steps = card.querySelectorAll('.workflow-step');
        animateWorkflow(steps);
    }
    
    // Typing effect for NLP demo
    function typeText(element, text) {
        let index = 0;
        element.textContent = '';
        
        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, 50);
            } else {
                // Reset after completion
                setTimeout(() => {
                    index = 0;
                    element.textContent = '';
                    type();
                }, 3000);
            }
        }
        
        type();
    }
    
    // Animate vision detection cells
    function animateVisionDetection(cells) {
        let currentIndex = 0;
        
        function detectNext() {
            // Reset all cells
            cells.forEach(cell => cell.classList.remove('detected'));
            
            // Randomly select cells to detect
            const detectCount = Math.floor(Math.random() * 3) + 3;
            const indices = [];
            
            while (indices.length < detectCount) {
                const randomIndex = Math.floor(Math.random() * cells.length);
                if (!indices.includes(randomIndex)) {
                    indices.push(randomIndex);
                    cells[randomIndex].classList.add('detected');
                }
            }
            
            // Update stats
            const statsElement = cells[0].closest('.capability-demo').querySelector('.vision-stats');
            if (statsElement) {
                const accuracy = (95 + Math.random() * 4).toFixed(1);
                statsElement.innerHTML = `<span>Objects: ${detectCount}</span><span>Accuracy: ${accuracy}%</span>`;
            }
            
            setTimeout(detectNext, 2000);
        }
        
        detectNext();
    }
    
    // Animate predictive analytics chart
    function animateChart(bars) {
        function updateChart() {
            bars.forEach((bar, index) => {
                if (index < 3) {
                    // Historical data
                    const height = 30 + Math.random() * 40;
                    bar.style.height = height + '%';
                } else {
                    // Predicted data
                    const height = 60 + Math.random() * 30;
                    bar.style.height = height + '%';
                }
            });
            
            setTimeout(updateChart, 3000);
        }
        
        updateChart();
    }
    
    // Animate workflow steps
    function animateWorkflow(steps) {
        let currentStep = 0;
        
        function activateNextStep() {
            steps.forEach(step => step.classList.remove('active'));
            
            // Activate steps sequentially
            for (let i = 0; i <= currentStep; i++) {
                steps[i].classList.add('active');
            }
            
            currentStep++;
            if (currentStep >= steps.length) {
                currentStep = 0;
                // Reset after completion
                setTimeout(() => {
                    steps.forEach(step => step.classList.remove('active'));
                    activateNextStep();
                }, 1000);
            } else {
                setTimeout(activateNextStep, 800);
            }
        }
        
        activateNextStep();
    }
    
    // Activate capability on click
    function activateCapability(card, capability) {
        // Add active state
        card.classList.add('active');
        
        // Enhanced animation on click
        const icon = card.querySelector('.ai-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1)';
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
            }, 300);
        }
        
        // Remove active state after animation
        setTimeout(() => {
            card.classList.remove('active');
        }, 600);
        
        // Trigger specific capability animation
        if (capability === 'nlp') {
            const result = card.querySelector('.analysis-result');
            if (result) {
                result.style.animation = 'fadeInUp 0.5s ease';
                setTimeout(() => {
                    result.style.animation = '';
                }, 500);
            }
        }
    }
    
    // Add hover sound effect (optional)
    capabilityCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add subtle hover effect
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Additional animation for fade in up
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .capability-card.active {
        animation: pulseGlow 0.6s ease;
    }
    
    @keyframes pulseGlow {
        0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
        }
        50% {
            box-shadow: 0 0 20px 10px rgba(59, 130, 246, 0.2);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
        }
    }
`;
document.head.appendChild(style);