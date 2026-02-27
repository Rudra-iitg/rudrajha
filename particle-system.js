// Tactical Particle System for Cyber-Brutalist Aesthetic

class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 80;
        this.mouse = { x: null, y: null, radius: 150 };
        this.cursorTrail = [];
        this.maxTrailLength = 20;

        this.init();
    }

    init() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        this.canvas.style.opacity = '0.4';
        document.body.appendChild(this.canvas);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Track mouse position
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            // Add to cursor trail
            this.cursorTrail.push({
                x: e.clientX,
                y: e.clientY,
                life: 1.0
            });

            if (this.cursorTrail.length > this.maxTrailLength) {
                this.cursorTrail.shift();
            }
        });

        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            baseX: Math.random() * this.canvas.width,
            baseY: Math.random() * this.canvas.height,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            life: Math.random() * 0.5 + 0.2,
            density: Math.random() * 30 + 5
        };
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw cursor trail
        this.cursorTrail.forEach((trail, index) => {
            const size = (trail.life * 6) * (index / this.cursorTrail.length);
            this.ctx.fillStyle = `rgba(0, 255, 153, ${trail.life * 0.3})`;
            this.ctx.fillRect(trail.x - size/2, trail.y - size/2, size, size);
            trail.life -= 0.05;
        });

        // Remove dead trails
        this.cursorTrail = this.cursorTrail.filter(t => t.life > 0);

        this.particles.forEach((p, i) => {
            // Base movement
            p.baseX += p.speedX;
            p.baseY += p.speedY;

            if (p.baseX < 0) p.baseX = this.canvas.width;
            if (p.baseX > this.canvas.width) p.baseX = 0;
            if (p.baseY < 0) p.baseY = this.canvas.height;
            if (p.baseY > this.canvas.height) p.baseY = 0;

            // Mouse interaction - attraction/repulsion effect
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - p.baseX;
                const dy = this.mouse.y - p.baseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const maxDistance = this.mouse.radius;
                const force = (maxDistance - distance) / maxDistance;

                if (distance < this.mouse.radius) {
                    const directionX = forceDirectionX * force * p.density;
                    const directionY = forceDirectionY * force * p.density;
                    p.x = p.baseX - directionX;
                    p.y = p.baseY - directionY;
                } else {
                    p.x = p.baseX;
                    p.y = p.baseY;
                }
            } else {
                p.x = p.baseX;
                p.y = p.baseY;
            }

            // Draw particle with glow effect
            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
            gradient.addColorStop(0, '#00F0FF');
            gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);

            // Connect lines if close
            this.particles.forEach((p2, j) => {
                if (i === j) return;
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - dist/120)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            });

            // Connect to mouse cursor
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.mouse.radius) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(0, 255, 153, ${0.3 * (1 - dist/this.mouse.radius)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.stroke();
                }
            }
        });
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});
