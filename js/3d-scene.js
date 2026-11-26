/**
 * ============================================================
 * VPS ACADEMY – 3D SPATIAL INTERACTIVE ENGINE v4.0
 * Tone màu thương hiệu TẬP ĐOÀN VPS:
 *   - Xanh nước biển (Ocean Blue): #0054A6 / #0077E6
 *   - Đỏ ngôi sao (Crimson Red):   #E61E25 / #FF3B42
 *   - Vàng ngôi sao (Star Gold):   #FFD700
 * ============================================================
 */

(function () {
  'use strict';

  // ─── 0. AUTO-INJECT OFFICIAL VPS GROUP LOGO ─────────────────
  function injectVPSBrandLogo() {
    const logoContainers = document.querySelectorAll(
      '.logo-icon, .auth-logo-icon, .admin-logo-icon, .f-logo-icon'
    );
    logoContainers.forEach((el) => {
      if (!el.querySelector('img')) {
        el.innerHTML = '<img src="images/logo-vps.png" alt="Tập Đoàn VPS Logo" loading="eager">';
      }
    });
  }

  // ─── 1. THREE.JS 3D HERO SCENE (VPS GROUP OCEAN BLUE & RED) ─
  function initHero3DScene() {
    const canvas = document.getElementById('hero3DCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const container = canvas.parentElement;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 560;

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

    // Friendly Bright 3D Lighting in Ocean Blue, Sky Cyan & Gold
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 2.3);
    scene.add(ambientLight);

    const oceanBlueLight = new THREE.PointLight(0x0088ff, 4.0, 35);
    oceanBlueLight.position.set(6, 4, 6);
    scene.add(oceanBlueLight);

    const skyCyanLight = new THREE.PointLight(0x00e5ff, 3.6, 35);
    skyCyanLight.position.set(-6, -3, 6);
    scene.add(skyCyanLight);

    const starGoldLight = new THREE.PointLight(0xfbbf24, 2.8, 30);
    starGoldLight.position.set(0, 6, 4);
    scene.add(starGoldLight);

    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    function updateGroupPosition() {
      if (window.innerWidth > 992) {
        coreGroup.position.set(2.4, 0, 0);
      } else {
        coreGroup.position.set(0, 0.4, 0);
      }
    }
    updateGroupPosition();

    // ── Mesh 1: Ocean Blue 3D Tech Globe Core (#0054A6) ──
    const icoGeo = new THREE.IcosahedronGeometry(2.25, 2);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x0054a6,
      emissive: 0x003d7a,
      emissiveIntensity: 0.55,
      roughness: 0.18,
      metalness: 0.85,
      transparent: true,
      opacity: 0.9
    });
    const icosahedron = new THREE.Mesh(icoGeo, icoMat);
    coreGroup.add(icosahedron);

    // Glowing Ocean Sky Wireframe Lattice
    const wireGeo = new THREE.IcosahedronGeometry(2.3, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    coreGroup.add(wireMesh);

    // ── Mesh 2: Golden 3D Center Star (Ngôi sao vàng trung tâm chữ VPS) ──
    const innerGeo = new THREE.OctahedronGeometry(1.15, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.85,
      roughness: 0.12,
      metalness: 0.9
    });
    const innerCrystal = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerCrystal);

    // ── Mesh 3 & 4: Sky Cyan & Ocean Blue 3D Orbital Rings ──
    const ringGeo1 = new THREE.TorusGeometry(3.55, 0.06, 20, 120);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.75,
      roughness: 0.2,
      metalness: 0.7
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    coreGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(4.15, 0.05, 16, 120);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 3.5;
    ring2.rotation.z = Math.PI / 4;
    coreGroup.add(ring2);

    // ── Mesh 5: 11 Orbiting 3D Sky Cyan & Gold Stars ──
    const satellites = [];
    const starGeo = new THREE.OctahedronGeometry(0.27, 0);
    const starPalette = [0x38bdf8, 0xfbbf24, 0x0ea5e9, 0x2dd4bf];

    for (let i = 0; i < 11; i++) {
      const starColor = starPalette[i % starPalette.length];
      const satMat = new THREE.MeshStandardMaterial({
        color: starColor,
        emissive: starColor,
        emissiveIntensity: 0.8,
        roughness: 0.15,
        metalness: 0.85
      });
      const satMesh = new THREE.Mesh(starGeo, satMat);
      coreGroup.add(satMesh);
      satellites.push({
        mesh: satMesh,
        speed: 0.008 + (i % 3) * 0.003,
        radius: 3.75 + (i % 2) * 0.35,
        angle: (i * Math.PI * 2) / 11,
        yOffset: Math.sin((i / 11) * Math.PI) * 1.2 - 0.4
      });
    }

    // ── Mesh 6: Friendly 3D Ocean & Sky Starfield Particles ──
    const particleCount = 520;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const cOcean = new THREE.Color(0x7dd3fc);
    const cAqua = new THREE.Color(0x38bdf8);
    const cGold = new THREE.Color(0xfde047);
    const cWhite = new THREE.Color(0xffffff);
    const colorChoices = [cOcean, cAqua, cGold, cWhite, cOcean];

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 36;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const chosen = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      particleColors[i * 3] = chosen.r;
      particleColors[i * 3 + 1] = chosen.g;
      particleColors[i * 3 + 2] = chosen.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    pGrad.addColorStop(0, 'rgba(255,255,255,1)');
    pGrad.addColorStop(0.35, 'rgba(255,255,255,0.85)');
    pGrad.addColorStop(1, 'rgba(255,255,255,0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 32, 32);

    const particleTexture = new THREE.CanvasTexture(pCanvas);
    const particleMat = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // ── Interactive Mouse/Touch Orbit ──
    let targetX = 0;
    let targetY = 0;
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velX = 0;
    let velY = 0;

    function onPointerMove(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      targetX = ((clientX / window.innerWidth) * 2 - 1) * 0.75;
      targetY = (-(clientY / window.innerHeight) * 2 + 1) * 0.45;

      if (isDragging) {
        velX = (clientX - prevX) * 0.006;
        velY = (clientY - prevY) * 0.006;
        coreGroup.rotation.y += velX;
        coreGroup.rotation.x += velY;
        prevX = clientX;
        prevY = clientY;
      }
    }

    function onPointerDown(e) {
      isDragging = true;
      prevX = e.touches ? e.touches[0].clientX : e.clientX;
      prevY = e.touches ? e.touches[0].clientY : e.clientY;
      velX = 0;
      velY = 0;
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

    window.addEventListener('resize', () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 560;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      updateGroupPosition();
    });

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      camera.position.x += (targetX * 1.8 - camera.position.x) * 0.04;
      camera.position.y += (targetY * 1.4 - camera.position.y) * 0.04;
      camera.lookAt(coreGroup.position.x * 0.5, 0, 0);

      if (!isDragging) {
        velX *= 0.94;
        velY *= 0.94;
        coreGroup.rotation.y += velX + 0.0035;
        coreGroup.rotation.x += velY + 0.0015;
      }

      icosahedron.rotation.y += 0.004;
      wireMesh.rotation.y -= 0.0025;
      innerCrystal.rotation.x += 0.012;
      innerCrystal.rotation.y += 0.015;

      const pulse = 1.0 + Math.sin(t * 2.4) * 0.1;
      innerCrystal.scale.set(pulse, pulse, pulse);

      ring1.rotation.z += 0.007;
      ring2.rotation.z -= 0.005;

      satellites.forEach((sat) => {
        sat.angle += sat.speed;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
        sat.mesh.position.z = Math.sin(sat.angle) * sat.radius;
        sat.mesh.position.y = Math.sin(t * 2 + sat.angle) * 0.45 + sat.yOffset;
        sat.mesh.rotation.x += 0.035;
        sat.mesh.rotation.y += 0.035;
      });

      particleSystem.rotation.y = t * 0.018;
      renderer.render(scene, camera);
    }

    animate();
  }

  // ─── 2. TRUE 3D CARD TILT ENGINE ────────────────────────────
  function attach3DTiltToCard(card) {
    if (card._has3DTilt) return;
    card._has3DTilt = true;
    card.classList.add('has-3d-tilt');

    let glare = card.querySelector('.card-3d-glare');
    if (!glare) {
      glare = document.createElement('div');
      glare.className = 'card-3d-glare';
      card.appendChild(glare);
    }

    let reqId = null;

    function onMouseMove(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const xPercent = (x / rect.width) * 2 - 1;
      const yPercent = (y / rect.height) * 2 - 1;

      const rotateX = -yPercent * 9;
      const rotateY = xPercent * 9;

      if (reqId) cancelAnimationFrame(reqId);

      reqId = requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px) scale3d(1.015, 1.015, 1.015)`;
        glare.style.opacity = '1';
        glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.35) 0%, rgba(0, 84, 166, 0.06) 45%, transparent 75%)`;
      });
    }

    function onMouseEnter() {
      card.style.transition = 'transform 0.12s ease-out, box-shadow 0.25s ease';
    }

    function onMouseLeave() {
      if (reqId) cancelAnimationFrame(reqId);
      card.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.45s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)';
      glare.style.opacity = '0';
    }

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove, { passive: true });
    card.addEventListener('mouseleave', onMouseLeave);
  }

  function initAll3DTilts() {
    const cards = document.querySelectorAll(
      '.course-card, .feature-card-3d, .hero-card-float, .course-sidebar-card, .stat-box-3d'
    );
    cards.forEach(attach3DTiltToCard);
  }

  function observeDynamicCards() {
    const observer = new MutationObserver(() => {
      initAll3DTilts();
    });
    const targetGrid = document.getElementById('coursesGrid');
    if (targetGrid) {
      observer.observe(targetGrid, { childList: true, subtree: true });
    }
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
        badgeColor: 'linear-gradient(135deg, #0284c7, #0ea5e9)'
      },
      photocopy: {
        icon: '🖨️',
        title: 'Thiết bị Photocopy & In ấn',
        desc: 'Mô phỏng 3D phần cứng Ricoh, FujiFilm, Konica Minolta và khắc phục sự cố',
        badge: '⚡ Chuyên sâu',
        badgeColor: 'linear-gradient(135deg, #0054a6, #0284c7)'
      },
      papercut: {
        icon: '⚙️',
        title: 'Giải pháp PaperCut MF / Hive',
        desc: 'Bảo mật tài liệu in ấn cấp doanh nghiệp, kiểm soát định lượng & mã hóa dữ liệu',
        badge: '🛡️ Bảo mật VPS',
        badgeColor: 'linear-gradient(135deg, #0d9488, #10b981)'
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

  document.addEventListener('DOMContentLoaded', () => {
    injectVPSBrandLogo();
    initHero3DScene();
    initAll3DTilts();
    observeDynamicCards();
    initHeroWidgetInteraction();
  });
})();
