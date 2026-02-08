class NeuralDefenseGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        // Game State
        this.mode = 'AUTO'; 
        this.score = 0;
        this.gameOver = false;
        this.frames = 0;
        
        // Entities
        this.player = { x: 0, y: 0, targetX: 0, width: 40, height: 40, color: '#00FF99' };
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.glitches = [];
        
        // UI Elements
        this.statusEl = document.getElementById('game-status');
        this.scoreEl = document.getElementById('game-score');
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.player.targetX = e.clientX - rect.left;
            if (this.mode === 'MANUAL' && !this.gameOver) {
                // Smooth movement even in manual
                this.player.x += (this.player.targetX - this.player.x) * 0.3;
            }
        });

        this.container.addEventListener('mousedown', () => {
            if (this.gameOver) {
                this.resetGame();
            } else if (this.mode === 'AUTO') {
                this.mode = 'MANUAL';
                this.statusEl.textContent = "STATUS: MANUAL_OVERRIDE";
                this.statusEl.style.color = "#FF3366";
                this.spawnParticles(this.player.x, this.player.y, 30, '#00FF99');
                this.glitchEffect();
            } else {
                this.shoot();
            }
        });

        this.resetGame();
        this.loop();
    }

    resize() {
        if (!this.container) return;
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        this.player.y = this.canvas.height - 80;
        this.player.x = this.canvas.width / 2;
    }

    resetGame() {
        this.score = 0;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.gameOver = false;
        this.frames = 0;
        if (this.scoreEl) this.scoreEl.textContent = "THREATS_NEUTRALIZED: 0";
    }

    glitchEffect() {
        for(let i=0; i<5; i++) {
            this.glitches.push({
                y: Math.random() * this.canvas.height,
                h: Math.random() * 20 + 5,
                life: 1.0,
                offset: (Math.random() - 0.5) * 50
            });
        }
    }

    shoot() {
        // Dual cannons
        [-15, 15].forEach(offset => {
            this.bullets.push({
                x: this.player.x + offset,
                y: this.player.y - 10,
                vx: 0,
                vy: -18,
                color: '#00FF99',
                size: 3
            });
        });
        this.spawnParticles(this.player.x, this.player.y, 5, '#00FF99');
    }

    spawnEnemy() {
        const types = [
            { name: 'PACKET', color: '#FF3366', size: 25, hp: 1, speed: 2 },
            { name: 'WORM', color: '#FFFF00', size: 35, hp: 3, speed: 1.2 },
            { name: 'LOGIC_BOMB', color: '#7000FF', size: 45, hp: 5, speed: 0.8 }
        ];
        const type = types[Math.floor(Math.random() * (this.score > 20 ? 3 : (this.score > 10 ? 2 : 1)))];
        
        this.enemies.push({
            ...type,
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: -50,
            rot: 0,
            rotSpeed: (Math.random() - 0.5) * 0.1
        });
    }

    spawnParticles(x, y, count, color) {
        for(let i=0; i<count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 1.0,
                decay: Math.random() * 0.05 + 0.02,
                color,
                size: Math.random() * 3 + 1
            });
        }
    }

    update() {
        this.frames++;

        if (this.mode === 'AUTO' && !this.gameOver) {
            if (this.enemies.length > 0) {
                const target = this.enemies.sort((a,b) => b.y - a.y)[0];
                this.player.x += (target.x - this.player.x) * 0.15;
                if (Math.abs(target.x - this.player.x) < 30 && this.frames % 12 === 0) this.shoot();
            } else {
                this.player.x += (this.canvas.width/2 + Math.sin(this.frames*0.05)*100 - this.player.x) * 0.05;
            }
        }

        if (this.frames % Math.max(20, 60 - Math.floor(this.score/2)) === 0 && !this.gameOver) {
            this.spawnEnemy();
        }

        this.bullets.forEach((b, i) => {
            b.y += b.vy;
            if (b.y < -50) this.bullets.splice(i, 1);
        });

        this.enemies.forEach((e, i) => {
            e.y += e.speed;
            e.rot += e.rotSpeed;

            this.bullets.forEach((b, j) => {
                const dx = b.x - e.x;
                const dy = b.y - e.y;
                if (Math.sqrt(dx*dx + dy*dy) < e.size) {
                    this.bullets.splice(j, 1);
                    e.hp--;
                    this.spawnParticles(e.x, e.y, 8, e.color);
                    this.glitchEffect();
                    
                    if (e.hp <= 0) {
                        this.enemies.splice(i, 1);
                        this.spawnParticles(e.x, e.y, 25, e.color);
                        this.score += e.name === 'LOGIC_BOMB' ? 5 : (e.name === 'WORM' ? 2 : 1);
                        if (this.scoreEl) this.scoreEl.textContent = `THREATS_NEUTRALIZED: ${this.score}`;
                    }
                }
            });

            if (e.y > this.canvas.height + 50) {
                if (this.mode === 'MANUAL') this.gameOver = true;
                this.enemies.splice(i, 1);
            }
        });

        this.particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            p.life -= p.decay;
            if (p.life <= 0) this.particles.splice(i, 1);
        });

        this.glitches.forEach((g, i) => {
            g.life -= 0.1;
            if (g.life <= 0) this.glitches.splice(i, 1);
        });
    }

    draw() {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid with perspective feel
        this.ctx.strokeStyle = 'rgba(0, 255, 153, 0.05)';
        for(let i=0; i<this.canvas.width; i+=40) {
            this.ctx.beginPath(); this.ctx.moveTo(i, 0); this.ctx.lineTo(i, this.canvas.height); this.ctx.stroke();
        }
        const gridOffset = (this.frames * 2) % 40;
        for(let i=gridOffset; i<this.canvas.height; i+=40) {
            this.ctx.beginPath(); this.ctx.moveTo(0, i); this.ctx.lineTo(this.canvas.width, i); this.ctx.stroke();
        }

        // Glitch Lines
        this.glitches.forEach(g => {
            this.ctx.fillStyle = `rgba(0, 255, 153, ${g.life * 0.2})`;
            this.ctx.fillRect(0, g.y, this.canvas.width, g.h);
        });

        // Player - Advanced Design
        if (!this.gameOver) {
            this.ctx.save();
            this.ctx.translate(this.player.x, this.player.y);
            
            // Engine Glow
            const engineY = 20 + Math.sin(this.frames * 0.5) * 5;
            const grad = this.ctx.createRadialGradient(0, engineY, 0, 0, engineY, 30);
            grad.addColorStop(0, 'rgba(0, 255, 153, 0.8)');
            grad.addColorStop(1, 'transparent');
            this.ctx.fillStyle = grad;
            this.ctx.beginPath(); this.ctx.arc(0, engineY, 20, 0, Math.PI*2); this.ctx.fill();

            // Ship Body
            this.ctx.strokeStyle = '#00FF99';
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#00FF99';
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, -30); // Nose
            this.ctx.lineTo(-20, 10); // Wing L
            this.ctx.lineTo(-10, 10);
            this.ctx.lineTo(-15, 25); // Tail L
            this.ctx.lineTo(15, 25);  // Tail R
            this.ctx.lineTo(10, 10);
            this.ctx.lineTo(20, 10);  // Wing R
            this.ctx.closePath();
            this.ctx.stroke();
            
            // Cockpit
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(-3, -10, 6, 15);
            
            this.ctx.restore();
        }

        // Bullets
        this.bullets.forEach(b => {
            this.ctx.fillStyle = b.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = b.color;
            this.ctx.fillRect(b.x - 2, b.y, 4, 15);
        });

        // Enemies - Detailed Assets
        this.enemies.forEach(e => {
            this.ctx.save();
            this.ctx.translate(e.x, e.y);
            this.ctx.rotate(e.rot);
            
            this.ctx.strokeStyle = e.color;
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = e.color;

            if (e.name === 'PACKET') {
                this.ctx.strokeRect(-e.size/2, -e.size/2, e.size, e.size);
                this.ctx.strokeRect(-e.size/4, -e.size/4, e.size/2, e.size/2);
            } else if (e.name === 'WORM') {
                this.ctx.beginPath();
                for(let i=0; i<6; i++) {
                    const ang = (i / 6) * Math.PI * 2;
                    this.ctx.lineTo(Math.cos(ang) * e.size, Math.sin(ang) * e.size);
                }
                this.ctx.closePath();
                this.ctx.stroke();
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, e.size/2, 0, Math.PI*2);
                this.ctx.moveTo(-e.size/2, 0); this.ctx.lineTo(e.size/2, 0);
                this.ctx.moveTo(0, -e.size/2); this.ctx.lineTo(0, e.size/2);
                this.ctx.stroke();
            }
            this.ctx.restore();
        });

        // Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        this.ctx.globalAlpha = 1;

        // HUD Scanlines
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for(let i=0; i<this.canvas.height; i+=4) {
            this.ctx.fillRect(0, i, this.canvas.width, 1);
        }

        // Overlays
        this.ctx.textAlign = 'center';
        if (this.mode === 'AUTO') {
            this.ctx.fillStyle = 'rgba(0, 255, 153, 0.8)';
            this.ctx.font = '700 18px Space Grotesk';
            this.ctx.fillText("AI_PILOT // SYSTEM_DEFENSE_ACTIVE", this.canvas.width/2, this.canvas.height - 120);
            this.ctx.font = '400 14px monospace';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.fillText("[ CLICK TO TAKE CONTROL ]", this.canvas.width/2, this.canvas.height - 95);
        }

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(10,10,10,0.85)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.strokeStyle = '#FF3366';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(50, this.canvas.height/2 - 60, this.canvas.width-100, 120);
            
            this.ctx.fillStyle = '#FF3366';
            this.ctx.font = '800 40px Syne';
            this.ctx.fillText("CRITICAL FAILURE", this.canvas.width/2, this.canvas.height/2 - 10);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '700 16px Space Grotesk';
            this.ctx.fillText("NETWORK BREACHED // CLICK TO REBOOT", this.canvas.width/2, this.canvas.height/2 + 30);
        }
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NeuralDefenseGame('cyber-dashboard');
});