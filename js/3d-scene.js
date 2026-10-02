/**
 * ============================================================
 * VPS ACADEMY – 3D SPATIAL INTERACTIVE ENGINE v3.0
 * Ultra-Modern WebGL 3D Scene + Real-time 3D Card Tilt + Parallax
 * ============================================================
 */

(function () {
  'use strict';

  // ─── 1. THREE.JS 3D HERO SCENE ─────────────────────────────
  function initHero3DScene() {
    const canvas = document.getElementById('hero3DCanvas');
    if (!canvas) return;

    // Check if Three is loaded
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded. Falling back to CSS 3D effects.');
      return;
    }

    const container = canvas.parentElement;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 560;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0f1c3f, 2.0);
    scene.add(ambientLight);

    // Dynamic point lights for 3D specular reflections
    const cyanLight = new THREE.PointLight(0x00f2fe, 3.5, 30);
    cyanLight.position.set(6, 4, 6);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 3.0, 30);
    purpleLight.position.set(-6, -3, 5);
    scene.add(purpleLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 2.5, 30);
    goldLight.position.set(0, 6, -3);
    scene.add(goldLight);

    // Group to hold all 3D core elements (for interactive rotation & parallax)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Shift group slightly to the right side on desktop so text on the left stays legible
    function updateGroupPosition() {
      if (window.innerWidth > 992) {
        coreGroup.position.set(2.5, 0, 0);
      } else {
        coreGroup.position.set(0, 0.5, 0);
      }
    }
    updateGroupPosition();

    // ── Mesh 1: Glowing 3D Icosahedron Tech Core ──
    const icoGeo = new THREE.IcosahedronGeometry(2.3, 1);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.9,
      wireframe: false,
      transparent: true,
      opacity: 0.85
    });
    const icosahedron = new THREE.Mesh(icoGeo, icoMat);
    coreGroup.add(icosahedron);

    // Wireframe overlay for futuristic holographic tech look
    const wireGeo = new THREE.IcosahedronGeometry(2.34, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    coreGroup.add(wireMesh);

    // ── Mesh 2: Inner Pulsing Crystal Core ──
    const innerGeo = new THREE.OctahedronGeometry(1.2, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.8
    });
    const innerCrystal = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerCrystal);

    // ── Mesh 3 & 4: Dual 3D Holographic Orbital Rings ──
    const ringGeo1 = new THREE.TorusGeometry(3.6, 0.05, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    coreGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(4.2, 0.04, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.55
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 4;
    coreGroup.add(ring2);

    // ── Mesh 5: Orbiting 3D Tech Nodes (Photocopy, AI, Print, Skills) ──
    const satellites = [];
    const satColors = [0x00f2fe, 0xf59e0b, 0x10b981, 0xec4899];
    const satGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);

    for (let i = 0; i < 4; i++) {
      const satMat = new THREE.MeshStandardMaterial({
        color: satColors[i],
        emissive: satColors[i],
        emissiveIntensity: 0.7,
        roughness: 0.2,
        metalness: 0.8
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      coreGroup.add(satMesh);
      satellites.push({
        mesh: satMesh,
        speed: 0.015 + i * 0.005,
        radius: 3.8 + (i % 2) * 0.5,
        angle: (i * Math.PI) / 2,
        yOffset: (i - 1.5) * 0.8
      });
    }

    // ── Mesh 6: Starfield / 3D Constellation Particles ──
    const particleCount = 650;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const cCyan = new THREE.Color(0x00f2fe);
    const cPurple = new THREE.Color(0xa855f7);
    const cGold = new THREE.Color(0xf59e0b);
    const cWhite = new THREE.Color(0xffffff);
    const colorChoices = [cCyan, cPurple, cGold, cWhite];

    for (let i = 0; i < particleCount; i++) {
      // Spread across 3D volume
      particlePos[i * 3] = (Math.random() - 0.5) * 36;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const chosenColor = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      particleColors[i * 3] = chosenColor.r;
      particleColors[i * 3 + 1] = chosenColor.g;
      particleColors[i * 3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Custom circular sprite particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    pGrad.addColorStop(0, 'rgba(255,255,255,1)');
    pGrad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    pGrad.addColorStop(0.7, 'rgba(255,255,255,0.2)');
    pGrad.addColorStop(1, 'rgba(255,255,255,0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 32, 32);

    const particleTexture = new THREE.CanvasTexture(pCanvas);
    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // ── Mouse / Touch Parallax & Inertial Orbit Interaction ──
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let dragVelocityX = 0;
    let dragVelocityY = 0;

    function onPointerMove(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      mouseX = (clientX / window.innerWidth) * 2 - 1;
      mouseY = -(clientY / window.innerHeight) * 2 + 1;

      targetX = mouseX * 0.8;
      targetY = mouseY * 0.5;

      if (isDragging) {
        const deltaX = clientX - previousPointerX;
        const deltaY = clientY - previousPointerY;
        dragVelocityX = deltaX * 0.006;
        dragVelocityY = deltaY * 0.006;
        coreGroup.rotation.y += dragVelocityX;
        coreGroup.rotation.x += dragVelocityY;
        previousPointerX = clientX;
        previousPointerY = clientY;
      }
    }

    function onPointerDown(e) {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      previousPointerX = clientX;
      previousPointerY = clientY;
      dragVelocityX = 0;
      dragVelocityY = 0;
    }

    function onPointerUp() {
      isDragging = false;
    }

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // Handle Window Resize
    function onResize() {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 560;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      updateGroupPosition();
    }
    window.addEventListener('resize', onResize);

    // ── Animation Loop ──
    let clock = new THREE.Clock();
    let frameId;

    function animate() {
      frameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      camera.position.x += (targetX * 2 - camera.position.x) * 0.04;
      camera.position.y += (targetY * 1.5 - camera.position.y) * 0.04;
      camera.lookAt(coreGroup.position.x * 0.5, 0, 0);

      // Inertial damping if dragged
      if (!isDragging) {
        dragVelocityX *= 0.94;
        dragVelocityY *= 0.94;
        coreGroup.rotation.y += dragVelocityX;
        coreGroup.rotation.x += dragVelocityY;

        // Ambient rotation
        coreGroup.rotation.y += 0.004;
        coreGroup.rotation.x += 0.002;
      }

      // Rotate individual components
      icosahedron.rotation.y += 0.005;
      wireMesh.rotation.y -= 0.003;
      innerCrystal.rotation.x += 0.012;
      innerCrystal.rotation.y += 0.015;

      // Pulse inner crystal
      const scale = 1.0 + Math.sin(elapsedTime * 2.5) * 0.12;
      innerCrystal.scale.set(scale, scale, scale);

      // Rings spin
      ring1.rotation.z += 0.008;
      ring2.rotation.z -= 0.006;

      // Orbiting Satellites
      satellites.forEach((sat) => {
        sat.angle += sat.speed;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
        sat.mesh.position.z = Math.sin(sat.angle) * sat.radius;
        sat.mesh.position.y = Math.sin(elapsedTime * 2 + sat.angle) * 0.5 + sat.yOffset;
        sat.mesh.rotation.x += 0.03;
        sat.mesh.rotation.y += 0.03;
      });

      // Slowly rotate particle field
      particleSystem.rotation.y = elapsedTime * 0.02;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.01) * 0.05;

      // Orbit point lights for dynamic illumination
      cyanLight.position.x = Math.sin(elapsedTime * 0.8) * 7;
      cyanLight.position.z = Math.cos(elapsedTime * 0.8) * 7;

      purpleLight.position.x = Math.cos(elapsedTime * 0.7) * -7;
      purpleLight.position.z = Math.sin(elapsedTime * 0.7) * -7;

      renderer.render(scene, camera);
    }

    animate();
  }

  // ─── 2. TRUE 3D CARD TILT ENGINE ────────────────────────────
  function attach3DTiltToCard(card) {
    if (card._has3DTilt) return;
    card._has3DTilt = true;

    // Ensure card has 3D preserve context
    card.classList.add('has-3d-tilt');

    // Create dynamic specular glare layer if not present
    let glare = card.querySelector('.card-3d-glare');
    if (!glare) {
      glare = document.createElement('div');
      glare.className = 'card-3d-glare';
      card.appendChild(glare);
    }

    let isHovered = false;
    let reqId = null;

    function onMouseMove(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Normalized coordinates (-1 to 1)
      const xPercent = (x / rect.width) * 2 - 1;
      const yPercent = (y / rect.height) * 2 - 1;

      // 3D rotation angles (degrees)
      const rotateX = -yPercent * 12;
      const rotateY = xPercent * 12;

      // Cancel previous rAF
      if (reqId) cancelAnimationFrame(reqId);

      reqId = requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(12px) scale3d(1.025, 1.025, 1.025)`;

        // Update glare position
        glare.style.opacity = '1';
        glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 45%, transparent 75%)`;
      });
    }

    function onMouseEnter() {
      isHovered = true;
      card.style.transition = 'transform 0.12s ease-out, box-shadow 0.25s ease';
    }

    function onMouseLeave() {
      isHovered = false;
      if (reqId) cancelAnimationFrame(reqId);

      // Smooth reset transition
      card.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)';

      glare.style.opacity = '0';
    }

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove, { passive: true });
    card.addEventListener('mouseleave', onMouseLeave);
  }

  function initAll3DTilts() {
    const cards = document.querySelectorAll(
      '.course-card, .feature-card-3d, .hero-card-float, .auth-card, .course-sidebar-card, .stat-box-3d, .qr-modal-box'
    );
    cards.forEach(attach3DTiltToCard);
  }

  // Observe dynamically rendered cards (e.g. from CourseDB or search filter)
  function observeDynamicCards() {
    const observer = new MutationObserver(() => {
      initAll3DTilts();
    });

    const targetGrid = document.getElementById('coursesGrid');
    if (targetGrid) {
      observer.observe(targetGrid, { childList: true, subtree: true });
    }

    // Also observe body in case other modals/views pop in
    observer.observe(document.body, { childList: true });
  }

  // ─── 3. INTERACTIVE 3D HERO MINI-WIDGET ─────────────────────
  function initHeroWidgetInteraction() {
    const widget = document.getElementById('heroInteractiveWidget');
    if (!widget) return;

    const tabs = widget.querySelectorAll('.hw-tab');
    const displayTitle = widget.querySelector('#hwTitle');
    const displayBadge = widget.querySelector('#hwBadge');
    const displayIcon = widget.querySelector('#hwIcon');
    const displayDesc = widget.querySelector('#hwDesc');

    const widgetData = {
      ai: {
        icon: '🤖',
        title: 'Trí tuệ nhân tạo (AI) VPS',
        desc: 'Tự động hóa tác vụ văn phòng, chatbot tư vấn & phân tích hợp đồng thông minh',
        badge: '🚀 Đột phá 2026',
        badgeColor: 'linear-gradient(135deg, #00f2fe, #4facfe)'
      },
      photocopy: {
        icon: '🖨️',
        title: 'Thiết bị Photocopy & In ấn',
        desc: 'Mô phỏng 3D phần cứng Ricoh, FujiFilm, Konica Minolta và khắc phục sự cố',
        badge: '⚡ Chuyên sâu',
        badgeColor: 'linear-gradient(135deg, #f59e0b, #d97706)'
      },
      papercut: {
        icon: '⚙️',
        title: 'Giải pháp PaperCut MF / Hive',
        desc: 'Bảo mật tài liệu in ấn cấp doanh nghiệp, kiểm soát định lượng & mã hóa dữ liệu',
        badge: '💎 Chuẩn Enterprise',
        badgeColor: 'linear-gradient(135deg, #a855f7, #6366f1)'
      }
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const key = tab.getAttribute('data-widget');
        const data = widgetData[key];
        if (!data) return;

        // 3D Flip animation
        const visualCard = widget.querySelector('.hw-card-inner');
        if (visualCard) {
          visualCard.style.transform = 'rotateY(90deg) scale(0.95)';
          visualCard.style.opacity = '0.5';

          setTimeout(() => {
            if (displayIcon) displayIcon.textContent = data.icon;
            if (displayTitle) displayTitle.textContent = data.title;
            if (displayDesc) displayDesc.textContent = data.desc;
            if (displayBadge) {
              displayBadge.textContent = data.badge;
              displayBadge.style.background = data.badgeColor;
            }
            visualCard.style.transform = 'rotateY(0deg) scale(1)';
            visualCard.style.opacity = '1';
          }, 180);
        }
      });
    });
  }

  // ─── 4. 3D SOUND & INTERACTION FEEDBACK (Haptic / Tactile) ─
  function initTactileInteractions() {
    // Subtle button click depression
    document.querySelectorAll('.btn, .cat-item, .hero-dot').forEach((el) => {
      el.addEventListener('mousedown', () => {
        el.style.transform = 'scale(0.97) translateY(1px)';
      });
      el.addEventListener('mouseup', () => {
        el.style.transform = '';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // ─── 5. INITIALIZATION ─────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initHero3DScene();
    initAll3DTilts();
    observeDynamicCards();
    initHeroWidgetInteraction();
    initTactileInteractions();
  });

  // Export for external calls
  window.VPS3D = {
    initHero3DScene,
    initAll3DTilts,
    attach3DTiltToCard
  };
})();
