class CyberDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        this.logContainer = document.createElement('div');
        this.logContainer.className = 'dashboard-logs';
        this.container.appendChild(this.logContainer);
        
        this.logs = [];
        this.maxLogs = 12;
        this.nodes = [];
        this.threats = [];
        this.mouse = { x: 0, y: 0, active: false };
        this.scanLine = 0;
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.active = true;
        });

        this.container.addEventListener('mouseleave', () => {
            this.mouse.active = false;
        });

        // Generate static nodes
        for(let i = 0; i < 15; i++) {
            this.nodes.push({
                x: Math.random() * 100, // percentage
                y: Math.random() * 100,
                val: Math.random(),
                label: 'NODE_' + Math.floor(Math.random() * 999)
            });
        }
        
        this.animate();
        setInterval(() => this.addLog(), 600);
        setInterval(() => this.addThreat(), 2000);
    }

    resize() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    }

    addLog() {
        const status = ['SUCCESS', 'WARNING', 'CRITICAL', 'INFO'];
        const actions = ['BYPASS', 'ENCRYPT', 'HANDSHAKE', 'TRACE', 'PING'];
        const targets = ['UPLINK', 'FIREWALL', 'DATABASE', 'KERNEL', 'PROXY'];
        
        const s = status[Math.floor(Math.random() * status.length)];
        const a = actions[Math.floor(Math.random() * actions.length)];
        const t = targets[Math.floor(Math.random() * targets.length)];
        
        const log = `[${s}] ${a} :: ${t} _ ${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
        this.logs.unshift({ text: log, type: s });
        if (this.logs.length > this.maxLogs) this.logs.pop();
        this.updateLogDisplay();
    }

    updateLogDisplay() {
        this.logContainer.innerHTML = this.logs.map((log, i) => {
            const color = log.type === 'CRITICAL' ? '#FF3366' : (log.type === 'WARNING' ? '#FFFF00' : '#00FF99');
            return `<div style="color: ${color}; opacity: ${1 - i*0.08}; font-size: 0.75rem; margin-bottom: 2px;">> ${log.text}</div>`;
        }).join('');
    }

    addThreat() {
        this.threats.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            life: 1.0,
            size: 0
        });
    }

    drawTacticalElement(x, y, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        
        // Crosshair
        const s = 15;
        this.ctx.beginPath();
        this.ctx.moveTo(x - s, y); this.ctx.lineTo(x + s, y);
        this.ctx.moveTo(x, y - s); this.ctx.lineTo(x, y + s);
        this.ctx.stroke();
        
        // Corners
        const c = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(x-s, y-s+c); this.ctx.lineTo(x-s, y-s); this.ctx.lineTo(x-s+c, y-s);
        this.ctx.moveTo(x+s, y-s+c); this.ctx.lineTo(x+s, y-s); this.ctx.lineTo(x+s-c, y-s);
        this.ctx.moveTo(x-s, y+s-c); this.ctx.lineTo(x-s, y+s); this.ctx.lineTo(x-s+c, y+s);
        this.ctx.moveTo(x+s, y+s-c); this.ctx.lineTo(x+s, y+s); this.ctx.lineTo(x+s-c, y+s);
        this.ctx.stroke();
    }

    draw() {
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Scan line
        this.scanLine = (this.scanLine + 2) % this.canvas.height;
        this.ctx.strokeStyle = 'rgba(0, 255, 153, 0.1)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.scanLine);
        this.ctx.lineTo(this.canvas.width, this.scanLine);
        this.ctx.stroke();

        // Grid nodes
        this.nodes.forEach(n => {
            const px = (n.x / 100) * this.canvas.width;
            const py = (n.y / 100) * this.canvas.height;
            const flicker = Math.random() > 0.9 ? 1 : 0.3;
            
            this.ctx.fillStyle = `rgba(0, 255, 153, ${0.2 * flicker})`;
            this.ctx.fillRect(px - 1, py - 1, 3, 3);
            
            if (Math.random() > 0.99) {
                this.ctx.font = '8px monospace';
                this.ctx.fillText(n.label, px + 5, py + 5);
            }
        });

        // Mouse Interactivity
        if (this.mouse.active) {
            // Radar circle
            this.ctx.beginPath();
            this.ctx.arc(this.mouse.x, this.mouse.y, 60, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(0, 255, 153, 0.3)';
            this.ctx.setLineDash([5, 5]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            this.drawTacticalElement(this.mouse.x, this.mouse.y, 'rgba(0, 255, 153, 0.8)');
            
            // Coordinates
            this.ctx.fillStyle = '#00FF99';
            this.ctx.font = '10px monospace';
            this.ctx.fillText(`LOC: ${Math.floor(this.mouse.x)},${Math.floor(this.mouse.y)}`, this.mouse.x + 20, this.mouse.y - 20);
        }

        // Threats
        this.threats.forEach((t, i) => {
            t.life -= 0.01;
            t.size += 1;
            
            this.ctx.strokeStyle = `rgba(255, 51, 102, ${t.life})`;
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.drawTacticalElement(t.x, t.y, `rgba(255, 51, 102, ${t.life})`);
            
            if (t.life <= 0) this.threats.splice(i, 1);
        });

        // Matrix Glitch Effect
        if (Math.random() > 0.98) {
            this.ctx.fillStyle = 'rgba(0, 255, 153, 0.1)';
            this.ctx.fillRect(0, Math.random() * this.canvas.height, this.canvas.width, 2);
        }
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CyberDashboard('cyber-dashboard');
});