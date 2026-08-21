/**
 * GUITAR BY QUANG — home.js
 * Controller cho trang chủ index.html.
 * Xử lý: fetch songs, lấy 3 bài nổi bật, render vào #featured-grid.
 * Có initScrollSpy phiên bản trang chủ (không map kho-tab → nav active).
 */

import { fetchAllSongs } from './firebase-service.js';
import {
  computeNormalizedFields,
  renderSongCard,
  initScrollReveal,
  initNavbarShrink,
  initMobileMenu,
  initModalListeners,
} from './common.js';


// ==========================================================================
// FEATURED SONGS LOGIC
// ==========================================================================

/**
 * Lấy danh sách bài hát nổi bật từ toàn bộ songs.
 * Hiện tại: lấy 3 phần tử đầu (tab-1, tab-2, tab-3).
 * Thiết kế để dễ đổi logic sau (vd: ưu tiên field isFeatured hoặc viewCount)
 * mà không cần sửa nhiều nơi — chỉ sửa hàm này.
 */
function getFeaturedSongs(allSongs) {
  return allSongs.slice(0, 3);
}

function renderFeaturedSongs(songs) {
  const container = document.getElementById('featured-grid');
  if (!container) return;

  // Không cần carousel classes — featured-grid dùng CSS grid thẳng
  container.innerHTML = songs.map((tab, index) => renderSongCard(tab, index, '')).join('');
}


// ==========================================================================
// SKELETON & ERROR STATES (cho #featured-grid)
// ==========================================================================

function showFeaturedSkeleton() {
  const container = document.getElementById('featured-grid');
  if (!container) return;
  container.innerHTML = `
    <div class="skeleton-card rounded-3xl bg-surface/50 border border-charcoal-border/60 aspect-[3/4]"></div>
    <div class="skeleton-card rounded-3xl bg-surface/50 border border-charcoal-border/60 aspect-[3/4]"></div>
    <div class="skeleton-card rounded-3xl bg-surface/50 border border-charcoal-border/60 aspect-[3/4]"></div>
  `;
}

function showFeaturedError() {
  const container = document.getElementById('featured-grid');
  if (!container) return;
  container.innerHTML = `
    <div class="col-span-full py-12 text-center text-charcoal-muted space-y-3">
      <div class="text-3xl">🎸</div>
      <p class="text-base font-bold text-charcoal">Kho Video Tab đang bị gián đoạn kết nối, anh em thử tải lại trang giúp mình nhé!</p>
      <p class="text-xs">Mình sẽ check lại server sớm thôi. Cảm ơn anh em đã thông cảm!</p>
    </div>
  `;
}


// ==========================================================================
// SCROLL SPY — Phiên bản trang chủ
// Khác với version cũ: 'kho-tab' không còn map sang 'Kho Video Tab' trong nav
// vì nav link đó giờ dẫn sang kho-tab.html (trang khác), không còn là anchor nội trang.
// Khi user cuộn qua section#kho-tab (featured), mobile indicator hiện "Bài Nổi Bật".
// ==========================================================================

function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-tab-link');
  const mobileActiveText = document.getElementById('mobile-active-tab-text');
  const mobileActiveLink = document.getElementById('mobile-active-tab-link');

  const sectionMap = {
    'hero':    { name: 'Giới thiệu', target: '#about' },
    'about':   { name: 'Giới thiệu', target: '#about' },
    'kho-tab': { name: 'Bài Nổi Bật', target: '#kho-tab' },
    'faq':     { name: 'Hỏi đáp',     target: '#faq' },
    'contact': { name: 'Liên hệ',     target: '#contact' },
  };

  let lastActiveName = '';

  function updateActiveNav() {
    let currentSectionId = '';
    const scrollPos = window.scrollY + 130;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 80) {
      currentSectionId = 'contact';
    } else if (!currentSectionId) {
      currentSectionId = 'about';
    }

    // Desktop nav: chỉ highlight các link có data-nav khớp section ID
    navLinks.forEach(link => {
      const linkTarget = link.getAttribute('data-nav') || link.getAttribute('href').replace('#', '');
      if (linkTarget === currentSectionId || (currentSectionId === 'hero' && linkTarget === 'about')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Mobile indicator
    if (mobileActiveText && mobileActiveLink) {
      const currentInfo = sectionMap[currentSectionId] || { name: 'Giới thiệu', target: '#about' };
      if (currentInfo.name !== lastActiveName) {
        lastActiveName = currentInfo.name;
        mobileActiveText.style.opacity = '0';
        mobileActiveText.style.transform = 'translateY(-4px)';
        setTimeout(() => {
          mobileActiveText.textContent = currentInfo.name;
          mobileActiveLink.setAttribute('href', currentInfo.target);
          mobileActiveText.style.opacity = '1';
          mobileActiveText.style.transform = 'translateY(0)';
        }, 120);
      }
    }
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}


// ==========================================================================
// DOMCONTENTLOADED
// ==========================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Init UI ngay (không cần chờ data)
  initScrollSpy();
  initScrollReveal();
  initNavbarShrink();
  initMobileMenu();

  // Fetch & render 3 bài nổi bật
  showFeaturedSkeleton();
  const songs = await fetchAllSongs();

  if (!songs || songs.length === 0) {
    showFeaturedError();
  } else {
    // Set window.__currentSongs để openCheckoutModal (trong common.js) truy cập được
    window.__currentSongs = songs;
    computeNormalizedFields(songs);
    const featured = getFeaturedSongs(songs);
    renderFeaturedSongs(featured);
  }

  // Init modal listeners (checkout, demo, copy buttons, Escape)
  initModalListeners();
});
