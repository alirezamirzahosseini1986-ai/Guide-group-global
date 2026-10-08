/* ================================================
   Guide Group Global — Admin Panel
   localStorage-based CMS for text/images/videos
   ================================================ */

const ADMIN_KEY = 'ggg_admin_logged_in';
const CONTENT_KEY = 'ggg_content';
const ADMIN_PASS = 'guideglobal2024';

let adminMode = false;
let contentStore = {};
let activeField = null;

// ── LOAD SAVED CONTENT ──
function loadContent() {
  const stored = localStorage.getItem(CONTENT_KEY);
  if (stored) {
    try { contentStore = JSON.parse(stored); } catch(e) { contentStore = {}; }
  }
  applyContent();
}

function applyContent() {
  Object.entries(contentStore).forEach(([id, value]) => {
    const el = document.getElementById(id) || document.querySelector(`[data-content="${id}"]`) || document.querySelector(`[data-editable="${id}"]`);
    if (!el) return;
    if (el.tagName === 'IMG') {
      if (value) {
        el.src = value;
        el.style.display = 'block';
        // hide emoji avatar if photo exists
        const avatarId = id.replace('-photo', '-avatar');
        const avatar = document.getElementById(avatarId);
        if (avatar) avatar.style.display = 'none';
      }
    } else if (el.tagName === 'VIDEO') {
      el.src = value;
    } else if (el.classList && el.classList.contains('yt-embed')) {
      // YouTube embed container
      const ytId = extractYouTubeId(value);
      if (ytId) {
        el.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen style="width:100%;height:100%;border-radius:inherit;"></iframe>`;
      }
    } else {
      el.innerHTML = value;
    }
  });
}

function extractYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function saveContent(id, value) {
  contentStore[id] = value;
  localStorage.setItem(CONTENT_KEY, JSON.stringify(contentStore));
}

// ── ADMIN LOGIN ──
function checkAdminLogin() {
  return localStorage.getItem(ADMIN_KEY) === 'true';
}

function showLoginModal() {
  const modal = document.getElementById('admin-login-modal');
  if (modal) modal.style.display = 'flex';
}

function hideLoginModal() {
  const modal = document.getElementById('admin-login-modal');
  if (modal) modal.style.display = 'none';
}

function attemptLogin() {
  const input = document.getElementById('admin-pass-input');
  if (!input) return;
  if (input.value === ADMIN_PASS) {
    localStorage.setItem(ADMIN_KEY, 'true');
    hideLoginModal();
    enableAdminMode();
  } else {
    showAdminToast('رمز عبور اشتباه است', 'error');
    input.value = '';
    input.focus();
  }
}

function logout() {
  localStorage.removeItem(ADMIN_KEY);
  adminMode = false;
  document.body.classList.remove('admin-mode');
  document.getElementById('admin-bar') && (document.getElementById('admin-bar').style.display = 'none');
  showAdminToast('از حساب کاربری خارج شدید');
}

// ── ENABLE/DISABLE ADMIN MODE ──
function enableAdminMode() {
  adminMode = true;
  document.body.classList.add('admin-mode');
  const bar = document.getElementById('admin-bar');
  if (bar) bar.style.display = 'flex';
  setupEditableFields();
  showAdminToast('پنل مدیریت فعال شد — روی هر متن کلیک کنید تا ویرایش کنید');
}

function setupEditableFields() {
  // Text fields
  document.querySelectorAll('[data-content]').forEach(el => {
    if (!el.getAttribute('data-editable-init')) {
      el.setAttribute('data-editable-init', 'true');
      el.style.cursor = 'pointer';
      el.title = 'کلیک کنید تا ویرایش کنید';
      el.addEventListener('click', (e) => {
        if (adminMode) {
          e.preventDefault();
          e.stopPropagation();
          openEditor(el);
        }
      });
    }
  });

  // Image fields — including team photos (click on avatar emoji too)
  document.querySelectorAll('img[data-editable], .team-photo-wrap').forEach(el => {
    if (!el.getAttribute('data-editable-init')) {
      el.setAttribute('data-editable-init', 'true');
      el.style.cursor = 'pointer';
      el.title = 'کلیک کنید تا عکس را تغییر دهید';
      el.addEventListener('click', (e) => {
        if (adminMode) {
          e.preventDefault();
          e.stopPropagation();
          // find the img inside wrap, or the img itself
          const img = el.tagName === 'IMG' ? el : el.querySelector('img[data-editable]');
          if (img) openImageEditor(img);
        }
      });
    }
  });

  // YouTube embed fields
  document.querySelectorAll('.yt-embed[data-editable]').forEach(div => {
    if (!div.getAttribute('data-editable-init')) {
      div.setAttribute('data-editable-init', 'true');
      div.style.cursor = 'pointer';
      div.title = 'کلیک کنید تا ویدیوی یوتیوب را تنظیم کنید';
      div.addEventListener('click', (e) => {
        if (adminMode) {
          e.preventDefault();
          e.stopPropagation();
          openYouTubeEditor(div);
        }
      });
    }
  });
}

// ── TEXT EDITOR ──
function openEditor(el) {
  activeField = el;
  const modal = document.getElementById('admin-editor-modal');
  const textarea = document.getElementById('admin-editor-textarea');
  const isHTML = el.getAttribute('data-html') === 'true';
  if (!modal || !textarea) return;

  textarea.value = isHTML ? el.innerHTML : el.textContent;
  document.getElementById('editor-field-name').textContent = el.getAttribute('data-label') || el.id || 'محتوا';
  modal.style.display = 'flex';
  textarea.focus();
}

function saveEditorContent() {
  if (!activeField) return;
  const textarea = document.getElementById('admin-editor-textarea');
  const isHTML = activeField.getAttribute('data-html') === 'true';
  const value = textarea.value;
  if (isHTML) {
    activeField.innerHTML = value;
  } else {
    activeField.textContent = value;
  }
  const id = activeField.id || activeField.getAttribute('data-content');
  if (id) saveContent(id, value);
  closeEditorModal();
  showAdminToast('محتوا ذخیره شد ✓');
}

function closeEditorModal() {
  const modal = document.getElementById('admin-editor-modal');
  if (modal) modal.style.display = 'none';
  activeField = null;
}

// ── IMAGE EDITOR ──
function openImageEditor(img) {
  activeField = img;
  const modal = document.getElementById('admin-image-modal');
  if (!modal) return;
  document.getElementById('image-url-input').value = img.src;
  modal.style.display = 'flex';
}

function saveImageUrl() {
  if (!activeField) return;
  const url = document.getElementById('image-url-input').value.trim();
  if (!url) return;
  activeField.src = url;
  const id = activeField.id || activeField.getAttribute('data-editable');
  if (id) saveContent(id, url);
  closeImageModal();
  showAdminToast('تصویر به‌روزرسانی شد ✓');
}

function handleImageFileUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('image-url-input').value = e.target.result;
    if (activeField) {
      activeField.src = e.target.result;
      const id = activeField.id || activeField.getAttribute('data-editable');
      if (id) saveContent(id, e.target.result);
    }
    closeImageModal();
    showAdminToast('تصویر آپلود شد ✓');
  };
  reader.readAsDataURL(file);
}

function closeImageModal() {
  const modal = document.getElementById('admin-image-modal');
  if (modal) modal.style.display = 'none';
  activeField = null;
}

// ── YOUTUBE EDITOR ──
function openYouTubeEditor(div) {
  activeField = div;
  const modal = document.getElementById('admin-yt-modal');
  if (!modal) return;
  // try to extract existing URL from iframe if present
  const iframe = div.querySelector('iframe');
  const existingUrl = iframe ? iframe.src.replace('https://www.youtube.com/embed/', 'https://youtu.be/') : '';
  document.getElementById('yt-url-input').value = existingUrl;
  modal.style.display = 'flex';
}

function saveYouTubeUrl() {
  if (!activeField) return;
  const url = document.getElementById('yt-url-input').value.trim();
  if (!url) return;
  const ytId = extractYouTubeId(url);
  if (!ytId) { showAdminToast('لینک یوتیوب نامعتبر است', 'error'); return; }
  activeField.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen style="width:100%;height:100%;border-radius:inherit;"></iframe>`;
  const id = activeField.getAttribute('data-editable');
  if (id) saveContent(id, url);
  closeYTModal();
  showAdminToast('ویدیو اضافه شد ✓');
}

function closeYTModal() {
  const modal = document.getElementById('admin-yt-modal');
  if (modal) modal.style.display = 'none';
  activeField = null;
}

// ── TOAST ──
function showAdminToast(msg, type) {
  const toast = document.getElementById('admin-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'admin-toast ' + (type || 'success');
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// ── EXPORT / IMPORT ──
function exportContent() {
  const blob = new Blob([JSON.stringify(contentStore, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ggg-content-backup.json';
  a.click();
}

function importContent(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      contentStore = JSON.parse(e.target.result);
      localStorage.setItem(CONTENT_KEY, JSON.stringify(contentStore));
      applyContent();
      showAdminToast('محتوا وارد شد ✓');
    } catch(err) {
      showAdminToast('فایل نامعتبر', 'error');
    }
  };
  reader.readAsText(file);
}

function resetContent() {
  if (confirm('آیا مطمئن هستید؟ تمام تغییرات حذف می‌شود.')) {
    localStorage.removeItem(CONTENT_KEY);
    contentStore = {};
    location.reload();
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  loadContent();

  // Check if already logged in
  if (checkAdminLogin()) {
    enableAdminMode();
  }

  // Admin button in page (if exists)
  const adminBtn = document.getElementById('open-admin-btn');
  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      if (checkAdminLogin()) {
        enableAdminMode();
      } else {
        showLoginModal();
      }
    });
  }

  // Login modal enter key
  const passInput = document.getElementById('admin-pass-input');
  if (passInput) {
    passInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptLogin();
    });
  }

  // Close modals on backdrop click
  document.querySelectorAll('.admin-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        activeField = null;
      }
    });
  });

  // Keyboard shortcut: Ctrl+Shift+A to open admin
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      if (checkAdminLogin()) {
        enableAdminMode();
      } else {
        showLoginModal();
      }
    }
  });
});

// Expose to window
window.gggAdmin = {
  login: showLoginModal,
  logout,
  attemptLogin,
  saveEditorContent,
  closeEditorModal,
  saveImageUrl,
  closeImageModal,
  handleImageFileUpload,
  exportContent,
  importContent,
  resetContent,
  saveYouTubeUrl,
  closeYTModal
};
