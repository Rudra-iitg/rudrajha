// ============================================
// PART 1: NEURAL NETWORK PARTICLE FIELD
// Full-page Three.js WebGL canvas with interactive nodes
// ============================================

class NeuralNetworkBackground {
    constructor() {
        this.canvas = document.getElementById('three-bg-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });

        // Mouse tracking
        this.mouse = { x: 0, y: 0 };
        this.mouseTarget = { x: 0, y: 0 };
        this.raycaster = new THREE.Raycaster();
        this.raycasterMouse = new THREE.Vector2();

        // Node configuration
        this.nodeCount = 400;
        this.nodes = [];
        this.nodeGeometry = null;
        this.nodeMesh = null;
        this.connectionLines = null;
        this.maxConnectionDistance = 2.5;
        this.mouseInfluenceRadius = 1.5;

        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Setup camera
        this.camera.position.z = 5;

        // Create nodes
        this.createNodes();

        // Create connection lines
        this.createConnections();

        // Event listeners
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Start animation loop
        this.animate();
    }

    createNodes() {
        // Create geometry for instanced nodes
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);

        // Custom shader material for glow effect
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uColor: { value: new THREE.Color(0x00ff41) }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    vec3 glow = uColor * intensity;
                    gl_FragColor = vec4(glow, 1.0);
                }
            `,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });

        // Create instanced mesh for performance
        this.nodeMesh = new THREE.InstancedMesh(geometry, material, this.nodeCount);

        // Initialize node data and positions
        const matrix = new THREE.Matrix4();
        for (let i = 0; i < this.nodeCount; i++) {
            const node = {
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 5
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.003,
                    (Math.random() - 0.5) * 0.003,
                    (Math.random() - 0.5) * 0.002
                ),
                originalPosition: new THREE.Vector3(),
                offset: new THREE.Vector3()
            };
            node.originalPosition.copy(node.position);
            this.nodes.push(node);

            // Set initial matrix
            matrix.setPosition(node.position);
            this.nodeMesh.setMatrixAt(i, matrix);
        }

        this.nodeMesh.instanceMatrix.needsUpdate = true;
        this.scene.add(this.nodeMesh);
    }

    createConnections() {
        // Create line segments for connections
        const lineGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.nodeCount * this.nodeCount * 6); // max possible connections
        const colors = new Float32Array(this.nodeCount * this.nodeCount * 6);

        lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        lineGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const lineMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.3
        });

        this.connectionLines = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(this.connectionLines);
    }

    updateConnections() {
        const positions = this.connectionLines.geometry.attributes.position.array;
        const colors = this.connectionLines.geometry.attributes.color.array;
        let lineIndex = 0;

        const greenColor = new THREE.Color(0x00ff41);

        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const nodeA = this.nodes[i];
                const nodeB = this.nodes[j];

                const distance = nodeA.position.distanceTo(nodeB.position);

                if (distance < this.maxConnectionDistance) {
                    // Calculate opacity based on distance and mouse proximity
                    let opacity = 1 - (distance / this.maxConnectionDistance);

                    // Check mouse proximity to line midpoint
                    const midpoint = new THREE.Vector3().addVectors(nodeA.position, nodeB.position).multiplyScalar(0.5);
                    const mousePos3D = new THREE.Vector3(this.mouse.x * 3, this.mouse.y * 3, 0);
                    const distToMouse = midpoint.distanceTo(mousePos3D);

                    if (distToMouse < this.mouseInfluenceRadius) {
                        opacity = Math.min(0.9, opacity + (1 - distToMouse / this.mouseInfluenceRadius) * 0.6);
                    }

                    // Set line positions
                    positions[lineIndex * 6] = nodeA.position.x;
                    positions[lineIndex * 6 + 1] = nodeA.position.y;
                    positions[lineIndex * 6 + 2] = nodeA.position.z;
                    positions[lineIndex * 6 + 3] = nodeB.position.x;
                    positions[lineIndex * 6 + 4] = nodeB.position.y;
                    positions[lineIndex * 6 + 5] = nodeB.position.z;

                    // Set line colors with opacity
                    colors[lineIndex * 6] = greenColor.r * opacity;
                    colors[lineIndex * 6 + 1] = greenColor.g * opacity;
                    colors[lineIndex * 6 + 2] = greenColor.b * opacity;
                    colors[lineIndex * 6 + 3] = greenColor.r * opacity;
                    colors[lineIndex * 6 + 4] = greenColor.g * opacity;
                    colors[lineIndex * 6 + 5] = greenColor.b * opacity;

                    lineIndex++;
                }
            }
        }

        // Update geometry
        this.connectionLines.geometry.setDrawRange(0, lineIndex * 2);
        this.connectionLines.geometry.attributes.position.needsUpdate = true;
        this.connectionLines.geometry.attributes.color.needsUpdate = true;
    }

    onMouseMove(event) {
        this.mouseTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseTarget.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update raycaster
        this.raycasterMouse.x = this.mouseTarget.x;
        this.raycasterMouse.y = this.mouseTarget.y;
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    updateNodes() {
        const matrix = new THREE.Matrix4();
        const mousePos3D = new THREE.Vector3(this.mouse.x * 3, this.mouse.y * 3, 0);

        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];

            // Slow drift animation
            node.originalPosition.add(node.velocity);

            // Boundary wrapping
            if (Math.abs(node.originalPosition.x) > 5) {
                node.originalPosition.x = -node.originalPosition.x;
            }
            if (Math.abs(node.originalPosition.y) > 5) {
                node.originalPosition.y = -node.originalPosition.y;
            }
            if (Math.abs(node.originalPosition.z) > 2.5) {
                node.originalPosition.z = -node.originalPosition.z;
            }

            // Mouse repulsion with spring physics
            const distToMouse = node.originalPosition.distanceTo(mousePos3D);
            if (distToMouse < this.mouseInfluenceRadius) {
                const force = (this.mouseInfluenceRadius - distToMouse) / this.mouseInfluenceRadius;
                const direction = new THREE.Vector3()
                    .subVectors(node.originalPosition, mousePos3D)
                    .normalize()
                    .multiplyScalar(force * 0.5);

                node.offset.add(direction);
            }

            // Spring back to original position
            node.offset.multiplyScalar(0.92);

            // Apply position
            node.position.copy(node.originalPosition).add(node.offset);

            // Update instance matrix
            matrix.setPosition(node.position);
            this.nodeMesh.setMatrixAt(i, matrix);
        }

        this.nodeMesh.instanceMatrix.needsUpdate = true;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth mouse lerp
        this.mouse.x += (this.mouseTarget.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.mouseTarget.y - this.mouse.y) * 0.05;

        // Camera parallax
        this.camera.position.x += (this.mouse.x * 0.3 - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.mouse.y * 0.3 - this.camera.position.y) * 0.05;

        // Update nodes
        this.updateNodes();

        // Update connections
        this.updateConnections();

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NeuralNetworkBackground();
});
