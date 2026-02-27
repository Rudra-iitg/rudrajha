// ============================================
// PERFORMANCE OPTIMIZATION & MOBILE HANDLING
// Device detection and performance settings
// ============================================

class PerformanceOptimizer {
    constructor() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isLowEndDevice = this.detectLowEndDevice();
        this.settings = this.getOptimalSettings();

        this.init();
    }

    detectLowEndDevice() {
        // Check for low-end device indicators
        const cores = navigator.hardwareConcurrency || 2;
        const memory = navigator.deviceMemory || 4;

        return cores <= 2 || memory <= 2;
    }

    getOptimalSettings() {
        if (this.isMobile || this.isLowEndDevice) {
            return {
                particleCount: 150,          // Reduced from 400
                maxConnectionDistance: 2.0,  // Reduced from 2.5
                enableBloom: false,
                enablePostProcessing: false,
                pixelRatio: 1,              // Cap at 1 for mobile
                throttleMouseMove: true,
                enableHeroScene: false,      // Disable hero 3D scene on mobile
                enableCursor3D: false,       // Disable custom cursor on mobile
                filmGrainOpacity: 0.01      // Reduce grain
            };
        }

        return {
            particleCount: 400,
            maxConnectionDistance: 2.5,
            enableBloom: true,
            enablePostProcessing: true,
            pixelRatio: Math.min(window.devicePixelRatio, 2),
            throttleMouseMove: false,
            enableHeroScene: true,
            enableCursor3D: true,
            filmGrainOpacity: 0.03
        };
    }

    init() {
        // Apply settings globally
        window.PERFORMANCE_SETTINGS = this.settings;

        // Log performance mode
        console.log(`Performance Mode: ${this.isMobile ? 'Mobile' : 'Desktop'} | Low-end: ${this.isLowEndDevice}`);
        console.log('Settings:', this.settings);

        // Add mobile-specific CSS
        if (this.isMobile) {
            this.applyMobileStyles();
        }

        // Setup throttled mouse move if needed
        if (this.settings.throttleMouseMove) {
            this.setupThrottledMouseMove();
        }

        // Monitor FPS and adjust if needed
        this.setupFPSMonitor();

        // Setup proper disposal on page unload
        this.setupDisposal();
    }

    applyMobileStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Mobile optimizations */
            @media (max-width: 768px) {
                body {
                    cursor: auto !important; /* Restore default cursor on mobile */
                }

                #three-bg-canvas,
                #hero-3d-canvas {
                    opacity: 0.5 !important; /* Reduce visual intensity */
                }

                #cursor-canvas {
                    display: none !important; /* Hide custom cursor */
                }

                .project-blueprint,
                .plugin-slot {
                    transform: none !important; /* Disable 3D tilt on mobile */
                }

                /* Simplify animations */
                * {
                    animation-duration: 0.5s !important;
                    transition-duration: 0.3s !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupThrottledMouseMove() {
        let lastMouseMove = 0;
        const throttleDelay = 16; // ~60fps

        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (type === 'mousemove') {
                const throttledListener = function(event) {
                    const now = Date.now();
                    if (now - lastMouseMove >= throttleDelay) {
                        lastMouseMove = now;
                        listener.call(this, event);
                    }
                };
                originalAddEventListener.call(this, type, throttledListener, options);
            } else {
                originalAddEventListener.call(this, type, listener, options);
            }
        };
    }

    setupFPSMonitor() {
        let frameCount = 0;
        let lastTime = performance.now();
        let fps = 60;

        const checkFPS = () => {
            frameCount++;
            const currentTime = performance.now();

            if (currentTime >= lastTime + 1000) {
                fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;

                // If FPS drops below 30, reduce quality
                if (fps < 30 && !this.qualityReduced) {
                    console.warn(`Low FPS detected (${fps}). Reducing quality...`);
                    this.reduceQuality();
                    this.qualityReduced = true;
                }
            }

            requestAnimationFrame(checkFPS);
        };

        requestAnimationFrame(checkFPS);
    }

    reduceQuality() {
        // Dynamically reduce quality if performance is poor
        window.PERFORMANCE_SETTINGS.particleCount = 100;
        window.PERFORMANCE_SETTINGS.enablePostProcessing = false;

        // Disable hero 3D scene
        const heroCanvas = document.getElementById('hero-3d-canvas');
        if (heroCanvas) {
            heroCanvas.style.display = 'none';
        }

        // Reduce neural network opacity
        const bgCanvas = document.getElementById('three-bg-canvas');
        if (bgCanvas) {
            bgCanvas.style.opacity = '0.3';
        }
    }

    setupDisposal() {
        window.addEventListener('beforeunload', () => {
            // Cleanup Three.js resources
            const canvases = document.querySelectorAll('canvas');
            canvases.forEach(canvas => {
                const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
                if (gl) {
                    gl.getExtension('WEBGL_lose_context')?.loseContext();
                }
            });
        });
    }
}

// Initialize immediately - before other scripts
(function() {
    window.performanceOptimizer = new PerformanceOptimizer();
})();
