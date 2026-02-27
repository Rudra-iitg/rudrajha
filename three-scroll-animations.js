// ============================================
// PART 8: SCROLL-TRIGGERED 3D ANIMATIONS
// GSAP ScrollTrigger for section transitions and camera effects
// ============================================

class ScrollTriggered3D {
    constructor() {
        this.init();
    }

    init() {
        if (!window.gsap || !window.ScrollTrigger) {
            console.warn('GSAP or ScrollTrigger not loaded');
            return;
        }

        // Enhanced section transitions
        this.setupSectionTransitions();

        // Floating shapes scroll response
        this.setupFloatingShapesScroll();

        // Matrix-style text decode for headers
        this.setupMatrixTextDecode();

        // Camera dolly on scroll (for neural network background)
        this.setupCameraDolly();
    }

    setupSectionTransitions() {
        const sections = document.querySelectorAll('[id]');

        sections.forEach((section, index) => {
            if (!section.id || section.id === 'three-bg-canvas') return;

            // Create scroll trigger for each major section
            gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'top 20%',
                    toggleActions: 'play none none reverse',
                    onEnter: () => {
                        // Trigger glitch effect on section enter
                        if (typeof window.triggerGlitch === 'function' && index % 2 === 0) {
                            window.triggerGlitch();
                        }
                    }
                }
            })
            .from(section, {
                opacity: 0,
                y: 100,
                scale: 0.95,
                duration: 1,
                ease: 'power3.out'
            });
        });

        // Project cards fly in with stagger
        const projectCards = document.querySelectorAll('.project-blueprint, .plugin-slot');
        if (projectCards.length > 0) {
            gsap.from(projectCards, {
                scrollTrigger: {
                    trigger: '#projects',
                    start: 'top 70%'
                },
                z: -2000,
                opacity: 0,
                rotationX: -90,
                stagger: 0.15,
                duration: 1.2,
                ease: 'power3.out',
                transformPerspective: 1000
            });
        }
    }

    setupFloatingShapesScroll() {
        // Shapes in hero section rotate based on scroll momentum
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;

            // Access hero 3D scene if it exists
            if (window.hero3DShapes) {
                window.hero3DShapes.forEach(shape => {
                    if (shape && shape.rotation) {
                        shape.rotation.y = scrollY * 0.001;
                    }
                });
            }
        });
    }

    setupMatrixTextDecode() {
        const headers = document.querySelectorAll('h2.reveal-text');

        headers.forEach(header => {
            const originalText = header.textContent;
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

            gsap.timeline({
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }).to(header, {
                duration: 1.5,
                onUpdate: function() {
                    const progress = this.progress();
                    let decoded = '';

                    for (let i = 0; i < originalText.length; i++) {
                        if (originalText[i] === ' ') {
                            decoded += ' ';
                        } else if (i < originalText.length * progress) {
                            decoded += originalText[i];
                        } else {
                            decoded += chars[Math.floor(Math.random() * chars.length)];
                        }
                    }

                    header.textContent = decoded;
                },
                onComplete: () => {
                    header.textContent = originalText;
                }
            });
        });
    }

    setupCameraDolly() {
        // Camera pulls back as user scrolls past hero
        gsap.to({}, {
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: '100vh top',
                scrub: 1,
                onUpdate: (self) => {
                    const progress = self.progress;

                    // Update neural network camera if accessible
                    if (window.neuralNetworkCamera) {
                        window.neuralNetworkCamera.position.z = 5 + (progress * 2);
                    }
                }
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for GSAP to be fully loaded
    if (window.gsap && window.ScrollTrigger) {
        new ScrollTriggered3D();
    } else {
        console.warn('GSAP not loaded, skipping scroll-triggered 3D animations');
    }
});
