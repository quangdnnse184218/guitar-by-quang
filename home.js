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

  // Render 3 thẻ bài hát nổi bật với kích thước hé lộ thẻ kế bên
  const songsHtml = songs.map((tab, index) => 
    renderSongCard(tab, index, 'flex-shrink-0 w-[74vw] max-w-[280px] snap-center md:w-auto md:max-w-none')
  ).join('');

  // Card "Xem thêm tab khác →" CTA cuối hàng trên Mobile
  const moreCardHtml = `
    <a href="kho-tab.html" class="flex-shrink-0 w-[74vw] max-w-[280px] snap-center md:hidden bg-surfaceCard/90 hover:bg-terracotta hover:text-white border-2 border-dashed border-terracotta/50 rounded-3xl p-6 shadow-soft transition-all duration-300 flex flex-col items-center justify-center text-center space-y-4 group/cta min-h-[360px]">
      <div class="w-14 h-14 rounded-full bg-terracotta-light text-terracotta group-hover/cta:bg-white group-hover/cta:text-terracotta flex items-center justify-center text-2xl shadow-sm group-hover/cta:scale-110 transition-transform">
        🎸
      </div>
      <div class="space-y-1.5">
        <span class="text-base font-black text-charcoal group-hover/cta:text-white transition-colors block">Xem Thêm Tab Khác</span>
        <p class="text-xs text-charcoal-muted group-hover/cta:text-white/80 transition-colors font-medium">Khám phá toàn bộ kho Video Tab fingerstyle & acoustic</p>
      </div>
      <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-terracotta text-white group-hover/cta:bg-white group-hover/cta:text-terracotta text-xs font-black transition-colors shadow-xs">
        <span>Xem toàn bộ kho tab</span>
        <svg class="w-3.5 h-3.5 transform group-hover/cta:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </span>
    </a>
  `;

  container.innerHTML = songsHtml + moreCardHtml;
}


// ==========================================================================
// SKELETON & ERROR STATES (cho #featured-grid)
// ==========================================================================

function showFeaturedSkeleton() {
  const container = document.getElementById('featured-grid');
  if (!container) return;
  container.innerHTML = `
    <div class="flex-shrink-0 w-[74vw] max-w-[280px] snap-center md:w-auto md:max-w-none skeleton-card rounded-3xl bg-surface/50 border border-charcoal-border/60 aspect-[3/4]"></div>
    <div class="flex-shrink-0 w-[74vw] max-w-[280px] snap-center md:w-auto md:max-w-none skeleton-card rounded-3xl bg-surface/50 border border-charcoal-border/60 aspect-[3/4]"></div>
    <div class="flex-shrink-0 w-[74vw] max-w-[280px] snap-center md:w-auto md:max-w-none skeleton-card rounded-3xl bg-surface/50 border border-charcoal-border/60 aspect-[3/4]"></div>
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
// SMOOTH FADE-UP REVEAL ANIMATION (ÁP DỤNG CẢ PC & MOBILE)
// ==========================================================================

function initSmoothFadeUp() {
  // Fallback an toàn nếu GSAP hoặc ScrollTrigger chưa tải
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  // Tôn trọng cài đặt giảm chuyển động của hệ điều hành (Accessibility)
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // 1. Hero Section Reveal (Text & Video Card)
  const heroLeft = document.querySelector('#hero .lg\\:col-span-7');
  if (heroLeft) {
    gsap.from(heroLeft.children, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
      clearProps: 'transform,opacity'
    });
  }

  const heroVideoWrapper = document.querySelector('#hero .lg\\:col-span-5');
  if (heroVideoWrapper) {
    gsap.from(heroVideoWrapper, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      delay: 0.1,
      ease: 'power2.out',
      clearProps: 'transform,opacity'
    });
  }

  // 2. Floating Music Motifs Parallax (Cuộn nhẹ nhàng)
  const motifs = document.querySelectorAll('.music-motif');
  motifs.forEach((motif, i) => {
    const depthSpeed = (i % 3 + 1) * 25;
    gsap.to(motif, {
      y: -depthSpeed,
      ease: 'none',
      scrollTrigger: {
        trigger: motif.closest('section') || motif,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });

  // 3. Section Giới Thiệu (#about) — Fade-up start top 85%
  const aboutGrid = document.querySelector('#about .grid');
  if (aboutGrid) {
    gsap.from(aboutGrid.children, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: aboutGrid,
        start: 'top 85%',
        once: true
      }
    });
  }

  // 4 Card đồ nghề (#about) — Fade-up stagger
  const gearCards = document.querySelectorAll('#about .flex.overflow-x-auto > div');
  if (gearCards.length > 0) {
    gsap.from(gearCards, {
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: '#about .flex.overflow-x-auto',
        start: 'top 85%',
        once: true
      }
    });
  }

  // 4. Section FAQ (#faq) — Fade-up stagger
  const faqItems = document.querySelectorAll('#faq details.faq-item');
  if (faqItems.length > 0) {
    gsap.from(faqItems, {
      opacity: 0,
      y: 30,
      stagger: 0.08,
      duration: 0.6,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: '#faq',
        start: 'top 85%',
        once: true
      }
    });
  }

  // 5. Section Dịch Vụ & Liên Hệ (#contact) — Fade-up
  const serviceCards = document.querySelectorAll('#contact .max-w-5xl .flex > div');
  if (serviceCards.length > 0) {
    gsap.from(serviceCards, {
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: '#contact .max-w-5xl',
        start: 'top 85%',
        once: true
      }
    });
  }

  const contactButtons = document.querySelectorAll('#contact .pt-4 > a');
  if (contactButtons.length > 0) {
    gsap.from(contactButtons, {
      opacity: 0,
      y: 20,
      stagger: 0.08,
      duration: 0.6,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: '#contact .pt-4',
        start: 'top 85%',
        once: true
      }
    });
  }
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

  // Khởi động Smooth Fade-Up Reveal (cả PC & Mobile)
  initSmoothFadeUp();

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
