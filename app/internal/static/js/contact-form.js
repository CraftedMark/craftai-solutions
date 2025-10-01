// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const resultDiv = document.getElementById('contact-result');

    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;

        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span>Sending...</span>';

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // Success message
                resultDiv.innerHTML = `
                    <div style="padding: 1rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; color: #10b981;">
                        ✓ ${data.message}
                    </div>
                `;
                contactForm.reset();
            } else {
                // Error message
                resultDiv.innerHTML = `
                    <div style="padding: 1rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #ef4444;">
                        ✗ ${data.message}
                    </div>
                `;
            }
        } catch (error) {
            // Network error
            resultDiv.innerHTML = `
                <div style="padding: 1rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #ef4444;">
                    ✗ Network error. Please try again or email us directly at hello@craftai.solutions
                </div>
            `;
        } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;

            // Scroll to result
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });

    // Add focus styles to form inputs
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#3b82f6';
            this.style.background = 'rgba(255,255,255,0.12)';
        });

        input.addEventListener('blur', function() {
            this.style.borderColor = 'rgba(255,255,255,0.15)';
            this.style.background = 'rgba(255,255,255,0.08)';
        });
    });
});
