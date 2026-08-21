/**
 * GUITAR BY QUANG — admin.js
 * Controller cho trang admin-dashboard.html
 * Quản lý CRUD bài hát (fetch, create, update, delete) qua Firebase Service
 */

import { onAuthChange, logoutAdmin } from './firebase-auth-service.js';
import { fetchAllSongs, createSong, updateSong, deleteSong } from './firebase-service.js';

let currentSongsList = [];

// ============================================================
// 1. ROUTE GUARD (Kiểm tra phiên đăng nhập)
// ============================================================
onAuthChange((user) => {
  if (!user) {
    window.location.href = 'admin-login.html';
  } else {
    const emailEl = document.getElementById('admin-user-email');
    if (emailEl) emailEl.textContent = user.email || 'Admin';
  }
});

// Toast notification helper
function showAdminToast(message, isSuccess = true) {
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('opacity-0', '-translate-y-4', 'pointer-events-none');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
  }, 3000);
}

// Modal Form Toggle
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
// 2. RENDER BẢNG BÀI HÁT
// ============================================================
function renderSongsTable(songs) {
  const tbody = document.getElementById('songs-table-body');
  const statTotal = document.getElementById('stat-total');
  const statFree = document.getElementById('stat-free');
  const statPaid = document.getElementById('stat-paid');

  if (statTotal) statTotal.textContent = songs.length;
  if (statFree) statFree.textContent = songs.filter(s => s.isFree).length;
  if (statPaid) statPaid.textContent = songs.filter(s => !s.isFree).length;

  if (!tbody) return;

  if (!songs || songs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-[#8C827A]">
          Chưa có bài hát nào trong kho. Hãy bấm "+ Thêm Bài Hát Mới" để tạo nhé!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = songs.map((song, index) => {
    const isFree = Boolean(song.isFree);
    const badgeType = isFree
      ? '<span class="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black uppercase">FREE</span>'
      : '<span class="px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-900 border border-orange-300 text-[10px] font-black uppercase">BÁN</span>';

    return `
      <tr class="hover:bg-[#F7F4F0] transition-colors border-b border-[#E3DBD0] group">
        <td class="py-4 px-4 text-center font-mono font-bold text-[#70655B]">${index + 1}</td>
        <td class="py-4 px-4">
          <div class="font-black text-[#1A1614] text-sm group-hover:text-terracotta transition-colors">${song.title}</div>
          <div class="text-[11px] font-mono text-[#8C827A] font-semibold">ID: ${song.id}</div>
        </td>
        <td class="py-4 px-4 text-[#4A4036] font-bold">${song.category || 'Nhạc Việt'}</td>
        <td class="py-4 px-4">
          <span class="font-black text-terracotta">${song.level || '4/10'}</span>
        </td>
        <td class="py-4 px-4">${badgeType}</td>
        <td class="py-4 px-4 font-mono font-black text-[#1A1614] text-sm">${isFree ? '0đ' : (song.priceFormatted || '239.000đ')}</td>
        <td class="py-4 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="handleEditSong('${song.id}')" class="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-extrabold text-xs transition-colors cursor-pointer shadow-xs">
              Sửa
            </button>
            <button onclick="handleDeleteSong('${song.id}', '${song.title.replace(/'/g, "\\'")}')" class="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-extrabold text-xs transition-colors cursor-pointer shadow-xs">
              Xóa
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
// 3. EDIT & DELETE HANDLERS
// ============================================================
window.handleEditSong = function(songId) {
  const song = currentSongsList.find(s => s.id === songId);
  if (!song) return;

  const modalTitle = document.getElementById('modal-form-title');
  const saveBtnText = document.getElementById('save-btn-text');
  if (modalTitle) modalTitle.textContent = `Chỉnh Sửa: ${song.title}`;
  if (saveBtnText) saveBtnText.textContent = 'Lưu Thay Đổi';

  document.getElementById('form-song-id').value = song.id;
  document.getElementById('form-title').value = song.title || '';
  document.getElementById('form-category').value = song.category || 'Nhạc Việt';
  document.getElementById('form-level').value = song.level || '4/10';
  document.getElementById('form-levelNum').value = song.levelNum || 4;

  const isFree = Boolean(song.isFree);
  document.getElementById('form-isFree').checked = isFree;
  document.getElementById('form-price').value = song.price || 0;
  document.getElementById('form-priceFormatted').value = song.priceFormatted || (isFree ? 'Miễn phí' : '239.000đ');
  document.getElementById('form-discountNote').value = song.discountNote || '';

  document.getElementById('form-tuning').value = song.tuning || 'Standard';
  document.getElementById('form-duration').value = song.duration || '03:30';
  document.getElementById('form-capo').value = song.capo || 'Không kẹp';
  document.getElementById('form-tempo').value = song.tempo || '~95 BPM';
  document.getElementById('form-description').value = song.description || '';

  document.getElementById('form-hasDemo').checked = Boolean(song.hasDemo);
  document.getElementById('form-videoDemo').value = song.videoDemo || '';
  document.getElementById('form-targetUrl').value = song.targetUrl || '';
  document.getElementById('form-buttonType').value = song.buttonType || (isFree ? 'link' : 'buy');
  document.getElementById('form-buttonText').value = song.buttonText || (isFree ? 'Tải video tab' : 'Mua Video Tab');
  document.getElementById('form-thumbnailBg').value = song.thumbnailBg || 'from-[#C1602F] to-[#6E3B1F]';

  toggleSongModal(true);
};

window.handleDeleteSong = async function(songId, songTitle) {
  const ok = confirm(`Bạn có chắc chắn muốn xóa bài "${songTitle}" (ID: ${songId}) khỏi Firestore không?\nHành động này không thể hoàn tác.`);
  if (!ok) return;

  const res = await deleteSong(songId);
  if (res.success) {
    showAdminToast(`Đã xóa bài hát "${songTitle}" thành công!`);
    await loadSongs();
  } else {
    showAdminToast(res.error || 'Lỗi khi xóa bài hát', false);
  }
};
// ============================================================
// 4. DOM READY EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadSongs();

  // Đăng xuất
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logoutAdmin();
      window.location.href = 'admin-login.html';
    });
  }

  // Nút Làm mới
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadSongs();
      showAdminToast('Đã làm mới danh sách bài hát');
    });
  }

  // Tìm kiếm nhanh
  const searchInput = document.getElementById('admin-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        renderSongsTable(currentSongsList);
        return;
      }
      const filtered = currentSongsList.filter(s =>
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.id && s.id.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
      );
      renderSongsTable(filtered);
    });
  }

  // Mở Form Thêm Mới
  const addSongBtn = document.getElementById('add-song-btn');
  if (addSongBtn) {
    addSongBtn.addEventListener('click', () => {
      const form = document.getElementById('song-form');
      if (form) form.reset();
      document.getElementById('form-song-id').value = '';
      document.getElementById('modal-form-title').textContent = 'Thêm Bài Hát Mới';
      document.getElementById('save-btn-text').textContent = 'Thêm Bài Hát';
      document.getElementById('form-isFree').checked = false;
      document.getElementById('form-hasDemo').checked = true;
      document.getElementById('form-category').value = 'Nhạc Việt';
      document.getElementById('form-level').value = '4/10';
      document.getElementById('form-levelNum').value = 4;
      document.getElementById('form-price').value = 239000;
      document.getElementById('form-priceFormatted').value = '239.000đ';
      document.getElementById('form-discountNote').value = '';
      document.getElementById('form-tuning').value = 'Standard';
      document.getElementById('form-duration').value = '03:30';
      document.getElementById('form-capo').value = 'Không kẹp';
      document.getElementById('form-tempo').value = '~95 BPM';
      document.getElementById('form-description').value = '';
      document.getElementById('form-videoDemo').value = '';
      document.getElementById('form-targetUrl').value = '';
      document.getElementById('form-buttonType').value = 'buy';
      document.getElementById('form-buttonText').value = 'Mua Video Tab';
      document.getElementById('form-thumbnailBg').value = 'from-[#C1602F] to-[#6E3B1F]';
      toggleSongModal(true);
    });
  }

  // Đóng Modal
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelFormBtn = document.getElementById('cancel-form-btn');
  const modal = document.getElementById('song-form-modal');
  if (closeModalBtn) closeModalBtn.addEventListener('click', () => toggleSongModal(false));
  if (cancelFormBtn) cancelFormBtn.addEventListener('click', () => toggleSongModal(false));
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) toggleSongModal(false);
    });
  }

  // Tự động điều chỉnh khi tick "Miễn phí"
  const isFreeCheck = document.getElementById('form-isFree');
  if (isFreeCheck) {
    isFreeCheck.addEventListener('change', (e) => {
      const isFree = e.target.checked;
      const priceFormattedInput = document.getElementById('form-priceFormatted');
      const buttonTypeSelect = document.getElementById('form-buttonType');
      const buttonTextInput = document.getElementById('form-buttonText');

      if (isFree) {
        if (priceFormattedInput) priceFormattedInput.value = 'Miễn phí';
        if (buttonTypeSelect) buttonTypeSelect.value = 'link';
        if (buttonTextInput) buttonTextInput.value = 'Tải video tab (Miễn phí)';
      } else {
        if (priceFormattedInput) priceFormattedInput.value = '239.000đ';
        if (buttonTypeSelect) buttonTypeSelect.value = 'buy';
        if (buttonTextInput) buttonTextInput.value = 'Mua Video Tab';
      }
    });
  }

  // Submit Form (Create / Update)
  const songForm = document.getElementById('song-form');
  if (songForm) {
    songForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const songId = document.getElementById('form-song-id').value;
      const isEdit = Boolean(songId);

      const title = document.getElementById('form-title').value.trim();
      if (!title) {
        alert('Vui lòng nhập tên bài hát nhé!');
        return;
      }

      const songData = {
        title,
        category: document.getElementById('form-category').value.trim() || 'Nhạc Việt',
        level: document.getElementById('form-level').value.trim() || '4/10',
        levelNum: Number(document.getElementById('form-levelNum').value) || 4,
        isFree: document.getElementById('form-isFree').checked,
        price: Number(document.getElementById('form-price').value) || 0,
        priceFormatted: document.getElementById('form-priceFormatted').value.trim() || 'Miễn phí',
        discountNote: document.getElementById('form-discountNote').value.trim(),
        tuning: document.getElementById('form-tuning').value.trim() || 'Standard',
        duration: document.getElementById('form-duration').value.trim() || '03:30',
        capo: document.getElementById('form-capo').value.trim() || 'Không kẹp',
        tempo: document.getElementById('form-tempo').value.trim() || '~95 BPM',
        description: document.getElementById('form-description').value.trim(),
        hasDemo: document.getElementById('form-hasDemo').checked,
        videoDemo: document.getElementById('form-videoDemo').value.trim(),
        targetUrl: document.getElementById('form-targetUrl').value.trim(),
        buttonType: document.getElementById('form-buttonType').value,
        buttonText: document.getElementById('form-buttonText').value.trim() || 'Mua Video Tab',
        thumbnailBg: document.getElementById('form-thumbnailBg').value
      };

      const saveBtn = document.getElementById('save-song-btn');
      const saveBtnText = document.getElementById('save-btn-text');
      const saveSpinner = document.getElementById('save-spinner');

      if (saveBtn) saveBtn.disabled = true;
      if (saveBtnText) saveBtnText.classList.add('hidden');
      if (saveSpinner) saveSpinner.classList.remove('hidden');

      let res;
      if (isEdit) {
        res = await updateSong(songId, songData);
      } else {
        res = await createSong(songData);
      }

      if (saveBtn) saveBtn.disabled = false;
      if (saveBtnText) saveBtnText.classList.remove('hidden');
      if (saveSpinner) saveSpinner.classList.add('hidden');

      if (res.success) {
        toggleSongModal(false);
        showAdminToast(isEdit ? 'Đã cập nhật bài hát thành công!' : `Đã thêm bài hát "${title}" thành công!`);
        await loadSongs();
      } else {
        showAdminToast(res.error || 'Có lỗi xảy ra, vui lòng thử lại.', false);
      }
    });
  }
});
