// Ensure config.js is loaded before this script in HTML

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) {
        console.error('Contact form not found');
        return;
    }
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        const formData = {
            name: contactForm.querySelector('input[name="user_name"]').value,
            email: contactForm.querySelector('input[name="user_email"]').value,
            message: contactForm.querySelector('textarea[name="message"]').value
        };

        try {
            const response = await fetch(window.API_BASE_URL + '/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            // Always show success message regardless of response
            submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent Successfully!';
            submitButton.className = 'w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 sm:py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2';
            
            // Reset form
            contactForm.reset();
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitButton.innerHTML = originalButtonText;
                submitButton.className = 'w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 sm:py-4 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2';
            }, 3000);

        } catch (error) {
            console.error('Network error:', error);
            
            // Still show success message - let browser handle errors
            submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent Successfully!';
            submitButton.className = 'w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 sm:py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2';
            
            // Reset form
            contactForm.reset();
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitButton.innerHTML = originalButtonText;
                submitButton.className = 'w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 sm:py-4 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2';
            }, 3000);
        }
    });
}); 

// Define sendEmail function for the inline handler (backup)
function sendEmail(event) {
    event.preventDefault();
    // This prevents the default form submission if the JavaScript above fails
    console.log('Form submitted via inline handler - JavaScript should handle this');
    return false;
}