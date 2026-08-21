/**
 * GUITAR BY QUANG — kho-tab.js
 * Controller cho trang kho-tab.html (Kho Video Tab đầy đủ).
 * Xử lý: fetch all songs, filter, search, render toàn bộ grid.
 * KHÔNG dùng initScrollSpy vì kho-tab.html chỉ có 1 nội dung chính.
 */

import { fetchAllSongs } from './firebase-service.js';
import {
  computeNormalizedFields,
  normalizeVietnameseStr,
  normalizeSpacelessStr,
  debounce,
  renderSongCard,
  initScrollReveal,
  initNavbarShrink,
  initMobileMenu,
  initModalListeners,
} from './common.js';


// ==========================================================================
// STATE
// ==========================================================================

let tabsData = [];
let currentFilter = 'all';
let currentSearch = '';


// ==========================================================================
// RENDER: FULL TABS GRID
// ==========================================================================

function renderTabs() {
  const container = document.getElementById('tabs-grid');
  const countBadge = document.getElementById('tab-count');
  if (!container) return;

  const searchRaw = currentSearch.trim();
  const searchNormalized = normalizeVietnameseStr(searchRaw);
  const searchSpaceless = normalizeSpacelessStr(searchRaw);

  const filtered = tabsData.filter(tab => {
    let matchFilter = true;
    if (currentFilter === 'paid') {
      matchFilter = tab.isFree === false;
    } else if (currentFilter === 'free') {
      matchFilter = tab.isFree === true;
    }
    if (!matchFilter) return false;
    if (!searchRaw) return true;
    const matchTitle = tab._titleNorm.includes(searchNormalized) || tab._titleSpaceless.includes(searchSpaceless);
    const matchDesc = tab._descNorm.includes(searchNormalized);
    return matchTitle || matchDesc;
  });

  if (countBadge) countBadge.textContent = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full w-full py-12 text-center text-charcoal-muted text-sm font-medium">
        <p class="text-base font-bold">Không tìm thấy bài nào khớp với từ khóa "${currentSearch}".</p>
        <p class="text-xs mt-1">Anh em cần bài gì cứ nhắn thẳng qua Zalo hoặc TikTok để mình xếp lịch soạn nhé!</p>
      </div>
    `;
    return;
  }

  // Carousel classes cho mobile, grid tự xử lý desktop
  const wrapperClasses = 'flex-shrink-0 w-[78%] snap-center md:w-auto md:flex-shrink md:snap-none';
  container.innerHTML = filtered.map((tab, index) => renderSongCard(tab, index, wrapperClasses)).join('');
}


// ==========================================================================
// SKELETON & ERROR STATES
// ==========================================================================

function showSkeletonLoading() {
  const container = document.getElementById('tabs-grid');
  if (!container) return;
  container.innerHTML = `
    <div class="skeleton-card rounded-3xl bg-surface/50 border border-charcoal-border/60 aspect-[3/4] w-[78%] flex-shrink-0 sm:w-auto sm:flex-shrink"></div>
    <div class="skeleton-card rounded-3xl bg-surface/50 border border-charcoal-border/60 aspect-[3/4] w-[78%] flex-shrink-0 md:w-auto md:flex-shrink hidden md:block"></div>
    <div class="skeleton-card rounded-3xl bg-surface/50 border border-charcoal-border/60 aspect-[3/4] w-[78%] flex-shrink-0 md:w-auto md:flex-shrink hidden lg:block"></div>
  `;
}

function showConnectionError() {
  const container = document.getElementById('tabs-grid');
  const countBadge = document.getElementById('tab-count');
  if (!container) return;
  if (countBadge) countBadge.textContent = '0';

  container.innerHTML = `
    <div class="col-span-full w-full py-14 text-center text-charcoal-muted text-sm font-medium space-y-3">
      <div class="text-4xl">🎸</div>
      <p class="text-base font-bold text-charcoal">Kho Video Tab đang bị gián đoạn kết nối, anh em thử tải lại trang giúp mình nhé!</p>
      <p class="text-xs">Nếu vẫn không được, nhắn mình qua Zalo hoặc TikTok để mình gửi tab trực tiếp nhé.</p>
      <button onclick="location.reload()" class="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-warm-gradient text-white text-xs font-bold shadow-glow hover:brightness-105 transition-all cursor-pointer">
        Tải lại trang
      </button>
    </div>
  `;
}


// ==========================================================================
// INIT: FILTER BUTTONS + PILL
// ==========================================================================

function initFilterButtons() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const filterPill = document.getElementById('filter-pill');

  function moveFilterPillTo(btn) {
    if (!filterPill || !btn) return;
    filterPill.style.width = `${btn.offsetWidth}px`;
    filterPill.style.transform = `translateX(${btn.offsetLeft - 6}px)`;
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('text-white');
        b.classList.add('text-charcoal-muted');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('text-white');
      btn.classList.remove('text-charcoal-muted');
      btn.setAttribute('aria-pressed', 'true');
      moveFilterPillTo(btn);
      currentFilter = btn.getAttribute('data-filter');
      renderTabs();
    });
  });

  const initialActiveBtn = document.querySelector('.filter-btn[aria-pressed="true"]') || filterBtns[0];
  requestAnimationFrame(() => moveFilterPillTo(initialActiveBtn));
  window.addEventListener('resize', debounce(() => {
    const active = document.querySelector('.filter-btn[aria-pressed="true"]') || filterBtns[0];
    moveFilterPillTo(active);
  }, 150));
}


// ==========================================================================
// DOMCONTENTLOADED
// ==========================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Init UI ngay (không cần chờ data)
  initScrollReveal();
  initNavbarShrink();
  initMobileMenu();

  // Fetch data từ Firestore
  showSkeletonLoading();
  const songs = await fetchAllSongs();

  if (!songs || songs.length === 0) {
    showConnectionError();
  } else {
    // Set window.__currentSongs để openCheckoutModal (trong common.js) truy cập được
    window.__currentSongs = songs;
    tabsData = songs;
    computeNormalizedFields(tabsData);
    renderTabs();
  }

  // Init filter/search (ngay cả khi fetch lỗi để không crash)
  initFilterButtons();

  const searchInput = document.getElementById('tab-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      currentSearch = e.target.value;
      renderTabs();
    }, 150));
  }

  // Init modal listeners (checkout, demo, copy buttons, Escape)
  initModalListeners();
});
