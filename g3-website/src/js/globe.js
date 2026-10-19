// Interactive 3D globe (Three.js): land dots, glowing atmosphere and animated
// routes from the Middle East to Budapest. Loaded lazily only when visible.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, BufferGeometry, Float32BufferAttribute,
  Points, ShaderMaterial, Mesh, SphereGeometry, AdditiveBlending, BackSide, Vector3,
  QuadraticBezierCurve3, Line, LineBasicMaterial, MeshBasicMaterial, RingGeometry, Color,
} from "three";
import { DOTS } from "./globe-data.js";

const BUDAPEST = [47.4979, 19.0402];
const CITIES = [
  [35.6892, 51.389],  // Tehran
  [25.2048, 55.2708], // Dubai
  [41.0082, 28.9784], // Istanbul
  [33.3152, 44.3661], // Baghdad
  [24.7136, 46.6753], // Riyadh
  [34.5553, 69.2075], // Kabul
  [25.2854, 51.531],  // Doha
  [29.3759, 47.9774], // Kuwait City
];
const R = 1;
const DEG = Math.PI / 180;

function toXYZ(lat, lon, r = R) {
  const phi = (90 - lat) * DEG, th = (lon + 180) * DEG;
  return new Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}

export function initGlobe(canvas, { reduced = false } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 4.4);

  const globe = new Group();
  scene.add(globe);

  const gold = new Color("#d9b56e");
  const dim = new Color("#55627e");
  const bud = toXYZ(...BUDAPEST);

  // Land dots, tinted gold near Budapest / Middle East corridor
  const pos = [], col = [], size = [];
  for (let i = 0; i < DOTS.length; i += 2) {
    const v = toXYZ(DOTS[i], DOTS[i + 1]);
    pos.push(v.x, v.y, v.z);
    const dist = v.distanceTo(bud);
    const t = Math.max(0, 1 - dist / 0.9);
    const c = dim.clone().lerp(gold, t * 0.95);
    col.push(c.r, c.g, c.b);
    size.push(1 + t * 0.8);
  }
  const dotGeo = new BufferGeometry();
  dotGeo.setAttribute("position", new Float32BufferAttribute(pos, 3));
  dotGeo.setAttribute("color", new Float32BufferAttribute(col, 3));
  dotGeo.setAttribute("aSize", new Float32BufferAttribute(size, 1));
  const dotMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uPx: { value: renderer.getPixelRatio() } },
    vertexShader: `
      attribute float aSize; attribute vec3 color; varying vec3 vColor; varying float vFace; uniform float uPx;
      void main(){
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        vec3 n = normalize(mat3(modelViewMatrix) * position);
        vFace = n.z;
        gl_PointSize = aSize * 2.6 * uPx;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vColor; varying float vFace;
      void main(){
        if (vFace < 0.0) discard;
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(vColor, smoothstep(0.5, 0.15, d) * (0.35 + vFace * 0.65));
      }`,
  });
  globe.add(new Points(dotGeo, dotMat));

  // Dark core sphere (hides back-facing lines)
  globe.add(new Mesh(new SphereGeometry(R * 0.995, 64, 64), new MeshBasicMaterial({ color: "#070b14" })));

  // Atmosphere glow
  const atmo = new Mesh(
    new SphereGeometry(R * 1.12, 64, 64),
    new ShaderMaterial({
      side: BackSide,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);} `,
      fragmentShader: `varying vec3 vN; void main(){ float i = pow(clamp(0.62 - dot(vN, vec3(0.,0.,1.)), 0.0, 1.0), 4.0); gl_FragColor = vec4(0.85,0.7,0.43,1.0) * i * 0.9; }`,
    })
  );
  scene.add(atmo);

  // Budapest marker: pulsing gold ring
  const marker = new Group();
  const ringMat = new MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.9, side: 2, depthWrite: false });
  const ring = new Mesh(new RingGeometry(0.018, 0.026, 40), ringMat);
  const core = new Mesh(new RingGeometry(0, 0.011, 24), new MeshBasicMaterial({ color: "#fff3d6", side: 2 }));
  marker.add(ring, core);
  marker.position.copy(toXYZ(...BUDAPEST, R * 1.004));
  marker.lookAt(marker.position.clone().multiplyScalar(2));
  globe.add(marker);

  // Routes
  const routes = CITIES.map((c, i) => {
    const a = toXYZ(...c, R * 1.002), b = toXYZ(...BUDAPEST, R * 1.002);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(R + a.distanceTo(b) * 0.42);
    const curve = new QuadraticBezierCurve3(a, mid, b);
    const pts = curve.getPoints(80);
    const g = new BufferGeometry().setFromPoints(pts);
    const line = new Line(g, new LineBasicMaterial({ color: gold, transparent: true, opacity: 0.75 }));
    g.setDrawRange(0, 0);
    globe.add(line);
    const spark = new Mesh(new SphereGeometry(0.009, 10, 10), new MeshBasicMaterial({ color: "#fff3d6" }));
    globe.add(spark);
    const origin = new Mesh(new SphereGeometry(0.008, 10, 10), new MeshBasicMaterial({ color: gold }));
    origin.position.copy(a);
    globe.add(origin);
    return { curve, g, spark, offset: i * 0.37 };
  });

  // Face the Europe–Middle East corridor toward the camera
  const focus = toXYZ(38, 34);
  const ay = Math.atan2(-focus.x, focus.z);
  const zAfter = -focus.x * Math.sin(ay) + focus.z * Math.cos(ay);
  const ax = Math.atan2(focus.y, zAfter);
  globe.rotation.set(ax, ay, 0);
  const baseY = ay, baseX = ax;

  // Drag to rotate
  let drag = null, userY = 0, userX = 0, velY = 0;
  canvas.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = (e.clientX - drag.x) / canvas.clientWidth, dy = (e.clientY - drag.y) / canvas.clientHeight;
    velY = dx * 3; userY += dx * 3; userX = Math.max(-0.5, Math.min(0.5, userX + dy * 2));
    drag = { x: e.clientX, y: e.clientY };
  });
  const end = () => (drag = null);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true, raf = 0;
  const start = performance.now();
  function frame(now) {
    const t = (now - start) / 1000;
    if (!drag) { velY *= 0.94; userY += velY * 0.016; }
    const sway = reduced ? 0 : Math.sin(t * 0.12) * 0.35;
    globe.rotation.y = baseY + sway + userY;
    globe.rotation.x = baseX + userX;

    const pulse = (t % 2.2) / 2.2;
    ring.scale.setScalar(1 + pulse * 1.8);
    ringMat.opacity = 0.9 * (1 - pulse);

    for (const r of routes) {
      const p = reduced ? 1 : Math.min(1, ((t * 0.32 + r.offset) % 1.6) / 1);
      r.g.setDrawRange(0, Math.floor(81 * p));
      r.spark.visible = p < 1;
      r.spark.position.copy(r.curve.getPoint(Math.min(p, 1)));
    }
    renderer.render(scene, camera);
    if (visible && !reduced) raf = requestAnimationFrame(frame);
  }

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible) raf = requestAnimationFrame(frame);
  }).observe(canvas);

  raf = requestAnimationFrame(frame);
  if (reduced) canvas.addEventListener("pointermove", () => requestAnimationFrame(frame));
}
