/* ─── Guide Group Global — components.js v4 ─────────────────────────────── */

/* ── Language helpers ───────────────────────────────────────────────────── */
const LANGS = ['fa', 'ar', 'en'];
const DIR   = { fa: 'rtl', ar: 'rtl', en: 'ltr' };

function getLang() {
  return localStorage.getItem('ggg_lang') || 'fa';
}

function setLang(lang) {
  if (!LANGS.includes(lang)) lang = 'fa';
  localStorage.setItem('ggg_lang', lang);
  applyLang(lang);
}

function applyLang(lang) {
  const html = document.documentElement;
  html.lang = lang;
  html.dir  = DIR[lang];
  html.classList.remove('rtl', 'ltr');
  html.classList.add(DIR[lang]);
  // Update active indicator in nav
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  // Update page title if data attribute exists
  const titleEl = document.querySelector('[data-title-' + lang + ']');
  if (titleEl) document.title = titleEl.getAttribute('data-title-' + lang);
}

/* ── First-visit redirect ────────────────────────────────────────────────── */
(function firstVisitCheck() {
  if (window.location.pathname.endsWith('welcome.html')) return;
  if (!localStorage.getItem('ggg_lang')) {
    window.location.replace('welcome.html');
  }
})();

/* ── Navbar HTML ─────────────────────────────────────────────────────────── */
const NAV_HTML = `
<header class="site-header" id="navbar">
  <div class="nav-inner">
    <a href="index.html" class="nav-logo">
      <span class="logo-mark">G³</span>
      <span class="logo-text">
        <span data-lang="fa">گاید گروپ گلوبال</span>
        <span data-lang="ar">غايد غروب غلوبال</span>
        <span data-lang="en">Guide Group Global</span>
      </span>
    </a>

    <div class="nav-links" id="nav-links">
      <a href="index.html" class="nav-link">
        <span data-lang="fa">خانه</span>
        <span data-lang="ar">الرئيسية</span>
        <span data-lang="en">Home</span>
      </a>
      <a href="immigration.html" class="nav-link">
        <span data-lang="fa">مهاجرت</span>
        <span data-lang="ar">الهجرة</span>
        <span data-lang="en">Immigration</span>
      </a>
      <a href="education.html" class="nav-link">
        <span data-lang="fa">تحصیل</span>
        <span data-lang="ar">التعليم</span>
        <span data-lang="en">Education</span>
      </a>
      <a href="golden-visa.html" class="nav-link">
        <span data-lang="fa">ویزای طلایی</span>
        <span data-lang="ar">التأشيرة الذهبية</span>
        <span data-lang="en">Golden Visa</span>
      </a>
      <a href="about.html" class="nav-link">
        <span data-lang="fa">درباره ما</span>
        <span data-lang="ar">عنّا</span>
        <span data-lang="en">About</span>
      </a>
      <a href="blog.html" class="nav-link">
        <span data-lang="fa">بلاگ</span>
        <span data-lang="ar">المدونة</span>
        <span data-lang="en">Blog</span>
      </a>
    </div>

    <div class="nav-actions">
      <div class="lang-switcher">
        <button class="lang-btn" data-lang="fa">FA</button>
        <button class="lang-btn" data-lang="ar">AR</button>
        <button class="lang-btn" data-lang="en">EN</button>
      </div>
      <a href="https://t.me/GGG_Immigration" target="_blank" class="btn-primary" style="font-size:0.78rem;padding:0.45rem 1rem;">
        <span data-lang="fa">مشاوره رایگان</span>
        <span data-lang="ar">استشارة مجانية</span>
        <span data-lang="en">Free Consult</span>
      </a>
      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>
<div class="nav-backdrop" id="nav-backdrop"></div>`;

/* ── Footer HTML ─────────────────────────────────────────────────────────── */
const FOOTER_HTML = `
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <span class="logo-mark">G³</span>
      <p class="footer-tagline">
        <span data-lang="fa">راهنمای مهاجرت و تحصیل در اروپا</span>
        <span data-lang="ar">دليلك للهجرة والدراسة في أوروبا</span>
        <span data-lang="en">Your guide to migration &amp; education in Europe</span>
      </p>
    </div>

    <div class="footer-col">
      <h4 class="footer-col-title">
        <span data-lang="fa">خدمات</span>
        <span data-lang="ar">الخدمات</span>
        <span data-lang="en">Services</span>
      </h4>
      <a href="immigration.html">
        <span data-lang="fa">مهاجرت</span>
        <span data-lang="ar">الهجرة</span>
        <span data-lang="en">Immigration</span>
      </a>
      <a href="education.html">
        <span data-lang="fa">تحصیل</span>
        <span data-lang="ar">التعليم</span>
        <span data-lang="en">Education</span>
      </a>
      <a href="golden-visa.html">
        <span data-lang="fa">ویزای طلایی</span>
        <span data-lang="ar">التأشيرة الذهبية</span>
        <span data-lang="en">Golden Visa</span>
      </a>
      <a href="blog.html">
        <span data-lang="fa">بلاگ</span>
        <span data-lang="ar">المدونة</span>
        <span data-lang="en">Blog</span>
      </a>
    </div>

    <div class="footer-col">
      <h4 class="footer-col-title">
        <span data-lang="fa">شرکت</span>
        <span data-lang="ar">الشركة</span>
        <span data-lang="en">Company</span>
      </h4>
      <a href="about.html">
        <span data-lang="fa">درباره ما</span>
        <span data-lang="ar">عنّا</span>
        <span data-lang="en">About Us</span>
      </a>
    </div>

    <div class="footer-col">
      <h4 class="footer-col-title">
        <span data-lang="fa">تماس</span>
        <span data-lang="ar">التواصل</span>
        <span data-lang="en">Contact</span>
      </h4>
      <div class="footer-phones">
        <span dir="ltr">+36 70 573 88 70</span>
        <span>info@guidegroupglobal.com</span>
        <span>
          <span data-lang="fa">بوداپست، مجارستان</span>
          <span data-lang="ar">بودابست، المجر</span>
          <span data-lang="en">Budapest, Hungary</span>
        </span>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <span>&copy; 2024 Guide Group Global</span>
    <span>
      <a href="https://t.me/GGG_Immigration" target="_blank" style="color:rgba(255,255,255,0.4);margin:0 0.5rem;">Telegram</a>
      <a href="https://wa.me/36705738870" target="_blank" style="color:rgba(255,255,255,0.4);margin:0 0.5rem;">WhatsApp</a>
    </span>
  </div>
</footer>`;

/* ── Admin modals HTML ───────────────────────────────────────────────────── */
const ADMIN_MODALS_HTML = `
<!-- Admin Login Modal -->
<div class="modal-overlay" id="modal-login">
  <div class="modal-box">
    <button class="modal-close" id="close-login">&times;</button>
    <h3 class="modal-title">Admin Login</h3>
    <input type="password" id="admin-pwd" class="modal-input" placeholder="Password" />
    <button class="modal-btn" id="admin-login-btn">Enter</button>
    <p class="modal-error" id="admin-error" style="display:none">Incorrect password</p>
  </div>
</div>

<!-- Image Upload Modal -->
<div class="modal-overlay" id="modal-img">
  <div class="modal-box">
    <button class="modal-close" id="close-img">&times;</button>
    <h3 class="modal-title">Upload Image</h3>
    <div class="upload-drop" id="img-drop">
      <p>Drop image here or click to browse</p>
      <input type="file" id="img-file-input" accept="image/*" style="display:none" />
    </div>
    <div id="img-preview-wrap" style="display:none">
      <img id="img-preview" style="max-width:100%;border-radius:4px;" />
    </div>
    <input type="text" id="img-url-input" class="modal-input" placeholder="Or paste image URL" />
    <button class="modal-btn" id="img-save-btn">Save Image</button>
  </div>
</div>

<!-- YouTube Modal -->
<div class="modal-overlay" id="modal-yt">
  <div class="modal-box">
    <button class="modal-close" id="close-yt">&times;</button>
    <h3 class="modal-title">Add YouTube Video</h3>
    <input type="text" id="yt-url-input" class="modal-input" placeholder="YouTube URL or ID" />
    <button class="modal-btn" id="yt-save-btn">Embed Video</button>
  </div>
</div>

<!-- Text Edit Modal -->
<div class="modal-overlay" id="modal-text">
  <div class="modal-box">
    <button class="modal-close" id="close-text">&times;</button>
    <h3 class="modal-title">Edit Content</h3>
    <textarea id="text-edit-input" class="modal-textarea" rows="4"></textarea>
    <button class="modal-btn" id="text-save-btn">Save</button>
  </div>
</div>

<!-- Admin Bar -->
<div class="admin-bar" id="admin-bar" style="display:none">
  <span class="admin-bar-label">⚙ Admin Mode</span>
  <button class="admin-bar-btn" id="admin-logout-btn">Logout</button>
</div>`;

/* ── Mount components ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {

  // Mount navbar
  const navMount = document.getElementById('navbar-mount');
  if (navMount) navMount.outerHTML = NAV_HTML;

  // Mount footer
  const footerMount = document.getElementById('footer-mount');
  if (footerMount) footerMount.outerHTML = FOOTER_HTML;

  // Mount admin modals (append to body)
  const adminDiv = document.createElement('div');
  adminDiv.innerHTML = ADMIN_MODALS_HTML;
  document.body.appendChild(adminDiv);

  // Apply current language
  const lang = getLang();
  applyLang(lang);

  // Lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      setLang(this.dataset.lang);
    });
  });

  // Navbar scroll shrink
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Mobile hamburger
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  const backdrop  = document.getElementById('nav-backdrop');

  function closeMenu() {
    if (navLinks)  navLinks.classList.remove('open');
    if (hamburger) hamburger.classList.remove('open');
    if (backdrop)  backdrop.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', function() {
      const isOpen = navLinks && navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      if (backdrop) backdrop.classList.toggle('visible', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  // Mark active nav link
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) link.classList.add('active');
  });

  // ── Scroll reveal (IntersectionObserver) ───────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  }

  // ── Hero lines already animated via CSS; just make them visible ─────────
  document.querySelectorAll('.hero-line').forEach(el => {
    el.style.visibility = 'visible';
  });

  // ── Admin keyboard shortcut ─────────────────────────────────────────────
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      if (localStorage.getItem('ggg_admin_logged_in') === '1') {
        enableAdminMode();
      } else {
        openModal('modal-login');
      }
    }
  });

  // ── Admin login ─────────────────────────────────────────────────────────
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('#admin-login-btn');
    if (btn) {
      const pwd = document.getElementById('admin-pwd');
      if (pwd && pwd.value === 'guideglobal2024') {
        localStorage.setItem('ggg_admin_logged_in', '1');
        closeModal('modal-login');
        enableAdminMode();
      } else {
        const err = document.getElementById('admin-error');
        if (err) err.style.display = 'block';
      }
    }
  });

  // ── Admin logout ─────────────────────────────────────────────────────────
  document.addEventListener('click', function(e) {
    if (e.target.closest('#admin-logout-btn')) {
      localStorage.removeItem('ggg_admin_logged_in');
      disableAdminMode();
    }
  });

  // Close modals
  ['close-login','close-img','close-yt','close-text'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', function() {
        document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
      });
    }
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  // If already logged in as admin
  if (localStorage.getItem('ggg_admin_logged_in') === '1') {
    enableAdminMode();
  }
});

/* ── Modal helpers ───────────────────────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

/* ── Admin mode ──────────────────────────────────────────────────────────── */
function enableAdminMode() {
  document.body.classList.add('admin-mode');
  const bar = document.getElementById('admin-bar');
  if (bar) bar.style.display = 'flex';
  addAdminHandlers();
}

function disableAdminMode() {
  document.body.classList.remove('admin-mode');
  const bar = document.getElementById('admin-bar');
  if (bar) bar.style.display = 'none';
}

/* ── Admin click handlers ────────────────────────────────────────────────── */
let _currentEditTarget = null;

function addAdminHandlers() {
  // Text content editable
  document.querySelectorAll('[data-content]').forEach(el => {
    if (!el.dataset.adminWired) {
      el.dataset.adminWired = '1';
      el.style.cursor = 'pointer';
      el.addEventListener('click', function(e) {
        if (!document.body.classList.contains('admin-mode')) return;
        e.stopPropagation();
        _currentEditTarget = this;
        const input = document.getElementById('text-edit-input');
        if (input) input.value = this.textContent.trim();
        openModal('modal-text');
      });
    }
  });

  // Text save
  const textSaveBtn = document.getElementById('text-save-btn');
  if (textSaveBtn && !textSaveBtn.dataset.wired) {
    textSaveBtn.dataset.wired = '1';
    textSaveBtn.addEventListener('click', function() {
      if (!_currentEditTarget) return;
      const val = document.getElementById('text-edit-input').value;
      _currentEditTarget.textContent = val;
      // Save to localStorage
      const key = _currentEditTarget.dataset.content;
      if (key) {
        const store = JSON.parse(localStorage.getItem('ggg_content') || '{}');
        store[key] = val;
        localStorage.setItem('ggg_content', JSON.stringify(store));
      }
      closeModal('modal-text');
    });
  }

  // Image editable
  document.querySelectorAll('[data-editable]').forEach(el => {
    if (!el.dataset.adminWired) {
      el.dataset.adminWired = '1';
      el.style.cursor = 'pointer';
      el.style.outline = '2px dashed #9A7B2F';
      el.addEventListener('click', function(e) {
        if (!document.body.classList.contains('admin-mode')) return;
        e.stopPropagation();
        _currentEditTarget = this;
        openModal('modal-img');
      });
    }
  });

  // YouTube embeds
  document.querySelectorAll('.yt-embed').forEach(el => {
    if (!el.dataset.adminWired) {
      el.dataset.adminWired = '1';
      el.style.cursor = 'pointer';
      el.style.outline = '2px dashed #9A7B2F';
      el.addEventListener('click', function(e) {
        if (!document.body.classList.contains('admin-mode')) return;
        e.stopPropagation();
        _currentEditTarget = this;
        openModal('modal-yt');
      });
    }
  });

  // Image drop/upload
  const imgDrop = document.getElementById('img-drop');
  const imgFileInput = document.getElementById('img-file-input');
  if (imgDrop && imgFileInput && !imgDrop.dataset.wired) {
    imgDrop.dataset.wired = '1';
    imgDrop.addEventListener('click', () => imgFileInput.click());
    imgDrop.addEventListener('dragover', e => { e.preventDefault(); imgDrop.classList.add('dragover'); });
    imgDrop.addEventListener('dragleave', () => imgDrop.classList.remove('dragover'));
    imgDrop.addEventListener('drop', e => {
      e.preventDefault();
      imgDrop.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) readImageFile(file);
    });
    imgFileInput.addEventListener('change', e => {
      if (e.target.files[0]) readImageFile(e.target.files[0]);
    });
  }

  // Image save
  const imgSaveBtn = document.getElementById('img-save-btn');
  if (imgSaveBtn && !imgSaveBtn.dataset.wired) {
    imgSaveBtn.dataset.wired = '1';
    imgSaveBtn.addEventListener('click', function() {
      if (!_currentEditTarget) return;
      const urlInput = document.getElementById('img-url-input');
      const preview  = document.getElementById('img-preview');
      let src = '';
      if (preview && preview.src && preview.style.display !== 'none') {
        src = preview.src;
      } else if (urlInput && urlInput.value) {
        src = urlInput.value;
      }
      if (src) {
        if (_currentEditTarget.tagName === 'IMG') {
          _currentEditTarget.src = src;
        } else {
          _currentEditTarget.style.backgroundImage = 'url(' + src + ')';
        }
        const key = _currentEditTarget.dataset.editable;
        if (key) {
          const store = JSON.parse(localStorage.getItem('ggg_content') || '{}');
          store[key] = src;
          localStorage.setItem('ggg_content', JSON.stringify(store));
        }
      }
      closeModal('modal-img');
      // reset
      if (urlInput) urlInput.value = '';
      if (preview)  { preview.src = ''; preview.style.display = 'none'; }
      const wrap = document.getElementById('img-preview-wrap');
      if (wrap) wrap.style.display = 'none';
    });
  }

  // YouTube save
  const ytSaveBtn = document.getElementById('yt-save-btn');
  if (ytSaveBtn && !ytSaveBtn.dataset.wired) {
    ytSaveBtn.dataset.wired = '1';
    ytSaveBtn.addEventListener('click', function() {
      if (!_currentEditTarget) return;
      const urlInput = document.getElementById('yt-url-input');
      const raw = urlInput ? urlInput.value.trim() : '';
      const vid = extractYTId(raw);
      if (vid) {
        _currentEditTarget.innerHTML =
          '<iframe src="https://www.youtube.com/embed/' + vid +
          '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;"></iframe>';
        const key = _currentEditTarget.dataset.ytId;
        if (key) {
          const store = JSON.parse(localStorage.getItem('ggg_content') || '{}');
          store[key] = vid;
          localStorage.setItem('ggg_content', JSON.stringify(store));
        }
      }
      closeModal('modal-yt');
      if (urlInput) urlInput.value = '';
    });
  }
}

function readImageFile(file) {
  const reader = new FileReader();
  reader.onload = function(ev) {
    const preview = document.getElementById('img-preview');
    const wrap    = document.getElementById('img-preview-wrap');
    if (preview) { preview.src = ev.target.result; preview.style.display = 'block'; }
    if (wrap)    wrap.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function extractYTId(url) {
  if (!url) return '';
  // Direct ID (11 chars)
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}

/* ── Restore saved content on load ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  const store = JSON.parse(localStorage.getItem('ggg_content') || '{}');
  Object.keys(store).forEach(key => {
    // Text
    document.querySelectorAll('[data-content="' + key + '"]').forEach(el => {
      el.textContent = store[key];
    });
    // Images
    document.querySelectorAll('[data-editable="' + key + '"]').forEach(el => {
      if (el.tagName === 'IMG') el.src = store[key];
      else el.style.backgroundImage = 'url(' + store[key] + ')';
    });
    // YouTube
    document.querySelectorAll('[data-yt-id="' + key + '"]').forEach(el => {
      const vid = store[key];
      el.innerHTML =
        '<iframe src="https://www.youtube.com/embed/' + vid +
        '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;"></iframe>';
    });
  });
});
