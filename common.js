/**
 * GUITAR BY QUANG — common.js
 * Shared utilities used by BOTH index.html (home.js) and kho-tab.html (kho-tab.js).
 *
 * EXPORTS:
 *   normalizeVietnameseStr, normalizeSpacelessStr, computeNormalizedFields, debounce
 *   toggleModal, showToast, copyToClipboard
 *   renderSongCard(tab, index, wrapperExtraClasses)
 *   initScrollReveal, initNavbarShrink, initMobileMenu, initModalListeners
 *
 * WINDOW GLOBALS exposed here (để onclick inline trong card HTML template gọi được):
 *   window.openVideoDemoModal(title, videoSrc)
 *   window.openCheckoutModal(tabId)
 *   — cả 2 đều đọc window.__currentSongs (được set bởi home.js hoặc kho-tab.js sau fetch)
 */


// ==========================================================================
// 1. NORMALIZE & SEARCH UTILS
// ==========================================================================

export function normalizeVietnameseStr(str) {
  if (!str) return '';
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();
}

export function normalizeSpacelessStr(str) {
  return normalizeVietnameseStr(str).replace(/[\s\-_.,/]+/g, "");
}

export function computeNormalizedFields(data) {
  data.forEach(tab => {
    tab._titleNorm = normalizeVietnameseStr(tab.title);
    tab._titleSpaceless = normalizeSpacelessStr(tab.title);
    tab._descNorm = normalizeVietnameseStr(tab.description);
  });
}

export function debounce(fn, delay = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}


import { isFavorite, isCompleted, toggleFavorite, toggleCompleted } from './local-storage-service.js';

// ==========================================================================
// 2. CARD TEMPLATE (dùng chung cho home.js, kho-tab.js và cua-toi.js)
// ==========================================================================

/**
 * Render HTML cho 1 song card.
 * @param {object} tab - Dữ liệu bài hát từ Firestore
 * @param {number} index - Vị trí trong mảng (dùng cho stagger animation)
 * @param {string} wrapperExtraClasses - CSS class bổ sung cho wrapper div:
 *   - kho-tab.js: 'flex-shrink-0 w-[78%] snap-center md:w-auto md:flex-shrink md:snap-none'
 *   - home.js: '' (grid layout tự xử lý kích thước)
 */
export function renderSongCard(tab, index, wrapperExtraClasses = '') {
  const percent = Math.min(100, Math.max(10, (tab.levelNum / 10) * 100));
  const staggerDelay = `${Math.min(index, 8) * 60}ms`;

  const favActive = isFavorite(tab.id);
  const compActive = isCompleted(tab.id);

  const favBtnHtml = `
    <button onclick="handleToggleFavorite(event, '${tab.id}')" data-fav-btn="${tab.id}" class="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${favActive ? 'bg-rose-500 text-white scale-105' : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/60'}" title="${favActive ? 'Bỏ yêu thích' : 'Yêu thích'}" aria-label="Yêu thích">
      <svg class="w-3.5 h-3.5 ${favActive ? 'fill-current' : 'fill-none'}" stroke="currentColor" stroke-width="${favActive ? '0' : '2'}" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </button>
  `;

  const compBtnHtml = `
    <button onclick="handleToggleCompleted(event, '${tab.id}')" data-comp-btn="${tab.id}" class="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${compActive ? 'bg-emerald-500 text-white scale-105' : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/60'}" title="${compActive ? 'Đánh dấu chưa học' : 'Đã học xong'}" aria-label="Đã học xong">
      <svg class="w-3.5 h-3.5 fill-none" stroke="currentColor" stroke-width="${compActive ? '3' : '2.5'}" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
      </svg>
    </button>
  `;

  const userActionGroup = `
    <div class="flex items-center gap-1.5 z-10" onclick="event.stopPropagation()">
      ${favBtnHtml}
      ${compBtnHtml}
    </div>
  `;

  // ========================================================================
  // 1. BIẾN THỂ: CARD MIỄN PHÍ (Đồng bộ cấu trúc & chiều cao cân đối với Card Trả phí)
  // ========================================================================
  if (tab.isFree) {
    return `
      <div onclick="openFreeTabModal('${tab.id}')" class="card-fade-in group ${wrapperExtraClasses} bg-surface/50 hover:bg-surface/90 rounded-3xl p-4 sm:p-5 border border-charcoal-border/80 hover:border-emerald-500/80 shadow-soft hover:shadow-float hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between space-y-4 cursor-pointer" style="animation-delay: ${staggerDelay}">

        <div class="space-y-3.5">

          <!-- Visual Banner Header cho Card Free -->
          <div class="relative overflow-hidden rounded-2xl aspect-[16/10] bg-gradient-to-br from-[#2D4A3E] via-[#385E4F] to-[#20362C] p-4 flex flex-col justify-between text-white shadow-inner group-hover:scale-[1.02] transition-transform duration-500 ease-out">

            <div class="flex justify-between items-start text-[10px] uppercase font-bold tracking-wider">
              <span class="bg-black/40 backdrop-blur px-2.5 py-1 rounded-full text-white/95">${tab.category || 'Fingerstyle'}</span>
              <div class="flex items-center gap-2">
                ${userActionGroup}
                <span class="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-400 text-emerald-950 border border-emerald-300 shadow-sm uppercase tracking-wide">FREE</span>
              </div>
            </div>

            <div class="my-auto text-center flex flex-col items-center justify-center">
              <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 text-emerald-800 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <span class="text-[10px] font-bold mt-2 text-white/95 tracking-wide bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-sm">Xem Tab Miễn Phí</span>
            </div>

            <div class="flex justify-between items-end text-[11px] text-white/95 font-semibold">
              <span>${tab.duration || 'Full Video'}</span>
              <span class="text-white/80">Tuning: ${tab.tuning || 'Standard'}</span>
            </div>

          </div>

          <!-- Thông tin bài hát -->
          <div class="space-y-2">
            <h3 class="text-lg sm:text-xl font-bold text-charcoal group-hover:text-emerald-700 transition-colors leading-snug">
              ${tab.title}
            </h3>

            <div class="space-y-1 pt-0.5">
              <div class="flex items-center justify-between text-xs font-bold text-charcoal-muted">
                <span>Độ khó: <strong class="text-emerald-700">${tab.level}</strong></span>
                <span class="text-[11px] font-semibold text-charcoal-faint">Tuning: Standard</span>
              </div>
              <div class="w-full bg-surfaceAlt rounded-full h-1.5 overflow-hidden">
                <div class="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
              </div>
            </div>

            <p class="text-xs text-charcoal-muted font-medium leading-relaxed pt-1 line-clamp-2">
              ${tab.description}
            </p>
          </div>

        </div>

        <!-- Nút CTA xem miễn phí -->
        <div class="pt-2">
          <div class="w-full py-2.5 rounded-full bg-emerald-600 group-hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 text-center">
            <span>Xem Video Tab (Miễn phí)</span>
            <svg class="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </div>
        </div>

      </div>
    `;
  }

  // ========================================================================
  // 2. BIẾN THỂ: CARD BÀI TRẢ PHÍ (Đồng bộ padding p-4 sm:p-5)
  // ========================================================================
  const badgeHtml = `<div class="flex flex-col items-end">
        <span class="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-sm uppercase tracking-wide">BÁN • ${tab.priceFormatted}</span>
        ${tab.discountNote ? `<span class="text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full font-bold mt-1 border border-amber-300">${tab.discountNote}</span>` : ''}
      </div>`;

  let artworkCenterHtml = '';
  if (tab.hasDemo) {
    artworkCenterHtml = `
      <div class="my-auto text-center flex flex-col items-center justify-center">
        <button onclick="openVideoDemoModal('${tab.title.replace(/'/g, "\\'")}', '${tab.videoDemo}')" class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-surfaceCard/95 text-charcoal flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform cursor-pointer" aria-label="Xem video demo bài hát">
          <svg class="w-5 h-5 fill-current ml-0.5 text-terracotta" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
        <span class="text-[10px] font-bold mt-2 text-white/95 tracking-wide bg-charcoal/40 px-2.5 py-0.5 rounded-full backdrop-blur-sm">Xem Video Demo</span>
      </div>
    `;
  } else {
    artworkCenterHtml = `
      <div class="my-auto text-center flex flex-col items-center justify-center opacity-80">
        <div class="w-10 h-10 rounded-full bg-charcoal/30 flex items-center justify-center text-lg shadow-sm">
          🎸
        </div>
        <span class="text-[10px] font-bold mt-1.5 text-white/80 tracking-wide">Acoustic Tab</span>
      </div>
    `;
  }

  let ctaButtonHtml = '';
  if (tab.buttonType === 'buy') {
    ctaButtonHtml = `
      <button onclick="openCheckoutModal('${tab.id}')" class="w-full py-2.5 rounded-full bg-warm-gradient hover:brightness-105 text-white font-bold text-xs transition-all shadow-glow active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer">
        <span>Xem chi tiết →</span>
      </button>
    `;
  } else {
    ctaButtonHtml = `
      <a href="${tab.targetUrl}" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 rounded-full bg-surfaceCard hover:bg-charcoal hover:text-white text-charcoal font-bold border border-charcoal-border/90 text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 text-center group/btn">
        <span>${tab.buttonText || 'Xem chi tiết →'}</span>
        <svg class="w-3.5 h-3.5 text-terracotta group-hover/btn:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
        </svg>
      </a>
    `;
  }

  return `
    <div class="card-fade-in group ${wrapperExtraClasses} bg-surface/50 hover:bg-surface/85 rounded-3xl p-4 sm:p-5 border border-charcoal-border/80 shadow-soft hover:shadow-float hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between space-y-4" style="animation-delay: ${staggerDelay}">

      <div class="space-y-3.5">

        <div class="relative overflow-hidden rounded-2xl aspect-[16/10] bg-gradient-to-br ${tab.thumbnailBg} p-4 flex flex-col justify-between text-white shadow-inner group-hover:scale-[1.02] transition-transform duration-500 ease-out">

          <div class="flex justify-between items-start text-[10px] uppercase font-bold tracking-wider">
            <span class="bg-charcoal/50 backdrop-blur px-2.5 py-1 rounded-full text-white/95">${tab.category}</span>
            <div class="flex items-start gap-2">
              ${userActionGroup}
              ${badgeHtml}
            </div>
          </div>

          ${artworkCenterHtml}

          <div class="flex justify-between items-end text-[11px] text-white/95 font-semibold">
            <span>${tab.duration}</span>
            <span class="text-white/80">Tuning: ${tab.tuning}</span>
          </div>

        </div>

        <div class="space-y-2">
          <h3 class="text-lg sm:text-xl font-bold text-charcoal group-hover:text-terracotta transition-colors leading-snug">
            ${tab.title}
          </h3>

          <div class="space-y-1 pt-0.5">
            <div class="flex items-center justify-between text-xs font-bold text-charcoal-muted">
              <span>Độ khó: <strong class="text-terracotta">${tab.level}</strong></span>
              <span class="text-[11px] font-semibold text-charcoal-faint">Tuning: Standard</span>
            </div>
            <div class="w-full bg-surfaceAlt rounded-full h-1.5 overflow-hidden">
              <div class="bg-terracotta h-1.5 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
            </div>
          </div>

          <p class="text-xs text-charcoal-muted font-medium leading-relaxed pt-1 line-clamp-2">
            ${tab.description}
          </p>
        </div>

      </div>

      <div class="pt-2">
        ${ctaButtonHtml}
      </div>

    </div>
  `;
}

// ==========================================================================
// 2.1. TOGGLE FAVORITE & COMPLETED HANDLERS (Client-side)
// ==========================================================================

export function handleToggleFavorite(event, songId) {
  if (event) event.stopPropagation();
  const nextState = toggleFavorite(songId);
  const btns = document.querySelectorAll(`[data-fav-btn="${songId}"]`);
  btns.forEach(btn => {
    if (nextState) {
      btn.className = 'w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm bg-rose-500 text-white scale-105';
      btn.title = 'Bỏ yêu thích';
      btn.innerHTML = `<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    } else {
      btn.className = 'w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm bg-black/40 text-white/80 hover:text-white hover:bg-black/60';
      btn.title = 'Yêu thích';
      btn.innerHTML = `<svg class="w-3.5 h-3.5 fill-none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    }
  });
  showToast(nextState ? 'Đã lưu vào danh sách Yêu thích ❤️' : 'Đã bỏ khỏi danh sách Yêu thích');
  window.dispatchEvent(new CustomEvent('gbq:storage-change', { detail: { type: 'favorite', songId, state: nextState } }));
}

export function handleToggleCompleted(event, songId) {
  if (event) event.stopPropagation();
  const nextState = toggleCompleted(songId);
  const btns = document.querySelectorAll(`[data-comp-btn="${songId}"]`);
  btns.forEach(btn => {
    if (nextState) {
      btn.className = 'w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm bg-emerald-500 text-white scale-105';
      btn.title = 'Đánh dấu chưa học';
      btn.innerHTML = `<svg class="w-3.5 h-3.5 fill-none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
    } else {
      btn.className = 'w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm bg-black/40 text-white/80 hover:text-white hover:bg-black/60';
      btn.title = 'Đã học xong';
      btn.innerHTML = `<svg class="w-3.5 h-3.5 fill-none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
    }
  });
  showToast(nextState ? 'Đã đánh dấu Đã học xong ✓' : 'Đã bỏ đánh dấu Đã học xong');
  window.dispatchEvent(new CustomEvent('gbq:storage-change', { detail: { type: 'completed', songId, state: nextState } }));
}

window.handleToggleFavorite = handleToggleFavorite;
window.handleToggleCompleted = handleToggleCompleted;


// ==========================================================================
// 3. MODAL SYSTEM
// ==========================================================================

let openModalCount = 0;

export function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  const dialog = modal.querySelector('.modal-dialog');

  modal.classList.toggle('opacity-0', !show);
  modal.classList.toggle('pointer-events-none', !show);
  modal.classList.toggle('opacity-100', show);

  if (dialog) {
    dialog.classList.toggle('scale-95', !show);
    dialog.classList.toggle('scale-100', show);
  }

  openModalCount = Math.max(0, openModalCount + (show ? 1 : -1));
  document.body.classList.toggle('modal-open', openModalCount > 0);

  if (show && dialog) {
    dialog.focus({ preventScroll: true });
  }
}

export function showToast(message) {
  const toast = document.getElementById('toast-notification');
  const msgEl = document.getElementById('toast-message');
  if (!toast || !msgEl) return;
  msgEl.textContent = message;

  toast.classList.remove('opacity-0', '-translate-y-4', 'pointer-events-none');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 3500);
}

export function copyToClipboard(text, toastMessage) {
  navigator.clipboard.writeText(text);
  showToast(toastMessage);
}

// --- Video Demo Modal ---

function closeVideoDemoModal() {
  const videoEl = document.getElementById('demo-modal-video');
  if (videoEl) {
    videoEl.pause();
    videoEl.currentTime = 0;
    videoEl.src = '';
  }
  toggleModal('video-demo-modal', false);
}

// Expose để onclick trong HTML template string gọi được
window.openVideoDemoModal = function openVideoDemoModal(title, videoSrc) {
  // Guard: tránh crash nếu tham số rỗng (user click skeleton hoặc UI lỗi)
  if (!title || !videoSrc) return;

  const titleEl = document.getElementById('video-demo-title');
  const videoEl = document.getElementById('demo-modal-video');
  if (!videoEl) return;

  if (titleEl) titleEl.textContent = title;
  videoEl.src = videoSrc;
  videoEl.load();

  toggleModal('video-demo-modal', true);

  videoEl.play().catch(() => {
    // Autoplay bị block bởi browser policy — người dùng tự nhấn play
  });
};

// --- Checkout Modal (Chi tiết Tab Trả Phí) ---

function closeCheckoutModal() {
  const videoEl = document.getElementById('checkout-modal-video');
  if (videoEl) {
    videoEl.pause();
    videoEl.currentTime = 0;
  }
  toggleModal('checkout-modal', false);
}

// Expose để onclick trong HTML template string gọi được
window.openCheckoutModal = function openCheckoutModal(tabId) {
  // Guard: tránh crash nếu data chưa load xong hoặc fetch lỗi
  if (!window.__currentSongs || !window.__currentSongs.length) return;

  const tab = window.__currentSongs.find(t => t.id === tabId);
  if (!tab) return;

  const titleEl = document.getElementById('modal-tab-title');
  const metaEl = document.getElementById('modal-tab-meta');
  const priceEl = document.getElementById('modal-tab-price');
  const syntaxEl = document.getElementById('modal-transfer-syntax');
  const discountTag = document.getElementById('modal-discount-tag');

  // Các field thông số kỹ thuật mở rộng
  const levelEl = document.getElementById('modal-tab-level');
  const tuningEl = document.getElementById('modal-tab-tuning');
  const capoEl = document.getElementById('modal-tab-capo');
  const tempoEl = document.getElementById('modal-tab-tempo');
  const durationEl = document.getElementById('modal-tab-duration');
  const descEl = document.getElementById('modal-tab-description');
  const videoEl = document.getElementById('checkout-modal-video');
  const videoSrcEl = document.getElementById('checkout-modal-video-source');
  const videoContainer = document.getElementById('checkout-modal-video-container');

  if (titleEl) titleEl.textContent = tab.title;
  if (metaEl) metaEl.textContent = `Tuning: ${tab.tuning || 'Standard'} • Bản Video Tab chạy nốt đồng bộ với âm thanh đàn mộc thật và nhịp gõ`;
  if (priceEl) priceEl.textContent = tab.priceFormatted;

  if (levelEl) levelEl.textContent = tab.level || '4/10';
  if (tuningEl) tuningEl.textContent = tab.tuning || 'Standard';
  if (capoEl) capoEl.textContent = tab.capo || 'Không kẹp';
  if (tempoEl) tempoEl.textContent = tab.tempo || '~95 BPM';
  if (durationEl) durationEl.textContent = tab.duration || '03:30';
  if (descEl) descEl.textContent = tab.description || 'Bản Video Tab được soạn chi tiết từng ô nhịp kèm file Guitar Pro & PDF sắc nét.';

  // Xử lý Video Demo
  if (videoEl && videoSrcEl && videoContainer) {
    if (tab.hasDemo && tab.videoDemo) {
      videoSrcEl.src = tab.videoDemo;
      videoEl.load();
      videoContainer.classList.remove('hidden');
    } else {
      videoContainer.classList.add('hidden');
    }
  }

  if (discountTag) {
    if (tab.discountNote) {
      discountTag.textContent = `(${tab.discountNote})`;
      discountTag.classList.remove('hidden');
    } else {
      discountTag.classList.add('hidden');
    }
  }

  if (syntaxEl) {
    const cleanSongCode = tab.title.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
    syntaxEl.textContent = `VIDEOTAB ${cleanSongCode}`;
  }

  toggleModal('checkout-modal', true);
};

// --- Free Tab Modal ---

function closeFreeTabModal() {
  const iframeEl = document.getElementById('free-tab-iframe');
  if (iframeEl) {
    iframeEl.src = '';
  }
  toggleModal('free-tab-modal', false);
}

window.closeFreeTabModal = closeFreeTabModal;

window.openFreeTabModal = function openFreeTabModal(tabId) {
  // Guard: tránh crash nếu data chưa load xong hoặc fetch lỗi
  if (!window.__currentSongs || !window.__currentSongs.length) return;

  const tab = window.__currentSongs.find(t => t.id === tabId);
  if (!tab) return;

  window.__activeFreeTab = tab;

  const titleEl = document.getElementById('free-tab-modal-title');
  const levelEl = document.getElementById('free-tab-modal-level');
  const tuningEl = document.getElementById('free-tab-modal-tuning');
  const durationEl = document.getElementById('free-tab-modal-duration');
  const capoEl = document.getElementById('free-tab-modal-capo');
  const tempoEl = document.getElementById('free-tab-modal-tempo');
  const techContainer = document.getElementById('free-tab-modal-techniques');
  const iframeEl = document.getElementById('free-tab-iframe');
  const backupLinkEl = document.getElementById('free-tab-backup-link');
  const pdfBtn = document.getElementById('free-tab-pdf-btn');

  if (titleEl) titleEl.textContent = tab.title;
  if (levelEl) levelEl.textContent = tab.level || 'Cơ bản';
  if (tuningEl) tuningEl.textContent = tab.tuning || 'Standard';
  if (durationEl) durationEl.textContent = tab.duration || '03:15';
  if (capoEl) capoEl.textContent = tab.capo || 'Không kẹp';
  if (tempoEl) tempoEl.textContent = tab.tempo || (tab.bpm ? `~${tab.bpm} BPM` : '~95 BPM');

  // Parse technique tags
  if (techContainer) {
    let techs = ['Tỉa ngón', 'Slap', 'Nail Attack'];
    if (tab.techniques && Array.isArray(tab.techniques)) {
      techs = tab.techniques;
    } else if (tab.techniques && typeof tab.techniques === 'string') {
      techs = tab.techniques.split(',').map(s => s.trim());
    } else if (tab.description) {
      const descLower = tab.description.toLowerCase();
      const detected = [];
      if (descLower.includes('slap')) detected.push('Slap');
      if (descLower.includes('nail attack')) detected.push('Nail Attack');
      if (descLower.includes('hammer') || descLower.includes('pull')) detected.push('Hammer-on / Pull-off');
      if (descLower.includes('slide') || descLower.includes('vuốt')) detected.push('Slide (Vuốt dây)');
      if (descLower.includes('rải') || descLower.includes('tỉa')) detected.push('Tỉa ngón / Rải');
      if (descLower.includes('bass')) detected.push('Đi Bass');
      if (detected.length > 0) techs = detected;
    }
    techContainer.innerHTML = techs.map(t => `<span class="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-canvas/90 text-[10px] sm:text-[11px] font-semibold">${t}</span>`).join('');
  }

  // Video embed url: parse Youtube nếu có
  const videoUrl = tab.targetUrl || tab.videoDemo || '';
  let embedUrl = videoUrl;
  if (videoUrl.includes('youtube.com/watch?v=')) {
    const videoId = videoUrl.split('watch?v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  } else if (videoUrl.includes('youtu.be/')) {
    const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  if (iframeEl) {
    iframeEl.src = embedUrl;
  }

  if (backupLinkEl) {
    backupLinkEl.href = videoUrl || '#';
  }

  if (pdfBtn) {
    if (tab.pdfUrl) {
      pdfBtn.removeAttribute('disabled');
      pdfBtn.href = tab.pdfUrl;
      pdfBtn.target = '_blank';
      pdfBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      pdfBtn.innerHTML = `
        <svg class="w-4 h-4 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        <span>Tải file PDF Tab</span>
      `;
    } else {
      pdfBtn.setAttribute('disabled', 'true');
      pdfBtn.removeAttribute('href');
      pdfBtn.classList.add('opacity-50', 'cursor-not-allowed');
      pdfBtn.innerHTML = `
        <svg class="w-4 h-4 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        <span>Tải file PDF (Đang cập nhật)</span>
      `;
    }
  }

  toggleModal('free-tab-modal', true);
};

// --- Image Preview Modal ---

function closeImageModal() {
  toggleModal('image-preview-modal', false);
}

window.closeImageModal = closeImageModal;

window.openImageModal = function openImageModal(src, title, caption) {
  if (!src) return;

  const imgEl = document.getElementById('image-modal-img');
  const titleEl = document.getElementById('image-modal-title');
  const captionEl = document.getElementById('image-modal-caption');

  if (imgEl) {
    imgEl.src = src;
    imgEl.alt = title || 'Ảnh đồ nghề';
  }
  if (titleEl) titleEl.textContent = title || '';
  if (captionEl) captionEl.textContent = caption || '';

  toggleModal('image-preview-modal', true);
};


// ==========================================================================
// 4. INIT: SCROLL REVEAL
// ==========================================================================

export function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  items.forEach(el => observer.observe(el));
}


// ==========================================================================
// 5. INIT: NAVBAR SHRINK
// ==========================================================================

export function initNavbarShrink() {
  const navbarInner = document.querySelector('#navbar .navbar-inner');
  const navbar = document.getElementById('navbar');
  if (!navbarInner || !navbar) return;

  const handleScroll = () => {
    const isScrolled = window.scrollY > 40;
    navbarInner.classList.toggle('h-16', isScrolled);
    navbarInner.classList.toggle('h-20', !isScrolled);
    navbar.classList.toggle('shadow-md', isScrolled);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}


// ==========================================================================
// 6. INIT: MOBILE MENU TOGGLE
// ==========================================================================

export function initMobileMenu() {
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');

  if (!mobileBtn || !mobileMenu) return;

  mobileBtn.addEventListener('click', () => {
    const isClosed = mobileMenu.classList.contains('hidden');
    if (isClosed) {
      mobileMenu.classList.remove('hidden');
      if (iconOpen) iconOpen.classList.add('hidden');
      if (iconClose) iconClose.classList.remove('hidden');
    } else {
      mobileMenu.classList.add('hidden');
      if (iconOpen) iconOpen.classList.remove('hidden');
      if (iconClose) iconClose.classList.add('hidden');
    }
    mobileBtn.setAttribute('aria-expanded', isClosed ? 'true' : 'false');
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      if (iconOpen) iconOpen.classList.remove('hidden');
      if (iconClose) iconClose.classList.add('hidden');
      mobileBtn.setAttribute('aria-expanded', 'false');
    });
  });
}


// ==========================================================================
// 7. INIT: MODAL EVENT LISTENERS (đóng khi click ngoài, Escape, copy buttons)
// ==========================================================================

export function initModalListeners() {
  // Video Demo Modal
  const closeVideoDemoBtn = document.getElementById('close-video-demo-modal');
  const videoDemoModal = document.getElementById('video-demo-modal');
  if (closeVideoDemoBtn) {
    closeVideoDemoBtn.addEventListener('click', closeVideoDemoModal);
  }
  if (videoDemoModal) {
    videoDemoModal.addEventListener('click', (e) => {
      if (e.target === videoDemoModal) closeVideoDemoModal();
    });
  }

  // Checkout Modal
  const closeCheckoutBtn = document.getElementById('close-checkout-modal');
  const checkoutModal = document.getElementById('checkout-modal');
  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
  }
  if (checkoutModal) {
    checkoutModal.addEventListener('click', (e) => {
      if (e.target === checkoutModal) closeCheckoutModal();
    });
  }

  // Free Tab Modal
  const closeFreeTabBtn = document.getElementById('close-free-tab-modal');
  const freeTabModal = document.getElementById('free-tab-modal');
  if (closeFreeTabBtn) {
    closeFreeTabBtn.addEventListener('click', closeFreeTabModal);
  }
  if (freeTabModal) {
    freeTabModal.addEventListener('click', (e) => {
      if (e.target === freeTabModal) closeFreeTabModal();
    });
  }

  // Image Preview Modal
  const closeImageBtn = document.getElementById('close-image-modal');
  const imageModal = document.getElementById('image-preview-modal');
  if (closeImageBtn) {
    closeImageBtn.addEventListener('click', closeImageModal);
  }
  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) closeImageModal();
    });
  }

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVideoDemoModal();
      closeCheckoutModal();
      closeFreeTabModal();
      closeImageModal();
    }
  });

  // Copy STK
  const copyStkBtn = document.getElementById('copy-stk-btn');
  if (copyStkBtn) {
    copyStkBtn.addEventListener('click', () => {
      copyToClipboard('03970202801', 'Đã copy STK TpBank: 03970202801 (DOAN NGUYEN NHAT QUANG)');
    });
  }

  // Copy Syntax
  const copySyntaxBtn = document.getElementById('copy-syntax-btn');
  if (copySyntaxBtn) {
    copySyntaxBtn.addEventListener('click', () => {
      const syntax = document.getElementById('modal-transfer-syntax')?.textContent || '';
      copyToClipboard(syntax, `Đã copy cú pháp: "${syntax}"`);
    });
  }

  // Share Zalo
  const shareZaloBtn = document.getElementById('share-zalo-btn');
  if (shareZaloBtn) {
    shareZaloBtn.addEventListener('click', () => {
      const songTitle = window.__activeFreeTab?.title || 'bài hát';
      const shareUrl = window.location.href.split('#')[0];
      const shareText = `Tập guitar bài "${songTitle}" (Video Tab Miễn phí do Nhật Quang soạn): ${shareUrl}`;
      copyToClipboard(shareText, 'Đã sao chép link chia sẻ Zalo!');
    });
  }

  // Share Facebook
  const shareFbBtn = document.getElementById('share-fb-btn');
  if (shareFbBtn) {
    shareFbBtn.addEventListener('click', () => {
      const shareUrl = encodeURIComponent(window.location.href.split('#')[0]);
      const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
      window.open(fbShareUrl, '_blank', 'width=600,height=450,noopener,noreferrer');
      showToast('Đang mở hộp thoại chia sẻ Facebook!');
    });
  }
}

// ==========================================================================
// 4. ACOUSTIC GUITAR & CONCENTRIC TRIANGLE TRAIL CURSOR
// ==========================================================================

export function initCustomCursor() {
  // Không kích hoạt custom cursor trên bất kỳ trang admin nào
  if (window.location.pathname.includes('admin') || document.body.classList.contains('admin-page')) {
    return;
  }

  // Chỉ chạy trên thiết bị có chuột (pointer: fine), không chạy trên touch
  if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) {
    return;
  }

  // Dọn dẹp con trỏ cũ nếu có
  const oldRing = document.getElementById('custom-cursor');
  const oldDot = document.getElementById('custom-cursor-dot');
  if (oldRing) oldRing.remove();
  if (oldDot) oldDot.remove();

  let container = document.getElementById('cursor-guitar-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'cursor-guitar-container';
    document.body.appendChild(container);
  }

  // 1. Con trỏ chính: Cây đàn Acoustic Guitar
  let guitarEl = document.getElementById('cursor-guitar');
  if (!guitarEl) {
    guitarEl = document.createElement('div');
    guitarEl.id = 'cursor-guitar';
    guitarEl.innerHTML = `
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Đầu cần đàn & khóa đàn trỏ chính xác tại đỉnh (0,0) -->
        <path d="M2 2L7 7M2 4L4 2M3 5L5 3" stroke="#C1602F" stroke-width="2" stroke-linecap="round"/>
        <!-- Cần đàn & phím -->
        <path d="M5 5L12 12" stroke="#2D231C" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M6 4L7 6M8 6L9 8M10 8L11 10" stroke="#F4EFE6" stroke-width="1.2"/>
        <!-- Thùng đàn Acoustic dáng D/OM sắc nét -->
        <path d="M13 10.5C14 9.5 16 9.5 17.5 11C19 12.5 19 14.5 18 15.5C17.5 16 17 16.5 17.5 17.5C18 18.5 17.5 20 16 21C14.5 22 12.5 21.5 11.5 20C10.5 18.5 10.5 18 10 17.5C9 16.5 9 14.5 10.5 13C12 11.5 12 11.5 13 10.5Z" fill="#C1602F" stroke="#8C3F18" stroke-width="1.2"/>
        <!-- Lỗ thoát âm & ngựa đàn -->
        <circle cx="14.5" cy="14.5" r="1.6" fill="#2D231C"/>
        <rect x="15" y="16.5" width="2.8" height="1" rx="0.5" fill="#8C3F18" transform="rotate(-45 15 16.5)"/>
      </svg>
    `;
    container.appendChild(guitarEl);
  }

  // 2. Tạo 6 hạt đuôi tam giác lồng nhau
  const TRAIL_COUNT = 6;
  const trailPoints = [];
  const trailElements = [];

  const triangleSvg = `
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Tam giác lớn ngoài -->
      <polygon points="12,2 22,20 2,20" stroke="#C1602F" stroke-width="1.8" fill="rgba(193, 96, 47, 0.12)" stroke-linejoin="round"/>
      <!-- Tam giác lồng bên trong -->
      <polygon points="12,8 18,18 6,18" stroke="#E07A3F" stroke-width="1.4" fill="rgba(224, 122, 63, 0.35)" stroke-linejoin="round"/>
      <!-- Tâm điểm -->
      <circle cx="12" cy="14.5" r="1.2" fill="#C1602F"/>
    </svg>
  `;

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'triangle-trail-item cursor-hidden';
    el.innerHTML = triangleSvg;
    container.appendChild(el);
    trailElements.push(el);

    trailPoints.push({
      x: -100,
      y: -100,
      scale: Math.max(0.25, 0.85 - (i * 0.12)),
      opacity: Math.max(0.1, 0.85 - (i * 0.14)),
      ease: 0.28 - (i * 0.025),
      rotation: i * 15
    });
  }

  let mouseX = -100;
  let mouseY = -100;
  let isMoving = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    guitarEl.style.left = `${mouseX}px`;
    guitarEl.style.top = `${mouseY}px`;
    guitarEl.classList.remove('cursor-hidden');

    trailElements.forEach(el => el.classList.remove('cursor-hidden'));

    if (!isMoving) {
      isMoving = true;
      requestAnimationFrame(renderTrail);
    }
  }, { passive: true });

  function renderTrail() {
    let leaderX = mouseX;
    let leaderY = mouseY;
    let hasDelta = false;

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const p = trailPoints[i];
      const el = trailElements[i];

      p.x += (leaderX - p.x) * p.ease;
      p.y += (leaderY - p.y) * p.ease;

      el.style.left = `${p.x}px`;
      el.style.top = `${p.y}px`;
      el.style.transform = `translate(-50%, -50%) scale(${p.scale}) rotate(${p.rotation}deg)`;
      el.style.opacity = p.opacity;

      if (Math.abs(leaderX - p.x) > 0.1 || Math.abs(leaderY - p.y) > 0.1) {
        hasDelta = true;
      }

      leaderX = p.x;
      leaderY = p.y;
    }

    if (hasDelta) {
      requestAnimationFrame(renderTrail);
    } else {
      isMoving = false;
    }
  }

  document.addEventListener('mouseleave', () => {
    guitarEl.classList.add('cursor-hidden');
    trailElements.forEach(el => el.classList.add('cursor-hidden'));
  });

  document.addEventListener('mouseenter', () => {
    guitarEl.classList.remove('cursor-hidden');
    trailElements.forEach(el => el.classList.remove('cursor-hidden'));
  });

  // Event Delegation để bắt hover cho tất cả element tương tác
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, input, textarea, select, details, summary, [role="button"], .song-card, .gear-card, .cinema-3d-card, .cursor-pointer, .cursor-zoom-in');
    if (target) {
      guitarEl.classList.add('cursor-hover');
      container.classList.add('cursor-hover-trail');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('a, button, input, textarea, select, details, summary, [role="button"], .song-card, .gear-card, .cinema-3d-card, .cursor-pointer, .cursor-zoom-in');
    if (target) {
      guitarEl.classList.remove('cursor-hover');
      container.classList.remove('cursor-hover-trail');
    }
  });
}


// Tự động khởi tạo cursor khi nạp common.js
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomCursor);
} else {
  initCustomCursor();
}

