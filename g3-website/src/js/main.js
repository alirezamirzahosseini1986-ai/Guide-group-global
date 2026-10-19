import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const root = document.documentElement;
root.classList.replace("no-js", "js");
window.__ok = true;
const LANG = root.lang;
const RTL = root.dir === "rtl";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const NUM_LOCALE = { fa: "fa-IR", en: "en-GB", ar: "ar-u-nu-latn" }[LANG] || "en-GB";
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

gsap.registerPlugin(ScrollTrigger);

/* ---------- Smooth scroll ---------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const el = id.length > 1 && $(id);
    if (!el) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(el, { offset: -80 }) : el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    if (id === "#main") el.focus({ preventScroll: true });
  })
);

/* ---------- Header ---------- */
const header = $("[data-header]");
let lastY = 0;
function onScroll() {
  const y = window.scrollY;
  header?.classList.toggle("is-solid", y > 40);
  header?.classList.toggle("is-hidden", y > 400 && y > lastY && !root.classList.contains("menu-open"));
  lastY = y;
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Menu overlay ---------- */
const menu = $("#site-menu");
const toggles = $$("[data-menu-toggle]");
function setMenu(open) {
  if (!menu) return;
  menu.hidden = false;
  requestAnimationFrame(() => root.classList.toggle("menu-open", open));
  toggles.forEach((b) => {
    b.setAttribute("aria-expanded", String(open));
    b.setAttribute("aria-label", open ? b.dataset.labelClose : b.dataset.labelOpen);
  });
  menu.setAttribute("aria-hidden", String(!open));
  menu.inert = !open;
  open ? lenis?.stop() : lenis?.start();
  if (open) $("a", menu)?.focus();
  else if (!open) setTimeout(() => !root.classList.contains("menu-open") && (menu.hidden = true), 600);
}
toggles.forEach((b) => b.addEventListener("click", () => setMenu(!root.classList.contains("menu-open"))));
addEventListener("keydown", (e) => {
  if (e.key === "Escape" && root.classList.contains("menu-open")) {
    setMenu(false);
    toggles[0]?.focus();
  }
});
menu?.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const f = $$("a,button", menu).filter((el) => el.offsetParent !== null);
  if (!f.length) return;
  if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
  else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
});

/* ---------- Remember language choice ---------- */
$$("[data-lang-link]").forEach((a) =>
  a.addEventListener("click", () => {
    try { localStorage.setItem("lang", a.dataset.langLink); } catch {}
  })
);
try { localStorage.setItem("lang", LANG); } catch {}

/* ---------- Word split (keeps Persian/Arabic letters joined: split by word only) ---------- */
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute("aria-label", el.textContent.trim());
  el.innerHTML = words.map((w) => `<span class="w" aria-hidden="true"><span class="wi">${w}</span></span>`).join(" ");
  return $$(".wi", el);
}

/* ---------- Hero ---------- */
const hero = $("[data-hero]");
if (hero) {
  const layers = $$("[data-depth]", hero);
  const lines = $$(".hero-line", hero);
  const fades = $$("[data-hero-fade]", hero);
  if (!reduced) {
    lines.length && gsap.fromTo(lines, { yPercent: 110, rotateX: -50, opacity: 0 }, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.4, ease: "expo.out", stagger: 0.12, delay: 0.15 });
    fades.length && gsap.fromTo(fades, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", stagger: 0.1, delay: 0.55 });
    const heroImg = $(".hero-media img, .hero-media video", hero);
    heroImg && gsap.fromTo(heroImg, { scale: 1.25 }, { scale: 1.06, duration: 2.6, ease: "expo.out" });

    const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    const media = $(".hero-media", hero), content = $(".hero-content", hero), clouds = $$(".cloud", hero);
    media && tl.to(media, { yPercent: 18, scale: 1.12, ease: "none" }, 0);
    content && tl.to(content, { yPercent: -30, opacity: 0, ease: "none" }, 0);
    clouds.length && tl.to(clouds, { yPercent: -60, opacity: 0.2, ease: "none", stagger: 0.02 }, 0);

    if (finePointer) {
      hero.addEventListener("pointermove", (e) => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach((l) => {
          const d = +l.dataset.depth;
          gsap.to(l, { x: -x * d * 40, y: -y * d * 30, rotateY: x * d * 4, rotateX: -y * d * 3, duration: 1.2, ease: "power3.out" });
        });
      });
    }
    initDust($(".hero-dust", hero));
  }
}

/* Gold dust particles (2D canvas, very light) */
function initDust(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, dpr, parts = [], on = true;
  const resize = () => {
    dpr = Math.min(devicePixelRatio, 2);
    w = canvas.width = canvas.clientWidth * dpr;
    h = canvas.height = canvas.clientHeight * dpr;
    const n = Math.round((canvas.clientWidth * canvas.clientHeight) / 14000);
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h, z: Math.random() * 0.8 + 0.2,
      r: Math.random() * 1.4 + 0.4, s: Math.random() * 0.25 + 0.05, p: Math.random() * 6.28,
    }));
  };
  resize();
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) requestAnimationFrame(tick); }).observe(canvas);
  function tick(t) {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.y -= p.s * p.z * dpr;
      p.x += Math.sin(t / 2400 + p.p) * 0.15 * dpr;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      const a = (0.25 + 0.55 * Math.abs(Math.sin(t / 1600 + p.p))) * p.z;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.z * dpr, 0, 6.283);
      ctx.fillStyle = `rgba(232,200,130,${a})`;
      ctx.fill();
    }
    if (on) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------- Reveal on scroll ---------- */
if (!reduced) {
  $$("[data-split]").forEach((el) => {
    const words = splitWords(el);
    gsap.fromTo(words, { opacity: 0.12 }, {
      opacity: 1, ease: "none", stagger: 0.08,
      scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 45%", scrub: true },
    });
  });

  $$("[data-reveal]").forEach((el) => {
    gsap.fromTo(el, { y: 60, opacity: 0, rotateX: 8, transformPerspective: 900 }, {
      y: 0, opacity: 1, rotateX: 0, duration: 1.2, ease: "expo.out", clearProps: "transform",
      delay: (+el.dataset.reveal || 0) * 0.1,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  $$("[data-reveal-img]").forEach((el) => {
    gsap.fromTo(el, { clipPath: "inset(12% 12% 12% 12% round 28px)" }, {
      clipPath: "inset(0% 0% 0% 0% round 28px)", ease: "none",
      scrollTrigger: { trigger: el, start: "top 90%", end: "top 35%", scrub: true },
    });
    const im = $("img", el);
    im && gsap.fromTo(im, { scale: 1.25, yPercent: -6 }, {
      scale: 1, yPercent: 6, ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* Stacked route cards: previous card recedes in 3D as the next arrives */
  const stack = $$(".stack-card");
  stack.forEach((card, i) => {
    if (i === stack.length - 1) return;
    gsap.to(card.firstElementChild, {
      scale: 0.9, rotateX: 6, opacity: 0.35, ease: "none", transformOrigin: "50% 0%",
      scrollTrigger: { trigger: stack[i + 1], start: "top bottom", end: "top 20%", scrub: true },
    });
  });

  /* Residence card rotates in 3D with scroll */
  $$("[data-card3d]").forEach((wrap) => {
    const card = $(".rp-card", wrap);
    gsap.fromTo(card, { rotateY: RTL ? 38 : -38, rotateX: 16, rotateZ: RTL ? 4 : -4 }, {
      rotateY: RTL ? -14 : 14, rotateX: -6, rotateZ: 0, ease: "none",
      scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* Section headline parallax */
  $$("[data-parallax]").forEach((el) =>
    gsap.fromTo(el, { yPercent: +el.dataset.parallax }, {
      yPercent: -el.dataset.parallax, ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    })
  );
}

/* ---------- Flip residence card (click / keyboard) ---------- */
$$("[data-flip]").forEach((btn) =>
  btn.addEventListener("click", () => {
    const inner = $(".rp-inner", btn);
    const flipped = btn.getAttribute("aria-pressed") === "true";
    btn.setAttribute("aria-pressed", String(!flipped));
    gsap.to(inner, { rotateY: flipped ? 0 : 180, duration: reduced ? 0 : 1, ease: "expo.inOut" });
  })
);

/* ---------- Pointer tilt ---------- */
if (finePointer && !reduced) {
  $$("[data-tilt]").forEach((el) => {
    const max = +el.dataset.tilt || 8;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, { rotateY: x * max, rotateX: -y * max, transformPerspective: 900, duration: 0.6, ease: "power3.out" });
      el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
      el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
    });
    el.addEventListener("pointerleave", () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 1, ease: "elastic.out(1,0.5)" }));
  });
}

/* ---------- Counters ---------- */
const nf = new Intl.NumberFormat(NUM_LOCALE, { useGrouping: false });
$$("[data-count]").forEach((el) => {
  const target = +el.dataset.count;
  if (reduced) return;
  const from = target > 1000 ? target - 60 : 0;
  const o = { v: from };
  el.textContent = nf.format(from);
  ScrollTrigger.create({
    trigger: el, start: "top 90%", once: true,
    onEnter: () => gsap.to(o, { v: target, duration: 2.2, ease: "power3.out", onUpdate: () => (el.textContent = nf.format(Math.round(o.v))) }),
  });
});

/* ---------- Budapest clock ---------- */
const clocks = $$("[data-clock]");
if (clocks.length) {
  const tf = new Intl.DateTimeFormat(NUM_LOCALE, { timeZone: "Europe/Budapest", hour: "2-digit", minute: "2-digit", hour12: false });
  const tick = () => clocks.forEach((c) => (c.textContent = tf.format(new Date())));
  tick();
  setInterval(tick, 20000);
}

/* ---------- Globe (lazy) ---------- */
const globeCanvas = $("[data-globe]");
if (globeCanvas) {
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    const ok = (() => { try { return !!document.createElement("canvas").getContext("webgl2"); } catch { return false; } })();
    if (!ok) return globeCanvas.closest(".globe-wrap")?.classList.add("no-webgl");
    import("./globe.js").then((m) => {
      m.initGlobe(globeCanvas, { reduced });
      globeCanvas.closest(".globe-wrap")?.classList.add("is-ready");
    });
  }, { rootMargin: "400px" });
  io.observe(globeCanvas);
}

/* ---------- Videos (click to load & play) ---------- */
$$("[data-video]").forEach((wrap) => {
  const v = $("video", wrap), btn = $("button", wrap);
  if (!v || !btn) return;
  btn.addEventListener("click", () => {
    if (!v.src) v.src = v.dataset.src;
    v.controls = true;
    wrap.classList.add("is-playing");
    v.play().catch(() => wrap.classList.remove("is-playing"));
  });
  v.addEventListener("error", () => wrap.classList.add("no-video"));
  new IntersectionObserver(([e]) => !e.isIntersecting && !v.paused && v.pause()).observe(wrap);
});

/* ---------- Consultation form ---------- */
const form = $("[data-form]");
if (form) {
  const status = $("[data-form-status]", form);
  const btn = $('button[type="submit"]', form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    if (form._honey?.value) return;
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = form.dataset.sending;
    status.textContent = "";
    status.className = "form-status";
    try {
      const data = Object.fromEntries(new FormData(form));
      const res = await fetch(form.dataset.ajax, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.textContent = form.dataset.success;
      status.classList.add("ok");
    } catch {
      status.textContent = form.dataset.error;
      status.classList.add("err");
    } finally {
      btn.disabled = false;
      btn.textContent = label;
      status.focus();
    }
  });
}

/* ---------- Analytics only after consent (GDPR) ---------- */
const ga = root.dataset.ga;
const bar = $("[data-consent]");
function loadGA() {
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
  document.head.append(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", ga, { anonymize_ip: true });
}
if (ga && bar) {
  let choice = null;
  try { choice = localStorage.getItem("consent"); } catch {}
  if (choice === "yes") loadGA();
  else if (!choice) bar.hidden = false;
  $$("[data-consent-choice]", bar).forEach((b) =>
    b.addEventListener("click", () => {
      const yes = b.dataset.consentChoice === "yes";
      try { localStorage.setItem("consent", yes ? "yes" : "no"); } catch {}
      bar.hidden = true;
      if (yes) loadGA();
    })
  );
}

/* Year-safe refresh after fonts load (layout shifts can move triggers) */
document.fonts?.ready.then(() => ScrollTrigger.refresh());
