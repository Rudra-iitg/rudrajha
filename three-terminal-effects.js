// ============================================
// PART 11: TERMINAL CONTACT INTERFACE
// Matrix rain background + transmission animation
// ============================================

class TerminalContactEffects {
    constructor() {
        this.terminalContainer = document.querySelector('.terminal-container');
        this.contactForm = document.getElementById('terminal-contact-form');
        this.terminalInputs = document.querySelectorAll('.terminal-body input, .terminal-body textarea');

        if (this.terminalContainer) {
            this.init();
        }
    }

    init() {
        // Add Matrix rain background
        this.createMatrixRain();

        // Enhanced input focus effects
        this.setupInputEffects();

        // Setup transmission animation
        this.setupTransmissionAnimation();
    }

    createMatrixRain() {
        // Create canvas for matrix rain
        const canvas = document.createElement('canvas');
        canvas.className = 'matrix-rain-canvas';
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            opacity: 0.08;
            pointer-events: none;
        `;

        this.terminalContainer.style.position = 'relative';
        this.terminalContainer.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = this.terminalContainer.offsetWidth;
        canvas.height = this.terminalContainer.offsetHeight;

        // Matrix characters
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#00ff41';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                ctx.fillText(char, x, y);

                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
            }
        };

        setInterval(draw, 50);

        // Resize handler
        window.addEventListener('resize', () => {
            canvas.width = this.terminalContainer.offsetWidth;
            canvas.height = this.terminalContainer.offsetHeight;
        });
    }

    setupInputEffects() {
        this.terminalInputs.forEach(input => {
            // Focus effect: brighten and add blinking cursor
            input.addEventListener('focus', () => {
                input.style.borderLeftColor = '#00ff41';
                input.style.borderLeftWidth = '3px';
                input.style.paddingLeft = 'calc(1rem - 1px)';
                input.style.boxShadow = '0 0 15px rgba(0, 255, 65, 0.3)';
                input.style.animation = 'none'; // Stop any existing animation

                // Add blinking cursor effect
                setTimeout(() => {
                    input.style.animation = 'terminal-cursor-blink 1s step-end infinite';
                }, 10);
            });

            input.addEventListener('blur', () => {
                input.style.borderLeftWidth = '2px';
                input.style.paddingLeft = '1rem';
                input.style.boxShadow = 'none';
                input.style.animation = 'none';
            });
        });

        // Add cursor blink animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes terminal-cursor-blink {
                0%, 49% {
                    border-right: 2px solid #00ff41;
                }
                50%, 100% {
                    border-right: 2px solid transparent;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupTransmissionAnimation() {
        if (!this.contactForm) return;

        const terminalOutput = document.getElementById('terminal-output');

        this.contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = this.contactForm.querySelector('.terminal-submit');
            const originalButtonText = submitButton.textContent;

            // Disable form
            submitButton.disabled = true;
            this.terminalInputs.forEach(input => input.disabled = true);

            // Phase 1: Text scramble
            await this.scrambleText(terminalOutput, '>> INITIATING_TRANSMISSION...');

            // Phase 2: Loading bar
            await this.showLoadingBar(terminalOutput);

            // Phase 3: Success message
            await this.scrambleText(terminalOutput, '>> TRANSMISSION_SENT [STATUS: 200_OK]', '#00ff41');

            // Simulate actual form submission (if you have backend)
            // const formData = new FormData(this.contactForm);
            // await fetch('/api/contact', { method: 'POST', body: formData });

            // Reset form after delay
            setTimeout(() => {
                this.contactForm.reset();
                submitButton.disabled = false;
                this.terminalInputs.forEach(input => input.disabled = false);
                submitButton.textContent = originalButtonText;
                terminalOutput.textContent = '';
            }, 3000);
        });
    }

    async scrambleText(element, finalText, color = '#ffff00') {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/';
        const duration = 500;
        const iterations = 20;
        const delay = duration / iterations;

        element.style.color = color;

        for (let i = 0; i <= iterations; i++) {
            await new Promise(resolve => setTimeout(resolve, delay));

            const progress = i / iterations;
            let scrambled = '';

            for (let j = 0; j < finalText.length; j++) {
                if (finalText[j] === ' ') {
                    scrambled += ' ';
                } else if (j < finalText.length * progress) {
                    scrambled += finalText[j];
                } else {
                    scrambled += chars[Math.floor(Math.random() * chars.length)];
                }
            }

            element.textContent = scrambled;
        }

        element.textContent = finalText;
    }

    async showLoadingBar(element) {
        element.style.color = '#ffff00';
        const barLength = 30;
        const duration = 1500;
        const steps = barLength;
        const delay = duration / steps;

        for (let i = 0; i <= barLength; i++) {
            await new Promise(resolve => setTimeout(resolve, delay));
            const filled = '█'.repeat(i);
            const empty = '░'.repeat(barLength - i);
            const percentage = Math.floor((i / barLength) * 100);
            element.textContent = `>> PROGRESS: [${filled}${empty}] ${percentage}%`;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TerminalContactEffects();
});
