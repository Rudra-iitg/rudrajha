/**
 * RUDRA.DEV — FULL 3D INTERACTIVE UPGRADE
 * Drop this file into your repo and add ONE line to your index.html:
 * <script src="rudra-3d.js"></script>
 *
 * NO build step. NO npm. Just drop and go.
 * Uses Three.js loaded from CDN.
 */

(function () {
  'use strict';

  // ─── Load Three.js from CDN, then boot everything ───────────────────────────
  function loadScript(src, cb) {
    const s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    document.head.appendChild(s);
  }

  loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', function () {
    // Three.js is now available globally
    boot();
  });

  // ─── SHARED STATE ─────────────────────────────────────────────────────────────
  const mouse = { x: 0, y: 0, nx: 0, ny: 0 }; // raw px + normalised -1..1
  const clock = { start: Date.now(), get t() { return (Date.now() - this.start) / 1000; } };
  let cursorDot, cursorRing;

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ny = -((e.clientY / window.innerHeight) * 2 - 1);
  });

  // ─── BOOT ─────────────────────────────────────────────────────────────────────
  function boot() {
    injectGlobalStyles();
    buildCustomCursor();
    buildNeuralBackground();
    buildHeroScene();
    build3DCardTilt();
    buildHologramAbout();
    buildScrollEffects();
    buildGlitchText();
    buildParticleClickBurst();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 1. GLOBAL STYLES INJECTION
  // ═══════════════════════════════════════════════════════════════════════════════
  function injectGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Hide default cursor */
      * { cursor: none !important; }

      /* Scanline overlay on everything */
      body::after {
        content: '';
        position: fixed;
        inset: 0;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,255,65,0.03) 2px,
          rgba(0,255,65,0.03) 4px
        );
        pointer-events: none;
        z-index: 99998;
      }

      /* Custom Cursor */
      #cursor-dot {
        position: fixed;
        width: 8px; height: 8px;
        background: #00ff41;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 99999;
        transition: transform 0.1s, background 0.2s;
        box-shadow: 0 0 10px #00ff41, 0 0 20px #00ff41;
      }
      #cursor-ring {
        position: fixed;
        width: 36px; height: 36px;
        border: 1.5px solid #00ff41;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 99999;
        transition: width 0.3s, height 0.3s, border-color 0.3s;
        box-shadow: 0 0 8px #00ff41;
        /* lag behind */
      }
      #cursor-ring.hovered {
        width: 56px; height: 56px;
        border-color: #ff0040;
        box-shadow: 0 0 15px #ff0040;
      }

      /* Neural BG canvas – sits behind everything */
      #neural-bg {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
      }

      /* Hero canvas overlay */
      #hero-3d {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
      }

      /* Card 3D wrapper */
      .project-card, .card, [class*="card"], [class*="project"] {
        transform-style: preserve-3d;
        transition: transform 0.08s linear, box-shadow 0.3s;
        will-change: transform;
      }
      .project-card:hover, .card:hover {
        box-shadow: 0 25px 60px rgba(0,255,65,0.3), 0 0 30px rgba(0,255,65,0.15) !important;
      }

      /* Glitch text effect */
      @keyframes glitch1 {
        0%,100% { clip-path: inset(0 0 95% 0); transform: translate(-3px,0); }
        20% { clip-path: inset(20% 0 60% 0); transform: translate(3px,0); }
        40% { clip-path: inset(50% 0 30% 0); transform: translate(-2px,0); }
        60% { clip-path: inset(70% 0 10% 0); transform: translate(2px,0); }
        80% { clip-path: inset(40% 0 50% 0); transform: translate(-3px,0); }
      }
      @keyframes glitch2 {
        0%,100% { clip-path: inset(0 0 95% 0); transform: translate(3px,0); }
        20% { clip-path: inset(60% 0 20% 0); transform: translate(-3px,0); }
        40% { clip-path: inset(10% 0 70% 0); transform: translate(2px,0); }
        60% { clip-path: inset(30% 0 50% 0); transform: translate(-2px,0); }
        80% { clip-path: inset(80% 0 5% 0); transform: translate(3px,0); }
      }
      .glitch-el {
        position: relative;
        display: inline-block;
      }
      .glitch-el::before,
      .glitch-el::after {
        content: attr(data-text);
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .glitch-el::before {
        color: #ff0040;
        animation: glitch1 4s infinite steps(1);
        opacity: 0.8;
      }
      .glitch-el::after {
        color: #00ff41;
        animation: glitch2 4s infinite steps(1) 0.5s;
        opacity: 0.8;
      }

      /* Hologram effect for about image */
      .hologram-wrap {
        position: relative;
        display: inline-block;
      }
      .hologram-wrap::after {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 3px,
          rgba(0,255,65,0.07) 3px,
          rgba(0,255,65,0.07) 6px
        );
        pointer-events: none;
        animation: holo-scan 2s linear infinite;
      }
      @keyframes holo-scan {
        0%   { background-position: 0 0; }
        100% { background-position: 0 100px; }
      }
      .hologram-wrap img {
        filter: saturate(0) brightness(0.7) sepia(1) hue-rotate(85deg) brightness(1.4);
        mix-blend-mode: normal;
      }

      /* Scroll reveal */
      .reveal {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.7s ease, transform 0.7s ease;
      }
      .reveal.visible {
        opacity: 1;
        transform: translateY(0);
      }

      /* Particle burst */
      .burst-particle {
        position: fixed;
        width: 4px; height: 4px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 99997;
        animation: burst-fade 0.6s ease-out forwards;
      }
      @keyframes burst-fade {
        0%   { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0); }
      }

      /* 3D floating skill bars */
      @keyframes skill-fill {
        from { width: 0; }
      }
      [class*="skill"] .bar, [class*="progress"] {
        animation: skill-fill 1.5s ease-out forwards !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 2. CUSTOM CURSOR
  // ═══════════════════════════════════════════════════════════════════════════════
  function buildCustomCursor() {
    cursorDot  = document.createElement('div'); cursorDot.id  = 'cursor-dot';
    cursorRing = document.createElement('div'); cursorRing.id = 'cursor-ring';
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    let rx = 0, ry = 0; // ring lag position

    function animCursor() {
      cursorDot.style.left  = mouse.x + 'px';
      cursorDot.style.top   = mouse.y + 'px';
      // ring lags behind
      rx += (mouse.x - rx) * 0.12;
      ry += (mouse.y - ry) * 0.12;
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top  = ry + 'px';
      requestAnimationFrame(animCursor);
    }
    animCursor();

    // Hover states
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('a, button, [class*="card"], [class*="project"], input, textarea');
      if (t) cursorRing.classList.add('hovered');
    });
    document.addEventListener('mouseout', e => {
      const t = e.target.closest('a, button, [class*="card"], [class*="project"], input, textarea');
      if (t) cursorRing.classList.remove('hovered');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 3. NEURAL NETWORK BACKGROUND (Three.js)
  // ═══════════════════════════════════════════════════════════════════════════════
  function buildNeuralBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'neural-bg';
    document.body.insertBefore(canvas, document.body.firstChild);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(innerWidth, innerHeight);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
    camera.position.z = 28;

    const NODE_COUNT = window.innerWidth < 768 ? 120 : 250;
    const LINE_DIST  = 7;

    // ── Nodes ──────────────────────────────────────────────────────────────────
    const nodePos = new Float32Array(NODE_COUNT * 3);
    const nodeVel = new Float32Array(NODE_COUNT * 3);
    const spread  = 40;

    for (let i = 0; i < NODE_COUNT; i++) {
      nodePos[i*3]   = (Math.random()-0.5) * spread;
      nodePos[i*3+1] = (Math.random()-0.5) * spread * (innerHeight/innerWidth);
      nodePos[i*3+2] = (Math.random()-0.5) * 10;
      nodeVel[i*3]   = (Math.random()-0.5) * 0.008;
      nodeVel[i*3+1] = (Math.random()-0.5) * 0.008;
      nodeVel[i*3+2] = (Math.random()-0.5) * 0.002;
    }

    const nodeBuf = new THREE.BufferGeometry();
    nodeBuf.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));

    const nodeMat = new THREE.PointsMaterial({
      color: 0x00ff41,
      size: 0.18,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
    const points = new THREE.Points(nodeBuf, nodeMat);
    scene.add(points);

    // ── Lines ─────────────────────────────────────────────────────────────────
    const maxLines = NODE_COUNT * 4;
    const linePosArr = new Float32Array(maxLines * 6);
    const lineAlphas = new Float32Array(maxLines);
    const lineBuf = new THREE.BufferGeometry();
    const linePosAttr = new THREE.BufferAttribute(linePosArr, 3);
    linePosAttr.usage = THREE.DynamicDrawUsage;
    lineBuf.setAttribute('position', linePosAttr);

    const lineMat = new THREE.LineSegments(
      lineBuf,
      new THREE.LineBasicMaterial({
        color: 0x00ff41,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    scene.add(lineMat);

    // ── Camera parallax target ─────────────────────────────────────────────────
    let camTX = 0, camTY = 0;

    // ── Animation loop ────────────────────────────────────────────────────────
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.t;
      const hw = spread / 2, hh = spread * (innerHeight/innerWidth) / 2;

      // Move nodes
      for (let i = 0; i < NODE_COUNT; i++) {
        nodePos[i*3]   += nodeVel[i*3];
        nodePos[i*3+1] += nodeVel[i*3+1];
        nodePos[i*3+2] += nodeVel[i*3+2];
        // Wrap
        if (nodePos[i*3]   >  hw) nodePos[i*3]   = -hw;
        if (nodePos[i*3]   < -hw) nodePos[i*3]   =  hw;
        if (nodePos[i*3+1] >  hh) nodePos[i*3+1] = -hh;
        if (nodePos[i*3+1] < -hh) nodePos[i*3+1] =  hh;

        // Mouse repulsion — convert mouse.nx/ny to world coords
        const mx = mouse.nx * (spread*0.5);
        const my = mouse.ny * (spread*0.5 * innerHeight/innerWidth);
        const dx = nodePos[i*3] - mx;
        const dy = nodePos[i*3+1] - my;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 5) {
          const force = (5 - dist) / 5 * 0.04;
          nodePos[i*3]   += dx / dist * force;
          nodePos[i*3+1] += dy / dist * force;
        }
      }
      nodeBuf.attributes.position.needsUpdate = true;

      // Rebuild lines
      let lc = 0;
      for (let i = 0; i < NODE_COUNT && lc < maxLines; i++) {
        for (let j = i+1; j < NODE_COUNT && lc < maxLines; j++) {
          const dx = nodePos[i*3] - nodePos[j*3];
          const dy = nodePos[i*3+1] - nodePos[j*3+1];
          const dz = nodePos[i*3+2] - nodePos[j*3+2];
          const d  = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (d < LINE_DIST) {
            linePosArr[lc*6]   = nodePos[i*3];   linePosArr[lc*6+1] = nodePos[i*3+1]; linePosArr[lc*6+2] = nodePos[i*3+2];
            linePosArr[lc*6+3] = nodePos[j*3];   linePosArr[lc*6+4] = nodePos[j*3+1]; linePosArr[lc*6+5] = nodePos[j*3+2];
            lc++;
          }
        }
      }
      // Zero out unused
      for (let i = lc*6; i < linePosArr.length; i++) linePosArr[i] = 0;
      lineBuf.attributes.position.needsUpdate = true;
      lineBuf.setDrawRange(0, lc * 2);

      // Camera parallax
      camTX += (mouse.nx * 2 - camTX) * 0.03;
      camTY += (mouse.ny * 1.5 - camTY) * 0.03;
      camera.position.x = camTX;
      camera.position.y = camTY;

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4. HERO 3D FLOATING SHAPES
  // ═══════════════════════════════════════════════════════════════════════════════
  function buildHeroScene() {
    // Find hero section
    const hero = document.querySelector('.hero, #hero, header, .header, section:first-of-type');
    if (!hero) return;

    hero.style.position = 'relative';
    hero.style.overflow = 'hidden';
    hero.style.zIndex   = '1';

    const canvas = document.createElement('canvas');
    canvas.id = 'hero-3d';
    canvas.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;width:100%;height:100%;';
    hero.insertBefore(canvas, hero.firstChild);

    const W = hero.offsetWidth, H = hero.offsetHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W/H, 0.1, 100);
    camera.position.z = 5;

    // Lights
    scene.add(new THREE.AmbientLight(0x00ff41, 0.3));
    const pointLight = new THREE.PointLight(0x00ff41, 2, 20);
    pointLight.position.set(3, 3, 3);
    scene.add(pointLight);
    const redLight = new THREE.PointLight(0xff0040, 1.5, 15);
    redLight.position.set(-3, -2, 2);
    scene.add(redLight);

    const meshes = [];

    // Helper: create glowing wireframe mesh
    function makeWire(geo, color) {
      const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.7 });
      return new THREE.Mesh(geo, mat);
    }
    function makeSolid(geo, color, emissive) {
      const mat = new THREE.MeshStandardMaterial({
        color, emissive: emissive || color, emissiveIntensity: 0.6,
        roughness: 0.2, metalness: 0.8, transparent: true, opacity: 0.85
      });
      return new THREE.Mesh(geo, mat);
    }

    // 1. Icosahedron – top right
    const ico = makeWire(new THREE.IcosahedronGeometry(0.7, 0), 0x00ff41);
    ico.position.set(2.8, 1.2, -1);
    ico._speed = { x: 0.008, y: 0.012, z: 0.003 };
    ico._offset = 0;
    scene.add(ico); meshes.push(ico);

    // Icosahedron solid inner
    const icoInner = makeSolid(new THREE.IcosahedronGeometry(0.5, 0), 0x003b00, 0x00ff41);
    icoInner.position.copy(ico.position);
    icoInner._speed = ico._speed;
    icoInner._offset = 0;
    scene.add(icoInner); meshes.push(icoInner);

    // 2. Torus Knot – bottom left
    const tk = makeWire(new THREE.TorusKnotGeometry(0.5, 0.12, 80, 12), 0x00ff41);
    tk.position.set(-2.5, -1, -0.5);
    tk._speed = { x: 0.006, y: 0.009, z: 0.004 };
    tk._offset = 1.5;
    scene.add(tk); meshes.push(tk);

    // 3. Octahedron – top left
    const octa = makeSolid(new THREE.OctahedronGeometry(0.45), 0xff0040, 0xff0040);
    octa.position.set(-2.8, 1.5, -0.8);
    octa._speed = { x: 0.01, y: 0.007, z: 0.005 };
    octa._offset = 2.5;
    scene.add(octa); meshes.push(octa);

    // 4. Dodecahedron – bottom right
    const dodeca = makeWire(new THREE.DodecahedronGeometry(0.55), 0xff0040);
    dodeca.position.set(2.5, -1.3, -1.2);
    dodeca._speed = { x: 0.005, y: 0.01, z: 0.003 };
    dodeca._offset = 3.7;
    scene.add(dodeca); meshes.push(dodeca);

    // 5. Ring / Torus – center background
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.04, 12, 80),
      new THREE.MeshStandardMaterial({ color: 0x00ff41, emissive: 0x00ff41, emissiveIntensity: 0.4, transparent: true, opacity: 0.35 })
    );
    torus.position.set(0, 0, -2.5);
    torus._speed = { x: 0.003, y: 0.006, z: 0.002 };
    torus._offset = 1.0;
    scene.add(torus); meshes.push(torus);

    // 6. Second ring, tilted
    const torus2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.03, 12, 100),
      new THREE.MeshStandardMaterial({ color: 0xff0040, emissive: 0xff0040, emissiveIntensity: 0.3, transparent: true, opacity: 0.25 })
    );
    torus2.rotation.x = Math.PI / 3;
    torus2.position.set(0.5, 0.2, -3);
    torus2._speed = { x: 0.004, y: 0.002, z: 0.005 };
    torus2._offset = 2.2;
    scene.add(torus2); meshes.push(torus2);

    // Animate
    let camTX = 0, camTY = 0;
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.t;

      meshes.forEach(m => {
        const o = m._offset || 0;
        const sp = m._speed || { x: 0.01, y: 0.01, z: 0.01 };
        m.rotation.x += sp.x;
        m.rotation.y += sp.y;
        m.rotation.z += sp.z;
        // Float up/down
        m.position.y += Math.sin(t * 0.7 + o) * 0.0015;
      });

      // Subtle camera parallax
      camTX += (mouse.nx * 0.3 - camTX) * 0.04;
      camTY += (mouse.ny * 0.2 - camTY) * 0.04;
      camera.position.x = camTX;
      camera.position.y = camTY;

      renderer.render(scene, camera);
    }
    animate();

    const ro = new ResizeObserver(() => {
      const W2 = hero.offsetWidth, H2 = hero.offsetHeight;
      renderer.setSize(W2, H2);
      camera.aspect = W2/H2;
      camera.updateProjectionMatrix();
    });
    ro.observe(hero);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 5. 3D CARD TILT
  // ═══════════════════════════════════════════════════════════════════════════════
  function build3DCardTilt() {
    // Target broad selectors to catch project cards whatever they're called
    const selectors = [
      '.project-card', '.card', '[class*="project"]',
      'section#projects > div > div', 'section > .card',
      '.works-item', '.work-item', '.portfolio-item'
    ].join(',');

    const cards = document.querySelectorAll(selectors);
    if (!cards.length) {
      // Fallback: try all direct children of sections that look like cards
      const sections = document.querySelectorAll('section, .section');
      sections.forEach(sec => {
        const children = [...sec.children].filter(c => c.tagName !== 'H2' && c.tagName !== 'H3');
        if (children.length >= 2 && children.length <= 8) applyTilt(children);
      });
      return;
    }
    applyTilt(cards);

    function applyTilt(els) {
      els.forEach(card => {
        card.style.transformStyle = 'preserve-3d';
        card.style.willChange = 'transform';
        card.style.transition = 'transform 0.05s linear, box-shadow 0.3s';

        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width  - 0.5) * 2;  // -1 to 1
          const y = ((e.clientY - r.top)  / r.height - 0.5) * 2;
          const rotX = -y * 14;
          const rotY =  x * 14;
          card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(12px) scale3d(1.03,1.03,1.03)`;
          // Gloss follow
          card.style.background = card.style.background || '';
          const gx = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
          const gy = ((e.clientY - r.top)  / r.height * 100).toFixed(1);
          card.style.backgroundImage = `radial-gradient(circle at ${gx}% ${gy}%, rgba(0,255,65,0.08) 0%, transparent 60%), ${getComputedStyle(card).backgroundImage.replace('radial-gradient(circle at','__').split('__')[0] || ''}`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0) scale3d(1,1,1)';
          card.style.backgroundImage = '';
        });
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 6. HOLOGRAM ABOUT IMAGE
  // ═══════════════════════════════════════════════════════════════════════════════
  function buildHologramAbout() {
    const imgs = document.querySelectorAll(
      '#about img, .about img, [class*="about"] img, [class*="profile"] img, .avatar, .profile-pic'
    );
    imgs.forEach(img => {
      if (img.parentElement.classList.contains('hologram-wrap')) return;
      const wrap = document.createElement('div');
      wrap.className = 'hologram-wrap';
      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);

      // Add orbiting ring via Three.js mini canvas
      const c = document.createElement('canvas');
      c.width = c.height = 200;
      c.style.cssText = 'position:absolute;inset:-30px;pointer-events:none;z-index:2;width:calc(100% + 60px);height:calc(100% + 60px);';
      wrap.style.position = 'relative';
      wrap.appendChild(c);

      const r2 = new THREE.WebGLRenderer({ canvas: c, alpha: true });
      r2.setSize(200, 200);
      const sc2 = new THREE.Scene();
      const cam2 = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
      cam2.position.z = 3;

      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.025, 8, 80),
        new THREE.MeshBasicMaterial({ color: 0x00ff41, transparent: true, opacity: 0.7 })
      );
      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.3, 0.02, 8, 80),
        new THREE.MeshBasicMaterial({ color: 0xff0040, transparent: true, opacity: 0.5 })
      );
      ring2.rotation.x = Math.PI / 3;
      sc2.add(ring1); sc2.add(ring2);

      function anim2() {
        requestAnimationFrame(anim2);
        ring1.rotation.y += 0.015;
        ring1.rotation.x += 0.007;
        ring2.rotation.z += 0.01;
        ring2.rotation.y += 0.012;
        r2.render(sc2, cam2);
      }
      anim2();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 7. GLITCH TEXT on headings
  // ═══════════════════════════════════════════════════════════════════════════════
  function buildGlitchText() {
    const headings = document.querySelectorAll('h1, h2, .glitch, [class*="title"]');
    headings.forEach(h => {
      if (h.dataset.glitchDone) return;
      h.dataset.glitchDone = '1';
      h.classList.add('glitch-el');
      h.dataset.text = h.textContent;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 8. SCROLL REVEAL
  // ═══════════════════════════════════════════════════════════════════════════════
  function buildScrollEffects() {
    const targets = document.querySelectorAll('section, .section, .card, [class*="project"], [class*="skill"]');
    targets.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(el => io.observe(el));
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 9. CLICK PARTICLE BURST
  // ═══════════════════════════════════════════════════════════════════════════════
  function buildParticleClickBurst() {
    document.addEventListener('click', e => {
      const colors = ['#00ff41', '#ff0040', '#ffffff'];
      for (let i = 0; i < 16; i++) {
        const p = document.createElement('div');
        p.className = 'burst-particle';
        const angle  = (i / 16) * Math.PI * 2;
        const speed  = 40 + Math.random() * 60;
        const color  = colors[Math.floor(Math.random() * colors.length)];
        const size   = 2 + Math.random() * 4;
        p.style.cssText = `
          left: ${e.clientX}px; top: ${e.clientY}px;
          background: ${color};
          width: ${size}px; height: ${size}px;
          box-shadow: 0 0 6px ${color};
          --dx: ${Math.cos(angle) * speed}px;
          --dy: ${Math.sin(angle) * speed}px;
          animation: burst-fade 0.5s ease-out forwards;
        `;
        // Manual animation via JS because CSS custom property in keyframe unreliable
        document.body.appendChild(p);
        const start = performance.now();
        function frame(now) {
          const prog = Math.min((now - start) / 500, 1);
          const ease = 1 - prog * prog;
          p.style.transform = `translate(calc(-50% + ${Math.cos(angle)*speed*prog}px), calc(-50% + ${Math.sin(angle)*speed*prog}px))`;
          p.style.opacity = (1 - prog).toString();
          if (prog < 1) requestAnimationFrame(frame);
          else p.remove();
        }
        requestAnimationFrame(frame);
      }
    });
  }

})();
