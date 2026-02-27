// ============================================
// PART 2: CUSTOM 3D CURSOR
// 3D targeting reticle with rotating rings
// ============================================

class Custom3DCursor {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'cursor-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '10000';
        document.body.appendChild(this.canvas);

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });

        // Mouse tracking
        this.mouse = { x: 0, y: 0 };
        this.mouseTarget = { x: 0, y: 0 };
        this.cursorScale = 1.0;
        this.targetScale = 1.0;

        // Particle trail
        this.trailParticles = [];
        this.maxTrailLength = 15;

        // Click burst particles
        this.burstParticles = [];

        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create cursor reticle
        this.createCursorReticle();

        // Event listeners
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('click', (e) => this.onMouseClick(e));

        // Detect hoverable elements
        this.detectHoverableElements();

        // Start animation loop
        this.animate();
    }

    createCursorReticle() {
        // Outer ring (neon green)
        const outerRingGeometry = new THREE.TorusGeometry(0.08, 0.008, 16, 32);
        const outerRingMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff41,
            transparent: true,
            opacity: 0.8
        });
        this.outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
        this.scene.add(this.outerRing);

        // Inner ring (red)
        const innerRingGeometry = new THREE.TorusGeometry(0.04, 0.006, 16, 32);
        const innerRingMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0040,
            transparent: true,
            opacity: 0.9
        });
        this.innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
        this.scene.add(this.innerRing);

        // Center dot
        const dotGeometry = new THREE.CircleGeometry(0.008, 16);
        const dotMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6
        });
        this.centerDot = new THREE.Mesh(dotGeometry, dotMaterial);
        this.scene.add(this.centerDot);
    }

    detectHoverableElements() {
        // Detect when mouse is over clickable elements
        const checkHoverable = () => {
            const elements = document.elementsFromPoint(this.mouseTarget.x, this.mouseTarget.y);
            const isHoverable = elements.some(el => {
                return el.tagName === 'A' ||
                       el.tagName === 'BUTTON' ||
                       el.classList.contains('btn-mega') ||
                       el.classList.contains('pill') ||
                       el.classList.contains('social-3d-link') ||
                       el.style.cursor === 'pointer' ||
                       window.getComputedStyle(el).cursor === 'pointer';
            });

            this.targetScale = isHoverable ? 1.8 : 1.0;
        };

        document.addEventListener('mousemove', checkHoverable);
    }

    onMouseMove(event) {
        this.mouseTarget.x = event.clientX;
        this.mouseTarget.y = event.clientY;

        // Add trail particle
        if (this.trailParticles.length < this.maxTrailLength) {
            this.addTrailParticle();
        }
    }

    onMouseClick(event) {
        // Create click burst
        this.createClickBurst(event.clientX, event.clientY);
    }

    addTrailParticle() {
        const geometry = new THREE.CircleGeometry(0.015, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff41,
            transparent: true,
            opacity: 0.6
        });
        const particle = new THREE.Mesh(geometry, material);

        // Convert screen coordinates to orthographic camera space
        const x = (this.mouse.x / window.innerWidth) * 2 - 1;
        const y = -(this.mouse.y / window.innerHeight) * 2 + 1;

        particle.position.set(x, y, 0);
        particle.userData.life = 1.0;
        particle.userData.initialScale = 1.0;

        this.scene.add(particle);
        this.trailParticles.push(particle);
    }

    createClickBurst(x, y) {
        const screenX = (x / window.innerWidth) * 2 - 1;
        const screenY = -(y / window.innerHeight) * 2 + 1;

        for (let i = 0; i < 20; i++) {
            const geometry = new THREE.CircleGeometry(0.012, 8);
            const material = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0x00ff41 : 0xff0040,
                transparent: true,
                opacity: 1.0
            });
            const particle = new THREE.Mesh(geometry, material);

            particle.position.set(screenX, screenY, 0);

            const angle = (i / 20) * Math.PI * 2;
            const speed = 0.01 + Math.random() * 0.01;
            particle.userData.velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            particle.userData.life = 1.0;

            this.scene.add(particle);
            this.burstParticles.push(particle);
        }
    }

    updateTrailParticles() {
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const particle = this.trailParticles[i];
            particle.userData.life -= 0.05;

            if (particle.userData.life <= 0) {
                this.scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
                this.trailParticles.splice(i, 1);
            } else {
                particle.material.opacity = 0.6 * particle.userData.life;
                particle.scale.setScalar(particle.userData.initialScale * particle.userData.life);
            }
        }
    }

    updateBurstParticles() {
        for (let i = this.burstParticles.length - 1; i >= 0; i--) {
            const particle = this.burstParticles[i];

            particle.position.x += particle.userData.velocity.x;
            particle.position.y += particle.userData.velocity.y;
            particle.userData.life -= 0.03;

            if (particle.userData.life <= 0) {
                this.scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
                this.burstParticles.splice(i, 1);
            } else {
                particle.material.opacity = particle.userData.life;
                particle.scale.setScalar(particle.userData.life);
            }
        }
    }

    onResize() {
        this.camera.left = -1;
        this.camera.right = 1;
        this.camera.top = 1;
        this.camera.bottom = -1;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth mouse lerp (outer ring lags more)
        this.mouse.x += (this.mouseTarget.x - this.mouse.x) * 0.12;
        this.mouse.y += (this.mouseTarget.y - this.mouse.y) * 0.12;

        // Convert to normalized device coordinates
        const x = (this.mouse.x / window.innerWidth) * 2 - 1;
        const y = -(this.mouse.y / window.innerHeight) * 2 + 1;

        // Smooth scale transition
        this.cursorScale += (this.targetScale - this.cursorScale) * 0.15;

        // Update outer ring (slower, lags behind)
        this.outerRing.position.x = x * 0.9;
        this.outerRing.position.y = y * 0.9;
        this.outerRing.rotation.z += this.targetScale > 1.5 ? 0.08 : 0.02;
        this.outerRing.scale.setScalar(this.cursorScale);

        // Update inner ring (faster)
        this.innerRing.position.x = x;
        this.innerRing.position.y = y;
        this.innerRing.rotation.z -= this.targetScale > 1.5 ? 0.12 : 0.04;
        this.innerRing.scale.setScalar(this.cursorScale);

        // Update center dot
        this.centerDot.position.x = x;
        this.centerDot.position.y = y;

        // Update trail particles
        this.updateTrailParticles();

        // Update burst particles
        this.updateBurstParticles();

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Custom3DCursor();
});
