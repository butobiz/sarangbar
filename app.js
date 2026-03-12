import { signInWithCustomToken, signInAnonymously, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth, db, googleProvider, appId } from "./firebase.js";

let currentUser = null;
let isViewMode = false;

// --- KONSTANTA & TEMA ---
const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: 'instagram', hoverColor: 'group-hover:text-pink-500', shadow: 'hover:shadow-pink-500/20' },
  { id: 'twitter', name: 'Twitter / X', icon: 'twitter', hoverColor: 'group-hover:text-sky-400', shadow: 'hover:shadow-sky-400/20' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube', hoverColor: 'group-hover:text-red-500', shadow: 'hover:shadow-red-500/20' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook', hoverColor: 'group-hover:text-blue-500', shadow: 'hover:shadow-blue-500/20' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', hoverColor: 'group-hover:text-blue-400', shadow: 'hover:shadow-blue-400/20' },
  { id: 'github', name: 'GitHub', icon: 'github', hoverColor: 'group-hover:text-white', shadow: 'hover:shadow-white/20' },
  { id: 'mail', name: 'Email', icon: 'mail', hoverColor: 'group-hover:text-emerald-400', shadow: 'hover:shadow-emerald-400/20' },
  { id: 'globe', name: 'Website', icon: 'globe', hoverColor: 'group-hover:text-indigo-400', shadow: 'hover:shadow-indigo-400/20' },
  { id: 'tiktok', name: 'TikTok', icon: 'music', hoverColor: 'group-hover:text-cyan-400', shadow: 'hover:shadow-cyan-400/20' }
];

const CARD_THEMES = [
  { id: 'dark', card: 'bg-slate-800/60 border-slate-700', glow: 'bg-gradient-to-r from-slate-600 to-slate-500 opacity-40', color: '#1e293b', label: 'Dark' },
  { id: 'indigo', card: 'bg-indigo-950/60 border-indigo-500/30', glow: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-80', color: '#312e81', label: 'Indigo Glow' },
  { id: 'rose', card: 'bg-rose-950/60 border-rose-500/30', glow: 'bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 opacity-80', color: '#881337', label: 'Rose Glow' },
  { id: 'emerald', card: 'bg-emerald-950/60 border-emerald-500/30', glow: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 opacity-80', color: '#064e3b', label: 'Emerald Glass' },
  { id: 'sunset', card: 'bg-orange-950/60 border-orange-500/30', glow: 'bg-gradient-to-r from-orange-500 via-red-500 to-yellow-400 opacity-80', color: '#7c2d12', label: 'Sunset Vibe' },
  { id: 'cyberpunk', card: 'bg-fuchsia-950/60 border-fuchsia-500/30', glow: 'bg-gradient-to-r from-fuchsia-600 via-pink-500 to-cyan-400 opacity-80', color: '#4a044e', label: 'Cyberpunk' },
  { id: 'amethyst', card: 'bg-purple-950/60 border-purple-500/30', glow: 'bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-400 opacity-80', color: '#3b0764', label: 'Amethyst' },
  { id: 'ocean', card: 'bg-cyan-950/60 border-cyan-500/30', glow: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-400 opacity-80', color: '#083344', label: 'Ocean Breeze' },
  { id: 'gold', card: 'bg-amber-950/60 border-amber-500/30', glow: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 opacity-80', color: '#78350f', label: 'Gold Luxury' },
  { id: 'ghost', card: 'bg-black/40 border-white/10', glow: 'bg-gradient-to-r from-white/20 via-slate-300/20 to-white/20 opacity-30', color: '#000000', label: 'Midnight Ghost' }
];

const THEME_OPTIONS = [
  { class: 'bg-slate-800/80 text-white backdrop-blur-md', color: '#1e293b' },
  { class: 'bg-slate-100/90 text-slate-900 backdrop-blur-md', color: '#f1f5f9' },
  { class: 'bg-indigo-600/80 text-white backdrop-blur-md', color: '#4f46e5' },
  { class: 'bg-rose-600/80 text-white backdrop-blur-md', color: '#e11d48' },
  { class: 'bg-emerald-600/80 text-white backdrop-blur-md', color: '#059669' },
  { class: 'bg-orange-500/80 text-white backdrop-blur-md', color: '#f97316' },
  { class: 'bg-fuchsia-600/80 text-white backdrop-blur-md', color: '#c026d3' },
  { class: 'bg-purple-600/80 text-white backdrop-blur-md', color: '#9333ea' },
  { class: 'bg-cyan-600/80 text-white backdrop-blur-md', color: '#0891b2' },
  { class: 'bg-black/40 border border-white/20 text-white backdrop-blur-md', color: '#000000' }
];

// --- STATE APLIKASI ---
let state = {
  profile: { name: "Pengguna Baru", bio: "Halo! Ini adalah profil Sarangbar baruku.", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Halo", cardThemeId: "indigo" },
  appConfig: { backgroundImage: "" },
  socials: [ { id: 101, platform: 'instagram', url: 'https://instagram.com' } ],
  links: [ 
    { id: 1, title: "Website Utama", url: "https://example.com", image: "", theme: "bg-indigo-600/80 text-white backdrop-blur-md", tag: "Main" },
    { id: 2, title: "Portofolio", url: "https://example.com", image: "", theme: "bg-slate-800/80 text-white backdrop-blur-md", tag: "Kerja" }
  ],
  editingLinkId: null, 
  tempProfileThemeId: "indigo", 
  activeModalTab: "profile",
  activeCategoryTab: "Semua" 
};

// --- FUNGSI SHARE & TOAST ---
function showToast(msg) {
  const toast = document.getElementById('toast-message');
  toast.innerHTML = `<i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i><span>${msg}</span>`;
  lucide.createIcons();
  toast.classList.remove('opacity-0', 'translate-y-4');
  setTimeout(() => { toast.classList.add('opacity-0', 'translate-y-4'); }, 3000);
}

function fallbackCopy(text) {
  const textArea = document.createElement("textarea"); textArea.value = text;
  textArea.style.position = "fixed"; document.body.appendChild(textArea);
  textArea.focus(); textArea.select();
  try { document.execCommand('copy'); showToast("Link Profil berhasil disalin! 🚀"); } catch (err) { showToast("Gagal menyalin link."); }
  document.body.removeChild(textArea);
}

window.shareProfile = function() {
  if(!currentUser) return;
  const shareUrl = window.location.origin + window.location.pathname + '?v=' + currentUser.uid;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(shareUrl).then(() => { showToast("Link Profil berhasil disalin! 🚀"); }).catch(() => fallbackCopy(shareUrl));
  } else { fallbackCopy(shareUrl); }
};

// --- FUNGSI AKUN & GOOGLE LOGIN ---
window.loginWithGoogle = async function() {
  if(isViewMode) return;
  try {
    const btn = document.getElementById('btn-google-login');
    if(btn) btn.innerHTML = "Tunggu...";
    await signInWithPopup(auth, googleProvider);
    showToast("Login berhasil! Data aman 🚀");
  } catch (error) {
    console.error("Login gagal:", error);
    showToast("Gagal memuat login Google.");
    const btn = document.getElementById('btn-google-login');
    if(btn) btn.innerHTML = "Login Ulang";
  }
};

window.logoutAccount = async function() {
  if(isViewMode) return;
  try {
    await signOut(auth);
    await signInAnonymously(auth); 
    showToast("Berhasil logout dari akun.");
  } catch (error) {
    console.error("Logout gagal:", error);
  }
};

// --- SISTEM CLOUD (FIRESTORE DATABASE) ---
async function saveStateToCloud() {
  if (!currentUser || isViewMode) return;
  const cloudData = { profile: state.profile, appConfig: state.appConfig, socials: state.socials, links: state.links };
  const docRef = doc(db, 'profiles', currentUser.uid);
  try { await setDoc(docRef, cloudData); } catch (err) { console.error("Gagal menyimpan:", err); }
}

// --- OTENTIKASI & MULTI-TENANT ---
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Jika benar-benar kosong (belum ada sesi), baru eksekusi login Anonim
    try {
      await signInAnonymously(auth);
    } catch(e) { 
      console.error("Auth error:", e); 
      const cloudStatus = document.getElementById('cloud-status');
      if (cloudStatus) {
          cloudStatus.innerHTML = `<i data-lucide="wifi-off" class="w-3 h-3"></i> Offline`;
          cloudStatus.className = "absolute top-4 left-4 text-[10px] font-bold text-rose-400 bg-rose-400/10 px-3 py-1.5 rounded-full border border-rose-400/20 backdrop-blur-md flex items-center gap-1.5 transition-opacity duration-300";
      }
      showToast("Mode Offline aktif.");
      lucide.createIcons();
      window.renderApp(); 
    }
    return; // Hentikan eksekusi di sini, biarkan onAuthStateChanged terpanggil lagi otomatis setelah login anonim sukses
  }

  // Jika kode sampai ke sini, berarti user SUDAH login (baik via Google atau Anonim)
  currentUser = user;
  
  const btnGoogle = document.getElementById('btn-google-login');
  const btnLogout = document.getElementById('btn-logout');
  const statusText = document.getElementById('account-status-text');
  
  if (btnGoogle && btnLogout && statusText) {
    if (!user.isAnonymous) {
      btnGoogle.classList.add('hidden');
      btnLogout.classList.remove('hidden');
      statusText.innerText = user.email || "Terhubung dengan Google";
    } else {
      btnGoogle.classList.remove('hidden');
      btnLogout.classList.add('hidden');
      statusText.innerText = "Anonim (Tamu)";
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const viewUserId = urlParams.get('v');
  isViewMode = !!viewUserId && viewUserId !== user.uid;
  const targetUserId = viewUserId || user.uid;

  const docRef = doc(db, 'profiles', targetUserId);
  
  onSnapshot(docRef, (snapshot) => {
    document.getElementById('cloud-status')?.classList.add('opacity-0'); 
    
    if (snapshot.exists()) {
      const data = snapshot.data(); 
      state.profile = data.profile || state.profile; 
      state.appConfig = data.appConfig || state.appConfig;
      state.socials = data.socials || state.socials; 
      state.links = data.links || state.links;
      window.renderApp();
    } else {
      if (isViewMode) {
        document.getElementById('display-name').innerText = "Profil Tidak Ditemukan";
        document.getElementById('display-bio').innerText = "Tautan ini mungkin sudah kadaluarsa atau salah ketik.";
      } else {
        saveStateToCloud(); 
        window.renderApp();
      }
    }
  }, (error) => { console.error("Cloud Error:", error); window.renderApp(); });
});

// --- FUNGSI UTILITAS: KOMPRESI GAMBAR ---
window.handleImageUpload = function(inputElement, maxWidth, callback, isBackground = false) {
  if(isViewMode) return; 
  const file = inputElement.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image(); img.src = e.target.result;
    img.onload = function() {
      try {
        const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
        let sWidth = img.width, sHeight = img.height, sx = 0, sy = 0, dWidth = img.width, dHeight = img.height;
        if (isBackground) {
          const targetRatio = 9 / 16, imgRatio = sWidth / sHeight;
          if (imgRatio > targetRatio) { sWidth = sHeight * targetRatio; sx = (img.width - sWidth) / 2; } 
          else { sHeight = sWidth / targetRatio; sy = (img.height - sHeight) / 2; }
          if (sWidth > maxWidth) { dWidth = maxWidth; dHeight = maxWidth / targetRatio; } else { dWidth = sWidth; dHeight = sHeight; }
        } else {
          if (sWidth > maxWidth) { dHeight = Math.round((sHeight * maxWidth) / sWidth); dWidth = maxWidth; }
        }
        canvas.width = dWidth; canvas.height = dHeight;
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);
        callback(canvas.toDataURL('image/jpeg', isBackground ? 0.7 : 0.6));
      } catch (error) { console.error("Komp error:", error); } finally { inputElement.value = ""; }
    };
  };
  reader.readAsDataURL(file);
};

window.updateAvatarData = function(base64) { document.getElementById('edit-avatar-preview').src = base64; state.profile.avatar = base64; saveStateToCloud(); window.renderApp(); };
window.updateBackgroundData = function(base64) { state.appConfig.backgroundImage = base64; saveStateToCloud(); window.applyBackground(); };
window.resetBackground = function() { state.appConfig.backgroundImage = ""; saveStateToCloud(); window.applyBackground(); };
window.uploadLinkImage = function(input, linkId) { window.handleImageUpload(input, 300, (base64) => { window.updateLink(linkId, { image: base64 }); }); };
window.removeLinkImage = function(linkId) { window.updateLink(linkId, { image: "" }); };

// --- RENDER MESIN ---
window.renderApp = function() {
  window.applyBackground();
  const elName = document.getElementById('display-name'), elBio = document.getElementById('display-bio'), elAvatar = document.getElementById('display-avatar');
  if (elName) elName.innerText = state.profile.name;
  if (elBio) elBio.innerText = state.profile.bio;
  if (elAvatar) elAvatar.src = state.profile.avatar;

  const profileCard = document.getElementById('profile-card'), profileGlow = document.getElementById('profile-glow');
  if (profileCard && profileGlow) {
    CARD_THEMES.forEach(t => { if(t.card) profileCard.classList.remove(...t.card.split(' ')); if(t.glow) profileGlow.classList.remove(...t.glow.split(' ')); });
    const selectedTheme = CARD_THEMES.find(t => t.id === state.profile.cardThemeId) || CARD_THEMES[0];
    profileCard.classList.add(...selectedTheme.card.split(' '));
    profileGlow.classList.add(...selectedTheme.glow.split(' '));
  }

  const btnSettings = document.getElementById('btn-settings'), btnShare = document.getElementById('btn-share'), btnAddLink = document.getElementById('btn-add-link');
  if (isViewMode) {
    if(btnSettings) btnSettings.classList.add('hidden');
    if(btnShare) btnShare.classList.add('hidden');
    if(btnAddLink) btnAddLink.classList.replace('flex', 'hidden'); 
  } else {
    if(btnSettings) btnSettings.classList.remove('hidden');
    if(btnShare) btnShare.classList.remove('hidden');
    if(btnAddLink) btnAddLink.classList.replace('hidden', 'flex');
  }

  window.renderSocials(); 
  window.renderCategories(); 
  window.renderLinks();
};

window.applyBackground = function() {
  const mobileBg = document.getElementById('mobile-bg-layer'), ambientBg = document.getElementById('desktop-ambient-bg');
  if (!mobileBg || !ambientBg) return;
  if (state.appConfig.backgroundImage) {
    mobileBg.classList.remove('bg-dark-pattern'); mobileBg.style.backgroundImage = `url(${state.appConfig.backgroundImage})`;
    ambientBg.style.backgroundImage = `url(${state.appConfig.backgroundImage})`;
  } else {
    mobileBg.style.backgroundImage = ''; mobileBg.classList.add('bg-dark-pattern'); ambientBg.style.backgroundImage = '';
  }
};

window.renderSocials = function() {
  const container = document.getElementById('socials-container');
  if (!container) return; container.innerHTML = "";
  state.socials.forEach(soc => {
    const platform = SOCIAL_PLATFORMS.find(p => p.id === soc.platform) || SOCIAL_PLATFORMS[0];
    const a = document.createElement('a');
    a.href = soc.url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.title = platform.name;
    a.className = `p-3 rounded-full bg-slate-800/40 border border-slate-700/50 backdrop-blur-md text-slate-300 transition-all duration-300 group hover:-translate-y-1 hover:bg-slate-800 shadow-sm ${platform.shadow}`;
    a.innerHTML = `<i data-lucide="${platform.icon}" class="w-5 h-5 transition-colors duration-300 ${platform.hoverColor}"></i>`;
    container.appendChild(a);
  });
  lucide.createIcons();
};

window.renderCategories = function() {
  const wrapper = document.getElementById('categories-wrapper');
  const container = document.getElementById('categories-container');
  if (!wrapper || !container) return;

  const tags = [...new Set(state.links.map(l => l.tag).filter(t => t && t.trim() !== ''))];
  if (tags.length === 0) { wrapper.classList.add('hidden'); return; }
  wrapper.classList.remove('hidden'); container.innerHTML = "";

  const allTabs = ['Semua', ...tags];
  allTabs.forEach(tab => {
    const isActive = state.activeCategoryTab === tab;
    const btn = document.createElement('button');
    btn.onclick = () => window.setCategoryTab(tab);
    btn.className = `snap-center shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 backdrop-blur-md border ${
      isActive 
        ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-105' 
        : 'bg-slate-800/50 text-slate-400 border-white/5 hover:bg-slate-700/50 hover:text-slate-200'
    }`;
    btn.innerText = tab;
    container.appendChild(btn);
  });
};

window.setCategoryTab = function(tab) {
  state.activeCategoryTab = tab;
  window.renderCategories();
  window.renderLinks();
};

window.validateActiveTab = function() {
  const tags = [...new Set(state.links.map(l => l.tag).filter(t => t && t.trim() !== ''))];
  if (state.activeCategoryTab !== 'Semua' && !tags.includes(state.activeCategoryTab)) {
    state.activeCategoryTab = 'Semua';
  }
};

window.renderLinks = function() {
  const container = document.getElementById('links-container');
  if(!container) return; container.innerHTML = "";
  
  const filteredLinks = state.activeCategoryTab === 'Semua' ? state.links : state.links.filter(l => l.tag === state.activeCategoryTab);

  filteredLinks.forEach((link) => {
    const linkDiv = document.createElement('div'); linkDiv.className = "relative group";
    const originalIndex = state.links.findIndex(l => l.id === link.id);
    const isFirst = originalIndex === 0, isLast = originalIndex === state.links.length - 1;
    const disableSort = state.activeCategoryTab !== 'Semua';

    if (state.editingLinkId === link.id && !isViewMode) {
      const themeBtns = THEME_OPTIONS.map(theme => `<button onclick="window.updateLink(${link.id}, {theme: '${theme.class}'})" class="w-6 h-6 rounded-full border-2 transition-all ${link.theme === theme.class ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}" style="background-color: ${theme.color}"></button>`).join('');
      const photoArea = link.image ? `<img src="${link.image}" class="w-10 h-10 rounded-lg object-cover bg-slate-700 border border-slate-600"><button onclick="window.removeLinkImage(${link.id})" class="text-xs bg-rose-900/50 text-rose-300 px-3 py-2 rounded-lg hover:bg-rose-900">Hapus</button>` : `<button onclick="document.getElementById('link-img-upload-${link.id}').click()" class="text-xs bg-slate-700 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-600 flex gap-1 items-center"><i data-lucide="image" class="w-3 h-3"></i> Tambah Foto</button>`;

      linkDiv.innerHTML = `
        <div class="bg-slate-800 rounded-2xl p-5 shadow-lg border border-slate-700 animate-in fade-in duration-200">
          <div class="flex justify-between items-center mb-4"><h3 class="font-semibold text-sm text-slate-400">Edit Tautan</h3>
            <div class="flex items-center gap-1">
              <button onclick="window.moveLinkUp(${link.id})" class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent" ${isFirst || disableSort ? 'disabled' : ''}><i data-lucide="chevron-up" class="w-4 h-4"></i></button>
              <button onclick="window.moveLinkDown(${link.id})" class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent" ${isLast || disableSort ? 'disabled' : ''}><i data-lucide="chevron-down" class="w-4 h-4"></i></button>
              <div class="w-px h-4 bg-slate-700 mx-1"></div>
              <button onclick="window.cancelEdit()" class="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>
          </div>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2"><label class="text-xs font-semibold text-slate-500 uppercase block mb-1">Judul</label><input type="text" value="${link.title}" onchange="window.updateLink(${link.id}, {title: this.value})" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-indigo-500"/></div>
              <div class="col-span-2"><label class="text-xs font-semibold text-slate-500 uppercase block mb-1">URL</label><input type="url" value="${link.url}" onchange="window.updateLink(${link.id}, {url: this.value})" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-indigo-500"/></div>
              <div class="col-span-2"><label class="text-xs font-semibold text-slate-500 uppercase block mb-1">Label / Kategori</label><input type="text" value="${link.tag || ''}" onchange="window.updateLink(${link.id}, {tag: this.value})" placeholder="Opsional (Otomatis jadi Tab Kategori)" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-indigo-500"/></div>
            </div>
            <div class="mt-2"><label class="text-xs font-semibold text-slate-500 uppercase block mb-1">Foto Tautan</label><div class="flex items-center gap-2">${photoArea}<input type="file" id="link-img-upload-${link.id}" class="hidden" accept="image/*" onchange="window.uploadLinkImage(this, ${link.id})"></div></div>
            <div><label class="text-xs font-semibold text-slate-500 uppercase block mb-2">Tema Warna</label><div class="flex flex-wrap gap-2">${themeBtns}</div></div>
            <div class="flex gap-2 pt-3 mt-3 border-t border-slate-700">
              <button onclick="window.cancelEdit()" class="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 flex justify-center items-center gap-2"><i data-lucide="save" class="w-4 h-4"></i> Selesai</button>
              <button onclick="window.deleteLink(${link.id})" class="p-2 bg-rose-900/30 text-rose-400 rounded-lg hover:bg-rose-900/60"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
          </div>
        </div>`;
    } else {
      const imgHtml = link.image ? `<img src="${link.image}" class="w-full h-full object-cover rounded-[0.9rem]" />` : `<i data-lucide="link-2" class="w-6 h-6 opacity-80"></i>`;
      const tagHtml = link.tag ? `<span class="inline-block text-[10px] font-extrabold text-white/90 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full uppercase tracking-wider w-fit mb-1.5 shadow-sm">${link.tag}</span>` : '';
      const editButtonHtml = !isViewMode ? `<button onclick="window.editLink(${link.id})" class="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/10 backdrop-blur-md text-white rounded-full shadow-sm opacity-0 group-hover/btn:opacity-100 transition-opacity hover:bg-white hover:text-indigo-600 z-20"><i data-lucide="edit-3" class="w-4 h-4"></i></button>` : '';

      linkDiv.innerHTML = `
        <div class="relative group/btn animate-in fade-in slide-in-from-bottom-2 duration-300">
          <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="relative block w-full rounded-[1.5rem] p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/20 border border-white/10 ${link.theme} flex items-center group-hover/btn:pr-14 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
            <div class="w-14 h-14 rounded-2xl bg-black/20 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5 shadow-inner relative z-10 transition-transform duration-300 group-hover/btn:scale-105 group-hover/btn:rotate-3">${imgHtml}</div>
            <div class="ml-4 flex-grow text-left pr-8 flex flex-col justify-center relative z-10">${tagHtml}<div class="font-bold text-lg leading-tight tracking-wide">${link.title}</div></div>
            <div class="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 group-hover/btn:text-white group-hover/btn:translate-x-1 group-hover/btn:-translate-y-2 transition-all duration-300"><i data-lucide="arrow-up-right" class="w-5 h-5"></i></div>
          </a>
          ${editButtonHtml}
        </div>`;
    }
    container.appendChild(linkDiv);
  });
  lucide.createIcons();
};

window.addNewLink = function() { if(isViewMode) return; state.links.unshift({ id: Date.now(), title: "Tautan Baru", url: "https://", image: "", theme: THEME_OPTIONS[0].class, tag: "" }); state.editingLinkId = state.links[0].id; state.activeCategoryTab = 'Semua'; saveStateToCloud(); window.renderCategories(); window.renderLinks(); };
window.editLink = function(id) { if(isViewMode) return; state.editingLinkId = id; window.renderLinks(); };
window.cancelEdit = function() { state.editingLinkId = null; window.renderLinks(); };
window.updateLink = function(id, data) { const i = state.links.findIndex(l => l.id === id); if(i > -1) { state.links[i] = { ...state.links[i], ...data }; window.validateActiveTab(); saveStateToCloud(); window.renderCategories(); window.renderLinks(); } };
window.deleteLink = function(id) { state.links = state.links.filter(l => l.id !== id); state.editingLinkId = null; window.validateActiveTab(); saveStateToCloud(); window.renderCategories(); window.renderLinks(); };
window.moveLinkUp = function(id) { const i = state.links.findIndex(l => l.id === id); if (i > 0) { const temp = state.links[i]; state.links[i] = state.links[i - 1]; state.links[i - 1] = temp; saveStateToCloud(); window.renderLinks(); } };
window.moveLinkDown = function(id) { const i = state.links.findIndex(l => l.id === id); if (i > -1 && i < state.links.length - 1) { const temp = state.links[i]; state.links[i] = state.links[i + 1]; state.links[i + 1] = temp; saveStateToCloud(); window.renderLinks(); } };

window.renderSocialSettingsList = function() {
  const container = document.getElementById('social-settings-list'); container.innerHTML = "";
  state.socials.forEach(soc => {
    const div = document.createElement('div'); div.className = "bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col gap-3";
    let selectOptions = SOCIAL_PLATFORMS.map(p => `<option value="${p.id}" ${soc.platform === p.id ? 'selected' : ''}>${p.name}</option>`).join('');
    div.innerHTML = `
      <div class="flex gap-3">
        <div class="w-1/3"><select onchange="window.updateSocialData(${soc.id}, 'platform', this.value)" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-indigo-500 appearance-none">${selectOptions}</select></div>
        <div class="w-2/3 flex gap-2"><input type="url" value="${soc.url}" placeholder="URL" onchange="window.updateSocialData(${soc.id}, 'url', this.value)" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-indigo-500" /><button onclick="window.removeSocial(${soc.id})" class="p-2 bg-rose-900/30 text-rose-400 rounded-lg hover:bg-rose-900/60" title="Hapus"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>
      </div>`;
    container.appendChild(div);
  });
  lucide.createIcons();
};

window.addNewSocial = function() { if(isViewMode) return; state.socials.push({ id: Date.now(), platform: 'instagram', url: 'https://' }); window.renderSocialSettingsList(); window.renderSocials(); saveStateToCloud(); };
window.updateSocialData = function(id, key, value) { const i = state.socials.findIndex(s => s.id === id); if(i > -1) { state.socials[i][key] = value; window.renderSocials(); saveStateToCloud(); } };
window.removeSocial = function(id) { state.socials = state.socials.filter(s => s.id !== id); window.renderSocialSettingsList(); window.renderSocials(); saveStateToCloud(); };

window.switchModalTab = function(tabId) {
  state.activeModalTab = tabId;
  const bp = document.getElementById('tab-btn-profile'), bs = document.getElementById('tab-btn-socials');
  const cp = document.getElementById('tab-content-profile'), cs = document.getElementById('tab-content-socials'), fs = document.getElementById('modal-footer-save');
  bp.className = bs.className = "flex-1 py-3 text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-300 transition-colors";
  cp.classList.add('hidden'); cs.classList.add('hidden'); fs.classList.add('hidden'); 
  if (tabId === 'profile') { bp.className = "flex-1 py-3 text-sm font-semibold border-b-2 border-indigo-500 text-indigo-400 transition-colors"; cp.classList.remove('hidden'); fs.classList.remove('hidden'); } 
  else { bs.className = "flex-1 py-3 text-sm font-semibold border-b-2 border-indigo-500 text-indigo-400 transition-colors"; cs.classList.remove('hidden'); window.renderSocialSettingsList(); }
};

window.renderProfileThemes = function() {
  const container = document.getElementById('profile-theme-options'); if(!container) return; container.innerHTML = "";
  CARD_THEMES.forEach(theme => {
    const btn = document.createElement('button');
    btn.className = `w-8 h-8 rounded-full border-2 transition-all ${state.tempProfileThemeId === theme.id ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`;
    btn.style.backgroundColor = theme.color; btn.title = theme.label;
    btn.onclick = () => { state.tempProfileThemeId = theme.id; window.renderProfileThemes(); };
    container.appendChild(btn);
  });
};

window.openSettings = function() {
  if(isViewMode) return;
  const elN = document.getElementById('edit-name'), elB = document.getElementById('edit-bio'), elA = document.getElementById('edit-avatar-preview'), m = document.getElementById('settings-modal'), mc = document.getElementById('settings-modal-content');
  if(elN) elN.value = state.profile.name; if(elB) elB.value = state.profile.bio; if(elA) elA.src = state.profile.avatar;
  state.tempProfileThemeId = state.profile.cardThemeId; window.renderProfileThemes(); window.switchModalTab('profile');
  if(m && mc) { m.classList.remove('hidden'); m.classList.add('flex'); setTimeout(() => { m.classList.remove('opacity-0'); mc.classList.remove('scale-95'); }, 10); }
};

window.closeSettings = function() {
  const m = document.getElementById('settings-modal'), mc = document.getElementById('settings-modal-content');
  if(m && mc) { m.classList.add('opacity-0'); mc.classList.add('scale-95'); setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300); }
};

window.saveProfileSettings = function() {
  const elN = document.getElementById('edit-name'), elB = document.getElementById('edit-bio');
  if(elN) state.profile.name = elN.value; if(elB) state.profile.bio = elB.value;
  state.profile.cardThemeId = state.tempProfileThemeId;
  window.closeSettings(); window.renderApp(); saveStateToCloud();
};

// --- TILT 3D EFEK ---
const tiltCard = document.getElementById('profile-tilt-wrapper');
let isTicking = false;
if (tiltCard) {
  tiltCard.addEventListener('mousemove', (e) => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        const rect = tiltCard.getBoundingClientRect(), x = e.clientX - rect.left - rect.width / 2, y = e.clientY - rect.top - rect.height / 2;
        tiltCard.style.transform = `perspective(1000px) rotateX(${-(y / rect.height) * 20}deg) rotateY(${(x / rect.width) * 20}deg) scale(1.02)`;
        tiltCard.style.transition = 'none';
        isTicking = false;
      });
      isTicking = true;
    }
  });
  tiltCard.addEventListener('mouseleave', () => { tiltCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`; tiltCard.style.transition = 'transform 0.5s ease-out'; });
}

// --- INISIALISASI ICON GLOBAL ---
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
});
