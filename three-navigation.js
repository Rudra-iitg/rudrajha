// ============================================
// PART 10: 3D NAVIGATION
// Letter extrusion on hover + active indicator bar
// ============================================

class Navigation3D {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.activeBar = null;
        this.currentActive = null;
        this.init();
    }

    init() {
        this.createActiveBar();
        this.setupNavLinkEffects();
        this.setupScrollSpy();
    }

    createActiveBar() {
        // Create vertical neon green bar
        this.activeBar = document.createElement('div');
        this.activeBar.className = 'nav-active-bar';
        this.activeBar.style.cssText = `
            position: fixed;
            right: 20px;
            width: 4px;
            height: 0;
            background: linear-gradient(180deg, transparent, #00ff41, transparent);
            box-shadow: 0 0 10px #00ff41, 0 0 20px #00ff41;
            transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            z-index: 99;
            pointer-events: none;
            border-radius: 2px;
            opacity: 0;
        `;
        document.body.appendChild(this.activeBar);
    }

    setupNavLinkEffects() {
        this.navLinks.forEach(link => {
            // Split text into individual letters for 3D effect
            const originalText = link.textContent;
            link.innerHTML = '';

            originalText.split('').forEach((char, index) => {
                const span = document.createElement('span');
                span.textContent = char;
                span.style.cssText = `
                    display: inline-block;
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transition-delay: ${index * 0.02}s;
                `;
                link.appendChild(span);
            });

            // Hover effect: letters extrude toward viewer
            link.addEventListener('mouseenter', () => {
                const letters = link.querySelectorAll('span');
                letters.forEach((letter, index) => {
                    setTimeout(() => {
                        letter.style.transform = `
                            translateZ(20px)
                            scale(1.1)
                            rotateY(${(Math.random() - 0.5) * 10}deg)
                        `;
                        letter.style.color = '#00ff41';
                        letter.style.textShadow = '0 0 10px #00ff41';
                    }, index * 30);
                });
            });

            link.addEventListener('mouseleave', () => {
                const letters = link.querySelectorAll('span');
                letters.forEach(letter => {
                    letter.style.transform = 'translateZ(0) scale(1) rotateY(0)';
                    letter.style.color = '';
                    letter.style.textShadow = '';
                });
            });
        });
    }

    setupScrollSpy() {
        // Update active bar position based on scroll position
        const sections = Array.from(this.navLinks).map(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                return {
                    id: href.substring(1),
                    element: document.getElementById(href.substring(1)),
                    link: link
                };
            }
            return null;
        }).filter(Boolean);

        const updateActiveSection = () => {
            const scrollY = window.scrollY + window.innerHeight / 3;

            let activeSection = sections[0];
            for (const section of sections) {
                if (section.element && section.element.offsetTop <= scrollY) {
                    activeSection = section;
                }
            }

            if (activeSection && activeSection.link !== this.currentActive) {
                this.currentActive = activeSection.link;
                this.updateActiveBar(activeSection.link);
            }
        };

        window.addEventListener('scroll', updateActiveSection);
        updateActiveSection(); // Initial call
    }

    updateActiveBar(link) {
        if (!link) return;

        const rect = link.getBoundingClientRect();
        const top = rect.top + window.scrollY;

        // Animate bar to link position
        this.activeBar.style.top = `${rect.top + rect.height / 2 - 20}px`;
        this.activeBar.style.height = '40px';
        this.activeBar.style.opacity = '1';

        // Highlight active link
        this.navLinks.forEach(l => {
            l.style.color = '';
            l.style.fontWeight = '';
        });

        link.style.color = '#00ff41';
        link.style.fontWeight = '900';
    }
}

// Mobile hamburger menu 3D fold-out
class MobileMenu3D {
    constructor() {
        this.menuButton = document.getElementById('hamburger');
        this.menu = document.getElementById('menu');

        if (this.menuButton && this.menu) {
            this.init();
        }
    }

    init() {
        // Add 3D transform styles
        this.menu.style.transformStyle = 'preserve-3d';
        this.menu.style.transformOrigin = 'right center';

        const originalDisplay = window.getComputedStyle(this.menu).display;

        this.menuButton.addEventListener('click', () => {
            const isOpen = this.menu.style.transform.includes('rotateY(0deg)');

            if (isOpen) {
                // Close with 3D fold
                this.menu.style.transform = 'perspective(1000px) rotateY(90deg)';
                this.menu.style.opacity = '0';
                setTimeout(() => {
                    this.menu.style.display = 'none';
                }, 300);
            } else {
                // Open with 3D unfold
                this.menu.style.display = originalDisplay;
                setTimeout(() => {
                    this.menu.style.transform = 'perspective(1000px) rotateY(0deg)';
                    this.menu.style.opacity = '1';
                }, 10);
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Navigation3D();
    new MobileMenu3D();
});
