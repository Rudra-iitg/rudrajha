// GSAP Animations for Cyber-Brutalist Redesign

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // Initial Load Reveal
    const tl = gsap.timeline();
    
    tl.from('.scanline', {
        duration: 1.5,
        opacity: 0,
        ease: 'power4.inOut'
    })
    .from('.hero-glitch', {
        duration: 1,
        y: 100,
        opacity: 0,
        skewX: 20,
        ease: 'power4.out',
        stagger: 0.2
    }, "-=0.5")
    .from('.btn-brutal', {
        duration: 0.8,
        y: 20,
        opacity: 0,
        stagger: 0.2,
        ease: 'back.out(1.7)'
    }, "-=0.3");

    // Smooth Scroll Reveal for Sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power3.out'
        });
    });

    // Background Grid Motion
    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 20;
        const yPos = (clientY / window.innerHeight - 0.5) * 20;

        gsap.to('.bg-tactical-grid', {
            duration: 1,
            x: xPos,
            y: yPos,
            ease: 'power2.out'
        });
    });

    // Text Glitch/Scramble Effect on Hover
    const glitchElements = document.querySelectorAll('.hero-glitch, .brutal-header');
    glitchElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(el, {
                duration: 0.1,
                skewX: () => Math.random() * 10 - 5,
                x: () => Math.random() * 6 - 3,
                repeat: 5,
                yoyo: true,
                onComplete: () => {
                    gsap.to(el, { duration: 0.1, skewX: 0, x: 0 });
                }
            });
        });
    });

    // Brutalist Card Parallax
    const cards = document.querySelectorAll('.brutalist-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            gsap.to(card, {
                duration: 0.5,
                rotateX: rotateX,
                rotateY: rotateY,
                ease: 'power2.out'
            });
            
            gsap.to(card.querySelector('::after'), {
                duration: 0.5,
                x: rotateY * 2,
                y: -rotateX * 2,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.5,
                rotateX: 0,
                rotateY: 0,
                ease: 'power2.out'
            });
        });
    });
});
