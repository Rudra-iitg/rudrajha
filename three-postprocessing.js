// ============================================
// PART 7: POST-PROCESSING & GLOBAL EFFECTS
// EffectComposer with Bloom, Film Grain, and Glitch
// ============================================

// Note: This requires Three.js postprocessing modules
// For CDN usage, we'll implement a simplified version using canvas/CSS effects

class PostProcessingEffects {
    constructor() {
        this.glitchActive = false;
        this.init();
    }

    init() {
        // Add CSS scanline overlay
        this.addScanlineOverlay();

        // Add film grain effect via canvas
        this.addFilmGrainEffect();

        // Setup glitch trigger on section changes
        this.setupGlitchTriggers();

        // Add bloom glow effect via CSS filters
        this.addBloomEffect();
    }

    addScanlineOverlay() {
        const scanlineDiv = document.createElement('div');
        scanlineDiv.id = 'scanline-overlay';
        scanlineDiv.style.cssText = `
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 255, 65, 0.015) 2px,
                rgba(0, 255, 65, 0.015) 4px
            );
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: overlay;
        `;
        document.body.appendChild(scanlineDiv);
    }

    addFilmGrainEffect() {
        const grainCanvas = document.createElement('canvas');
        grainCanvas.id = 'film-grain';
        grainCanvas.width = window.innerWidth;
        grainCanvas.height = window.innerHeight;
        grainCanvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
            opacity: 0.03;
            mix-blend-mode: overlay;
        `;
        document.body.appendChild(grainCanvas);

        const ctx = grainCanvas.getContext('2d');

        // Animate film grain
        const animateGrain = () => {
            const imageData = ctx.createImageData(grainCanvas.width, grainCanvas.height);
            const buffer = new Uint32Array(imageData.data.buffer);

            for (let i = 0; i < buffer.length; i++) {
                if (Math.random() < 0.1) {
                    buffer[i] = 0xffffffff;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            requestAnimationFrame(animateGrain);
        };

        animateGrain();

        // Resize handler
        window.addEventListener('resize', () => {
            grainCanvas.width = window.innerWidth;
            grainCanvas.height = window.innerHeight;
        });
    }

    addBloomEffect() {
        // Add CSS filter for bloom/glow effect on specific elements
        const style = document.createElement('style');
        style.textContent = `
            /* Bloom glow on neon elements */
            .pill:hover,
            .social-3d-link:hover,
            .btn-mega:hover,
            h1::after,
            .skill-bar-fill {
                filter: drop-shadow(0 0 8px currentColor)
                        drop-shadow(0 0 12px currentColor);
            }

            /* Enhanced glow on active elements */
            .status-light,
            .terminal-submit:hover,
            #send-button:hover {
                filter: drop-shadow(0 0 10px currentColor)
                        drop-shadow(0 0 20px currentColor)
                        brightness(1.2);
            }
        `;
        document.head.appendChild(style);
    }

    setupGlitchTriggers() {
        // Trigger glitch effect on section scroll into view
        const sections = document.querySelectorAll('[id]');

        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.glitchActive) {
                    this.triggerGlitch();
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            if (section.id && ['projects', 'extensions', 'ai-systems', 'tools', 'about', 'contact'].includes(section.id)) {
                observer.observe(section);
            }
        });
    }

    triggerGlitch() {
        if (this.glitchActive) return;

        this.glitchActive = true;
        const glitchDuration = 200;

        // Create glitch overlay
        const glitchDiv = document.createElement('div');
        glitchDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9997;
        `;
        document.body.appendChild(glitchDiv);

        // Animate glitch bars
        let frame = 0;
        const glitchInterval = setInterval(() => {
            glitchDiv.innerHTML = '';

            // Create random glitch bars
            for (let i = 0; i < 8; i++) {
                const bar = document.createElement('div');
                const height = Math.random() * 50 + 10;
                const top = Math.random() * 100;
                const offset = (Math.random() - 0.5) * 30;
                const color = Math.random() > 0.5 ? 'rgba(0, 255, 65, 0.3)' : 'rgba(255, 0, 64, 0.3)';

                bar.style.cssText = `
                    position: absolute;
                    top: ${top}%;
                    left: 0;
                    width: 100%;
                    height: ${height}px;
                    background: ${color};
                    transform: translateX(${offset}px);
                    mix-blend-mode: difference;
                `;
                glitchDiv.appendChild(bar);
            }

            frame++;
            if (frame > 10) {
                clearInterval(glitchInterval);
                document.body.removeChild(glitchDiv);
                setTimeout(() => {
                    this.glitchActive = false;
                }, 1000);
            }
        }, 20);
    }

    // Manual trigger for specific events
    triggerManualGlitch() {
        this.triggerGlitch();
    }
}

// Initialize when DOM is ready
let postProcessing;
document.addEventListener('DOMContentLoaded', () => {
    postProcessing = new PostProcessingEffects();
});

// Export for external use
if (typeof window !== 'undefined') {
    window.triggerGlitch = () => {
        if (postProcessing) {
            postProcessing.triggerManualGlitch();
        }
    };
}
