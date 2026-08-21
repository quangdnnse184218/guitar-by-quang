/**
 * GUITAR BY QUANG — cua-toi.js
 * Controller cho trang cua-toi.html (Góc Của Tôi)
 * Quản lý hiển thị danh sách Yêu thích (❤️) và Đã học xong (✓) từ localStorage
 */

import { fetchAllSongs } from './firebase-service.js';
import { getFavorites, getCompleted } from './local-storage-service.js';
import {
  computeNormalizedFields,
  renderSongCard,
  initNavbarShrink,
  initMobileMenu,
  initModalListeners
} from './common.js';

let allSongs = [];
let activeTab = 'favorites'; // 'favorites' | 'completed'

// ============================================================
// 1. UPDATE BADGE COUNTS
// ============================================================
function updateBadges() {
  const favs = getFavorites();
  const comps = getCompleted();

  const favCountEl = document.getElementById('badge-fav-count');
  const compCountEl = document.getElementById('badge-comp-count');

  if (favCountEl) favCountEl.textContent = favs.length;
  if (compCountEl) compCountEl.textContent = comps.length;
}

// ============================================================
// 2. SLIDER & TAB SWITCHING
// ============================================================
function updateTabUI() {
  const btnFav = document.getElementById('tab-btn-favorites');
  const btnComp = document.getElementById('tab-btn-completed');
  const slider = document.getElementById('tab-slider');

  if (activeTab === 'favorites') {
    if (btnFav) {
      btnFav.className = 'my-tab-btn relative z-10 flex-1 py-2.5 px-4 rounded-full text-xs sm:text-sm font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-white';
    }
    if (btnComp) {
      btnComp.className = 'my-tab-btn relative z-10 flex-1 py-2.5 px-4 rounded-full text-xs sm:text-sm font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-charcoal-muted hover:text-charcoal';
    }
    if (slider) {
      slider.style.transform = 'translateX(0%)';
    }
  } else {
    if (btnFav) {
      btnFav.className = 'my-tab-btn relative z-10 flex-1 py-2.5 px-4 rounded-full text-xs sm:text-sm font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-charcoal-muted hover:text-charcoal';
    }
    if (btnComp) {
      btnComp.className = 'my-tab-btn relative z-10 flex-1 py-2.5 px-4 rounded-full text-xs sm:text-sm font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-white';
    }
    if (slider) {
      slider.style.transform = 'translateX(100%)';
    }
  }
}

// ============================================================
// 3. RENDER TAB CONTENT
// ============================================================
function renderCurrentTab() {
  updateBadges();
  updateTabUI();

  const grid = document.getElementById('my-tabs-grid');
  const emptyState = document.getElementById('empty-state');
  const emptyTitle = document.getElementById('empty-state-title');
  const emptyDesc = document.getElementById('empty-state-desc');
  const emptyIcon = document.getElementById('empty-state-icon');

  if (!grid || !emptyState) return;

  const targetIds = activeTab === 'favorites' ? getFavorites() : getCompleted();
  const matchedSongs = allSongs.filter(s => targetIds.includes(String(s.id)));

  if (matchedSongs.length === 0) {
    grid.innerHTML = '';
    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');

    if (activeTab === 'favorites') {
      if (emptyIcon) emptyIcon.innerHTML = '❤️';
      if (emptyTitle) emptyTitle.textContent = 'Chưa có bài hát yêu thích nào';
      if (emptyDesc) emptyDesc.textContent = 'Bạn chưa thêm bài hát nào vào danh sách Yêu thích. Hãy bấm vào biểu tượng ❤️ trên các thẻ bài hát để lưu lại nhé!';
    } else {
      if (emptyIcon) emptyIcon.innerHTML = '✓';
      if (emptyTitle) emptyTitle.textContent = 'Chưa có bài hát nào đánh dấu đã học';
      if (emptyDesc) emptyDesc.textContent = 'Khi bạn tập hoàn chỉnh một bài hát, hãy bấm biểu tượng ✓ để đánh dấu hoàn thành và theo dõi tiến độ tập đàn của mình!';
    }
  } else {
    emptyState.classList.add('hidden');
    grid.classList.remove('hidden');
    grid.innerHTML = matchedSongs.map((song, idx) => renderSongCard(song, idx)).join('');
  }
}

// ============================================================
// 4. DOMCONTENTLOADED INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  initNavbarShrink();
  initMobileMenu();

  const btnFav = document.getElementById('tab-btn-favorites');
  const btnComp = document.getElementById('tab-btn-completed');

  if (btnFav) {
    btnFav.addEventListener('click', () => {
      activeTab = 'favorites';
      renderCurrentTab();
    });
  }

  if (btnComp) {
    btnComp.addEventListener('click', () => {
      activeTab = 'completed';
      renderCurrentTab();
    });
  }

  // Lắng nghe thay đổi từ các nút ❤️ và ✓ trên card
  window.addEventListener('gbq:storage-change', () => {
    renderCurrentTab();
  });

  // Fetch dữ liệu từ Firestore
  const songs = await fetchAllSongs();
  allSongs = songs || [];
  window.__currentSongs = allSongs;
  computeNormalizedFields(allSongs);

  renderCurrentTab();
  initModalListeners();
});
