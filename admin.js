/* G3 — Guide Group Global | Admin CMS v3 */
(function(){
'use strict';

const STORAGE_KEY = 'ggg_content';
const PASS = 'guideglobal2024';

let content = {};
let currentEditKey = null;
let currentEditType = null;

function loadContent(){
  try { content = JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'); } catch(e){ content={}; }
}

function saveContent(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

function applyContent(){
  loadContent();
  /* text elements */
  document.querySelectorAll('[data-content]').forEach(el=>{
    const k = el.getAttribute('data-content');
    if(content[k] !== undefined) el.innerHTML = content[k];
    if(localStorage.getItem('ggg_admin_logged_in')==='1'){
      el.classList.add('admin-editable');
      el.style.cursor='pointer';
      el.title='Click to edit';
      el.addEventListener('click', e=>{ e.stopPropagation(); openEditor(k, el.innerHTML); }, {once:false});
    }
  });
  /* image / video elements */
  document.querySelectorAll('[data-editable]').forEach(el=>{
    const k = el.getAttribute('data-editable');
    if(content[k]) {
      if(el.tagName==='IMG') el.src = content[k];
    }
    if(localStorage.getItem('ggg_admin_logged_in')==='1'){
      el.style.outline = '2px dashed var(--gold)';
      el.style.cursor = 'pointer';
      el.addEventListener('click', e=>{ e.stopPropagation(); openImageEditor(k); }, {once:false});
    }
  });
  /* youtube embeds */
  document.querySelectorAll('.yt-embed').forEach(el=>{
    const k = el.getAttribute('data-editable') || el.id;
    if(content[k]){
      el.innerHTML = `<iframe src="https://www.youtube.com/embed/${content[k]}" frameborder="0" allowfullscreen style="width:100%;aspect-ratio:16/9;border-radius:var(--radius-md)"></iframe>`;
    }
    if(localStorage.getItem('ggg_admin_logged_in')==='1'){
      el.style.outline = '2px dashed rgba(255,80,80,0.6)';
      el.style.cursor = 'pointer';
      el.addEventListener('click', e=>{ e.stopPropagation(); openYouTubeEditor(k); }, {once:false});
    }
  });
  /* team photos */
  document.querySelectorAll('.team-photo-wrap').forEach(wrap=>{
    const img = wrap.querySelector('img[data-editable]');
    if(!img) return;
    const k = img.getAttribute('data-editable');
    if(content[k]){
      img.src = content[k];
      img.style.display = '';
      const av = wrap.querySelector('.team-avatar');
      if(av) av.style.display = 'none';
    }
    if(localStorage.getItem('ggg_admin_logged_in')==='1'){
      wrap.style.outline = '2px dashed var(--gold)';
      wrap.style.cursor = 'pointer';
      wrap.addEventListener('click', e=>{ e.stopPropagation(); openImageEditor(k); }, {once:false});
    }
  });
}

/* ─── Text editor ──────────────────────────────────────────────── */
function openEditor(key, current){
  currentEditKey = key;
  currentEditType = 'text';
  const ta = document.getElementById('editor-textarea');
  if(ta) ta.value = current || '';
  document.getElementById('editor-modal').classList.add('open');
  setTimeout(()=> ta && ta.focus(), 100);
}
function saveEditorContent(){
  const val = document.getElementById('editor-textarea').value;
  content[currentEditKey] = val;
  saveContent();
  document.querySelectorAll(`[data-content="${currentEditKey}"]`).forEach(el=> el.innerHTML=val);
  closeEditorModal();
  showAdminToast('✓ Saved');
}
function closeEditorModal(){
  document.getElementById('editor-modal').classList.remove('open');
  currentEditKey = null;
}

/* ─── Image editor ─────────────────────────────────────────────── */
function openImageEditor(key){
  currentEditKey = key;
  currentEditType = 'image';
  const urlInput = document.getElementById('image-url-input');
  const preview = document.getElementById('image-preview');
  const previewWrap = document.getElementById('image-preview-wrap');
  if(urlInput) urlInput.value = content[key] || '';
  if(preview && content[key]){ preview.src=content[key]; previewWrap.style.display=''; }
  else if(previewWrap) previewWrap.style.display='none';
  document.getElementById('image-modal').classList.add('open');
}
function saveImageUrl(){
  const url = document.getElementById('image-url-input').value.trim();
  if(!url){ showAdminToast('⚠ Enter URL or upload file'); return; }
  content[currentEditKey] = url;
  saveContent();
  _applyImageKey(currentEditKey, url);
  closeImageModal();
  showAdminToast('✓ Image saved');
}
function handleImageFileUpload(input){
  if(input.files && input.files[0]) handleImageFileFromFile(input.files[0]);
}
function handleImageFileFromFile(file){
  const reader = new FileReader();
  reader.onload = e=>{
    const dataUrl = e.target.result;
    document.getElementById('image-url-input').value = dataUrl;
    const preview = document.getElementById('image-preview');
    const previewWrap = document.getElementById('image-preview-wrap');
    if(preview){ preview.src=dataUrl; previewWrap.style.display=''; }
  };
  reader.readAsDataURL(file);
}
function closeImageModal(){
  document.getElementById('image-modal').classList.remove('open');
  currentEditKey = null;
}
function _applyImageKey(k, url){
  document.querySelectorAll(`[data-editable="${k}"]`).forEach(el=>{
    if(el.tagName==='IMG'){ el.src=url; el.style.display=''; }
  });
  document.querySelectorAll('.team-photo-wrap').forEach(wrap=>{
    const img = wrap.querySelector(`img[data-editable="${k}"]`);
    if(img){
      img.src=url; img.style.display='';
      const av = wrap.querySelector('.team-avatar');
      if(av) av.style.display='none';
    }
  });
}

/* ─── YouTube editor ───────────────────────────────────────────── */
function openYouTubeEditor(key){
  currentEditKey = key;
  currentEditType = 'youtube';
  document.getElementById('yt-url-input').value = '';
  document.getElementById('yt-modal').classList.add('open');
  setTimeout(()=> document.getElementById('yt-url-input').focus(), 100);
}
function saveYouTubeUrl(){
  const raw = document.getElementById('yt-url-input').value.trim();
  const vid = extractYTId(raw);
  if(!vid){ showAdminToast('⚠ Invalid YouTube URL'); return; }
  content[currentEditKey] = vid;
  saveContent();
  const embed = document.querySelector(`.yt-embed[data-editable="${currentEditKey}"], #${currentEditKey}`);
  if(embed) embed.innerHTML = `<iframe src="https://www.youtube.com/embed/${vid}" frameborder="0" allowfullscreen style="width:100%;aspect-ratio:16/9;border-radius:var(--radius-md)"></iframe>`;
  closeYTModal();
  showAdminToast('✓ Video saved');
}
function extractYTId(url){
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : (url.length===11 ? url : null);
}
function closeYTModal(){
  document.getElementById('yt-modal').classList.remove('open');
  currentEditKey = null;
}

/* ─── Auth ─────────────────────────────────────────────────────── */
function login(){
  const input = document.getElementById('admin-password-input');
  if(input.value === PASS){
    localStorage.setItem('ggg_admin_logged_in','1');
    document.getElementById('admin-login-modal').classList.remove('open');
    document.getElementById('admin-bar').style.display='';
    input.value='';
    applyContent();
    showAdminToast('✓ Logged in');
  } else {
    input.style.borderColor='red';
    setTimeout(()=> input.style.borderColor='', 1000);
    showAdminToast('✗ Wrong password');
  }
}
function logout(){
  localStorage.removeItem('ggg_admin_logged_in');
  document.getElementById('admin-bar').style.display='none';
  document.querySelectorAll('.admin-editable').forEach(el=>{
    el.classList.remove('admin-editable');
    el.style.cursor='';
    el.title='';
  });
  showAdminToast('Logged out');
}

/* ─── Import / Export ──────────────────────────────────────────── */
function exportContent(){
  const data = JSON.stringify(content, null, 2);
  const a = document.createElement('a');
  a.href = 'data:application/json;charset=utf-8,'+encodeURIComponent(data);
  a.download = 'ggg-content-'+Date.now()+'.json';
  a.click();
}
function importContent(input){
  if(!input.files[0]) return;
  const r = new FileReader();
  r.onload = e=>{
    try{
      const d = JSON.parse(e.target.result);
      content = d;
      saveContent();
      applyContent();
      showAdminToast('✓ Imported');
    } catch(err){ showAdminToast('✗ Invalid JSON'); }
  };
  r.readAsText(input.files[0]);
}
function resetContent(){
  content={};
  saveContent();
  location.reload();
}

/* ─── Toast ────────────────────────────────────────────────────── */
function showAdminToast(msg){
  const t = document.getElementById('admin-toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 2200);
}

/* ─── Expose ────────────────────────────────────────────────────── */
window.gggAdmin = {
  loadContent, applyContent, saveContent,
  openEditor, saveEditorContent, closeEditorModal,
  openImageEditor, saveImageUrl, handleImageFileUpload, handleImageFileFromFile, closeImageModal,
  openYouTubeEditor, saveYouTubeUrl, closeYTModal,
  login, logout,
  exportContent, importContent, resetContent,
  showAdminToast
};

loadContent();

})();
