"use strict";

/* ══════════════════════════════════════════════════════════════
   Rufus Blessing — 3D INTERACTIVE PORTFOLIO ENGINE
   Three.js background + Physics cursor balls + Tech Orbs
   ══════════════════════════════════════════════════════════════ */

/* ── GLOBAL MOUSE ── */
const mouse = { x: 0, y: 0, nx: 0, ny: 0 };
document.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.nx = (e.clientX / window.innerWidth)  * 2 - 1;
  mouse.ny = -(e.clientY / window.innerHeight) * 2 + 1;
});

/* ══════════════════════════════════════════════════════════════
   1. SPLASH SCREEN — plays video once with sound
   ══════════════════════════════════════════════════════════════ */
(function initSplash() {
  const splash   = document.getElementById("splash-screen");
  const vid      = document.getElementById("splash-video");
  const page     = document.getElementById("main-page");
  const progress = document.getElementById("splash-progress");
  const skipBtn  = document.getElementById("splash-skip");

  if (!splash || !vid || !page) return;

  vid.muted = false;
  vid.volume = 0.85;
  document.body.style.overflow = "hidden";

  function reveal() {
    splash.classList.add("splash-exit");
    setTimeout(() => {
      splash.style.display = "none";
      page.classList.add("page-visible");
      document.body.style.overflow = "";
      bootMainPage();
    }, 1000);
  }

  vid.addEventListener("ended", reveal, { once: true });
  if (skipBtn) skipBtn.addEventListener("click", () => { vid.pause(); reveal(); });

  vid.addEventListener("timeupdate", () => {
    if (vid.duration && progress)
      progress.style.width = (vid.currentTime / vid.duration * 100) + "%";
  });

  vid.play().catch(() => {
    vid.muted = true;
    vid.play().catch(() => reveal());
    const sp = document.getElementById("sound-prompt");
    if (sp) {
      sp.style.display = "flex";
      const enable = () => { vid.muted = false; vid.volume = 0.85; sp.style.display = "none"; };
      sp.addEventListener("click", enable, { once: true });
    }
  });
})();

/* ══════════════════════════════════════════════════════════════
   2. BOOT ALL SYSTEMS
   ══════════════════════════════════════════════════════════════ */
function bootMainPage() {
  init3DBackground();
  initPhysicsBalls();
  initTechOrbs();
  initScrollReveal();
  initTypedRole();
  initMagneticButtons();
  initCounters();
  initParallax();
  initSoundButtons();
  initClosingVideo();
  initNavDots();
  initProgressBar();
  initGlitchLoop();
}

/* ══════════════════════════════════════════════════════════════
   3. THREE.JS 3D BACKGROUND — Wireframe geometry + stars
   ══════════════════════════════════════════════════════════════ */
function init3DBackground() {
  const canvas = document.getElementById("three-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.position.z = 30;

  /* Stars */
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1800;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 200;
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0x00f5ff, size: 0.15, transparent: true, opacity: 0.7 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* Wireframe Icosahedron */
  const icoGeo = new THREE.IcosahedronGeometry(8, 1);
  const icoMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, wireframe: true, transparent: true, opacity: 0.08 });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  scene.add(ico);

  /* Wireframe Torus */
  const torusGeo = new THREE.TorusGeometry(14, 0.4, 16, 80);
  const torusMat = new THREE.MeshBasicMaterial({ color: 0xff006e, wireframe: true, transparent: true, opacity: 0.06 });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.rotation.x = Math.PI / 3;
  scene.add(torus);

  /* Inner ring */
  const ring2Geo = new THREE.TorusGeometry(6, 0.2, 12, 60);
  const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x39ff14, wireframe: true, transparent: true, opacity: 0.05 });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = -Math.PI / 4;
  scene.add(ring2);

  /* Floating octahedrons */
  const octas = [];
  for (let i = 0; i < 12; i++) {
    const g = new THREE.OctahedronGeometry(Math.random() * 0.6 + 0.2, 0);
    const m = new THREE.MeshBasicMaterial({
      color: [0x00f5ff, 0xff006e, 0x39ff14][i % 3],
      wireframe: true, transparent: true, opacity: 0.15
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20
    );
    mesh.userData = {
      speed: Math.random() * 0.005 + 0.002,
      drift: Math.random() * Math.PI * 2
    };
    scene.add(mesh);
    octas.push(mesh);
  }

  function animate() {
    requestAnimationFrame(animate);
    const t = Date.now() * 0.001;

    /* React to mouse */
    camera.position.x += (mouse.nx * 3 - camera.position.x) * 0.02;
    camera.position.y += (mouse.ny * 2 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    stars.rotation.y += 0.0002;
    stars.rotation.x += 0.0001;

    ico.rotation.x = t * 0.08;
    ico.rotation.y = t * 0.12;

    torus.rotation.z = t * 0.05;
    torus.rotation.y = t * 0.03;

    ring2.rotation.z = -t * 0.06;
    ring2.rotation.x = t * 0.04 - Math.PI / 4;

    octas.forEach(o => {
      o.rotation.x += o.userData.speed;
      o.rotation.y += o.userData.speed * 0.7;
      o.position.y += Math.sin(t + o.userData.drift) * 0.005;
    });

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ══════════════════════════════════════════════════════════════
   4. PHYSICS BALLS — spawn on cursor movement
   ══════════════════════════════════════════════════════════════ */
function initPhysicsBalls() {
  const canvas = document.getElementById("physics-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H;
  const balls = [];
  const GRAVITY   = 0.12;
  const FRICTION  = 0.985;
  const BOUNCE    = 0.72;
  const MAX_BALLS = 120;
  let frameCount  = 0;
  let lastMX = 0, lastMY = 0;

  const COLORS = [
    "rgba(0,245,255,",   // cyan
    "rgba(255,0,110,",   // magenta
    "rgba(57,255,20,",   // green
    "rgba(160,80,255,",  // purple
    "rgba(255,200,0,",   // gold
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.r = Math.random() * 8 + 3;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 4 - 2;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = 0.7 + Math.random() * 0.3;
    this.life = 1;
    this.decay = 0.002 + Math.random() * 0.003;
    this.glow = Math.random() > 0.6;
  }

  function spawnBalls(x, y, count) {
    for (let i = 0; i < count; i++) {
      if (balls.length >= MAX_BALLS) balls.shift();
      balls.push(new Ball(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10));
    }
  }

  function tick() {
    requestAnimationFrame(tick);
    ctx.clearRect(0, 0, W, H);
    frameCount++;

    /* Spawn on cursor move */
    const dx = mouse.x - lastMX;
    const dy = mouse.y - lastMY;
    const speed = Math.sqrt(dx * dx + dy * dy);
    if (speed > 3 && frameCount % 2 === 0) {
      const count = Math.min(Math.floor(speed / 8) + 1, 4);
      spawnBalls(mouse.x, mouse.y, count);
    }
    lastMX = mouse.x;
    lastMY = mouse.y;

    /* Update + draw */
    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      b.vy += GRAVITY;
      b.vx *= FRICTION;
      b.vy *= FRICTION;
      b.x += b.vx;
      b.y += b.vy;
      b.life -= b.decay;

      /* Bounce off floor */
      if (b.y + b.r > H) {
        b.y = H - b.r;
        b.vy *= -BOUNCE;
        if (Math.abs(b.vy) < 0.5) b.vy = 0;
      }
      /* Bounce off walls */
      if (b.x - b.r < 0) { b.x = b.r; b.vx *= -BOUNCE; }
      if (b.x + b.r > W) { b.x = W - b.r; b.vx *= -BOUNCE; }
      /* Bounce off ceiling */
      if (b.y - b.r < 0) { b.y = b.r; b.vy *= -BOUNCE; }

      /* Ball-to-ball collisions (simple) */
      for (let j = i + 1; j < balls.length; j++) {
        const b2 = balls[j];
        const ddx = b2.x - b.x;
        const ddy = b2.y - b.y;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        const minDist = b.r + b2.r;
        if (dist < minDist && dist > 0) {
          const nx = ddx / dist;
          const ny = ddy / dist;
          const overlap = minDist - dist;
          b.x  -= nx * overlap * 0.5;
          b.y  -= ny * overlap * 0.5;
          b2.x += nx * overlap * 0.5;
          b2.y += ny * overlap * 0.5;
          const dvx = b.vx - b2.vx;
          const dvy = b.vy - b2.vy;
          const dot = dvx * nx + dvy * ny;
          b.vx  -= dot * nx * 0.5;
          b.vy  -= dot * ny * 0.5;
          b2.vx += dot * nx * 0.5;
          b2.vy += dot * ny * 0.5;
        }
      }

      if (b.life <= 0) { balls.splice(i, 1); continue; }

      const a = b.alpha * b.life;

      /* Glow */
      if (b.glow) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = b.color + (a * 0.15) + ")";
        ctx.fill();
      }

      /* Ball */
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0, b.x, b.y, b.r);
      grad.addColorStop(0, b.color + Math.min(1, a * 1.3) + ")");
      grad.addColorStop(1, b.color + (a * 0.5) + ")");
      ctx.fillStyle = grad;
      ctx.fill();

      /* Highlight */
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a * 0.35})`;
      ctx.fill();
    }

    /* Draw connections between close balls */
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const ddx = balls[i].x - balls[j].x;
        const ddy = balls[i].y - balls[j].y;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(balls[i].x, balls[i].y);
          ctx.lineTo(balls[j].x, balls[j].y);
          ctx.strokeStyle = `rgba(0,245,255,${(1 - dist / 90) * 0.12 * balls[i].life})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }
  tick();
}

/* ══════════════════════════════════════════════════════════════
   5. 3D INTERACTIVE TECH ORBS — Three.js in-section
   ══════════════════════════════════════════════════════════════ */
function initTechOrbs() {
  const container = document.getElementById("tech-orbs-container");
  if (!container || typeof THREE === "undefined") return;

  const techStack = [
    { name: "Python",     color: 0x3776AB },
    { name: "FastAPI",    color: 0x009688 },
    { name: "React",      color: 0x61DAFB },
    { name: "Next.js",    color: 0xffffff },
    { name: "PyTorch",    color: 0xEE4C2C },
    { name: "TensorFlow", color: 0xFF6F00 },
    { name: "Docker",     color: 0x2496ED },
    { name: "PostgreSQL", color: 0x336791 },
    { name: "AWS",        color: 0xFF9900 },
    { name: "LangChain",  color: 0x39ff14 },
    { name: "OpenAI",     color: 0x00f5ff },
    { name: "Hugging Face", color: 0xFFD21E },
    { name: "MLflow",     color: 0x0194E2 },
    { name: "Azure",      color: 0x0078D4 },
  ];

  const W = container.clientWidth;
  const H = container.clientHeight;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(50, W / H, 0.1, 500);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  camera.position.z = 28;

  const raycaster = new THREE.Raycaster();
  const pointer   = new THREE.Vector2();

  /* Lights */
  scene.add(new THREE.AmbientLight(0x222244, 0.6));
  const pLight = new THREE.PointLight(0x00f5ff, 1.2, 100);
  pLight.position.set(10, 10, 15);
  scene.add(pLight);
  const pLight2 = new THREE.PointLight(0xff006e, 0.6, 80);
  pLight2.position.set(-10, -5, 10);
  scene.add(pLight2);

  /* Create orbs */
  const orbs = [];
  techStack.forEach((tech, i) => {
    const angle  = (i / techStack.length) * Math.PI * 2;
    const radius = 10 + Math.sin(i * 1.3) * 3;
    const yOff   = (Math.random() - 0.5) * 8;

    const geo = new THREE.SphereGeometry(0.9, 24, 24);
    const mat = new THREE.MeshPhongMaterial({
      color: tech.color,
      emissive: tech.color,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.85,
      shininess: 90
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      Math.cos(angle) * radius,
      yOff,
      Math.sin(angle) * radius - 8
    );
    mesh.userData = {
      name: tech.name,
      basePos: mesh.position.clone(),
      angle: angle,
      radius: radius,
      yOff: yOff,
      hovered: false,
      scale: 1
    };
    scene.add(mesh);
    orbs.push(mesh);

    /* Glow ring around each orb */
    const ringGeo = new THREE.RingGeometry(1.1, 1.3, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: tech.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(mesh.position);
    ring.userData.parent = mesh;
    scene.add(ring);
    mesh.userData.ring = ring;
  });

  /* Label tooltip */
  const tooltip = document.createElement("div");
  tooltip.style.cssText = `
    position:absolute;padding:8px 16px;
    font:600 11px 'Orbitron',sans-serif;letter-spacing:.16em;text-transform:uppercase;
    color:#00f5ff;background:rgba(3,5,8,.85);border:1px solid rgba(0,245,255,.4);
    pointer-events:none;opacity:0;transition:opacity .2s;z-index:10;
    box-shadow:0 0 16px rgba(0,245,255,.3);
    clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%);
  `;
  container.appendChild(tooltip);
  container.style.position = "relative";

  /* Mouse interaction */
  container.addEventListener("mousemove", e => {
    const rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    tooltip.style.left = (e.clientX - rect.left + 14) + "px";
    tooltip.style.top  = (e.clientY - rect.top  - 14) + "px";
  });

  container.addEventListener("mouseleave", () => {
    tooltip.style.opacity = "0";
    orbs.forEach(o => { o.userData.hovered = false; });
  });

  /* Animate */
  function animate() {
    requestAnimationFrame(animate);
    const t = Date.now() * 0.001;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(orbs);

    let hoveredName = null;
    orbs.forEach(o => {
      o.userData.hovered = false;
    });
    if (hits.length > 0) {
      hits[0].object.userData.hovered = true;
      hoveredName = hits[0].object.userData.name;
    }

    orbs.forEach(o => {
      const d = o.userData;
      /* Orbit slowly */
      d.angle += 0.003;
      const targetX = Math.cos(d.angle) * d.radius;
      const targetY = d.yOff + Math.sin(t * 0.5 + d.angle) * 1.2;
      const targetZ = Math.sin(d.angle) * d.radius - 8;

      o.position.x += (targetX - o.position.x) * 0.05;
      o.position.y += (targetY - o.position.y) * 0.05;
      o.position.z += (targetZ - o.position.z) * 0.05;

      o.rotation.x = t * 0.3;
      o.rotation.y = t * 0.5;

      /* Hover scale */
      const targetScale = d.hovered ? 1.8 : 1;
      d.scale += (targetScale - d.scale) * 0.1;
      o.scale.setScalar(d.scale);
      o.material.emissiveIntensity = d.hovered ? 0.6 : 0.25;

      /* Ring follows orb */
      if (d.ring) {
        d.ring.position.copy(o.position);
        d.ring.lookAt(camera.position);
        d.ring.material.opacity = d.hovered ? 0.35 : 0.12;
        d.ring.scale.setScalar(d.scale);
      }
    });

    if (hoveredName) {
      tooltip.textContent = hoveredName;
      tooltip.style.opacity = "1";
    } else {
      tooltip.style.opacity = "0";
    }

    /* Camera breathe */
    camera.position.x += (pointer.x * 4 - camera.position.x) * 0.02;
    camera.position.y += (pointer.y * 2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, -8);

    renderer.render(scene, camera);
  }
  animate();

  /* Resize */
  const ro = new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(container);
}

/* ══════════════════════════════════════════════════════════════
   6. SCROLL REVEAL
   ══════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add("revealed"), parseInt(e.target.dataset.delay || 0));
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════════════════════════
   7. TYPED ROLE TEXT
   ══════════════════════════════════════════════════════════════ */
function initTypedRole() {
  const el = document.getElementById("typed-role");
  if (!el) return;
  const roles = ["Generative AI Engineer", "Machine Learning Engineer", "RAG Systems Architect", "LLM Fine-Tuning Expert", "AI Product Builder"];
  let ri = 0, ci = 0, del = false;
  function tick() {
    const cur = roles[ri];
    el.textContent = del ? cur.slice(0, --ci) : cur.slice(0, ++ci);
    if (!del && ci === cur.length) { del = true; setTimeout(tick, 1800); return; }
    if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; }
    setTimeout(tick, del ? 40 : 75);
  }
  tick();
}

/* ══════════════════════════════════════════════════════════════
   8. MAGNETIC BUTTONS
   ══════════════════════════════════════════════════════════════ */
function initMagneticButtons() {
  document.querySelectorAll(".btn-magnetic").forEach(btn => {
    btn.addEventListener("mousemove", e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.3;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      btn.style.transform = `translate(${x}px,${y}px)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });
}

/* ══════════════════════════════════════════════════════════════
   9. ANIMATED COUNTERS
   ══════════════════════════════════════════════════════════════ */
function initCounters() {
  const els = document.querySelectorAll("[data-count]");
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || "";
      let v = 0;
      const step = Math.max(1, Math.ceil(end / 55));
      const t = setInterval(() => { v = Math.min(v + step, end); el.textContent = v + suf; if (v >= end) clearInterval(t); }, 18);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════════════════════════
   10. HERO PARALLAX
   ══════════════════════════════════════════════════════════════ */
function initParallax() {
  const hero = document.querySelector(".video-hero");
  if (!hero) return;
  window.addEventListener("scroll", () => {
    const vid = hero.querySelector(".background-video");
    if (vid) vid.style.transform = `translateY(${window.scrollY * 0.25}px) scale(1.08)`;
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════════
   11. SOUND TOGGLE BUTTONS
   ══════════════════════════════════════════════════════════════ */
function initSoundButtons() {
  document.querySelectorAll("[data-video]").forEach(btn => {
    const vid = document.getElementById(btn.dataset.video);
    if (!vid) return;
    btn.addEventListener("click", async () => {
      vid.muted = !vid.muted;
      if (!vid.muted) { try { await vid.play(); } catch (_) {} }
      const icon = btn.querySelector(".sound-icon");
      const label = btn.querySelector(".sound-label");
      if (icon) icon.textContent = vid.muted ? "◖" : "◗";
      if (label) label.textContent = vid.muted ? "Sound off" : "Sound on";
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   12. CLOSING VIDEO (LAST PAGE) — play on scroll into view
   ══════════════════════════════════════════════════════════════ */
function initClosingVideo() {
  const v = document.getElementById("closing-video");
  if (!v) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.15 });

  obs.observe(v);

  /* Also force play when user scrolls close */
  window.addEventListener("scroll", () => {
    const rect = v.getBoundingClientRect();
    const vh = window.innerHeight;
    if (rect.top < vh && rect.bottom > 0) {
      if (v.paused) v.play().catch(() => {});
    }
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════════
   13. SIDE NAV DOTS
   ══════════════════════════════════════════════════════════════ */
function initNavDots() {
  const dots = document.querySelectorAll(".nav-dot");
  const sections = document.querySelectorAll("section[id]");
  if (!dots.length || !sections.length) return;
  sections.forEach(s => {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        dots.forEach(d => d.classList.remove("active"));
        const a = document.querySelector(`.nav-dot[href="#${e.target.id}"]`);
        if (a) a.classList.add("active");
      });
    }, { threshold: 0.3 }).observe(s);
  });
}

/* ══════════════════════════════════════════════════════════════
   14. READING PROGRESS
   ══════════════════════════════════════════════════════════════ */
function initProgressBar() {
  const bar = document.getElementById("read-progress");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    bar.style.width = Math.min(100, window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + "%";
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════════
   15. GLITCH LOOP ON H1
   ══════════════════════════════════════════════════════════════ */
function initGlitchLoop() {
  const h = document.querySelector(".video-hero h1");
  if (!h) return;
  function go() {
    h.style.filter = "hue-rotate(90deg) brightness(1.3)";
    h.style.transform = `skewX(${(Math.random() - 0.5) * 3}deg) translateX(${(Math.random() - 0.5) * 4}px)`;
    setTimeout(() => { h.style.filter = ""; h.style.transform = ""; }, 80 + Math.random() * 60);
    setTimeout(go, 5000 + Math.random() * 5000);
  }
  setTimeout(go, 3000);
}
