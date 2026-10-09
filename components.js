/* G3 — Guide Group Global | Components v3 */
(function(){
'use strict';

/* ─── Language helpers ─────────────────────────────────────────── */
const LANGS = { fa:'fa', ar:'ar', en:'en' };
function getLang(){ return localStorage.getItem('ggg_lang') || 'fa'; }
function setLang(l){
  localStorage.setItem('ggg_lang', l);
  applyLang(l);
}
function applyLang(l){
  const html = document.documentElement;
  if(l==='en'){ html.setAttribute('lang','en'); html.setAttribute('dir','ltr'); html.classList.remove('rtl'); html.classList.add('ltr'); }
  else if(l==='ar'){ html.setAttribute('lang','ar'); html.setAttribute('dir','rtl'); html.classList.add('rtl'); html.classList.remove('ltr'); }
  else { html.setAttribute('lang','fa'); html.setAttribute('dir','rtl'); html.classList.add('rtl'); html.classList.remove('ltr'); }
  document.querySelectorAll('[data-lang]').forEach(el=>{
    el.style.display = el.getAttribute('data-lang')===l ? '' : 'none';
  });
  document.querySelectorAll('.lang-btn').forEach(b=>{
    b.classList.toggle('active', b.getAttribute('data-l')===l);
  });
}

/* ─── Navbar HTML ──────────────────────────────────────────────── */
const NAV_LINKS = [
  { href:'index.html', fa:'خانه', ar:'الرئيسية', en:'Home' },
  { href:'immigration.html', fa:'مهاجرت', ar:'الهجرة', en:'Immigration' },
  { href:'golden-visa.html', fa:'ویزای طلایی', ar:'التأشيرة الذهبية', en:'Golden Visa' },
  { href:'education.html', fa:'تحصیل', ar:'التعليم', en:'Education' },
  { href:'about.html', fa:'درباره ما', ar:'من نحن', en:'About' },
  { href:'blog.html', fa:'بلاگ', ar:'المدونة', en:'Blog' },
];

function buildNavbar(){
  const current = location.pathname.split('/').pop() || 'index.html';
  const linksHTML = NAV_LINKS.map(l=>`
    <a href="${l.href}" class="nav-link${current===l.href?' active':''}">
      <span data-lang="fa">${l.fa}</span>
      <span data-lang="ar">${l.ar}</span>
      <span data-lang="en">${l.en}</span>
    </a>`).join('');

  const html = `
<header class="site-header" id="site-header">
  <nav class="nav-inner">
    <a href="index.html" class="nav-logo">
      <span class="logo-mark">G³</span>
      <span class="logo-text">Guide Group Global</span>
    </a>
    <div class="nav-links" id="nav-links">
      ${linksHTML}
    </div>
    <div class="nav-actions">
      <div class="lang-switcher">
        <button class="lang-btn" data-l="fa">FA</button>
        <button class="lang-btn" data-l="ar">AR</button>
        <button class="lang-btn" data-l="en">EN</button>
      </div>
      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
</header>
<div class="mobile-menu" id="mobile-menu">
  <div class="mobile-menu-inner">
    ${NAV_LINKS.map(l=>`
    <a href="${l.href}" class="mobile-nav-link${current===l.href?' active':''}">
      <span data-lang="fa">${l.fa}</span>
      <span data-lang="ar">${l.ar}</span>
      <span data-lang="en">${l.en}</span>
    </a>`).join('')}
    <div class="lang-switcher mobile-lang">
      <button class="lang-btn" data-l="fa">FA</button>
      <button class="lang-btn" data-l="ar">AR</button>
      <button class="lang-btn" data-l="en">EN</button>
    </div>
  </div>
</div>`;

  const target = document.getElementById('navbar-mount') || document.body;
  target.insertAdjacentHTML('afterbegin', html);

  /* hamburger */
  document.getElementById('hamburger').addEventListener('click', ()=>{
    const mm = document.getElementById('mobile-menu');
    mm.classList.toggle('open');
    document.body.classList.toggle('menu-open');
  });

  /* language buttons */
  document.querySelectorAll('.lang-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> setLang(btn.getAttribute('data-l')));
  });

  /* scroll shrink */
  window.addEventListener('scroll', ()=>{
    document.getElementById('site-header').classList.toggle('scrolled', window.scrollY > 60);
  }, {passive:true});
}

/* ─── Footer HTML ──────────────────────────────────────────────── */
function buildFooter(){
  const html = `
<footer class="site-footer" id="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <span class="logo-mark" style="font-size:2rem">G³</span>
      <p class="footer-tagline">
        <span data-lang="fa">راهنمای مهاجرت و تحصیل شما در اروپا</span>
        <span data-lang="ar">دليلك للهجرة والتعليم في أوروبا</span>
        <span data-lang="en">Your guide to migration and education in Europe</span>
      </p>
    </div>
    <div class="footer-cols">
      <div class="footer-col">
        <div class="footer-col-title">
          <span data-lang="fa">خدمات</span>
          <span data-lang="ar">الخدمات</span>
          <span data-lang="en">Services</span>
        </div>
        <a href="immigration.html">
          <span data-lang="fa">مهاجرت</span>
          <span data-lang="ar">الهجرة</span>
          <span data-lang="en">Immigration</span>
        </a>
        <a href="golden-visa.html">
          <span data-lang="fa">ویزای طلایی</span>
          <span data-lang="ar">التأشيرة الذهبية</span>
          <span data-lang="en">Golden Visa</span>
        </a>
        <a href="education.html">
          <span data-lang="fa">تحصیل</span>
          <span data-lang="ar">التعليم</span>
          <span data-lang="en">Education</span>
        </a>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">
          <span data-lang="fa">شرکت</span>
          <span data-lang="ar">الشركة</span>
          <span data-lang="en">Company</span>
        </div>
        <a href="about.html">
          <span data-lang="fa">درباره ما</span>
          <span data-lang="ar">من نحن</span>
          <span data-lang="en">About</span>
        </a>
        <a href="blog.html">
          <span data-lang="fa">بلاگ</span>
          <span data-lang="ar">المدونة</span>
          <span data-lang="en">Blog</span>
        </a>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">
          <span data-lang="fa">تماس</span>
          <span data-lang="ar">تواصل معنا</span>
          <span data-lang="en">Contact</span>
        </div>
        <a href="https://t.me/GGG_Immigration" target="_blank">Telegram</a>
        <a href="https://instagram.com/guidegroupglobal" target="_blank">Instagram</a>
        <div class="footer-phones">
          <span style="direction:ltr;unicode-bidi:embed;display:inline-block;">+36 70 573 88 70</span><br>
          <span style="direction:ltr;unicode-bidi:embed;display:inline-block;">+36 20 387 59 47</span>
        </div>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2024 Guide Group Global</span>
    <span style="direction:ltr;unicode-bidi:embed;display:inline-block;">Budapest, Hungary</span>
  </div>
</footer>`;

  const mount = document.getElementById('footer-mount');
  if(mount) mount.outerHTML = html;
  else document.body.insertAdjacentHTML('beforeend', html);
}

/* ─── Admin modals HTML ────────────────────────────────────────── */
function buildAdminUI(){
  const html = `
<!-- Admin Bar -->
<div class="admin-bar" id="admin-bar" style="display:none">
  <span class="admin-bar-logo">G³ Admin</span>
  <div class="admin-bar-actions">
    <button onclick="window.gggAdmin.exportContent()">
      <span data-lang="fa">خروجی</span><span data-lang="ar">تصدير</span><span data-lang="en">Export</span>
    </button>
    <button onclick="document.getElementById('import-file').click()">
      <span data-lang="fa">ورودی</span><span data-lang="ar">استيراد</span><span data-lang="en">Import</span>
    </button>
    <button onclick="if(confirm('Reset?'))window.gggAdmin.resetContent()">
      <span data-lang="fa">ریست</span><span data-lang="ar">إعادة تعيين</span><span data-lang="en">Reset</span>
    </button>
    <button onclick="window.gggAdmin.logout()" class="admin-btn-danger">
      <span data-lang="fa">خروج</span><span data-lang="ar">خروج</span><span data-lang="en">Logout</span>
    </button>
  </div>
  <input type="file" id="import-file" accept=".json" style="display:none" onchange="window.gggAdmin.importContent(this)">
</div>

<!-- Admin Login Modal -->
<div class="modal-overlay" id="admin-login-modal">
  <div class="modal-box">
    <button class="modal-close" onclick="document.getElementById('admin-login-modal').classList.remove('open')">✕</button>
    <h3 class="modal-title">Admin Login</h3>
    <input type="password" id="admin-password-input" class="modal-input" placeholder="Password">
    <div class="modal-actions">
      <button class="btn-primary" onclick="window.gggAdmin.login()">Login</button>
    </div>
  </div>
</div>

<!-- Text Editor Modal -->
<div class="modal-overlay" id="editor-modal">
  <div class="modal-box">
    <button class="modal-close" onclick="window.gggAdmin.closeEditorModal()">✕</button>
    <h3 class="modal-title">
      <span data-lang="fa">ویرایش متن</span><span data-lang="ar">تعديل النص</span><span data-lang="en">Edit Text</span>
    </h3>
    <textarea id="editor-textarea" class="modal-textarea" rows="6"></textarea>
    <div class="modal-actions">
      <button class="btn-primary" onclick="window.gggAdmin.saveEditorContent()">
        <span data-lang="fa">ذخیره</span><span data-lang="ar">حفظ</span><span data-lang="en">Save</span>
      </button>
      <button class="btn-ghost" onclick="window.gggAdmin.closeEditorModal()">
        <span data-lang="fa">لغو</span><span data-lang="ar">إلغاء</span><span data-lang="en">Cancel</span>
      </button>
    </div>
  </div>
</div>

<!-- Image Editor Modal -->
<div class="modal-overlay" id="image-modal">
  <div class="modal-box">
    <button class="modal-close" onclick="window.gggAdmin.closeImageModal()">✕</button>
    <h3 class="modal-title">
      <span data-lang="fa">آپلود تصویر</span><span data-lang="ar">رفع صورة</span><span data-lang="en">Upload Image</span>
    </h3>
    <div class="upload-area" id="upload-area" onclick="document.getElementById('image-file-input').click()">
      <div class="upload-icon">↑</div>
      <p><span data-lang="fa">کلیک یا درگ کنید</span><span data-lang="ar">انقر أو اسحب</span><span data-lang="en">Click or drag to upload</span></p>
    </div>
    <input type="file" id="image-file-input" accept="image/*" style="display:none" onchange="window.gggAdmin.handleImageFileUpload(this)">
    <div style="margin:1rem 0;text-align:center;color:var(--muted)">— or —</div>
    <input type="url" id="image-url-input" class="modal-input" placeholder="https://...">
    <div id="image-preview-wrap" style="display:none;margin:1rem 0;">
      <img id="image-preview" style="max-width:100%;border-radius:var(--radius);" alt="preview">
    </div>
    <div class="modal-actions">
      <button class="btn-primary" onclick="window.gggAdmin.saveImageUrl()">
        <span data-lang="fa">ذخیره</span><span data-lang="ar">حفظ</span><span data-lang="en">Save</span>
      </button>
      <button class="btn-ghost" onclick="window.gggAdmin.closeImageModal()">
        <span data-lang="fa">لغو</span><span data-lang="ar">إلغاء</span><span data-lang="en">Cancel</span>
      </button>
    </div>
  </div>
</div>

<!-- YouTube Editor Modal -->
<div class="modal-overlay" id="yt-modal">
  <div class="modal-box">
    <button class="modal-close" onclick="window.gggAdmin.closeYTModal()">✕</button>
    <h3 class="modal-title">
      <span data-lang="fa">افزودن ویدیو یوتیوب</span><span data-lang="ar">إضافة فيديو يوتيوب</span><span data-lang="en">Add YouTube Video</span>
    </h3>
    <input type="url" id="yt-url-input" class="modal-input" placeholder="https://youtube.com/watch?v=...">
    <div class="modal-actions">
      <button class="btn-primary" onclick="window.gggAdmin.saveYouTubeUrl()">
        <span data-lang="fa">ذخیره</span><span data-lang="ar">حفظ</span><span data-lang="en">Save</span>
      </button>
      <button class="btn-ghost" onclick="window.gggAdmin.closeYTModal()">
        <span data-lang="fa">لغو</span><span data-lang="ar">إلغاء</span><span data-lang="en">Cancel</span>
      </button>
    </div>
  </div>
</div>

<!-- Admin Toast -->
<div class="admin-toast" id="admin-toast"></div>`;

  document.body.insertAdjacentHTML('beforeend', html);

  /* drag-drop on upload area */
  const area = document.getElementById('upload-area');
  if(area){
    area.addEventListener('dragover', e=>{ e.preventDefault(); area.classList.add('drag-over'); });
    area.addEventListener('dragleave', ()=> area.classList.remove('drag-over'));
    area.addEventListener('drop', e=>{
      e.preventDefault(); area.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if(file) window.gggAdmin.handleImageFileFromFile(file);
    });
  }
}

/* ─── Scroll reveal ────────────────────────────────────────────── */
function initReveal(){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin:'0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el=> io.observe(el));
}

/* ─── Hero line entrance ───────────────────────────────────────── */
function initHeroLines(){
  const lines = document.querySelectorAll('.hero-line');
  if(!lines.length) return;
  requestAnimationFrame(()=>{
    setTimeout(()=>{ lines.forEach(l=> l.classList.add('in')); }, 120);
  });
}

/* ─── First-visit language redirect ───────────────────────────── */
function checkLangRedirect(){
  const page = location.pathname.split('/').pop() || 'index.html';
  if(page === 'welcome.html') return;
  if(!localStorage.getItem('ggg_lang')){
    window.location.href = 'welcome.html';
  }
}

/* ─── Boot ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', ()=>{
  checkLangRedirect();
  buildNavbar();
  buildFooter();
  buildAdminUI();

  const l = getLang();
  applyLang(l);

  /* keyboard shortcut */
  document.addEventListener('keydown', e=>{
    if(e.ctrlKey && e.shiftKey && e.key==='A'){
      e.preventDefault();
      if(localStorage.getItem('ggg_admin_logged_in')==='1'){
        document.getElementById('admin-bar').style.display='';
      } else {
        document.getElementById('admin-login-modal').classList.add('open');
        setTimeout(()=> document.getElementById('admin-password-input').focus(), 100);
      }
    }
  });

  /* password enter key */
  document.addEventListener('keydown', e=>{
    if(e.key==='Enter' && document.getElementById('admin-login-modal').classList.contains('open')){
      window.gggAdmin && window.gggAdmin.login();
    }
  });

  /* overlay clicks */
  document.querySelectorAll('.modal-overlay').forEach(ov=>{
    ov.addEventListener('click', e=>{ if(e.target===ov) ov.classList.remove('open'); });
  });

  if(localStorage.getItem('ggg_admin_logged_in')==='1'){
    document.getElementById('admin-bar').style.display='';
  }

  /* init CMS content */
  if(window.gggAdmin) window.gggAdmin.applyContent();

  initReveal();
  initHeroLines();
});

/* expose lang helpers globally */
window.gggLang = { get: getLang, set: setLang, apply: applyLang };

})();
