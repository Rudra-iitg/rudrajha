// ============================================
// PART 3: 3D HERO SECTION
// 3D extruded text + floating geometric shapes
// ============================================

class Hero3DScene {
    constructor() {
        this.container = document.querySelector('.grid-container');
        if (!this.container) return;

        // Create canvas container for hero 3D scene
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'hero-3d-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100vh';
        this.canvas.style.zIndex = '1';
        this.canvas.style.pointerEvents = 'none';
        document.body.appendChild(this.canvas);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });

        // Mouse tracking
        this.mouse = { x: 0, y: 0 };
        this.scroll = 0;

        // Clock for animations
        this.clock = new THREE.Clock();

        // Floating shapes
        this.shapes = [];

        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Setup camera
        this.camera.position.z = 8;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x00ff41, 1, 100);
        pointLight1.position.set(5, 5, 5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff0040, 1, 100);
        pointLight2.position.set(-5, -5, 5);
        this.scene.add(pointLight2);

        // Create floating shapes
        this.createFloatingShapes();

        // Create holographic scan line
        this.createHolographicScan();

        // Event listeners
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('scroll', () => this.onScroll());

        // Start animation loop
        this.animate();
    }

    createFloatingShapes() {
        // 1. Icosahedron (brain/neural network representation)
        const icosahedronGeometry = new THREE.IcosahedronGeometry(0.8, 0);
        const icosahedronMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff41,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
        icosahedron.position.set(-3, 2, -2);
        icosahedron.userData.offset = 0;
        icosahedron.userData.rotationSpeed = { x: 0.005, y: 0.008, z: 0.003 };
        icosahedron.userData.bobSpeed = 0.5;
        icosahedron.userData.bobAmount = 0.3;
        icosahedron.userData.depth = 0.3;
        this.scene.add(icosahedron);
        this.shapes.push(icosahedron);

        // 2. Octahedron #1 (data node)
        const octahedronGeometry = new THREE.OctahedronGeometry(0.5, 0);
        const octahedronMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0040,
            emissive: 0xff0040,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });
        const octahedron1 = new THREE.Mesh(octahedronGeometry, octahedronMaterial);
        octahedron1.position.set(3, -1, -1);
        octahedron1.userData.offset = Math.PI / 2;
        octahedron1.userData.rotationSpeed = { x: 0.01, y: 0.01, z: 0.005 };
        octahedron1.userData.bobSpeed = 0.7;
        octahedron1.userData.bobAmount = 0.2;
        octahedron1.userData.depth = 0.5;
        this.scene.add(octahedron1);
        this.shapes.push(octahedron1);

        // 3. Octahedron #2 (threat node)
        const octahedron2 = octahedron1.clone();
        octahedron2.position.set(-2, -2, -3);
        octahedron2.userData.offset = Math.PI;
        octahedron2.userData.rotationSpeed = { x: -0.008, y: 0.012, z: -0.006 };
        octahedron2.userData.bobSpeed = 0.6;
        octahedron2.userData.bobAmount = 0.25;
        octahedron2.userData.depth = 0.2;
        this.scene.add(octahedron2);
        this.shapes.push(octahedron2);

        // 4. Torus Knot (organic/cybernetic)
        const torusKnotGeometry = new THREE.TorusKnotGeometry(0.6, 0.15, 100, 16);
        const torusKnotMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff41,
            wireframe: true,
            transparent: true,
            opacity: 0.7
        });
        const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
        torusKnot.position.set(2, 3, -4);
        torusKnot.userData.offset = Math.PI / 3;
        torusKnot.userData.rotationSpeed = { x: 0.003, y: 0.007, z: 0.004 };
        torusKnot.userData.bobSpeed = 0.4;
        torusKnot.userData.bobAmount = 0.35;
        torusKnot.userData.depth = 0.1;
        this.scene.add(torusKnot);
        this.shapes.push(torusKnot);

        // 5. DNA Helix
        this.createDNAHelix();
    }

    createDNAHelix() {
        const helixGroup = new THREE.Group();
        const sphereGeometry = new THREE.SphereGeometry(0.08, 16, 16);

        const material1 = new THREE.MeshStandardMaterial({
            color: 0x00ff41,
            emissive: 0x00ff41,
            emissiveIntensity: 0.4,
            metalness: 0.8,
            roughness: 0.2
        });

        const material2 = new THREE.MeshStandardMaterial({
            color: 0xff0040,
            emissive: 0xff0040,
            emissiveIntensity: 0.4,
            metalness: 0.8,
            roughness: 0.2
        });

        const numPoints = 40;
        const height = 3;
        const radius = 0.4;

        for (let i = 0; i < numPoints; i++) {
            const t = (i / numPoints) * Math.PI * 4; // 2 full rotations
            const y = (i / numPoints) * height - height / 2;

            // Strand 1
            const sphere1 = new THREE.Mesh(sphereGeometry, material1);
            sphere1.position.set(
                Math.cos(t) * radius,
                y,
                Math.sin(t) * radius
            );
            helixGroup.add(sphere1);

            // Strand 2 (opposite side)
            const sphere2 = new THREE.Mesh(sphereGeometry, material2);
            sphere2.position.set(
                Math.cos(t + Math.PI) * radius,
                y,
                Math.sin(t + Math.PI) * radius
            );
            helixGroup.add(sphere2);
        }

        helixGroup.position.set(-4, 0, -5);
        helixGroup.userData.offset = Math.PI * 1.5;
        helixGroup.userData.rotationSpeed = { x: 0, y: 0.01, z: 0 };
        helixGroup.userData.bobSpeed = 0.3;
        helixGroup.userData.bobAmount = 0.15;
        helixGroup.userData.depth = 0.15;

        this.scene.add(helixGroup);
        this.shapes.push(helixGroup);
    }

    createHolographicScan() {
        // Horizontal scan line that moves from top to bottom
        const scanGeometry = new THREE.PlaneGeometry(20, 0.02);
        const scanMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff41,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        this.scanLine = new THREE.Mesh(scanGeometry, scanMaterial);
        this.scanLine.position.z = -6;
        this.scene.add(this.scanLine);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onScroll() {
        this.scroll = window.scrollY;
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const elapsedTime = this.clock.getElapsedTime();

        // Update holographic scan line (loop every 3 seconds)
        this.scanLine.position.y = -5 + ((elapsedTime % 3) / 3) * 10;

        // Update floating shapes
        this.shapes.forEach(shape => {
            // Rotation
            shape.rotation.x += shape.userData.rotationSpeed.x;
            shape.rotation.y += shape.userData.rotationSpeed.y;
            shape.rotation.z += shape.userData.rotationSpeed.z;

            // Bobbing animation
            const bobOffset = Math.sin(elapsedTime * shape.userData.bobSpeed + shape.userData.offset) * shape.userData.bobAmount;
            shape.position.y += (bobOffset - shape.position.y % shape.userData.bobAmount) * 0.05;

            // Mouse parallax based on depth
            const parallaxX = this.mouse.x * shape.userData.depth * 2;
            const parallaxY = this.mouse.y * shape.userData.depth * 2;
            shape.position.x += (parallaxX - (shape.position.x % (shape.userData.depth * 2))) * 0.05;
            shape.position.y += (parallaxY - (shape.position.y % (shape.userData.depth * 2))) * 0.05;
        });

        // Fade out hero 3D scene as user scrolls
        const fadeStart = 0;
        const fadeEnd = window.innerHeight;
        const opacity = 1 - Math.max(0, Math.min(1, (this.scroll - fadeStart) / (fadeEnd - fadeStart)));
        this.canvas.style.opacity = opacity;

        // Only render if visible
        if (opacity > 0.01) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Hero3DScene();
});
