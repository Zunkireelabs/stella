import * as THREE from 'three';

function init() {
  const canvas = document.getElementById('stella-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── Renderer ──
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ── Scene + Camera ──
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 5.5);

  // ── Globe group (rotates independently) ──
  const globe = new THREE.Group();
  scene.add(globe);


  const GLOBE_R = 1.55;
  const PTS = 81; // points per grid line

  // Grid material — darker green so it reads on the light bg
  const gridMat = new THREE.LineBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.38 });

  // Build latitude lines + keep point arrays for sweep arcs
  const LAT_DEGS = [-60, -30, 0, 30, 60];
  const latPts = LAT_DEGS.map(deg => {
    const lat = (deg * Math.PI) / 180;
    const r   = Math.cos(lat) * GLOBE_R;
    const y   = Math.sin(lat) * GLOBE_R;
    const pts = [];
    for (let i = 0; i < PTS; i++) {
      const a = (i / (PTS - 1)) * Math.PI * 2;
      pts.push(new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a)));
    }
    globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    return pts;
  });

  // Build longitude lines + keep point arrays for sweep arcs
  const LNG_COUNT = 12;
  const lngPts = Array.from({ length: LNG_COUNT }, (_, i) => {
    const lng = (i / LNG_COUNT) * Math.PI * 2;
    const pts = [];
    for (let j = 0; j < PTS; j++) {
      const phi = (j / (PTS - 1)) * Math.PI - Math.PI / 2;
      pts.push(new THREE.Vector3(
        Math.cos(phi) * Math.cos(lng) * GLOBE_R,
        Math.sin(phi) * GLOBE_R,
        Math.cos(phi) * Math.sin(lng) * GLOBE_R,
      ));
    }
    globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    return pts;
  });

  // ── Animated sweep arcs — glowing segments that travel along the grid ──
  const SWEEP_LEN = 22;
  const sweepDefs = [
    { pts: latPts[3],  speed: 0.28, phase: 0.00, color: 0x166534 },
    { pts: lngPts[1],  speed: 0.22, phase: 0.35, color: 0x4ade80 },
    { pts: latPts[1],  speed: 0.18, phase: 0.60, color: 0x166534 },
    { pts: lngPts[7],  speed: 0.32, phase: 0.15, color: 0x166534 },
    { pts: lngPts[4],  speed: 0.24, phase: 0.80, color: 0x4ade80 },
  ];
  const sweepArcs = sweepDefs.map(def => {
    const positions = new Float32Array((SWEEP_LEN + 1) * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({ color: def.color, transparent: true, opacity: 1.0 });
    globe.add(new THREE.Line(geo, mat));
    return { ...def, positions, geo };
  });

  // ── Tiny ecommerce marker dots on globe surface ──
  const markerPositions = [
    [35, 45], [52, -60], [-18, 80],
    [-42, 20], [14, -100], [61, 120],
    [28, -30], [-35, 155], [5, 60],
  ];
  const mGeo = new THREE.SphereGeometry(0.04, 6, 6);
  markerPositions.forEach(([latDeg, lngDeg]) => {
    const lat = (latDeg * Math.PI) / 180;
    const lng = (lngDeg * Math.PI) / 180;
    const pos = new THREE.Vector3(
      Math.cos(lat) * Math.cos(lng) * GLOBE_R,
      Math.sin(lat) * GLOBE_R,
      Math.cos(lat) * Math.sin(lng) * GLOBE_R,
    );
    const marker = new THREE.Mesh(mGeo, new THREE.MeshBasicMaterial({ color: 0xFEF08A }));
    marker.position.copy(pos);
    globe.add(marker);
  });

  // ── Particle cloud (spherical shell around globe) ──
  const COUNT = 800;
  const pPos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const r   = 2.0 + Math.random() * 1.5;
    const phi = Math.acos(2 * Math.random() - 1);
    const th  = Math.random() * Math.PI * 2;
    pPos[i * 3]     = r * Math.sin(phi) * Math.cos(th);
    pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(th);
    pPos[i * 3 + 2] = r * Math.cos(phi);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particleCloud = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x86EFAC, size: 0.03, transparent: true, opacity: 0.4, sizeAttenuation: true,
  }));
  scene.add(particleCloud);

  // ── Connection lines from globe surface to 5 card positions ──
  const cardLineMat = new THREE.LineBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.55 });
  const cardLineEndpoints = [
    new THREE.Vector3(0,      1.55,  0),  // top center   → Chat (9% from top)
    new THREE.Vector3(1.20,   0.90,  0),  // right upper  → Products (28% top, 6% right)
    new THREE.Vector3(1.20,  -0.55,  0),  // right lower  → Order (62% top, 6% right)
    new THREE.Vector3(-1.20, -0.55,  0),  // left lower   → 24/7
    new THREE.Vector3(-1.20,  0.90,  0),  // left upper   → Channels
  ];
  const lineStartPoints = cardLineEndpoints.map(end =>
    end.clone().normalize().multiplyScalar(GLOBE_R + 0.05)
  );
  cardLineEndpoints.forEach((end, i) => {
    const lineGeo = new THREE.BufferGeometry().setFromPoints([lineStartPoints[i], end]);
    scene.add(new THREE.Line(lineGeo, cardLineMat));
  });

  // ── Traveling particles along connection lines ──
  const clock = new THREE.Clock();
  const travelParticles = cardLineEndpoints.map((end, i) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xFEF08A, transparent: true, opacity: 1 })
    );
    scene.add(mesh);
    return { mesh, start: lineStartPoints[i].clone(), end: end.clone(), phase: i / 5 };
  });

  // ── Mouse tilt ──
  let tRX = 0, tRY = 0, cRX = 0, cRY = 0;
  let mouseOver = false;
  let autoAngle = 0;

  const heroEl = document.getElementById('hero');
  heroEl?.addEventListener('mousemove', e => {
    mouseOver = true;
    const r = heroEl.getBoundingClientRect();
    tRY =  ((e.clientX - r.left) / r.width  - 0.5) * 0.35;
    tRX = -((e.clientY - r.top)  / r.height - 0.5) * 0.22;
  });
  heroEl?.addEventListener('mouseleave', () => { mouseOver = false; tRX = 0; tRY = 0; });

  // ── Resize ──
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  // ── Pause off-screen ──
  let active = true;
  new IntersectionObserver(([e]) => { active = e.isIntersecting; }, { threshold: 0.1 }).observe(canvas);

  // ── Animation loop ──
  function tick() {
    requestAnimationFrame(tick);
    if (!active) return;

    const elapsed = clock.getElapsedTime();

    // Globe self-rotation
    globe.rotation.y += 0.003;

    // Particle cloud counter-rotation
    particleCloud.rotation.y -= 0.0006;
    particleCloud.rotation.x  += 0.0002;

    // Sweep arcs — advance each glowing segment along its path
    sweepArcs.forEach(arc => {
      const N = arc.pts.length;
      const startIdx = Math.floor(((elapsed * arc.speed + arc.phase) % 1.0) * N);
      for (let k = 0; k <= SWEEP_LEN; k++) {
        const idx = (startIdx + k) % N;
        arc.positions[k * 3]     = arc.pts[idx].x;
        arc.positions[k * 3 + 1] = arc.pts[idx].y;
        arc.positions[k * 3 + 2] = arc.pts[idx].z;
      }
      arc.geo.attributes.position.needsUpdate = true;
    });

    // Scene mouse tilt / auto-rotate
    if (mouseOver) {
      cRX += (tRX - cRX) * 0.07;
      cRY += (tRY - cRY) * 0.07;
    } else {
      autoAngle += 0.0018;
      cRX += (0 - cRX) * 0.04;
      cRY += (autoAngle - cRY) * 0.018;
    }
    scene.rotation.x = cRX;
    scene.rotation.y = cRY;

    // Traveling particles along connection lines
    travelParticles.forEach(({ mesh, start, end, phase }) => {
      const t = (elapsed * 0.5 + phase) % 1.0;
      mesh.position.lerpVectors(start, end, t);
      mesh.material.opacity = t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1;
    });

    renderer.render(scene, camera);
  }

  tick();
}

init();
