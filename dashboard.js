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
        this.combo = 0;
        this.maxCombo = 0;
        this.gameOver = false;
        this.frames = 0;
        this.level = 1;
        this.shake = { x: 0, y: 0, intensity: 0 };

        // Entities
        this.player = {
            x: 0, y: 0, targetX: 0, width: 40, height: 40,
            color: '#00FF99', health: 100, maxHealth: 100,
            activePowerups: []
        };
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.glitches = [];
        this.powerups = [];
        this.trails = [];
        this.laserBeams = [];
        this.explosions = [];

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
        this.combo = 0;
        this.maxCombo = 0;
        this.level = 1;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.powerups = [];
        this.trails = [];
        this.gameOver = false;
        this.frames = 0;
        this.player.health = this.player.maxHealth;
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

    screenShake(intensity = 5) {
        this.shake.intensity = intensity;
    }

    shoot() {
        // Dual cannons with trails
        [-15, 15].forEach(offset => {
            const bullet = {
                x: this.player.x + offset,
                y: this.player.y - 10,
                vx: 0,
                vy: -18,
                color: '#00FF99',
                size: 3
            };
            this.bullets.push(bullet);
            // Create bullet trail
            this.trails.push({
                x: bullet.x,
                y: bullet.y,
                life: 1.0,
                color: '#00FF99'
            });
        });
        this.spawnParticles(this.player.x, this.player.y, 5, '#00FF99');
    }

    spawnEnemy() {
        const types = [
            { name: 'PACKET', color: '#FF3366', size: 25, hp: 1, speed: 2, points: 1 },
            { name: 'WORM', color: '#FFFF00', size: 35, hp: 3, speed: 1.2, points: 2 },
            { name: 'LOGIC_BOMB', color: '#7000FF', size: 45, hp: 5, speed: 0.8, points: 5 }
        ];
        const difficultyLevel = Math.min(Math.floor(this.score / 10), 2);
        const type = types[Math.floor(Math.random() * (difficultyLevel + 1))];

        this.enemies.push({
            ...type,
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: -50,
            z: Math.random() * 0.5 + 0.5, // Depth from 0.5 to 1.0
            rot: 0,
            rotSpeed: (Math.random() - 0.5) * 0.1,
            currentHp: type.hp
        });
    }

    spawnPowerup(x, y) {
        // 30% chance to spawn a powerup
        if (Math.random() < 0.3) {
            const types = [
                { type: 'SHIELD', color: '#00FFFF', symbol: '+' },
                { type: 'RAPID_FIRE', color: '#FFD700', symbol: '»' },
                { type: 'LASER_BEAM', color: '#FF00FF', symbol: '━' },
                { type: 'TIME_SLOW', color: '#00FF99', symbol: '◷' },
                { type: 'EXPLOSION', color: '#FF6600', symbol: '☢' }
            ];
            const powerup = types[Math.floor(Math.random() * types.length)];
            this.powerups.push({
                x, y,
                type: powerup.type,
                color: powerup.color,
                symbol: powerup.symbol,
                size: 20,
                life: 1.0,
                rotation: 0
            });
        }
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

    handlePowerup(type) {
        switch(type) {
            case 'SHIELD':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 25);
                break;
            case 'RAPID_FIRE':
                this.activatePowerup('RAPID_FIRE', 5000);
                break;
            case 'LASER_BEAM':
                this.activateLaser();
                break;
            case 'TIME_SLOW':
                this.activatePowerup('TIME_SLOW', 4000);
                break;
            case 'EXPLOSION':
                this.activateExplosion();
                break;
        }
    }

    activatePowerup(type, duration) {
        const existing = this.player.activePowerups.find(p => p.type === type);
        if (existing) {
            existing.endTime = this.frames + duration / 16.67;
        } else {
            this.player.activePowerups.push({
                type,
                endTime: this.frames + duration / 16.67
            });
        }
    }

    activateLaser() {
        this.laserBeams.push({
            x: this.player.x,
            y: this.player.y,
            life: 1.0,
            width: 10
        });
        this.screenShake(5);
    }

    activateExplosion() {
        this.explosions.push({
            x: this.player.x,
            y: this.player.y - 100,
            radius: 0,
            maxRadius: 200,
            life: 1.0
        });
        this.screenShake(15);
    }

    update() {
        this.frames++;

        // Screen shake decay
        if (this.shake.intensity > 0) {
            this.shake.x = (Math.random() - 0.5) * this.shake.intensity;
            this.shake.y = (Math.random() - 0.5) * this.shake.intensity;
            this.shake.intensity *= 0.9;
        }

        // Update active powerups
        this.player.activePowerups = this.player.activePowerups.filter(p => {
            return this.frames < p.endTime;
        });

        // Combo decay
        if (this.frames % 120 === 0 && this.combo > 0) {
            this.combo = Math.max(0, this.combo - 1);
        }

        const timeSlowActive = this.player.activePowerups.some(p => p.type === 'TIME_SLOW');
        const rapidFireActive = this.player.activePowerups.some(p => p.type === 'RAPID_FIRE');

        if (this.mode === 'AUTO' && !this.gameOver) {
            if (this.enemies.length > 0) {
                const target = this.enemies.sort((a,b) => b.y - a.y)[0];
                this.player.x += (target.x - this.player.x) * 0.15;
                const fireRate = rapidFireActive ? 6 : 12;
                if (Math.abs(target.x - this.player.x) < 30 && this.frames % fireRate === 0) this.shoot();
            } else {
                this.player.x += (this.canvas.width/2 + Math.sin(this.frames*0.05)*100 - this.player.x) * 0.05;
            }
        }

        // Improved spawn rate with difficulty scaling
        const baseSpawnRate = Math.max(20, 60 - Math.floor(this.score/2));
        const spawnRate = timeSlowActive ? baseSpawnRate * 2 : baseSpawnRate;
        if (this.frames % spawnRate === 0 && !this.gameOver) {
            this.spawnEnemy();
        }

        // Update laser beams
        this.laserBeams.forEach((laser, i) => {
            laser.life -= 0.05;
            if (laser.life <= 0) this.laserBeams.splice(i, 1);
        });

        // Update explosions
        this.explosions.forEach((exp, i) => {
            exp.radius += 10;
            exp.life -= 0.03;
            if (exp.life <= 0 || exp.radius >= exp.maxRadius) {
                this.explosions.splice(i, 1);
            }
        });

        // Update bullets with trails
        this.bullets.forEach((b, i) => {
            b.y += b.vy;
            if (this.frames % 2 === 0) {
                this.trails.push({
                    x: b.x,
                    y: b.y,
                    life: 0.5,
                    color: b.color
                });
            }
            if (b.y < -50) this.bullets.splice(i, 1);
        });

        // Update trails
        this.trails.forEach((t, i) => {
            t.life -= 0.05;
            if (t.life <= 0) this.trails.splice(i, 1);
        });

        // Update powerups
        this.powerups.forEach((p, i) => {
            p.y += 2;
            p.rotation += 0.05;
            const dx = p.x - this.player.x;
            const dy = p.y - this.player.y;
            if (Math.sqrt(dx*dx + dy*dy) < 40) {
                this.powerups.splice(i, 1);
                this.spawnParticles(p.x, p.y, 20, p.color);
                this.handlePowerup(p.type);
            }
            if (p.y > this.canvas.height + 50) this.powerups.splice(i, 1);
        });

        this.enemies.forEach((e, i) => {
            const speedMultiplier = timeSlowActive ? 0.5 : 1;
            e.y += e.speed * speedMultiplier;
            e.rot += e.rotSpeed;

            // Check laser beam collision
            this.laserBeams.forEach(laser => {
                if (Math.abs(laser.x - e.x) < laser.width + e.size/2 && e.y < this.player.y) {
                    e.currentHp = 0;
                }
            });

            // Check explosion collision
            this.explosions.forEach(exp => {
                const dx = exp.x - e.x;
                const dy = exp.y - e.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < exp.radius) {
                    e.currentHp = 0;
                }
            });

            this.bullets.forEach((b, j) => {
                const dx = b.x - e.x;
                const dy = b.y - e.y;
                if (Math.sqrt(dx*dx + dy*dy) < e.size * e.z) {
                    this.bullets.splice(j, 1);
                    e.currentHp--;
                    this.spawnParticles(e.x, e.y, 8, e.color);
                    this.glitchEffect();
                    this.screenShake(3);

                    if (e.currentHp <= 0) {
                        this.enemies.splice(i, 1);
                        this.spawnParticles(e.x, e.y, 25, e.color);
                        this.screenShake(8);
                        this.combo++;
                        this.maxCombo = Math.max(this.maxCombo, this.combo);
                        this.score += e.points * (1 + Math.floor(this.combo / 5));
                        this.spawnPowerup(e.x, e.y);
                        if (this.scoreEl) {
                            const comboText = this.combo > 1 ? ` (x${this.combo} COMBO!)` : '';
                            this.scoreEl.textContent = `THREATS_NEUTRALIZED: ${this.score}${comboText}`;
                        }
                    }
                }
            });

            if (e.currentHp <= 0) {
                this.enemies.splice(i, 1);
                this.spawnParticles(e.x, e.y, 25, e.color);
                this.screenShake(8);
                this.combo++;
                this.maxCombo = Math.max(this.maxCombo, this.combo);
                this.score += e.points * (1 + Math.floor(this.combo / 5));
                this.spawnPowerup(e.x, e.y);
                if (this.scoreEl) {
                    const comboText = this.combo > 1 ? ` (x${this.combo} COMBO!)` : '';
                    this.scoreEl.textContent = `THREATS_NEUTRALIZED: ${this.score}${comboText}`;
                }
            }

            if (e.y > this.canvas.height + 50) {
                if (this.mode === 'MANUAL') {
                    this.player.health -= 20;
                    this.combo = 0;
                    this.screenShake(10);
                    if (this.player.health <= 0) this.gameOver = true;
                }
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
        // Apply screen shake
        this.ctx.save();
        this.ctx.translate(this.shake.x, this.shake.y);

        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid with perspective feel and parallax
        this.ctx.strokeStyle = 'rgba(0, 255, 153, 0.05)';
        for(let i=0; i<this.canvas.width; i+=40) {
            this.ctx.beginPath(); this.ctx.moveTo(i, 0); this.ctx.lineTo(i, this.canvas.height); this.ctx.stroke();
        }
        const gridOffset = (this.frames * 2) % 40;
        for(let i=gridOffset; i<this.canvas.height; i+=40) {
            this.ctx.beginPath(); this.ctx.moveTo(0, i); this.ctx.lineTo(this.canvas.width, i); this.ctx.stroke();
        }

        // Background layer grid (parallax effect)
        this.ctx.strokeStyle = 'rgba(0, 255, 153, 0.02)';
        const bgGridOffset = (this.frames * 1) % 60;
        for(let i=bgGridOffset; i<this.canvas.height; i+=60) {
            this.ctx.beginPath(); this.ctx.moveTo(0, i); this.ctx.lineTo(this.canvas.width, i); this.ctx.stroke();
        }

        // Glitch Lines
        this.glitches.forEach(g => {
            this.ctx.fillStyle = `rgba(0, 255, 153, ${g.life * 0.2})`;
            this.ctx.fillRect(0, g.y, this.canvas.width, g.h);
        });

        // Draw explosions
        this.explosions.forEach(exp => {
            this.ctx.save();
            this.ctx.globalAlpha = exp.life;

            // Outer ring
            this.ctx.strokeStyle = '#FF6600';
            this.ctx.lineWidth = 4;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#FF6600';
            this.ctx.beginPath();
            this.ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
            this.ctx.stroke();

            // Inner ring
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(exp.x, exp.y, exp.radius * 0.7, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.restore();
        });

        // Draw laser beams
        this.laserBeams.forEach(laser => {
            this.ctx.save();
            this.ctx.globalAlpha = laser.life;

            const gradient = this.ctx.createLinearGradient(laser.x, laser.y, laser.x, 0);
            gradient.addColorStop(0, 'rgba(255, 0, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 0, 255, 0.2)');
            this.ctx.fillStyle = gradient;
            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = '#FF00FF';
            this.ctx.fillRect(laser.x - laser.width/2, 0, laser.width, laser.y);

            this.ctx.restore();
        });

        // Bullet trails
        this.trails.forEach(t => {
            this.ctx.globalAlpha = t.life;
            this.ctx.fillStyle = t.color;
            this.ctx.fillRect(t.x - 1, t.y, 2, 8);
        });
        this.ctx.globalAlpha = 1;

        // Powerups with 3D rotation effect
        this.powerups.forEach(p => {
            this.ctx.save();
            this.ctx.translate(p.x, p.y);

            const scale = 1 + Math.sin(this.frames * 0.1 + p.y) * 0.2;
            this.ctx.scale(scale, scale);
            this.ctx.rotate(p.rotation);

            this.ctx.strokeStyle = p.color;
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = p.color;
            this.ctx.strokeRect(-p.size/2, -p.size/2, p.size, p.size);

            this.ctx.font = '18px monospace';
            this.ctx.fillStyle = p.color;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(p.symbol, 0, 0);

            this.ctx.restore();
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

            // Player health bar (only in manual mode)
            if (this.mode === 'MANUAL') {
                const barWidth = 60;
                const barHeight = 6;
                const barX = this.player.x - barWidth/2;
                const barY = this.player.y - 50;

                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                this.ctx.fillRect(barX, barY, barWidth, barHeight);

                const healthPercent = this.player.health / this.player.maxHealth;
                const healthColor = healthPercent > 0.5 ? '#00FF99' : healthPercent > 0.25 ? '#FFFF00' : '#FF3366';
                this.ctx.fillStyle = healthColor;
                this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(barX, barY, barWidth, barHeight);
            }
        }

        // Bullets
        this.bullets.forEach(b => {
            this.ctx.fillStyle = b.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = b.color;
            this.ctx.fillRect(b.x - 2, b.y, 4, 15);
        });

        // Enemies - 3D rendering with depth and shadows
        // Sort enemies by z-depth for proper layering
        const sortedEnemies = [...this.enemies].sort((a, b) => a.z - b.z);

        sortedEnemies.forEach(e => {
            this.ctx.save();

            // Apply 3D scale based on z-depth
            const scale = e.z;
            const displaySize = e.size * scale;

            // Draw shadow (behind enemy)
            this.ctx.globalAlpha = 0.3 * scale;
            this.ctx.fillStyle = '#000';
            this.ctx.translate(e.x + 5, e.y + 5);
            this.ctx.scale(scale, scale * 0.5);
            this.ctx.fillRect(-e.size/2, -e.size/2, e.size, e.size);
            this.ctx.restore();
            this.ctx.save();

            // Draw enemy with depth effects
            this.ctx.translate(e.x, e.y);
            this.ctx.scale(scale, scale);
            this.ctx.rotate(e.rot);

            this.ctx.strokeStyle = e.color;
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 15 * scale;
            this.ctx.shadowColor = e.color;
            this.ctx.globalAlpha = 0.2 + 0.8 * scale;

            if (e.name === 'PACKET') {
                // 3D cube effect
                this.ctx.strokeRect(-e.size/2, -e.size/2, e.size, e.size);
                this.ctx.strokeRect(-e.size/4, -e.size/4, e.size/2, e.size/2);
                // Add depth lines
                this.ctx.beginPath();
                this.ctx.moveTo(-e.size/2, -e.size/2);
                this.ctx.lineTo(-e.size/4, -e.size/4);
                this.ctx.moveTo(e.size/2, -e.size/2);
                this.ctx.lineTo(e.size/4, -e.size/4);
                this.ctx.moveTo(-e.size/2, e.size/2);
                this.ctx.lineTo(-e.size/4, e.size/4);
                this.ctx.moveTo(e.size/2, e.size/2);
                this.ctx.lineTo(e.size/4, e.size/4);
                this.ctx.stroke();
            } else if (e.name === 'WORM') {
                // 3D hexagon
                this.ctx.beginPath();
                for(let i=0; i<6; i++) {
                    const ang = (i / 6) * Math.PI * 2;
                    this.ctx.lineTo(Math.cos(ang) * e.size, Math.sin(ang) * e.size);
                }
                this.ctx.closePath();
                this.ctx.stroke();
                // Inner hexagon for depth
                this.ctx.beginPath();
                for(let i=0; i<6; i++) {
                    const ang = (i / 6) * Math.PI * 2;
                    this.ctx.lineTo(Math.cos(ang) * e.size * 0.6, Math.sin(ang) * e.size * 0.6);
                }
                this.ctx.closePath();
                this.ctx.stroke();
            } else {
                // 3D sphere effect
                this.ctx.beginPath();
                this.ctx.arc(0, 0, e.size/2, 0, Math.PI*2);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.arc(0, 0, e.size/3, 0, Math.PI*2);
                this.ctx.stroke();
                this.ctx.moveTo(-e.size/2, 0); this.ctx.lineTo(e.size/2, 0);
                this.ctx.moveTo(0, -e.size/2); this.ctx.lineTo(0, e.size/2);
                this.ctx.stroke();
            }
            this.ctx.restore();

            // Enemy health bar with 3D effect
            if (e.hp > 1) {
                const barWidth = displaySize;
                const barHeight = 4;
                const barX = e.x - barWidth/2;
                const barY = e.y - displaySize - 10;

                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(barX, barY, barWidth, barHeight);

                const healthPercent = e.currentHp / e.hp;
                this.ctx.fillStyle = e.color;
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = e.color;
                this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 1;
                this.ctx.shadowBlur = 0;
                this.ctx.strokeRect(barX, barY, barWidth, barHeight);
            }
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

        // Combo display
        if (this.combo > 1 && !this.gameOver) {
            this.ctx.save();
            this.ctx.textAlign = 'center';
            this.ctx.font = '700 32px Syne';
            this.ctx.fillStyle = '#FFD700';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#FFD700';
            const scale = 1 + Math.sin(this.frames * 0.1) * 0.1;
            this.ctx.scale(scale, scale);
            this.ctx.fillText(`${this.combo}x COMBO!`, this.canvas.width/2/scale, 80/scale);
            this.ctx.restore();
        }

        // Active powerups display
        if (this.player.activePowerups.length > 0 && !this.gameOver) {
            this.ctx.save();
            this.ctx.textAlign = 'left';
            this.ctx.font = '600 14px Space Grotesk';

            this.player.activePowerups.forEach((p, i) => {
                const x = 20;
                const y = 30 + i * 25;
                const timeLeft = Math.max(0, p.endTime - this.frames);
                const progress = timeLeft / (5000 / 16.67);

                // Background bar
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(x, y, 150, 18);

                // Progress bar
                const colors = {
                    'RAPID_FIRE': '#FFD700',
                    'TIME_SLOW': '#00FF99'
                };
                this.ctx.fillStyle = colors[p.type] || '#00FFFF';
                this.ctx.fillRect(x, y, 150 * progress, 18);

                // Text
                this.ctx.fillStyle = '#fff';
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = colors[p.type] || '#00FFFF';
                this.ctx.fillText(p.type, x + 5, y + 13);

                // Border
                this.ctx.strokeStyle = colors[p.type] || '#00FFFF';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, 150, 18);
            });

            this.ctx.restore();
        }

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(10,10,10,0.85)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.strokeStyle = '#FF3366';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(50, this.canvas.height/2 - 80, this.canvas.width-100, 160);

            this.ctx.fillStyle = '#FF3366';
            this.ctx.font = '800 40px Syne';
            this.ctx.fillText("CRITICAL FAILURE", this.canvas.width/2, this.canvas.height/2 - 20);

            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '700 16px Space Grotesk';
            this.ctx.fillText("NETWORK BREACHED // CLICK TO REBOOT", this.canvas.width/2, this.canvas.height/2 + 20);

            // Final stats
            this.ctx.font = '400 14px monospace';
            this.ctx.fillStyle = '#00FF99';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 50);
            if (this.maxCombo > 1) {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillText(`Max Combo: ${this.maxCombo}x`, this.canvas.width/2, this.canvas.height/2 + 70);
            }
        }

        this.ctx.restore(); // Restore screen shake transform
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