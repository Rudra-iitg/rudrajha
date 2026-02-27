// ============================================
// PART 4: 3D PROJECT CARDS
// CSS 3D tilt effect + gloss layer + hover depth
// ============================================

class ProjectCard3D {
    constructor() {
        this.cards = [];
        this.init();
    }

    init() {
        // Find all project cards
        const projectCards = document.querySelectorAll('.project-blueprint, .plugin-slot, .terminal-window, .research-hud');

        projectCards.forEach(card => {
            this.setupCardTilt(card);
            this.addGlossLayer(card);
        });

        // Add hover depth effect CSS
        this.addDepthEffectStyles();
    }

    setupCardTilt(card) {
        card.style.transformStyle = 'preserve-3d';
        card.style.transition = 'transform 0.2s ease-out';

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 to 0.5
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            const rotateX = -y * 20;  // Inverted for correct tilt direction
            const rotateY = x * 20;

            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(20px)
                scale(1.02)
            `;

            // Update gloss position
            const gloss = card.querySelector('.card-gloss');
            if (gloss) {
                const glossX = (x + 0.5) * 100;
                const glossY = (y + 0.5) * 100;
                gloss.style.background = `
                    linear-gradient(
                        ${Math.atan2(y, x) * (180 / Math.PI)}deg,
                        transparent 30%,
                        rgba(255, 255, 255, 0.15) 50%,
                        transparent 70%
                    )
                `;
                gloss.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `
                perspective(1000px)
                rotateX(0)
                rotateY(0)
                translateZ(0)
                scale(1)
            `;

            const gloss = card.querySelector('.card-gloss');
            if (gloss) {
                gloss.style.opacity = '0';
            }
        });

        card.addEventListener('mouseenter', () => {
            const gloss = card.querySelector('.card-gloss');
            if (gloss) {
                gloss.style.opacity = '1';
            }

            // Make surrounding cards slightly recede
            const allCards = document.querySelectorAll('.project-blueprint, .plugin-slot, .terminal-window, .research-hud');
            allCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.style.transform = 'perspective(1000px) translateZ(-10px) scale(0.98)';
                    otherCard.style.opacity = '0.7';
                }
            });
        });

        card.addEventListener('mouseleave', () => {
            // Reset all cards
            const allCards = document.querySelectorAll('.project-blueprint, .plugin-slot, .terminal-window, .research-hud');
            allCards.forEach(otherCard => {
                otherCard.style.transform = 'perspective(1000px) translateZ(0) scale(1)';
                otherCard.style.opacity = '1';
            });
        });

        this.cards.push(card);
    }

    addGlossLayer(card) {
        // Check if gloss layer already exists
        if (card.querySelector('.card-gloss')) return;

        const gloss = document.createElement('div');
        gloss.className = 'card-gloss';
        gloss.style.cssText = `
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 1;
            mix-blend-mode: overlay;
        `;

        // Ensure card has position relative
        if (window.getComputedStyle(card).position === 'static') {
            card.style.position = 'relative';
        }

        card.appendChild(gloss);
    }

    addDepthEffectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .project-blueprint,
            .plugin-slot,
            .terminal-window,
            .research-hud {
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                            opacity 0.3s ease;
                will-change: transform;
            }

            /* Enhance hover effect */
            .project-blueprint:hover,
            .plugin-slot:hover,
            .terminal-window:hover,
            .research-hud:hover {
                z-index: 50;
            }

            /* Add subtle shadow on hover for depth */
            .project-blueprint:hover,
            .plugin-slot:hover {
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
                            0 0 40px rgba(0, 255, 65, 0.1);
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProjectCard3D();
});
