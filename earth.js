/* ================================================
   Guide Group Global — Interactive 3D Earth
   WebGL Ray-Marched Globe with Scroll Parallax
   ================================================ */

(function() {
  'use strict';

  const canvas = document.getElementById('earth-bg');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { antialias: true, alpha: true })
          || canvas.getContext('experimental-webgl', { antialias: true, alpha: true });
  if (!gl) { canvas.style.display = 'none'; return; }

  // ── SHADERS ──────────────────────────────────────────────────
  const VERT = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      v_uv = a_pos * 0.5 + 0.5;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  const FRAG = `
    precision highp float;
    varying vec2 v_uv;
    uniform float u_time;
    uniform vec2  u_res;
    uniform float u_scroll;   // 0..1 page scroll
    uniform vec2  u_mouse;    // -1..1 normalized
    #define PI 3.14159265

    float hash(vec2 p) {
      p = fract(p * vec2(127.1, 311.7));
      p += dot(p, p + 74.51);
      return fract(p.x * p.y);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f*f*(3.0-2.0*f);
      return mix(
        mix(hash(i),         hash(i+vec2(1,0)), f.x),
        mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y
      );
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i=0;i<6;i++) { v+=a*noise(p); p*=2.2; a*=0.5; }
      return v;
    }

    bool raySphere(vec3 ro, vec3 rd, float r, out float t) {
      float b = dot(ro,rd), c = dot(ro,ro)-r*r, d = b*b-c;
      if(d<0.0) return false;
      t = -b - sqrt(d);
      return t > 0.0;
    }

    mat3 rotY(float a) {
      float s=sin(a),c=cos(a);
      return mat3(c,0,s, 0,1,0, -s,0,c);
    }
    mat3 rotX(float a) {
      float s=sin(a),c=cos(a);
      return mat3(1,0,0, 0,c,-s, 0,s,c);
    }

    vec3 earthColor(vec3 pos) {
      vec3 n = normalize(pos);

      // Mouse tilt + auto rotation
      float autoRot = u_time * 0.07;
      float mouseX  = u_mouse.x * 0.6;
      float mouseY  = u_mouse.y * 0.3;
      n = rotY(autoRot + mouseX) * rotX(mouseY) * n;

      float lon = atan(n.z, n.x) / (2.0*PI) + 0.5;
      float lat = acos(clamp(n.y,-1.0,1.0)) / PI;
      vec2 uv = vec2(lon, lat);

      // Land mask
      float l1 = fbm(uv * 5.0 + vec2(1.7, 0.3));
      float l2 = fbm(uv * 9.0 + vec2(4.1, 2.8));
      float land = l1 * l2 * 3.0;
      float isLand = smoothstep(0.20, 0.30, land);

      // Ocean
      vec3 oceanA = vec3(0.02, 0.08, 0.22);
      vec3 oceanB = vec3(0.04, 0.18, 0.40);
      vec3 ocean  = mix(oceanA, oceanB, fbm(uv*14.0+u_time*0.01));

      // Land
      vec3 low   = vec3(0.10, 0.25, 0.11);
      vec3 high  = vec3(0.22, 0.30, 0.15);
      vec3 snow  = vec3(0.82, 0.86, 0.88);
      float elev  = fbm(uv*10.0 + 2.0);
      float polar = smoothstep(0.50, 0.62, lat) + smoothstep(0.38, 0.50, 1.0-lat);
      vec3 landC  = mix(mix(low, high, elev), snow, polar * 0.9);

      // Latitude / longitude grid (gold)
      float gLon = abs(fract(lon * 20.0) - 0.5);
      float gLat = abs(fract(lat * 10.0) - 0.5);
      float grid  = smoothstep(0.47, 0.50, max(gLon, gLat));
      vec3 gridC  = vec3(0.78, 0.65, 0.27);

      vec3 surf = mix(ocean, landC, isLand);
      surf = mix(surf, gridC, grid * 0.30);

      // Day/night + city lights
      vec3 sunDir = normalize(vec3(cos(u_time*0.04)*2.0, 0.7, sin(u_time*0.04)*2.0));
      float sun = dot(normalize(pos), sunDir);
      float nightBand = smoothstep(0.0, 0.25, -sun);
      float cities = fbm(uv * 22.0 + 6.0) * step(0.38, fbm(uv * 7.5));
      surf += vec3(1.0, 0.88, 0.6) * cities * nightBand * 0.8;

      // Lighting
      float diff = max(dot(normalize(pos), sunDir), 0.0);
      float amb  = 0.12;
      vec3 viewDir = vec3(0, 0, -1);
      float spec = pow(max(dot(reflect(-sunDir, normalize(pos)), viewDir), 0.0), 64.0);
      surf = surf * (diff + amb) + vec3(0.4, 0.6, 1.0) * spec * 0.35;

      return surf;
    }

    void main() {
      vec2 fc = (v_uv * 2.0 - 1.0) * vec2(u_res.x / u_res.y, 1.0);

      // Globe position reacts to scroll (shifts down & shrinks a bit)
      float scrollOffset = u_scroll * -0.4;
      float sizeScale    = 1.0 + u_scroll * 0.08;

      vec3 ro = vec3(0.0, 0.0, -2.8);
      vec3 rd = normalize(vec3(fc, 1.0));
      vec3 offset = vec3(0.25, scrollOffset, 0.0);

      vec3 ro2 = ro - offset;

      float radius = 0.78 * sizeScale;

      vec3 col = vec3(0.0);
      float alpha = 0.0;
      float t;

      if (raySphere(ro2, rd, radius, t)) {
        vec3 p = ro2 + rd * t;
        col = earthColor(p);

        // Rim glow (blue/purple)
        float rim = 1.0 - max(dot(-rd, normalize(p)), 0.0);
        col += vec3(0.1, 0.3, 0.7) * pow(rim, 4.0) * 0.6;
        alpha = 1.0;
      }

      // Atmosphere shell
      float tAtm;
      if (raySphere(ro2, rd, radius + 0.065, tAtm)) {
        float rimAtm = 1.0 - max(dot(-rd, normalize(ro2 + rd*tAtm)), 0.0);
        float hitSurf = 0.0;
        float tS;
        if (raySphere(ro2, rd, radius, tS)) hitSurf = 1.0;
        float atmA = (1.0 - hitSurf) * pow(rimAtm, 4.0) * 0.55;
        col += vec3(0.15, 0.4, 0.8) * atmA;
        alpha = max(alpha, atmA * 0.8);
      }

      gl_FragColor = vec4(col, alpha * 0.85);
    }
  `;

  // ── COMPILE ──────────────────────────────────────────────────
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Shader error:', gl.getShaderInfoLog(s));
    }
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime   = gl.getUniformLocation(prog, 'u_time');
  const uRes    = gl.getUniformLocation(prog, 'u_res');
  const uScroll = gl.getUniformLocation(prog, 'u_scroll');
  const uMouse  = gl.getUniformLocation(prog, 'u_mouse');

  // ── STATE ─────────────────────────────────────────────────────
  let scrollVal = 0, scrollTarget = 0;
  let mouseX = 0, mouseY = 0;
  let mouseTargetX = 0, mouseTargetY = 0;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('scroll', () => {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    scrollTarget = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  });

  window.addEventListener('mousemove', e => {
    mouseTargetX = (e.clientX / window.innerWidth  * 2 - 1);
    mouseTargetY = (e.clientY / window.innerHeight * 2 - 1);
  });

  // Touch support
  window.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      mouseTargetX = (e.touches[0].clientX / window.innerWidth  * 2 - 1);
      mouseTargetY = (e.touches[0].clientY / window.innerHeight * 2 - 1);
    }
  }, { passive: true });

  // ── RENDER LOOP ──────────────────────────────────────────────
  function loop(t) {
    scrollVal += (scrollTarget - scrollVal) * 0.06;
    mouseX    += (mouseTargetX - mouseX)    * 0.04;
    mouseY    += (mouseTargetY - mouseY)    * 0.04;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(uTime,   t * 0.001);
    gl.uniform2f(uRes,    canvas.width, canvas.height);
    gl.uniform1f(uScroll, scrollVal);
    gl.uniform2f(uMouse,  mouseX, mouseY);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
