/* ═══════════════════════════════════════════════════════
   G³ Globe — v5
   WebGL globe with galaxy background + scroll animation
   Pure WebGL, no Three.js dependency
═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { antialias: true, alpha: true }) ||
             canvas.getContext('experimental-webgl', { antialias: true, alpha: true });
  if (!gl) return;

  // ── Resize ────────────────────────────────────────────
  function resize() {
    canvas.width  = canvas.clientWidth  * (window.devicePixelRatio || 1);
    canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  // ── Shader helpers ────────────────────────────────────
  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  function program(vsrc, fsrc) {
    const p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vsrc));
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fsrc));
    gl.linkProgram(p);
    return p;
  }

  // ── Stars ──────────────────────────────────────────────
  const starVS = `
    attribute vec3 aPos;
    attribute float aSize;
    attribute float aBright;
    uniform mat4 uMVP;
    varying float vBright;
    void main() {
      gl_Position = uMVP * vec4(aPos, 1.0);
      gl_PointSize = aSize;
      vBright = aBright;
    }`;
  const starFS = `
    precision mediump float;
    varying float vBright;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float a = smoothstep(0.5, 0.1, d) * vBright;
      gl_FragColor = vec4(1.0, 0.97, 0.88, a);
    }`;
  const starProg = program(starVS, starFS);

  const STAR_COUNT = 2800;
  const starPos    = new Float32Array(STAR_COUNT * 3);
  const starSize   = new Float32Array(STAR_COUNT);
  const starBright = new Float32Array(STAR_COUNT);
  for (let i = 0; i < STAR_COUNT; i++) {
    // Random points on sphere of radius ~4
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 3.5 + Math.random() * 3;
    starPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i*3+2] = r * Math.cos(phi);
    starSize[i]   = 0.8 + Math.random() * 2.2;
    starBright[i] = 0.3 + Math.random() * 0.7;
  }

  const starPosBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, starPosBuf);
  gl.bufferData(gl.ARRAY_BUFFER, starPos, gl.STATIC_DRAW);
  const starSizeBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, starSizeBuf);
  gl.bufferData(gl.ARRAY_BUFFER, starSize, gl.STATIC_DRAW);
  const starBrightBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, starBrightBuf);
  gl.bufferData(gl.ARRAY_BUFFER, starBright, gl.STATIC_DRAW);

  // ── Globe ─────────────────────────────────────────────
  const globeVS = `
    attribute vec3 aPos;
    attribute vec2 aUV;
    attribute vec3 aNorm;
    uniform mat4 uMVP;
    uniform mat4 uModel;
    varying vec2 vUV;
    varying vec3 vNorm;
    varying vec3 vPos;
    void main() {
      gl_Position = uMVP * vec4(aPos, 1.0);
      vUV = aUV;
      vNorm = normalize((uModel * vec4(aNorm, 0.0)).xyz);
      vPos = (uModel * vec4(aPos, 1.0)).xyz;
    }`;
  const globeFS = `
    precision highp float;
    varying vec2 vUV;
    varying vec3 vNorm;
    varying vec3 vPos;
    uniform sampler2D uEarth;
    uniform vec3 uSunDir;
    uniform float uAtmosphere;
    void main() {
      vec4 tex = texture2D(uEarth, vUV);
      float diff = max(dot(vNorm, uSunDir), 0.0);
      float night = 1.0 - clamp(diff * 2.5, 0.0, 1.0);
      vec3 land  = tex.rgb * (0.3 + diff * 0.85);
      // Night side: faint city glow
      vec3 cityGlow = vec3(0.9, 0.7, 0.3) * night * 0.4 * (1.0 - tex.b * 0.8);
      vec3 oceanNight = vec3(0.05, 0.08, 0.18) * night;
      vec3 col = land + cityGlow + oceanNight;
      // Atmosphere rim
      float rim = 1.0 - max(dot(vNorm, normalize(-vPos)), 0.0);
      rim = pow(rim, 3.5);
      vec3 atmo = vec3(0.25, 0.55, 1.0) * rim * uAtmosphere;
      col += atmo;
      gl_FragColor = vec4(col, 1.0);
    }`;
  const globeProg = program(globeVS, globeFS);

  // Build sphere geometry
  function buildSphere(segs) {
    const verts = [], uvs = [], norms = [], idx = [];
    for (let j = 0; j <= segs; j++) {
      const phi = Math.PI * j / segs;
      for (let i = 0; i <= segs; i++) {
        const theta = 2 * Math.PI * i / segs;
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);
        verts.push(x, y, z);
        norms.push(x, y, z);
        uvs.push(i / segs, j / segs);
      }
    }
    for (let j = 0; j < segs; j++) {
      for (let i = 0; i < segs; i++) {
        const a = j * (segs+1) + i;
        const b = a + segs + 1;
        idx.push(a, b, a+1, b, b+1, a+1);
      }
    }
    return { verts: new Float32Array(verts), uvs: new Float32Array(uvs),
             norms: new Float32Array(norms), idx: new Uint16Array(idx) };
  }
  const sphere = buildSphere(72);

  const gPosBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gPosBuf);
  gl.bufferData(gl.ARRAY_BUFFER, sphere.verts, gl.STATIC_DRAW);
  const gUVBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gUVBuf);
  gl.bufferData(gl.ARRAY_BUFFER, sphere.uvs, gl.STATIC_DRAW);
  const gNormBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gNormBuf);
  gl.bufferData(gl.ARRAY_BUFFER, sphere.norms, gl.STATIC_DRAW);
  const gIdxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIdxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.idx, gl.STATIC_DRAW);

  // ── Earth texture ─────────────────────────────────────
  const earthTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, earthTex);
  // 1px placeholder
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([20, 50, 100, 255]));

  // Procedural earth texture (no external dependency needed)
  generateEarthTexture();

  function generateEarthTexture() {
    const W = 1024, H = 512;
    const buf = new Uint8Array(W * H * 4);

    // Simple procedural continents using noise-like approach
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const lon = (i / W) * 360 - 180; // -180 to 180
        const lat = (j / H) * 180 - 90;  // -90 to 90
        const idx = (j * W + i) * 4;

        // Simple continent mask using trig combinations
        const x = Math.cos(lat * Math.PI/180) * Math.cos(lon * Math.PI/180);
        const y = Math.cos(lat * Math.PI/180) * Math.sin(lon * Math.PI/180);
        const z = Math.sin(lat * Math.PI/180);

        // Multi-frequency noise approximation
        const n1 = Math.sin(x * 4.1 + y * 2.9 + z * 3.7);
        const n2 = Math.sin(x * 7.3 + y * 5.1 + z * 6.2) * 0.5;
        const n3 = Math.sin(x * 13.7 + y * 9.3 + z * 11.1) * 0.25;
        const n  = (n1 + n2 + n3) / 1.75;

        // Land bias based on real geography approximation
        let isLand = n > 0.08;

        // Poles = ice
        const isPole = Math.abs(lat) > 70;
        // Rough Europe/Asia/Africa band
        const isEurasia = lon > -15 && lon < 150 && lat > -40 && lat < 75;
        // Americas
        const isAmerica = lon > -130 && lon < -30 && lat > -60 && lat < 75;
        // Australia
        const isAustralia = lon > 110 && lon < 155 && lat > -45 && lat < -10;

        // Boost land probability in continent zones
        let landBoost = 0;
        if (isEurasia) landBoost = 0.25;
        if (isAmerica) landBoost = 0.2;
        if (isAustralia) landBoost = 0.3;
        isLand = (n + landBoost) > 0.15;

        // Hungary highlight area
        const isHungary = lon > 16 && lon < 22 && lat > 45.5 && lat < 48.5;

        let r, g, b;
        if (isPole) {
          r = 220; g = 230; b = 245; // ice
        } else if (isLand) {
          if (isHungary) {
            r = 180; g = 140; b = 60; // golden highlight
          } else {
            // Land colors: darker green/brown
            const elevation = (n + landBoost) * 0.5;
            r = Math.floor(40  + elevation * 60);
            g = Math.floor(65  + elevation * 55);
            b = Math.floor(25  + elevation * 30);
          }
        } else {
          // Ocean depth
          const depth = 0.3 + Math.abs(n) * 0.4;
          r = Math.floor(8  + depth * 25);
          g = Math.floor(25 + depth * 50);
          b = Math.floor(75 + depth * 80);
        }

        buf[idx]   = Math.min(255, Math.max(0, r));
        buf[idx+1] = Math.min(255, Math.max(0, g));
        buf[idx+2] = Math.min(255, Math.max(0, b));
        buf[idx+3] = 255;
      }
    }

    gl.bindTexture(gl.TEXTURE_2D, earthTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  // ── Math helpers ──────────────────────────────────────
  function mat4() { return new Float32Array(16); }
  function identity(m) {
    m[0]=1; m[1]=0; m[2]=0; m[3]=0;
    m[4]=0; m[5]=1; m[6]=0; m[7]=0;
    m[8]=0; m[9]=0; m[10]=1; m[11]=0;
    m[12]=0;m[13]=0;m[14]=0; m[15]=1;
    return m;
  }
  function multiply(out, a, b) {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      out[i*4+j] = 0;
      for (let k = 0; k < 4; k++) out[i*4+j] += a[i*4+k] * b[k*4+j];
    }
    return out;
  }
  function perspective(out, fov, aspect, near, far) {
    const f = 1 / Math.tan(fov/2);
    out[0]=f/aspect; out[1]=0; out[2]=0; out[3]=0;
    out[4]=0; out[5]=f; out[6]=0; out[7]=0;
    out[8]=0; out[9]=0; out[10]=(far+near)/(near-far); out[11]=-1;
    out[12]=0; out[13]=0; out[14]=2*far*near/(near-far); out[15]=0;
    return out;
  }
  function translate(out, m, x, y, z) {
    const t = identity(mat4());
    t[12]=x; t[13]=y; t[14]=z;
    return multiply(out, m, t);
  }
  function rotateY(out, m, a) {
    const c=Math.cos(a), s=Math.sin(a);
    const r = identity(mat4());
    r[0]=c; r[2]=s; r[8]=-s; r[10]=c;
    return multiply(out, m, r);
  }
  function rotateX(out, m, a) {
    const c=Math.cos(a), s=Math.sin(a);
    const r = identity(mat4());
    r[5]=c; r[6]=-s; r[9]=s; r[10]=c;
    return multiply(out, m, r);
  }
  function scale(out, m, sx, sy, sz) {
    const s = identity(mat4());
    s[0]=sx; s[5]=sy; s[10]=sz;
    return multiply(out, m, s);
  }

  // ── Scroll state ──────────────────────────────────────
  // Scroll phases:
  // 0.00–0.15: Initial view — galaxy + full earth
  // 0.15–0.40: Earth gets closer, rotates to show Europe
  // 0.40–0.65: Zoom into Hungary — gold highlight pulses
  // 0.65–0.85: Budapest parliament appears (text)
  // 0.85–1.00: Settle into page content

  let scrollProgress = 0;
  const scene = document.querySelector('.scroll-scene');

  function updateScroll() {
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    const totalH = scene.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    scrollProgress = Math.max(0, Math.min(1, scrolled / totalH));

    // Show scene labels
    const label = document.getElementById('globe-label');
    if (label) {
      const lang = getLang ? getLang() : 'fa';
      if (scrollProgress < 0.15) {
        label.style.opacity = '0';
      } else if (scrollProgress < 0.40) {
        label.style.opacity = '1';
        label.textContent = lang === 'fa' ? 'اروپا' : lang === 'ar' ? 'أوروبا' : 'Europe';
      } else if (scrollProgress < 0.65) {
        label.style.opacity = '1';
        label.textContent = lang === 'fa' ? 'مجارستان' : lang === 'ar' ? 'المجر' : 'Hungary';
      } else if (scrollProgress < 0.85) {
        label.style.opacity = '1';
        label.textContent = lang === 'fa' ? 'بوداپست' : lang === 'ar' ? 'بودابست' : 'Budapest';
      } else {
        label.style.opacity = '0';
      }
    }
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // ── Nebula / Milky Way texture ─────────────────────────
  const nebulaTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, nebulaTex);
  // Generate a simple nebula gradient procedurally
  const NW = 512, NH = 512;
  const nebBuf = new Uint8Array(NW * NH * 4);
  for (let j = 0; j < NH; j++) {
    for (let i = 0; i < NW; i++) {
      const idx = (j * NW + i) * 4;
      const dx = (i / NW - 0.5) * 2;
      const dy = (j / NH - 0.5) * 2;
      // Milky Way band along diagonal
      const band = Math.exp(-Math.pow(dx - dy * 0.3, 2) * 8);
      const dust = Math.exp(-Math.pow(dx * 0.5 + dy * 0.8, 2) * 5) * 0.5;
      const glow = (band + dust) * 0.6;
      nebBuf[idx]   = Math.floor(30 + glow * 80);
      nebBuf[idx+1] = Math.floor(20 + glow * 50);
      nebBuf[idx+2] = Math.floor(60 + glow * 120);
      nebBuf[idx+3] = Math.floor(glow * 255 * 0.4);
    }
  }
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, NW, NH, 0, gl.RGBA, gl.UNSIGNED_BYTE, nebBuf);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // ── Render loop ────────────────────────────────────────
  let t = 0;
  // Smooth interpolated scroll
  let smoothScroll = 0;

  // Hungary lon/lat → rotation needed
  // Hungary is roughly at lon=18°E, lat=47°N
  // We need to rotate the globe so Hungary faces camera
  // Camera looks down -Z, globe center at (0,0,0)
  // lon=18° means rotateY by -(18/180)*pi from initial orientation
  // lat=47° means tilt slightly
  const HUNGARY_ROT_Y = -((18 / 180) * Math.PI) + Math.PI; // flip to face front
  const HUNGARY_ROT_X = (47 / 180) * Math.PI * 0.4; // tilt down slightly

  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

  function render(ts) {
    t = ts * 0.001;
    smoothScroll = lerp(smoothScroll, scrollProgress, 0.04);

    const p = smoothScroll;
    resize();

    gl.clearColor(0.03, 0.035, 0.048, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const aspect = canvas.width / canvas.height;
    const proj = perspective(mat4(), 0.85, aspect, 0.1, 100);

    // ── Camera / globe transform based on scroll ──────
    // Phase 0: far away, slightly to the side
    // Phase 1: zoom in to Hungary

    let globeZ, globeScale, rotY, rotX, globeX, globeY;
    let atmoStrength = 1.0;

    if (p < 0.15) {
      // Intro: earth far, slow rotation
      const pp = p / 0.15;
      globeZ = -4.5;
      globeScale = 1.0;
      rotY = t * 0.06; // slow idle rotation
      rotX = 0.1;
      globeX = 0.3; globeY = 0;
      atmoStrength = 1.2;
    } else if (p < 0.45) {
      // Approaching Europe
      const pp = easeInOut((p - 0.15) / 0.30);
      globeZ = lerp(-4.5, -2.2, pp);
      globeScale = lerp(1.0, 1.4, pp);
      rotY = lerp(t * 0.06, HUNGARY_ROT_Y + t * 0.015, pp);
      rotX = lerp(0.1, HUNGARY_ROT_X, pp);
      globeX = lerp(0.3, 0, pp);
      globeY = lerp(0, 0.1, pp);
      atmoStrength = lerp(1.2, 0.8, pp);
    } else if (p < 0.75) {
      // Zooming into Hungary
      const pp = easeInOut((p - 0.45) / 0.30);
      globeZ = lerp(-2.2, -1.1, pp);
      globeScale = lerp(1.4, 2.5, pp);
      rotY = HUNGARY_ROT_Y + t * 0.008;
      rotX = HUNGARY_ROT_X;
      globeX = lerp(0, 0, pp);
      globeY = lerp(0.1, -0.05, pp);
      atmoStrength = lerp(0.8, 0.3, pp);
    } else {
      // Budapest — settled
      const pp = easeInOut((p - 0.75) / 0.25);
      globeZ = lerp(-1.1, -1.0, pp);
      globeScale = lerp(2.5, 2.8, pp);
      rotY = HUNGARY_ROT_Y + t * 0.004;
      rotX = HUNGARY_ROT_X;
      globeX = 0; globeY = -0.05;
      atmoStrength = lerp(0.3, 0.2, pp);
    }

    // Model matrix for globe
    let model = identity(mat4());
    model = translate(model, identity(mat4()), globeX, globeY, globeZ);
    model = scale(model, model, globeScale, globeScale, globeScale);
    model = rotateX(model, model, rotX);
    model = rotateY(model, model, rotY);

    // MVP = proj * model (no separate view for simplicity)
    const mvp = multiply(mat4(), proj, model);

    // Model matrix without scale for normals
    let modelNoScale = identity(mat4());
    modelNoScale = translate(modelNoScale, identity(mat4()), globeX, globeY, globeZ);
    modelNoScale = rotateX(modelNoScale, modelNoScale, rotX);
    modelNoScale = rotateY(modelNoScale, modelNoScale, rotY);

    // ── Draw stars ──────────────────────────────────────
    // Stars use a fixed view: proj * identity * translate(-star-sphere)
    let starModel = identity(mat4());
    starModel = rotateY(starModel, starModel, t * 0.01);
    const starMVP = multiply(mat4(), proj, starModel);

    gl.useProgram(starProg);
    const sMVP = gl.getUniformLocation(starProg, 'uMVP');
    gl.uniformMatrix4fv(sMVP, false, starMVP);

    const sPos = gl.getAttribLocation(starProg, 'aPos');
    gl.bindBuffer(gl.ARRAY_BUFFER, starPosBuf);
    gl.enableVertexAttribArray(sPos);
    gl.vertexAttribPointer(sPos, 3, gl.FLOAT, false, 0, 0);

    const sSz = gl.getAttribLocation(starProg, 'aSize');
    gl.bindBuffer(gl.ARRAY_BUFFER, starSizeBuf);
    gl.enableVertexAttribArray(sSz);
    gl.vertexAttribPointer(sSz, 1, gl.FLOAT, false, 0, 0);

    const sBr = gl.getAttribLocation(starProg, 'aBright');
    gl.bindBuffer(gl.ARRAY_BUFFER, starBrightBuf);
    gl.enableVertexAttribArray(sBr);
    gl.vertexAttribPointer(sBr, 1, gl.FLOAT, false, 0, 0);

    gl.disable(gl.DEPTH_TEST);
    gl.drawArrays(gl.POINTS, 0, STAR_COUNT);
    gl.enable(gl.DEPTH_TEST);

    // ── Draw globe ──────────────────────────────────────
    gl.useProgram(globeProg);

    const gMVP = gl.getUniformLocation(globeProg, 'uMVP');
    gl.uniformMatrix4fv(gMVP, false, mvp);
    const gModel = gl.getUniformLocation(globeProg, 'uModel');
    gl.uniformMatrix4fv(gModel, false, modelNoScale);

    // Sun direction (slightly from upper left)
    const sunAngle = t * 0.02;
    gl.uniform3f(gl.getUniformLocation(globeProg, 'uSunDir'),
      Math.cos(sunAngle) * 0.7, 0.5, Math.sin(sunAngle) * 0.7);
    gl.uniform1f(gl.getUniformLocation(globeProg, 'uAtmosphere'), atmoStrength);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, earthTex);
    gl.uniform1i(gl.getUniformLocation(globeProg, 'uEarth'), 0);

    const gPos = gl.getAttribLocation(globeProg, 'aPos');
    gl.bindBuffer(gl.ARRAY_BUFFER, gPosBuf);
    gl.enableVertexAttribArray(gPos);
    gl.vertexAttribPointer(gPos, 3, gl.FLOAT, false, 0, 0);

    const gUV = gl.getAttribLocation(globeProg, 'aUV');
    gl.bindBuffer(gl.ARRAY_BUFFER, gUVBuf);
    gl.enableVertexAttribArray(gUV);
    gl.vertexAttribPointer(gUV, 2, gl.FLOAT, false, 0, 0);

    const gNorm = gl.getAttribLocation(globeProg, 'aNorm');
    gl.bindBuffer(gl.ARRAY_BUFFER, gNormBuf);
    gl.enableVertexAttribArray(gNorm);
    gl.vertexAttribPointer(gNorm, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIdxBuf);
    gl.drawElements(gl.TRIANGLES, sphere.idx.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

})();
