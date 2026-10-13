/* ═══════════════════════════════════════════════════════
   G³ Components — v5
   Language system, navbar, footer, admin CMS
═══════════════════════════════════════════════════════ */

// ── Language ─────────────────────────────────────────────
function getLang() {
  // 1. URL param (from welcome page redirect)
  const urlLang = new URLSearchParams(location.search).get('lang');
  if (urlLang && ['fa','ar','en'].includes(urlLang)) {
    try { localStorage.setItem('ggg_lang', urlLang); } catch(e){}
    // Clean URL without reload
    const clean = location.pathname + location.hash;
    history.replaceState(null, '', clean);
    return urlLang;
  }
  // 2. localStorage
  try {
    const saved = localStorage.getItem('ggg_lang');
    if (saved && ['fa','ar','en'].includes(saved)) return saved;
  } catch(e){}
  // 3. default
  return 'fa';
}
function setLang(l) {
  try { localStorage.setItem('ggg_lang', l); } catch(e){}
  applyLang(l);
}
function applyLang(l) {
  const html = document.documentElement;
  html.lang = l;
  html.dir  = (l === 'en') ? 'ltr' : 'rtl';
  document.querySelectorAll('.lang-btn, .nav-mobile-langs button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === l);
  });
}

// First visit → welcome page (only on index, not welcome itself)
(function(){
  const isWelcome = location.pathname.endsWith('welcome.html');
  const isIndex   = location.pathname.endsWith('index.html') || location.pathname.endsWith('/');
  const hasLangParam = new URLSearchParams(location.search).get('lang');
  let hasSaved = false;
  try { hasSaved = !!localStorage.getItem('ggg_lang'); } catch(e){}
  if (!isWelcome && isIndex && !hasSaved && !hasLangParam) {
    location.replace('welcome.html');
  }
})();

// ── Nav HTML ─────────────────────────────────────────────
const NAV_HTML = `
<header class="site-header" id="navbar">
  <div class="container">
    <nav class="nav-inner">
      <a href="index.html" class="nav-logo">
        <span class="logo-mark">G³</span>
        <span class="logo-text">Guide Group Global</span>
      </a>
      <ul class="nav-links">
        <li><a href="index.html" data-page="index">
          <span data-lang="fa">خانه</span>
          <span data-lang="ar">الرئيسية</span>
          <span data-lang="en">Home</span>
        </a></li>
        <li><a href="immigration.html" data-page="immigration">
          <span data-lang="fa">مهاجرت</span>
          <span data-lang="ar">الهجرة</span>
          <span data-lang="en">Immigration</span>
        </a></li>
        <li><a href="golden-visa.html" data-page="golden-visa">
          <span data-lang="fa">ویزای طلایی</span>
          <span data-lang="ar">التأشيرة الذهبية</span>
          <span data-lang="en">Golden Visa</span>
        </a></li>
        <li><a href="education.html" data-page="education">
          <span data-lang="fa">تحصیل</span>
          <span data-lang="ar">التعليم</span>
          <span data-lang="en">Education</span>
        </a></li>
        <li><a href="about.html" data-page="about">
          <span data-lang="fa">درباره ما</span>
          <span data-lang="ar">من نحن</span>
          <span data-lang="en">About</span>
        </a></li>
        <li><a href="blog.html" data-page="blog">
          <span data-lang="fa">بلاگ</span>
          <span data-lang="ar">المدونة</span>
          <span data-lang="en">Blog</span>
        </a></li>
      </ul>
      <div class="nav-actions">
        <button class="lang-btn" data-lang="fa">FA</button>
        <button class="lang-btn" data-lang="ar">AR</button>
        <button class="lang-btn" data-lang="en">EN</button>
      </div>
      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </nav>
  </div>
</header>
<nav class="nav-mobile" id="nav-mobile">
  <a href="index.html"><span data-lang="fa">خانه</span><span data-lang="ar">الرئيسية</span><span data-lang="en">Home</span></a>
  <a href="immigration.html"><span data-lang="fa">مهاجرت</span><span data-lang="ar">الهجرة</span><span data-lang="en">Immigration</span></a>
  <a href="golden-visa.html"><span data-lang="fa">ویزای طلایی</span><span data-lang="ar">التأشيرة الذهبية</span><span data-lang="en">Golden Visa</span></a>
  <a href="education.html"><span data-lang="fa">تحصیل</span><span data-lang="ar">التعليم</span><span data-lang="en">Education</span></a>
  <a href="about.html"><span data-lang="fa">درباره ما</span><span data-lang="ar">من نحن</span><span data-lang="en">About</span></a>
  <a href="blog.html"><span data-lang="fa">بلاگ</span><span data-lang="ar">المدونة</span><span data-lang="en">Blog</span></a>
  <div class="nav-mobile-langs">
    <button data-lang="fa" onclick="setLang('fa')">FA فارسی</button>
    <button data-lang="ar" onclick="setLang('ar')">AR عربی</button>
    <button data-lang="en" onclick="setLang('en')">EN English</button>
  </div>
</nav>`;

// ── Footer HTML ───────────────────────────────────────────
const FOOTER_HTML = `
<footer class="site-footer">
  <div class="footer-bg-img"></div>
  <div class="container">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-brand-name">G³</div>
        <div class="footer-brand-full">Guide Group Global</div>
        <p class="footer-tagline">
          <span data-lang="fa">راهنمای تخصصی شما برای مهاجرت، تحصیل و سرمایه‌گذاری در اروپا</span>
          <span data-lang="ar">دليلك المتخصص للهجرة والتعليم والاستثمار في أوروبا</span>
          <span data-lang="en">Your expert guide for immigration, education and investment in Europe</span>
        </p>
        <div class="footer-phones">
          <a href="tel:+36705738870" class="footer-phone">+36 70 573 88 70</a>
          <a href="tel:+36203875947" class="footer-phone">+36 20 387 59 47</a>
        </div>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">
          <span data-lang="fa">خدمات</span>
          <span data-lang="ar">الخدمات</span>
          <span data-lang="en">Services</span>
        </div>
        <div class="footer-links">
          <a href="immigration.html"><span data-lang="fa">اقامت مجارستان</span><span data-lang="ar">إقامة المجر</span><span data-lang="en">Hungary Residence</span></a>
          <a href="golden-visa.html"><span data-lang="fa">ویزای طلایی</span><span data-lang="ar">التأشيرة الذهبية</span><span data-lang="en">Golden Visa</span></a>
          <a href="education.html"><span data-lang="fa">تحصیل در مجارستان</span><span data-lang="ar">الدراسة في المجر</span><span data-lang="en">Study in Hungary</span></a>
        </div>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">
          <span data-lang="fa">شرکت</span>
          <span data-lang="ar">الشركة</span>
          <span data-lang="en">Company</span>
        </div>
        <div class="footer-links">
          <a href="about.html"><span data-lang="fa">درباره ما</span><span data-lang="ar">من نحن</span><span data-lang="en">About G³</span></a>
          <a href="blog.html"><span data-lang="fa">بلاگ</span><span data-lang="ar">المدونة</span><span data-lang="en">Blog</span></a>
        </div>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">
          <span data-lang="fa">تماس</span>
          <span data-lang="ar">التواصل</span>
          <span data-lang="en">Contact</span>
        </div>
        <div class="footer-links">
          <a href="https://t.me/GGG_Immigration" target="_blank">Telegram</a>
          <a href="https://instagram.com/persianguidegroup" target="_blank">Instagram</a>
          <a href="https://wa.me/36705738870" target="_blank">WhatsApp</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>Budapest, Hungary</span>
      <span>Guide Group Global © 2024</span>
    </div>
  </div>
</footer>`;

// ── Admin modals ──────────────────────────────────────────
const ADMIN_MODALS_HTML = `
<div id="admin-bar">
  <span>⬤ Admin Mode</span>
  <button onclick="document.getElementById('modal-img').classList.toggle('open')">+ Image</button>
  <button onclick="disableAdminMode()">Exit</button>
</div>
<div class="modal-overlay" id="modal-login">
  <div class="modal-box">
    <div class="modal-title">Admin Login</div>
    <input type="password" id="login-pw" placeholder="Password" onkeydown="if(event.key==='Enter')checkLogin()">
    <div class="modal-actions">
      <button class="btn-ghost" onclick="document.getElementById('modal-login').classList.remove('open')">Cancel</button>
      <button class="btn-primary" onclick="checkLogin()">Login</button>
    </div>
  </div>
</div>
<div class="modal-overlay" id="modal-img">
  <div class="modal-box">
    <div class="modal-title">Upload Image</div>
    <div class="modal-drop" id="img-drop" onclick="document.getElementById('img-file').click()">
      Click or drag to upload
      <input type="file" id="img-file" accept="image/*" style="display:none" onchange="readImageFile(this)">
    </div>
    <img class="modal-preview" id="img-preview">
    <input type="text" id="img-url" placeholder="...or paste image URL (https://)">
    <div class="modal-actions">
      <button class="btn-ghost" onclick="document.getElementById('modal-img').classList.remove('open')">Cancel</button>
      <button class="btn-primary" onclick="saveImage()">Save</button>
    </div>
  </div>
</div>
<div class="modal-overlay" id="modal-yt">
  <div class="modal-box">
    <div class="modal-title">Add YouTube Video</div>
    <input type="text" id="yt-url" placeholder="youtube.com/watch?v=... or video ID">
    <div class="modal-actions">
      <button class="btn-ghost" onclick="document.getElementById('modal-yt').classList.remove('open')">Cancel</button>
      <button class="btn-primary" onclick="saveYT()">Save</button>
    </div>
  </div>
</div>
<div class="modal-overlay" id="modal-text">
  <div class="modal-box">
    <div class="modal-title">Edit Text</div>
    <textarea id="text-val"></textarea>
    <div class="modal-actions">
      <button class="btn-ghost" onclick="document.getElementById('modal-text').classList.remove('open')">Cancel</button>
      <button class="btn-primary" onclick="saveText()">Save</button>
    </div>
  </div>
</div>`;

// ── Mount & Init ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function(){
  // Mount nav (prepend to body) & footer (append before scripts)
  if (!document.getElementById('navbar')) {
    document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
  }
  if (!document.querySelector('.site-footer')) {
    document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);
  }

  // Mount admin
  document.body.insertAdjacentHTML('beforeend', ADMIN_MODALS_HTML);

  // Apply language
  applyLang(getLang());

  // Wire lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  // Scroll: header background
  const header = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 30);
  });

  // Hamburger
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('nav-mobile');
  if (ham && mob) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      mob.classList.toggle('open');
    });
  }

  // Active nav link
  const page = location.pathname.split('/').pop().replace('.html','') || 'index';
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  // IntersectionObserver reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Admin: Ctrl+Shift+A
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      document.getElementById('modal-login').classList.add('open');
      setTimeout(() => document.getElementById('login-pw').focus(), 100);
    }
  });

  // YouTube click-to-load
  document.querySelectorAll('.yt-frame').forEach(frame => {
    const ytId = frame.dataset.ytId;
    if (ytId) {
      frame.querySelector('.yt-placeholder').addEventListener('click', function(){
        frame.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1" allow="autoplay;encrypted-media" allowfullscreen></iframe>`;
      });
    } else if (document.body.classList.contains('admin-mode') || localStorage.getItem('ggg_admin_logged_in')) {
      frame.addEventListener('click', function(e){
        e.stopPropagation();
        window._currentTarget = this;
        document.getElementById('yt-url').value = '';
        document.getElementById('modal-yt').classList.add('open');
      });
    }
  });

  // Restore saved content
  restoreContent();
});

// ── Admin logic ───────────────────────────────────────────
function checkLogin() {
  const pw = document.getElementById('login-pw').value;
  if (pw === 'guideglobal2024') {
    document.getElementById('modal-login').classList.remove('open');
    document.getElementById('login-pw').value = '';
    enableAdminMode();
  } else {
    document.getElementById('login-pw').style.borderColor = '#f55';
    setTimeout(() => document.getElementById('login-pw').style.borderColor = '', 1200);
  }
}
function enableAdminMode() {
  localStorage.setItem('ggg_admin_logged_in','1');
  document.body.classList.add('admin-mode');
  document.getElementById('admin-bar').classList.add('on');
  addAdminHandlers();
}
function disableAdminMode() {
  localStorage.removeItem('ggg_admin_logged_in');
  document.body.classList.remove('admin-mode');
  document.getElementById('admin-bar').classList.remove('on');
}
window._currentTarget = null;
function addAdminHandlers() {
  document.querySelectorAll('[data-content]').forEach(el => {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      window._currentTarget = this;
      document.getElementById('text-val').value = this.innerText;
      document.getElementById('modal-text').classList.add('open');
    });
  });
  document.querySelectorAll('[data-editable]').forEach(el => {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      window._currentTarget = this;
      document.getElementById('modal-img').classList.add('open');
    });
  });
  document.querySelectorAll('.yt-frame').forEach(el => {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      window._currentTarget = this;
      document.getElementById('yt-url').value = '';
      document.getElementById('modal-yt').classList.add('open');
    });
  });
}
function saveText() {
  const val = document.getElementById('text-val').value;
  const el = window._currentTarget;
  if (!el) return;
  el.innerText = val;
  const key = el.dataset.content;
  if (key) saveToStorage('text_' + key, val);
  document.getElementById('modal-text').classList.remove('open');
}
function saveImage() {
  const el = window._currentTarget; if (!el) return;
  const url = document.getElementById('img-url').value.trim();
  const preview = document.getElementById('img-preview');
  const src = preview.style.display !== 'none' ? preview.src : url;
  if (!src) return;
  const img = el.querySelector('img') || el;
  if (img.tagName === 'IMG') {
    img.src = src;
    const key = el.dataset.editable || el.closest('[data-editable]')?.dataset.editable;
    if (key) saveToStorage('img_' + key, src);
  }
  document.getElementById('modal-img').classList.remove('open');
  document.getElementById('img-url').value = '';
  preview.src = ''; preview.style.display = 'none';
}
function saveYT() {
  const el = window._currentTarget; if (!el) return;
  const id = extractYTId(document.getElementById('yt-url').value.trim());
  if (!id) return;
  el.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}" allow="autoplay;encrypted-media" allowfullscreen></iframe>`;
  el.dataset.ytId = id;
  const key = el.id || el.dataset.ytId;
  if (key) saveToStorage('yt_' + key, id);
  document.getElementById('modal-yt').classList.remove('open');
  document.getElementById('yt-url').value = '';
}
function extractYTId(str) {
  const m = str.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : (str.length === 11 ? str : null);
}
function readImageFile(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const p = document.getElementById('img-preview');
    p.src = e.target.result;
    p.style.display = 'block';
  };
  reader.readAsDataURL(file);
}
function saveToStorage(key, val) {
  const store = JSON.parse(localStorage.getItem('ggg_content') || '{}');
  store[key] = val;
  localStorage.setItem('ggg_content', JSON.stringify(store));
}
function restoreContent() {
  const store = JSON.parse(localStorage.getItem('ggg_content') || '{}');
  Object.entries(store).forEach(([key, val]) => {
    if (key.startsWith('text_')) {
      const id = key.slice(5);
      document.querySelectorAll(`[data-content="${id}"]`).forEach(el => el.innerText = val);
    } else if (key.startsWith('img_')) {
      const id = key.slice(4);
      document.querySelectorAll(`[data-editable="${id}"] img`).forEach(el => el.src = val);
    } else if (key.startsWith('yt_')) {
      const id = key.slice(3);
      const targets = [...document.querySelectorAll(`[data-yt-id="${id}"]`), ...document.querySelectorAll(`#${id}.yt-frame`)];
      targets.forEach(el => {
        if (!el.querySelector('iframe')) {
          el.innerHTML = `<iframe src="https://www.youtube.com/embed/${val}" allow="autoplay;encrypted-media" allowfullscreen></iframe>`;
        }
      });
    }
  });
  if (localStorage.getItem('ggg_admin_logged_in')) enableAdminMode();
}
