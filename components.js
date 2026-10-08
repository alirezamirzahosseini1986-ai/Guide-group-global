/* ================================================
   Guide Group Global — Shared Components
   Navbar, Footer, Admin Panel UI
   ================================================ */

const NAV_HTML = `
<nav class="navbar">
  <div class="container">
    <a href="index.html" class="logo">
      <div class="logo-mark">G³</div>
      <div class="logo-text">
        <span class="brand">Guide Group Global</span>
        <span class="tagline">IMMIGRATION · EDUCATION · INVESTMENT</span>
      </div>
    </a>
    <ul class="nav-links">
      <li><a href="index.html">خانه</a></li>
      <li><a href="immigration.html">مهاجرت</a></li>
      <li><a href="education.html">تحصیل</a></li>
      <li><a href="golden-visa.html">گلدن ویزا</a></li>
      <li><a href="about.html">درباره ما</a></li>
      <li><a href="index.html#contact" class="nav-cta">مشاوره رایگان</a></li>
    </ul>
    <button class="hamburger" id="hamburger" aria-label="منو">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>`;

const FOOTER_HTML = `
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="index.html" class="logo" style="margin-bottom:1rem; display:inline-flex;">
          <div class="logo-mark">G³</div>
          <div class="logo-text">
            <span class="brand">Guide Group Global</span>
            <span class="tagline">IMMIGRATION · EDUCATION · INVESTMENT</span>
          </div>
        </a>
        <p>بیش از ۱۵ سال تجربه در مهاجرت، تحصیل و سرمایه‌گذاری در مجارستان. همراه شما از اولین قدم تا دریافت اقامت.</p>
      </div>
      <div class="footer-col">
        <h5>خدمات</h5>
        <ul>
          <li><a href="immigration.html">مهاجرت تجاری</a></li>
          <li><a href="education.html">تحصیل در مجارستان</a></li>
          <li><a href="golden-visa.html">گلدن ویزا</a></li>
          <li><a href="immigration.html#residency">اقامت از طریق ملک</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>شرکت</h5>
        <ul>
          <li><a href="about.html">درباره ما</a></li>
          <li><a href="about.html#team">تیم ما</a></li>
          <li><a href="index.html#contact">تماس با ما</a></li>
          <li><a href="about.html#history">سابقه ما</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>تماس</h5>
        <ul>
          <li><a href="tel:+36705738870">+۳۶ ۷۰ ۵۷۳ ۸۸ ۷۰</a></li>
          <li><a href="tel:+36203875947">+۳۶ ۲۰ ۳۸۷ ۵۹ ۴۷</a></li>
          <li><a href="https://wa.me/36705738870" target="_blank">واتساپ</a></li>
          <li><a href="https://t.me/budapestguidegroup2009" target="_blank">تلگرام</a></li>
          <li><a href="mailto:info@persianguidegroup.co">ایمیل</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© ۲۰۲۴ Guide Group Global — تمام حقوق محفوظ است</p>
      <div class="footer-socials">
        <a href="https://www.facebook.com/persianguidegroup" target="_blank">فیسبوک</a>
        <a href="https://www.instagram.com/persianguidegroup" target="_blank">اینستاگرام</a>
        <a href="https://t.me/budapestguidegroup2009" target="_blank">تلگرام</a>
        <a href="https://wa.me/36705738870" target="_blank">واتساپ</a>
      </div>
    </div>
  </div>
</footer>`;

const ADMIN_UI_HTML = `
<!-- Admin Bar -->
<div id="admin-bar" style="display:none; position:fixed; top:0; left:0; right:0; height:44px; background:linear-gradient(90deg,#0A1628,#162240); border-bottom:2px solid #C9A84C; z-index:9999; align-items:center; justify-content:space-between; padding:0 1.5rem; font-family:Vazirmatn,sans-serif;">
  <div style="display:flex;align-items:center;gap:1rem;">
    <span style="color:#C9A84C;font-size:0.85rem;font-weight:700;">⚙ پنل مدیریت فعال</span>
    <span style="color:#8A9BB5;font-size:0.75rem;">روی هر متن یا تصویر کلیک کنید تا ویرایش کنید</span>
  </div>
  <div style="display:flex;gap:0.7rem;">
    <button onclick="gggAdmin.exportContent()" style="background:rgba(201,168,76,0.15);color:#C9A84C;border:1px solid rgba(201,168,76,0.4);padding:0.3rem 0.8rem;border-radius:6px;font-family:Vazirmatn,sans-serif;font-size:0.75rem;cursor:pointer;">خروجی JSON</button>
    <label style="background:rgba(29,158,117,0.15);color:#1D9E75;border:1px solid rgba(29,158,117,0.4);padding:0.3rem 0.8rem;border-radius:6px;font-size:0.75rem;cursor:pointer;">
      ورودی JSON
      <input type="file" accept=".json" style="display:none" onchange="gggAdmin.importContent(this)">
    </label>
    <button onclick="gggAdmin.resetContent()" style="background:rgba(255,60,60,0.1);color:#ff6b6b;border:1px solid rgba(255,60,60,0.3);padding:0.3rem 0.8rem;border-radius:6px;font-family:Vazirmatn,sans-serif;font-size:0.75rem;cursor:pointer;">بازنشانی</button>
    <button onclick="gggAdmin.logout()" style="background:rgba(255,255,255,0.05);color:#8A9BB5;border:1px solid rgba(255,255,255,0.15);padding:0.3rem 0.8rem;border-radius:6px;font-family:Vazirmatn,sans-serif;font-size:0.75rem;cursor:pointer;">خروج</button>
  </div>
</div>

<!-- Login Modal -->
<div id="admin-login-modal" class="admin-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:10000;align-items:center;justify-content:center;">
  <div style="background:#0F1E38;border:1px solid rgba(201,168,76,0.3);border-radius:16px;padding:2.5rem;width:100%;max-width:400px;font-family:Vazirmatn,sans-serif;">
    <h3 style="color:#fff;margin-bottom:1.5rem;text-align:center;">ورود به پنل مدیریت</h3>
    <div style="margin-bottom:1.2rem;">
      <label style="display:block;color:#8A9BB5;font-size:0.85rem;margin-bottom:0.5rem;">رمز عبور</label>
      <input id="admin-pass-input" type="password" placeholder="رمز عبور را وارد کنید" style="width:100%;padding:0.75rem 1rem;background:rgba(255,255,255,0.05);border:1px solid rgba(201,168,76,0.3);border-radius:8px;color:#fff;font-family:Vazirmatn,sans-serif;font-size:0.95rem;outline:none;direction:rtl;">
    </div>
    <div style="display:flex;gap:1rem;">
      <button onclick="gggAdmin.attemptLogin()" style="flex:1;background:linear-gradient(135deg,#C9A84C,#A07C2E);color:#0A1628;padding:0.75rem;border:none;border-radius:8px;font-family:Vazirmatn,sans-serif;font-weight:700;font-size:0.95rem;cursor:pointer;">ورود</button>
      <button onclick="document.getElementById('admin-login-modal').style.display='none'" style="flex:1;background:rgba(255,255,255,0.05);color:#8A9BB5;padding:0.75rem;border:1px solid rgba(255,255,255,0.15);border-radius:8px;font-family:Vazirmatn,sans-serif;font-size:0.95rem;cursor:pointer;">انصراف</button>
    </div>
  </div>
</div>

<!-- Text Editor Modal -->
<div id="admin-editor-modal" class="admin-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:10000;align-items:center;justify-content:center;">
  <div style="background:#0F1E38;border:1px solid rgba(201,168,76,0.3);border-radius:16px;padding:2.5rem;width:100%;max-width:600px;font-family:Vazirmatn,sans-serif;">
    <h3 style="color:#fff;margin-bottom:0.5rem;">ویرایش محتوا</h3>
    <p id="editor-field-name" style="color:#C9A84C;font-size:0.85rem;margin-bottom:1.2rem;"></p>
    <textarea id="admin-editor-textarea" rows="8" style="width:100%;padding:1rem;background:rgba(255,255,255,0.05);border:1px solid rgba(201,168,76,0.3);border-radius:8px;color:#fff;font-family:Vazirmatn,sans-serif;font-size:0.95rem;direction:rtl;resize:vertical;outline:none;line-height:1.7;"></textarea>
    <div style="display:flex;gap:1rem;margin-top:1.2rem;">
      <button onclick="gggAdmin.saveEditorContent()" style="flex:1;background:linear-gradient(135deg,#C9A84C,#A07C2E);color:#0A1628;padding:0.75rem;border:none;border-radius:8px;font-family:Vazirmatn,sans-serif;font-weight:700;cursor:pointer;">ذخیره</button>
      <button onclick="gggAdmin.closeEditorModal()" style="flex:1;background:rgba(255,255,255,0.05);color:#8A9BB5;padding:0.75rem;border:1px solid rgba(255,255,255,0.15);border-radius:8px;font-family:Vazirmatn,sans-serif;cursor:pointer;">انصراف</button>
    </div>
  </div>
</div>

<!-- Image Editor Modal -->
<div id="admin-image-modal" class="admin-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:10000;align-items:center;justify-content:center;">
  <div style="background:#0F1E38;border:1px solid rgba(201,168,76,0.3);border-radius:16px;padding:2.5rem;width:100%;max-width:500px;font-family:Vazirmatn,sans-serif;">
    <h3 style="color:#fff;margin-bottom:1.5rem;">تغییر تصویر</h3>
    <div style="margin-bottom:1rem;">
      <label style="display:block;color:#8A9BB5;font-size:0.85rem;margin-bottom:0.5rem;">آدرس URL تصویر</label>
      <input id="image-url-input" type="url" placeholder="https://..." style="width:100%;padding:0.75rem 1rem;background:rgba(255,255,255,0.05);border:1px solid rgba(201,168,76,0.3);border-radius:8px;color:#fff;font-family:Vazirmatn,sans-serif;font-size:0.9rem;outline:none;direction:ltr;">
    </div>
    <div style="margin-bottom:1.2rem;text-align:center;">
      <span style="color:#8A9BB5;font-size:0.8rem;">یا</span>
    </div>
    <label style="display:flex;align-items:center;justify-content:center;gap:0.7rem;background:rgba(29,158,117,0.1);border:1px dashed rgba(29,158,117,0.3);border-radius:8px;padding:1rem;cursor:pointer;color:#1D9E75;font-size:0.9rem;">
      📁 آپلود فایل از رایانه
      <input type="file" accept="image/*" style="display:none" onchange="gggAdmin.handleImageFileUpload(this)">
    </label>
    <div style="display:flex;gap:1rem;margin-top:1.5rem;">
      <button onclick="gggAdmin.saveImageUrl()" style="flex:1;background:linear-gradient(135deg,#C9A84C,#A07C2E);color:#0A1628;padding:0.75rem;border:none;border-radius:8px;font-family:Vazirmatn,sans-serif;font-weight:700;cursor:pointer;">ذخیره</button>
      <button onclick="gggAdmin.closeImageModal()" style="flex:1;background:rgba(255,255,255,0.05);color:#8A9BB5;padding:0.75rem;border:1px solid rgba(255,255,255,0.15);border-radius:8px;font-family:Vazirmatn,sans-serif;cursor:pointer;">انصراف</button>
    </div>
  </div>
</div>

<!-- Toast -->
<div id="admin-toast" style="display:none;position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#1D9E75;color:#fff;padding:0.75rem 1.5rem;border-radius:8px;font-family:Vazirmatn,sans-serif;font-size:0.9rem;z-index:10001;box-shadow:0 4px 16px rgba(0,0,0,0.3);"></div>

<!-- Admin Access Button (floating) -->
<button id="open-admin-btn" title="پنل مدیریت (Ctrl+Shift+A)" style="position:fixed;bottom:2rem;right:1.5rem;width:48px;height:48px;background:rgba(10,22,40,0.9);border:1px solid rgba(201,168,76,0.3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;cursor:pointer;z-index:999;transition:all 0.3s ease;" onmouseover="this.style.borderColor='#C9A84C'" onmouseout="this.style.borderColor='rgba(201,168,76,0.3)'">⚙</button>
`;

// Inject components
document.addEventListener('DOMContentLoaded', () => {
  // Inject navbar
  const navContainer = document.getElementById('navbar-container');
  if (navContainer) navContainer.innerHTML = NAV_HTML;

  // Inject footer
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) footerContainer.innerHTML = FOOTER_HTML;

  // Inject admin UI
  const adminContainer = document.getElementById('admin-ui-container');
  if (adminContainer) adminContainer.innerHTML = ADMIN_UI_HTML;

  // Add top padding when admin bar is active
  const observer = new MutationObserver(() => {
    const adminBar = document.getElementById('admin-bar');
    if (adminBar && adminBar.style.display !== 'none') {
      document.body.style.paddingTop = '44px';
    } else {
      document.body.style.paddingTop = '0';
    }
  });

  setTimeout(() => {
    const adminBar = document.getElementById('admin-bar');
    if (adminBar) observer.observe(adminBar, { attributes: true, attributeFilter: ['style'] });
  }, 100);
});
