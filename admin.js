/**
 * GUITAR BY QUANG - admin.js
 * Controller cho trang admin-dashboard.html
 * Tich hop: Segmented Toggle Free/Paid, auto-computed schema fields, Firebase Storage upload.
 */

import { onAuthChange, logoutAdmin } from './firebase-auth-service.js';
import { fetchAllSongs, createSong, updateSong, deleteSong, uploadMediaFile } from './firebase-service.js';

let currentSongsList = [];

// Auto-computed defaults theo loai bai
const FREE_DEFAULTS = {
  isFree: true,
  price: 0,
  priceFormatted: '0d',
  discountNote: '',
  buttonType: 'free_modal',
  buttonText: 'Xem Video Tab',
  thumbnailBg: 'bg-gradient-to-br from-charcoal to-[#231e1b]',
};

const PAID_DEFAULTS = {
  isFree: false,
  targetUrl: '',
  buttonType: 'checkout_modal',
  buttonText: 'Xem chi tiet \u2192',
  thumbnailBg: 'bg-gradient-to-br from-[#2D2421] to-[#1C1614]',
};

// ============================================================
// 1. ROUTE GUARD
// ============================================================
onAuthChange((user) => {
  if (!user) {
    window.location.href = 'admin-login.html';
  } else {
    const emailEl = document.getElementById('admin-user-email');
    if (emailEl) emailEl.textContent = user.email || 'Admin';
  }
});

// ============================================================
// TOAST
// ============================================================
function showAdminToast(message, isSuccess = true) {
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  const icon = toast.querySelector('svg');
  if (icon) {
    icon.classList.toggle('text-emerald-400', isSuccess);
    icon.classList.toggle('text-rose-400', !isSuccess);
  }
  toast.classList.remove('opacity-0', '-translate-y-4', 'pointer-events-none');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
  }, 3500);
}

// ============================================================
// MODAL TOGGLE
// ============================================================
function toggleSongModal(show) {
  const modal = document.getElementById('song-form-modal');
  if (!modal) return;
  modal.classList.toggle('opacity-0', !show);
  modal.classList.toggle('pointer-events-none', !show);
  modal.classList.toggle('opacity-100', show);
  const dialog = modal.querySelector('.modal-dialog');
  if (dialog) {
    dialog.classList.toggle('scale-95', !show);
    dialog.classList.toggle('scale-100', show);
  }
}

// ============================================================
// SEGMENTED TOGGLE - Free vs Paid UI
// ============================================================
function setTabType(isFree) {
  const freeBtn    = document.getElementById('toggle-free-btn');
  const paidBtn    = document.getElementById('toggle-paid-btn');
  const branchFree = document.getElementById('branch-free');
  const branchPaid = document.getElementById('branch-paid');
  const isFreeHidden = document.getElementById('form-isFree');

  if (!freeBtn || !paidBtn) return;

  if (isFree) {
    freeBtn.className = 'tab-type-btn px-5 py-2.5 text-xs font-black flex items-center gap-1.5 transition-colors duration-200 bg-emerald-600 text-white';
    paidBtn.className = 'tab-type-btn px-5 py-2.5 text-xs font-black flex items-center gap-1.5 transition-colors duration-200 bg-white text-[#5C5147] hover:bg-[#F4EFEA]';
    branchFree?.classList.remove('hidden');
    branchPaid?.classList.add('hidden');
  } else {
    paidBtn.className = 'tab-type-btn px-5 py-2.5 text-xs font-black flex items-center gap-1.5 transition-colors duration-200 bg-amber-600 text-white';
    freeBtn.className = 'tab-type-btn px-5 py-2.5 text-xs font-black flex items-center gap-1.5 transition-colors duration-200 bg-white text-[#5C5147] hover:bg-[#F4EFEA]';
    branchFree?.classList.add('hidden');
    branchPaid?.classList.remove('hidden');
  }

  if (isFreeHidden) isFreeHidden.value = isFree ? 'true' : 'false';
}

// ============================================================
// 2. RENDER BANG BAI HAT
// ============================================================
function renderSongsTable(songs) {
  const tbody    = document.getElementById('songs-table-body');
  const statTotal = document.getElementById('stat-total');
  const statFree  = document.getElementById('stat-free');
  const statPaid  = document.getElementById('stat-paid');

  if (statTotal) statTotal.textContent = songs.length;
  if (statFree)  statFree.textContent  = songs.filter(s => s.isFree).length;
  if (statPaid)  statPaid.textContent  = songs.filter(s => !s.isFree).length;

  if (!tbody) return;

  if (!songs || songs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-[#8C827A]">
          Chua co bai hat nao trong kho. Hay bam "+ Them Bai Hat Moi" de tao nhe!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = songs.map((song, index) => {
    const isFree = Boolean(song.isFree);
    const badgeType = isFree
      ? '<span class="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black uppercase">FREE</span>'
      : '<span class="px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-900 border border-orange-300 text-[10px] font-black uppercase">BAN</span>';

    return `
      <tr class="hover:bg-[#F7F4F0] transition-colors border-b border-[#E3DBD0] group">
        <td class="py-4 px-4 text-center font-mono font-bold text-[#70655B]">${index + 1}</td>
        <td class="py-4 px-4">
          <div class="font-black text-[#1A1614] text-sm group-hover:text-terracotta transition-colors">${song.title}</div>
          <div class="text-[11px] font-mono text-[#8C827A] font-semibold">ID: ${song.id}</div>
        </td>
        <td class="py-4 px-4 text-[#4A4036] font-bold">${song.category || 'Nhac Viet'}</td>
        <td class="py-4 px-4">
          <span class="font-black text-terracotta">${song.level || '4/10'}</span>
        </td>
        <td class="py-4 px-4">${badgeType}</td>
        <td class="py-4 px-4 font-mono font-black text-[#1A1614] text-sm">${isFree ? '0d' : (song.priceFormatted || '239.000d')}</td>
        <td class="py-4 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="handleEditSong('${song.id}')" class="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-extrabold text-xs transition-colors cursor-pointer shadow-xs">
              Sua
            </button>
            <button onclick="handleDeleteSong('${song.id}', '${song.title.replace(/'/g, "\\'")}')" class="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-extrabold text-xs transition-colors cursor-pointer shadow-xs">
              Xoa
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadSongs() {
  const songs = await fetchAllSongs();
  currentSongsList = songs;
  renderSongsTable(songs);
}

// ============================================================
// FORM RESET HELPER
// ============================================================
function resetFormForNew() {
  const form = document.getElementById('song-form');
  if (form) form.reset();

  document.getElementById('form-song-id').value        = '';
  document.getElementById('form-category').value       = 'Nhac Viet';
  document.getElementById('form-level').value          = '4/10';
  document.getElementById('form-levelNum').value       = 4;
  document.getElementById('form-tuning').value         = 'Standard';
  document.getElementById('form-duration').value       = '03:30';
  document.getElementById('form-capo').value           = 'Khong kep';
  document.getElementById('form-tempo').value          = '~95 BPM';
  document.getElementById('form-description').value    = '';
  document.getElementById('form-hasDemo').checked      = true;
  document.getElementById('form-videoDemo').value      = '';
  document.getElementById('form-targetUrl').value      = '';
  document.getElementById('form-price').value          = 239000;
  document.getElementById('form-priceFormatted').value = '239.000d';
  document.getElementById('form-discountNote').value   = '';

  setTabType(true);
}

// ============================================================
// 3. EDIT & DELETE HANDLERS
// ============================================================
window.handleEditSong = function(songId) {
  const song = currentSongsList.find(s => s.id === songId);
  if (!song) return;

  document.getElementById('modal-form-title').textContent = 'Chinh Sua: ' + song.title;
  document.getElementById('save-btn-text').textContent    = 'Luu Thay Doi';

  document.getElementById('form-song-id').value         = song.id;
  document.getElementById('form-title').value           = song.title || '';
  document.getElementById('form-category').value        = song.category || 'Nhac Viet';
  document.getElementById('form-level').value           = song.level || '4/10';
  document.getElementById('form-levelNum').value        = song.levelNum || 4;
  document.getElementById('form-tuning').value          = song.tuning || 'Standard';
  document.getElementById('form-duration').value        = song.duration || '03:30';
  document.getElementById('form-capo').value            = song.capo || 'Khong kep';
  document.getElementById('form-tempo').value           = song.tempo || '~95 BPM';
  document.getElementById('form-description').value     = song.description || '';
  document.getElementById('form-hasDemo').checked       = Boolean(song.hasDemo);
  document.getElementById('form-videoDemo').value       = song.videoDemo || '';
  document.getElementById('form-targetUrl').value       = song.targetUrl || '';
  document.getElementById('form-price').value           = song.price || 0;
  document.getElementById('form-priceFormatted').value  = song.priceFormatted || '239.000d';
  document.getElementById('form-discountNote').value    = song.discountNote || '';

  setTabType(Boolean(song.isFree));
  toggleSongModal(true);
};

window.handleDeleteSong = async function(songId, songTitle) {
  const ok = confirm('Ban co chac chan muon xoa bai "' + songTitle + '" (ID: ' + songId + ') khoi Firestore khong?\nHanh dong nay khong the hoan tac.');
  if (!ok) return;

  const res = await deleteSong(songId);
  if (res.success) {
    showAdminToast('Da xoa bai hat "' + songTitle + '" thanh cong!');
    await loadSongs();
  } else {
    showAdminToast(res.error || 'Loi khi xoa bai hat', false);
  }
};

// ============================================================
// UPLOAD HELPER
// ============================================================
function setupUploadButton(btnId, fileInputId, urlInputId, progressId, progressTextId, progressBarId, folder) {
  const btn       = document.getElementById(btnId);
  const fileInput = document.getElementById(fileInputId);
  const urlInput  = document.getElementById(urlInputId);
  const progressWrapper = document.getElementById(progressId);
  const progressText    = document.getElementById(progressTextId);
  const progressBar     = document.getElementById(progressBarId);

  if (!btn || !fileInput) return;

  btn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (progressWrapper) progressWrapper.classList.remove('hidden');
    if (progressText) progressText.textContent = 'Dang tai len... 0%';
    if (progressBar)  progressBar.style.width = '0%';
    btn.disabled = true;
    btn.textContent = 'dang tai...';

    const result = await uploadMediaFile(file, folder, (pct) => {
      if (progressText) progressText.textContent = 'Dang tai len... ' + pct + '%';
      if (progressBar)  progressBar.style.width = pct + '%';
    });

    btn.disabled = false;
    btn.textContent = 'Upload';
    fileInput.value = '';

    if (result.success) {
      if (urlInput) urlInput.value = result.url;
      if (progressWrapper) progressWrapper.classList.add('hidden');
      showAdminToast('Upload thanh cong! URL da duoc dien tu dong');
    } else {
      if (progressWrapper) progressWrapper.classList.add('hidden');
      showAdminToast(result.error || 'Upload that bai, thu lai nhe.', false);
    }
  });
}

// ============================================================
// 4. DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadSongs();

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logoutAdmin();
      window.location.href = 'admin-login.html';
    });
  }

  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadSongs();
      showAdminToast('Da lam moi danh sach bai hat');
    });
  }

  const searchInput = document.getElementById('admin-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) { renderSongsTable(currentSongsList); return; }
      const filtered = currentSongsList.filter(s =>
        (s.title    && s.title.toLowerCase().includes(q)) ||
        (s.id       && s.id.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
      );
      renderSongsTable(filtered);
    });
  }

  const addSongBtn = document.getElementById('add-song-btn');
  if (addSongBtn) {
    addSongBtn.addEventListener('click', () => {
      resetFormForNew();
      document.getElementById('modal-form-title').textContent = 'Them Bai Hat Moi';
      document.getElementById('save-btn-text').textContent    = 'Them Bai Hat';
      toggleSongModal(true);
    });
  }

  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelFormBtn = document.getElementById('cancel-form-btn');
  const modal         = document.getElementById('song-form-modal');
  if (closeModalBtn) closeModalBtn.addEventListener('click', () => toggleSongModal(false));
  if (cancelFormBtn) cancelFormBtn.addEventListener('click', () => toggleSongModal(false));
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) toggleSongModal(false);
    });
  }

  const toggleFreeBtn = document.getElementById('toggle-free-btn');
  const togglePaidBtn = document.getElementById('toggle-paid-btn');
  if (toggleFreeBtn) toggleFreeBtn.addEventListener('click', () => setTabType(true));
  if (togglePaidBtn) togglePaidBtn.addEventListener('click', () => setTabType(false));

  setupUploadButton('upload-demo-btn', 'upload-demo-file', 'form-videoDemo',
    'upload-demo-progress', 'upload-demo-progress-text', 'upload-demo-bar', 'videos');
  setupUploadButton('upload-tab-btn', 'upload-tab-file', 'form-targetUrl',
    'upload-tab-progress', 'upload-tab-progress-text', 'upload-tab-bar', 'videos');

  const songForm = document.getElementById('song-form');
  if (songForm) {
    songForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const songId = document.getElementById('form-song-id').value;
      const isEdit = Boolean(songId);
      const title  = document.getElementById('form-title').value.trim();

      if (!title) {
        alert('Vui long nhap ten bai hat nhe!');
        return;
      }

      const isFree = document.getElementById('form-isFree').value === 'true';

      const autoFields = isFree
        ? {
            isFree: true,
            price: 0,
            priceFormatted: '0d',
            discountNote: '',
            buttonType: FREE_DEFAULTS.buttonType,
            buttonText: FREE_DEFAULTS.buttonText,
            thumbnailBg: FREE_DEFAULTS.thumbnailBg,
          }
        : {
            isFree: false,
            targetUrl: '',
            buttonType: PAID_DEFAULTS.buttonType,
            buttonText: PAID_DEFAULTS.buttonText,
            thumbnailBg: PAID_DEFAULTS.thumbnailBg,
          };

      const priceVal          = isFree ? 0 : (Number(document.getElementById('form-price').value) || 239000);
      const priceFormattedVal = isFree ? '0d' : (document.getElementById('form-priceFormatted').value.trim() || '239.000d');
      const discountNoteVal   = isFree ? '' : (document.getElementById('form-discountNote').value.trim());
      const targetUrlVal      = isFree ? (document.getElementById('form-targetUrl').value.trim()) : '';

      const songData = {
        title,
        category:       document.getElementById('form-category').value.trim() || 'Nhac Viet',
        level:          document.getElementById('form-level').value.trim() || '4/10',
        levelNum:       Number(document.getElementById('form-levelNum').value) || 4,
        tuning:         document.getElementById('form-tuning').value.trim() || 'Standard',
        duration:       document.getElementById('form-duration').value.trim() || '03:30',
        capo:           document.getElementById('form-capo').value.trim() || 'Khong kep',
        tempo:          document.getElementById('form-tempo').value.trim() || '~95 BPM',
        description:    document.getElementById('form-description').value.trim(),
        hasDemo:        document.getElementById('form-hasDemo').checked,
        videoDemo:      document.getElementById('form-videoDemo').value.trim(),
        price:          priceVal,
        priceFormatted: priceFormattedVal,
        discountNote:   discountNoteVal,
        targetUrl:      targetUrlVal,
        ...autoFields,
      };

      const saveBtn     = document.getElementById('save-song-btn');
      const saveBtnText = document.getElementById('save-btn-text');
      const saveSpinner = document.getElementById('save-spinner');

      if (saveBtn)     saveBtn.disabled = true;
      if (saveBtnText) saveBtnText.classList.add('hidden');
      if (saveSpinner) saveSpinner.classList.remove('hidden');

      let res;
      if (isEdit) {
        res = await updateSong(songId, songData);
      } else {
        res = await createSong(songData);
      }

      if (saveBtn)     saveBtn.disabled = false;
      if (saveBtnText) saveBtnText.classList.remove('hidden');
      if (saveSpinner) saveSpinner.classList.add('hidden');

      if (res.success) {
        toggleSongModal(false);
        showAdminToast(isEdit
          ? 'Da cap nhat bai hat "' + title + '" thanh cong!'
          : 'Da them bai hat "' + title + '" thanh cong!'
        );
        await loadSongs();
      } else {
        showAdminToast(res.error || 'Co loi xay ra, vui long thu lai.', false);
      }
    });
  }
});
