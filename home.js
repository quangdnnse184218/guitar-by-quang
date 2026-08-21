/**
 * GUITAR BY QUANG — home.js
 * Controller cho trang chủ index.html.
 * Xử lý: fetch songs, lấy 3 bài nổi bật, render vào #featured-grid.
 * Có initScrollSpy phiên bản trang chủ (không map kho-tab → nav active).
 */

import { fetchAllSongs, fetchAllGears, DEFAULT_GEARS } from './firebase-service.js';
import {
  computeNormalizedFields,
  renderSongCard,
  initScrollReveal,
  initNavbarShrink,
  initMobileMenu,
  initModalListeners,
} from './common.js';

// ==========================================================================
// GEARS (BỘ ĐỒ NGHỀ) RENDER LOGIC
// ==========================================================================

function renderGears(gears) {
  const container = document.getElementById('gear-container');
  if (!container || !gears || gears.length === 0) return;

  container.innerHTML = gears.map(gear => {
    const buyButtonHtml = gear.buyUrl
      ? `<a href="${gear.buyUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta hover:text-terracotta-hover">
          <span>${gear.buyText || 'Mua trên Shopee'}</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>`
      : `<div class="text-xs font-bold text-terracotta italic">${gear.footerText ? `"${gear.footerText.replace(/"/g, '')}"` : ''}</div>`;

    const cleanDesc = (gear.description || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const cleanTitle = (gear.title || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

    return `
      <div class="flex-shrink-0 w-[74vw] max-w-[280px] snap-center bg-white border-2 border-[#D8CEBF] rounded-3xl p-4 sm:p-5 shadow-soft hover:shadow-float hover:border-terracotta-border transition-all duration-300 active:scale-95 flex flex-col justify-between gap-3.5 group md:w-auto md:max-w-none">
        <div class="space-y-3">
          <div onclick="openImageModal('${gear.image || 'assets/clover.jpg'}', '${cleanTitle}', '${cleanDesc}')" class="w-full aspect-[4/3] rounded-2xl bg-[#EDE5D8] flex items-center justify-center p-3 border border-charcoal-border/40 shadow-inner overflow-hidden group/img relative cursor-zoom-in group-hover:scale-[1.02] transition-transform duration-300" title="Click để phóng to ảnh">
            <img src="${gear.image || 'assets/clover.jpg'}" alt="${cleanTitle}" class="w-full h-full object-contain mix-blend-multiply" onerror="this.src='assets/clover.jpg'" />
            <div class="absolute bottom-2 right-2 p-1.5 rounded-lg bg-charcoal/60 text-white/90 opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-sm shadow-sm pointer-events-none">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>
            </div>
          </div>
          <div>
            <span class="text-[10px] font-extrabold font-mono tracking-widest text-terracotta uppercase block">${gear.category || 'THIẾT BỊ'}</span>
            <h4 class="text-base font-bold text-charcoal group-hover:text-terracotta transition-colors leading-snug">${gear.title}</h4>
            <p class="text-xs text-charcoal-muted font-medium leading-relaxed mt-1 line-clamp-3">${gear.description || ''}</p>
          </div>
        </div>
        <div class="pt-2 border-t border-[#EAE3D9]">
          ${buyButtonHtml}
        </div>
      </div>
    `;
  }).join('');

  // Refresh ScrollTrigger nếu đang dùng GSAP
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
}



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
  // NOTE: Gear cards được render động bởi JS (renderGears) sau khi fetch Firestore.
  // ScrollTrigger.refresh() sẽ được gọi sau khi renderGears() hoàn tất.
  // Ở đây chỉ đặt ScrollTrigger trên container, không chạy trước khi có DOM.

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

  // Fetch & render bộ đồ nghề từ Firestore (hoặc fallback mặc định)
  try {
    const gears = await fetchAllGears();
    if (gears && gears.length > 0) {
      renderGears(gears);
    } else {
      renderGears(DEFAULT_GEARS);
    }
  } catch (err) {
    console.warn('[GuitarByQuang] Không load được gears động, dùng DEFAULT_GEARS:', err);
    renderGears(DEFAULT_GEARS);
  }

  // Init modal listeners (checkout, demo, copy buttons, Escape)
  initModalListeners();
});
