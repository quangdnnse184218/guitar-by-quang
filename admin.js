/**
 * GUITAR BY QUANG - admin.js
 * Controller cho trang admin-dashboard.html
 * Tich hop:
 * - CRUD Video Tab (songs collection)
 * - CRUD Bo Do Nghe (gears collection)
 * - Tab Switcher giua Kho Tab va Bo Do Nghe
 * - Auto-Clean Media Path: Tu dong chuan hoa khi copy path file tu may (VD: "D:\My_guitar_web\assets\capo.jpg" -> assets/capo.jpg)
 */

import { onAuthChange, logoutAdmin } from './firebase-auth-service.js';
import {
  fetchAllSongs, createSong, updateSong, deleteSong, swapSongsOrder,
  fetchAllGears, createGear, updateGear, deleteGear, swapGearsOrder,
  DEFAULT_GEARS
} from './firebase-service.js';

let currentSongsList = [];
let currentGearsList = [];

// ============================================================
// AUTO-CLEAN PATH HELPER
// Tu dong bien: "D:\My_guitar_web\assets\capo.jpg" -> "assets/capo.jpg"
// ============================================================
function cleanMediaPath(rawPath) {
  if (!rawPath) return '';
  let str = rawPath.trim();
  
  // Xoa dau ngoac kep/don o 2 dau
  str = str.replace(/^["']|["']$/g, '').trim();
  
  // Chuyen tat ca dau gach cheo nguoc \ thanh /
  str = str.replace(/\\/g, '/');

  // Neu nguoi dung copy path chua thu muc assets/ -> tu dong cat lay tu assets/...
  const lower = str.toLowerCase();
  const assetsIdx = lower.indexOf('assets/');
  if (assetsIdx !== -1) {
    str = str.substring(assetsIdx);
  }

  return str;
}

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
// TOAST NOTIFICATION
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
// MODAL TOGGLES
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

function toggleGearModal(show) {
  const modal = document.getElementById('gear-form-modal');
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
// SEGMENTED TOGGLE - Free vs Paid UI (cho Song)
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
// 2. RENDER BANG VIDEO TAB (SONGS)
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
        <td colspan="8" class="py-8 text-center text-[#8C827A]">
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

    const isFirst = index === 0;
    const isLast = index === songs.length - 1;
    const currentOrder = song.order !== undefined ? song.order : (index + 1);

    // Đánh dấu 3 bài đầu tiên sẽ lên mục Nổi Bật ở trang chủ
    const isFeatured = index < 3;
    const featuredTag = isFeatured
      ? `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-terracotta bg-terracotta/10 px-1.5 py-0.5 rounded border border-terracotta/20 mr-1.5" title="Top 3 bài hiển thị nổi bật ở trang chủ">★ Nổi Bật</span>`
      : '';

    return `
      <tr class="hover:bg-[#F7F4F0] transition-colors border-b border-[#E3DBD0] group ${isFeatured ? 'bg-amber-50/30' : ''}">
        <td class="py-4 px-4 text-center font-mono font-bold text-[#70655B]">${index + 1}</td>
        <td class="py-4 px-4">
          <div class="font-black text-[#1A1614] text-sm group-hover:text-terracotta transition-colors flex items-center flex-wrap gap-1">
            ${featuredTag}
            <span>${song.title}</span>
          </div>
          <div class="text-[11px] font-mono text-[#8C827A] font-semibold">ID: ${song.id}</div>
        </td>
        <td class="py-4 px-4 text-[#4A4036] font-bold">${song.category || 'Nhạc Việt'}</td>
        <td class="py-4 px-4">
          <span class="font-black text-terracotta">${song.level || '4/10'}</span>
        </td>
        <td class="py-4 px-4">${badgeType}</td>
        <td class="py-4 px-4 font-mono font-black text-[#1A1614] text-sm">${isFree ? '0đ' : (song.priceFormatted || '239.000đ')}</td>
        
        <!-- Cột Thứ Tự / Vị Trí với nút Lên / Xuống -->
        <td class="py-4 px-4 text-center">
          <div class="inline-flex items-center gap-1.5 bg-[#EAE4DC] px-2 py-1 rounded-xl border border-[#D6CFC4]">
            <button onclick="handleMoveSong('${song.id}', -1)" ${isFirst ? 'disabled' : ''} 
              class="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs transition-colors ${isFirst ? 'text-[#A89F95] cursor-not-allowed opacity-40' : 'bg-white text-charcoal hover:bg-terracotta hover:text-white cursor-pointer shadow-xs'}"
              title="Đẩy lên trên (tăng độ ưu tiên)">
              ▲
            </button>
            <span class="font-mono font-black text-xs text-charcoal min-w-[20px] text-center">${currentOrder}</span>
            <button onclick="handleMoveSong('${song.id}', 1)" ${isLast ? 'disabled' : ''} 
              class="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs transition-colors ${isLast ? 'text-[#A89F95] cursor-not-allowed opacity-40' : 'bg-white text-charcoal hover:bg-terracotta hover:text-white cursor-pointer shadow-xs'}"
              title="Đẩy xuống dưới">
              ▼
            </button>
          </div>
        </td>

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

// Di chuyển thứ tự bài hát (Lên / Xuống)
window.handleMoveSong = async function(songId, direction) {
  const idx = currentSongsList.findIndex(s => s.id === songId);
  if (idx === -1) return;
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= currentSongsList.length) return;

  const currentSong = currentSongsList[idx];
  const targetSong  = currentSongsList[targetIdx];

  const currentOrder = currentSong.order !== undefined ? currentSong.order : (idx + 1);
  const targetOrder  = targetSong.order !== undefined ? targetSong.order : (targetIdx + 1);

  const finalOrder1 = currentOrder === targetOrder ? (targetIdx + 1) : targetOrder;
  const finalOrder2 = currentOrder === targetOrder ? (idx + 1) : currentOrder;

  const res = await swapSongsOrder(currentSong.id, finalOrder1, targetSong.id, finalOrder2);
  if (res.success) {
    showAdminToast(`Đã chuyển vị trí bài "${currentSong.title}"!`);
    await loadSongs();
  } else {
    showAdminToast(res.error || 'Lỗi khi đổi vị trí', false);
  }
};

// ============================================================
// 3. RENDER BANG BO DO NGHE (GEARS)
// ============================================================
function renderGearsTable(gears) {
  const tbody = document.getElementById('gears-table-body');
  if (!tbody) return;

  if (!gears || gears.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-[#8C827A]">
          Chua co mon do nghe nao. Hay bam "Them Mon Do Nghe" hoac bam "Nap 4 Mon Mau" de khoi tao nhe!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = gears.map((gear, index) => {
    const buyInfo = gear.buyUrl
      ? `<a href="${gear.buyUrl}" target="_blank" class="inline-flex items-center gap-1 text-terracotta font-bold hover:underline truncate max-w-[220px]">
          <span>${gear.buyText || 'Link Mua'}</span>
          <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        </a>`
      : `<span class="text-xs text-[#70655B] italic">${gear.footerText || 'Tư vấn trực tiếp'}</span>`;

    const imgPreview = gear.image
      ? `<img src="${gear.image}" alt="${gear.title}" class="w-10 h-10 object-contain rounded-xl bg-[#EDE5D8] border border-[#D6CFC4] p-0.5 shadow-xs" onerror="this.src='assets/clover.jpg'" />`
      : `<div class="w-10 h-10 rounded-xl bg-[#EDE5D8] border border-[#D6CFC4] flex items-center justify-center text-base">🎸</div>`;

    const isFirst = index === 0;
    const isLast = index === gears.length - 1;
    const currentOrder = gear.order !== undefined ? gear.order : (index + 1);

    return `
      <tr class="hover:bg-[#F7F4F0] transition-colors border-b border-[#E3DBD0] group">
        <td class="py-4 px-4 text-center font-mono font-bold text-[#70655B]">${index + 1}</td>
        <td class="py-3 px-4 text-center">${imgPreview}</td>
        <td class="py-4 px-4">
          <div class="font-black text-[#1A1614] text-sm group-hover:text-terracotta transition-colors">${gear.title}</div>
          <div class="text-[11px] font-mono text-[#8C827A] font-semibold">ID: ${gear.id}</div>
        </td>
        <td class="py-4 px-4">
          <span class="px-2.5 py-0.5 rounded-md bg-[#EAE4DC] text-[#3A332C] border border-[#D6CFC4] text-[10px] font-extrabold uppercase">${gear.category || 'THIẾT BỊ'}</span>
        </td>
        <td class="py-4 px-4">${buyInfo}</td>
        
        <!-- Cột Thứ Tự / Vị Trí Đồ Nghề với nút Lên / Xuống -->
        <td class="py-4 px-4 text-center">
          <div class="inline-flex items-center gap-1.5 bg-[#EAE4DC] px-2 py-1 rounded-xl border border-[#D6CFC4]">
            <button onclick="handleMoveGear('${gear.id}', -1)" ${isFirst ? 'disabled' : ''} 
              class="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs transition-colors ${isFirst ? 'text-[#A89F95] cursor-not-allowed opacity-40' : 'bg-white text-charcoal hover:bg-terracotta hover:text-white cursor-pointer shadow-xs'}"
              title="Đẩy lên trước">
              ▲
            </button>
            <span class="font-mono font-black text-xs text-charcoal min-w-[20px] text-center">${currentOrder}</span>
            <button onclick="handleMoveGear('${gear.id}', 1)" ${isLast ? 'disabled' : ''} 
              class="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs transition-colors ${isLast ? 'text-[#A89F95] cursor-not-allowed opacity-40' : 'bg-white text-charcoal hover:bg-terracotta hover:text-white cursor-pointer shadow-xs'}"
              title="Đẩy xuống sau">
              ▼
            </button>
          </div>
        </td>

        <td class="py-4 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="handleEditGear('${gear.id}')" class="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-extrabold text-xs transition-colors cursor-pointer shadow-xs">
              Sửa
            </button>
            <button onclick="handleDeleteGear('${gear.id}', '${gear.title.replace(/'/g, "\\'")}')" class="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-extrabold text-xs transition-colors cursor-pointer shadow-xs">
              Xóa
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadGears() {
  const gears = await fetchAllGears();
  currentGearsList = gears;
  renderGearsTable(gears);
}

// Di chuyển thứ tự đồ nghề (Lên / Xuống)
window.handleMoveGear = async function(gearId, direction) {
  const idx = currentGearsList.findIndex(g => g.id === gearId);
  if (idx === -1) return;
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= currentGearsList.length) return;

  const currentGear = currentGearsList[idx];
  const targetGear  = currentGearsList[targetIdx];

  const currentOrder = currentGear.order !== undefined ? currentGear.order : (idx + 1);
  const targetOrder  = targetGear.order !== undefined ? targetGear.order : (targetIdx + 1);

  const finalOrder1 = currentOrder === targetOrder ? (targetIdx + 1) : targetOrder;
  const finalOrder2 = currentOrder === targetOrder ? (idx + 1) : currentOrder;

  const res = await swapGearsOrder(currentGear.id, finalOrder1, targetGear.id, finalOrder2);
  if (res.success) {
    showAdminToast(`Đã đổi vị trí món "${currentGear.title}"!`);
    await loadGears();
  } else {
    showAdminToast(res.error || 'Lỗi khi đổi vị trí đồ nghề', false);
  }
};

// ============================================================
// FORM RESET HELPERS
// ============================================================
function resetFormForNewSong() {
  const form = document.getElementById('song-form');
  if (form) form.reset();

  document.getElementById('form-song-id').value        = '';
  document.getElementById('form-title').value          = '';
  document.getElementById('form-category').value       = 'Nhạc Việt';
  document.getElementById('form-order').value          = currentSongsList.length + 1;
  document.getElementById('form-level').value          = '4/10';
  document.getElementById('form-levelNum').value       = 4;
  document.getElementById('form-tuning').value         = 'Standard';
  document.getElementById('form-duration').value       = '03:30';
  document.getElementById('form-capo').value           = 'Không kẹp';
  document.getElementById('form-tempo').value          = '~95 BPM';
  document.getElementById('form-description').value    = '';
  document.getElementById('form-hasDemo').checked      = true;
  document.getElementById('form-videoDemo').value      = '';
  document.getElementById('form-targetUrl').value      = '';
  document.getElementById('form-price').value          = 239000;
  document.getElementById('form-priceFormatted').value = '239.000đ';
  document.getElementById('form-discountNote').value   = '';

  setTabType(true);
}

function resetFormForNewGear() {
  const form = document.getElementById('gear-form');
  if (form) form.reset();

  document.getElementById('form-gear-id').value         = '';
  document.getElementById('form-gear-title').value      = '';
  document.getElementById('form-gear-category').value   = 'GUITAR CHÍNH';
  document.getElementById('form-gear-image').value      = 'assets/clover.jpg';
  document.getElementById('form-gear-description').value= '';
  document.getElementById('form-gear-buyUrl').value     = '';
  document.getElementById('form-gear-buyText').value    = 'Mua trên Shopee';
  document.getElementById('form-gear-footerText').value = '';
  document.getElementById('form-gear-order').value      = currentGearsList.length + 1;
}

// ============================================================
// EDIT & DELETE HANDLERS (SONG)
// ============================================================
window.handleEditSong = function(songId) {
  const song = currentSongsList.find(s => s.id === songId);
  if (!song) return;

  document.getElementById('modal-form-title').textContent = 'Chỉnh Sửa: ' + song.title;
  document.getElementById('save-btn-text').textContent    = 'Lưu Thay Đổi';

  document.getElementById('form-song-id').value         = song.id;
  document.getElementById('form-title').value           = song.title || '';
  document.getElementById('form-category').value        = song.category || 'Nhạc Việt';
  document.getElementById('form-order').value           = song.order !== undefined ? song.order : 1;
  document.getElementById('form-level').value           = song.level || '4/10';
  document.getElementById('form-levelNum').value        = song.levelNum || 4;
  document.getElementById('form-tuning').value          = song.tuning || 'Standard';
  document.getElementById('form-duration').value        = song.duration || '03:30';
  document.getElementById('form-capo').value            = song.capo || 'Không kẹp';
  document.getElementById('form-tempo').value           = song.tempo || '~95 BPM';
  document.getElementById('form-description').value     = song.description || '';
  document.getElementById('form-hasDemo').checked       = Boolean(song.hasDemo);
  document.getElementById('form-videoDemo').value       = song.videoDemo || '';
  document.getElementById('form-targetUrl').value       = song.targetUrl || '';
  document.getElementById('form-price').value           = song.price || 0;
  document.getElementById('form-priceFormatted').value  = song.priceFormatted || '239.000đ';
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
// EDIT & DELETE HANDLERS (GEAR)
// ============================================================
window.handleEditGear = function(gearId) {
  const gear = currentGearsList.find(g => g.id === gearId);
  if (!gear) return;

  document.getElementById('modal-gear-form-title').textContent = 'Chinh Sua: ' + gear.title;
  document.getElementById('save-gear-btn-text').textContent    = 'Luu Thay Doi';

  document.getElementById('form-gear-id').value         = gear.id;
  document.getElementById('form-gear-title').value      = gear.title || '';
  document.getElementById('form-gear-category').value   = gear.category || 'THIET BI';
  document.getElementById('form-gear-image').value      = gear.image || '';
  document.getElementById('form-gear-description').value= gear.description || '';
  document.getElementById('form-gear-buyUrl').value     = gear.buyUrl || '';
  document.getElementById('form-gear-buyText').value    = gear.buyText || 'Mua tren Shopee';
  document.getElementById('form-gear-footerText').value = gear.footerText || '';
  document.getElementById('form-gear-order').value      = gear.order || 1;

  toggleGearModal(true);
};

window.handleDeleteGear = async function(gearId, gearTitle) {
  const ok = confirm('Ban co chac chan muon xoa mon do "' + gearTitle + '" (ID: ' + gearId + ') khoi Firestore khong?');
  if (!ok) return;

  const res = await deleteGear(gearId);
  if (res.success) {
    showAdminToast('Da xoa mon do "' + gearTitle + '" thanh cong!');
    await loadGears();
  } else {
    showAdminToast(res.error || 'Loi khi xoa mon do nghe', false);
  }
};

// ============================================================
// 4. DOM READY EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadSongs();
  loadGears();

  // Tu dong chuan hoa duong dan khi user nhap/dan vao cac o input
  const autoCleanInputs = ['form-videoDemo', 'form-targetUrl', 'form-gear-image'];
  autoCleanInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', (e) => {
        e.target.value = cleanMediaPath(e.target.value);
      });
      el.addEventListener('paste', () => {
        setTimeout(() => {
          el.value = cleanMediaPath(el.value);
        }, 10);
      });
    }
  });

  // Tab Switcher (Video Tab vs Bo Do Nghe)
  const tabNavSongs   = document.getElementById('tab-nav-songs');
  const tabNavGears   = document.getElementById('tab-nav-gears');
  const sectionSongs  = document.getElementById('section-songs');
  const sectionGears  = document.getElementById('section-gears');

  if (tabNavSongs && tabNavGears && sectionSongs && sectionGears) {
    tabNavSongs.addEventListener('click', () => {
      tabNavSongs.className = 'px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer bg-warm-gradient text-white shadow-xs';
      tabNavGears.className = 'px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer text-[#5C5147] hover:text-[#1A1614] hover:bg-[#F4EFEA]';
      sectionSongs.classList.remove('hidden');
      sectionGears.classList.add('hidden');
    });

    tabNavGears.addEventListener('click', () => {
      tabNavGears.className = 'px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer bg-warm-gradient text-white shadow-xs';
      tabNavSongs.className = 'px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer text-[#5C5147] hover:text-[#1A1614] hover:bg-[#F4EFEA]';
      sectionGears.classList.remove('hidden');
      sectionSongs.classList.add('hidden');
      loadGears();
    });
  }

  // Dang xuat
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logoutAdmin();
      window.location.href = 'admin-login.html';
    });
  }

  // Lam moi danh sach songs
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadSongs();
      showAdminToast('Da lam moi danh sach bai hat');
    });
  }

  // Tim kiem nhanh songs
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

  // Mo Form Them Song
  const addSongBtn = document.getElementById('add-song-btn');
  if (addSongBtn) {
    addSongBtn.addEventListener('click', () => {
      resetFormForNewSong();
      document.getElementById('modal-form-title').textContent = 'Them Bai Hat Moi';
      document.getElementById('save-btn-text').textContent    = 'Them Bai Hat';
      toggleSongModal(true);
    });
  }

  // Dong Modal Song
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelFormBtn = document.getElementById('cancel-form-btn');
  const songModal     = document.getElementById('song-form-modal');
  if (closeModalBtn) closeModalBtn.addEventListener('click', () => toggleSongModal(false));
  if (cancelFormBtn) cancelFormBtn.addEventListener('click', () => toggleSongModal(false));
  if (songModal) {
    songModal.addEventListener('click', (e) => {
      if (e.target === songModal) toggleSongModal(false);
    });
  }

  // Segmented Toggle Song (Free/Paid)
  const toggleFreeBtn = document.getElementById('toggle-free-btn');
  const togglePaidBtn = document.getElementById('toggle-paid-btn');
  if (toggleFreeBtn) toggleFreeBtn.addEventListener('click', () => setTabType(true));
  if (togglePaidBtn) togglePaidBtn.addEventListener('click', () => setTabType(false));

  // Submit Form Song
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
      const targetUrlVal      = isFree ? cleanMediaPath(document.getElementById('form-targetUrl').value) : '';
      const videoDemoVal      = cleanMediaPath(document.getElementById('form-videoDemo').value);

      const songData = {
        title,
        category:       document.getElementById('form-category').value.trim() || 'Nhạc Việt',
        order:          Number(document.getElementById('form-order').value) || (isEdit ? 1 : (currentSongsList.length + 1)),
        level:          document.getElementById('form-level').value.trim() || '4/10',
        levelNum:       Number(document.getElementById('form-levelNum').value) || 4,
        tuning:         document.getElementById('form-tuning').value.trim() || 'Standard',
        duration:       document.getElementById('form-duration').value.trim() || '03:30',
        capo:           document.getElementById('form-capo').value.trim() || 'Không kẹp',
        tempo:          document.getElementById('form-tempo').value.trim() || '~95 BPM',
        description:    document.getElementById('form-description').value.trim(),
        hasDemo:        document.getElementById('form-hasDemo').checked,
        videoDemo:      videoDemoVal,
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

  // ============================================================
  // GEAR FORM LISTENERS
  // ============================================================
  const addGearBtn = document.getElementById('add-gear-btn');
  if (addGearBtn) {
    addGearBtn.addEventListener('click', () => {
      resetFormForNewGear();
      document.getElementById('modal-gear-form-title').textContent = 'Them Mon Do Nghe';
      document.getElementById('save-gear-btn-text').textContent    = 'Luu Mon Do Nghe';
      toggleGearModal(true);
    });
  }

  // Seed 4 mon mac dinh
  const seedGearsBtn = document.getElementById('seed-gears-btn');
  if (seedGearsBtn) {
    seedGearsBtn.addEventListener('click', async () => {
      const ok = confirm('Ban co muon nap 4 mon do nghe mau vao Firestore khong?');
      if (!ok) return;

      seedGearsBtn.disabled = true;
      seedGearsBtn.textContent = 'Dang nap...';

      for (const item of DEFAULT_GEARS) {
        await createGear(item);
      }

      seedGearsBtn.disabled = false;
      seedGearsBtn.textContent = '🔄 Nap 4 Mon Mau';
      showAdminToast('Da nap thanh cong 4 mon do nghe mau!');
      await loadGears();
    });
  }

  // Dong Modal Gear
  const closeGearModalBtn = document.getElementById('close-gear-modal-btn');
  const cancelGearBtn     = document.getElementById('cancel-gear-btn');
  const gearModal         = document.getElementById('gear-form-modal');
  if (closeGearModalBtn) closeGearModalBtn.addEventListener('click', () => toggleGearModal(false));
  if (cancelGearBtn) cancelGearBtn.addEventListener('click', () => toggleGearModal(false));
  if (gearModal) {
    gearModal.addEventListener('click', (e) => {
      if (e.target === gearModal) toggleGearModal(false);
    });
  }

  // Submit Form Gear
  const gearForm = document.getElementById('gear-form');
  if (gearForm) {
    gearForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const gearId = document.getElementById('form-gear-id').value;
      const isEdit = Boolean(gearId);
      const title  = document.getElementById('form-gear-title').value.trim();

      if (!title) {
        alert('Vui long nhap ten mon do nghe nhe!');
        return;
      }

      const gearData = {
        title,
        category:    document.getElementById('form-gear-category').value.trim() || 'THIET BI',
        image:       cleanMediaPath(document.getElementById('form-gear-image').value) || 'assets/clover.jpg',
        description: document.getElementById('form-gear-description').value.trim(),
        buyUrl:      document.getElementById('form-gear-buyUrl').value.trim(),
        buyText:     document.getElementById('form-gear-buyText').value.trim() || 'Mua ngay',
        footerText:  document.getElementById('form-gear-footerText').value.trim(),
        order:       Number(document.getElementById('form-gear-order').value) || 1,
      };

      const saveBtn     = document.getElementById('save-gear-btn');
      const saveBtnText = document.getElementById('save-gear-btn-text');
      const saveSpinner = document.getElementById('save-gear-spinner');

      if (saveBtn)     saveBtn.disabled = true;
      if (saveBtnText) saveBtnText.classList.add('hidden');
      if (saveSpinner) saveSpinner.classList.remove('hidden');

      let res;
      if (isEdit) {
        res = await updateGear(gearId, gearData);
      } else {
        res = await createGear(gearData);
      }

      if (saveBtn)     saveBtn.disabled = false;
      if (saveBtnText) saveBtnText.classList.remove('hidden');
      if (saveSpinner) saveSpinner.classList.add('hidden');

      if (res.success) {
        toggleGearModal(false);
        showAdminToast(isEdit
          ? 'Da cap nhat mon do "' + title + '" thanh cong!'
          : 'Da them mon do "' + title + '" thanh cong!'
        );
        await loadGears();
      } else {
        showAdminToast(res.error || 'Co loi xay ra khi luu do nghe.', false);
      }
    });
  }
});
