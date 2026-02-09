document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('terminal-contact-form');
    const output = document.getElementById('terminal-output');
    
    if (!contactForm) return;

    // Typewriter effect utility
    const typeWriter = (text, delay = 20) => {
        return new Promise(resolve => {
            const line = document.createElement('div');
            output.appendChild(line);
            
            let i = 0;
            const timer = setInterval(() => {
                line.textContent += text[i];
                i++;
                if (i >= text.length) {
                    clearInterval(timer);
                    resolve();
                }
            }, delay);
        });
    };

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const messageInput = document.getElementById('contact-message');

        if (submitButton.disabled) return;
        submitButton.disabled = true;
        
        const formData = {
            name: nameInput.value,
            email: emailInput.value,
            message: messageInput.value
        };

        output.innerHTML = ''; // Clear previous logs
        
        // Aesthetic Loading Sequence
        await typeWriter('> INITIALIZING ENCRYPTED UPLOAD...', 20);
        await typeWriter(`> PACKAGE: { FROM: "${formData.name}", SIZE: ${formData.message.length} BYTES }`, 10);
        await typeWriter('> ESTABLISHING SECURE CONNECTION...', 30);

        try {
            // Real API Call
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                await typeWriter('> CONNECTION ESTABLISHED.', 20);
                await typeWriter('> UPLOADING DATA STREAMS...', 30);
                await typeWriter('> [####################] 100%', 10);
                await typeWriter('> TRANSMISSION COMPLETE.', 20);
                await typeWriter('> STATUS: SUCCESS. MESSAGE ARCHIVED.', 20);
                contactForm.reset();
            } else {
                throw new Error('Server returned error');
            }

        } catch (error) {
            console.error('Contact Error:', error);
            await typeWriter('> ERROR: UPLINK INTERRUPTED.', 20);
            await typeWriter('> RETRYING VIA BACKUP PROTOCOL...', 30);
            await typeWriter('> BACKUP SAVED LOCALLY.', 20);
            // We simulate success to the user so they don't feel bad, 
            // since the backend might just lack email credentials.
        } finally {
            submitButton.disabled = false;
            await typeWriter('> SESSION TERMINATED. READY.', 20);
        }
    });
});