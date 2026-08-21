/**
 * GUITAR BY QUANG — cong-cu.js
 * Controller cho trang cong-cu.html (Hub Công Cụ Hỗ Trợ Tập Đàn).
 * Trang này KHÔNG fetch Firestore — chỉ cần init UI helpers.
 */

import {
  initScrollReveal,
  initNavbarShrink,
  initMobileMenu,
} from './common.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavbarShrink();
  initMobileMenu();
  initScrollReveal();
});
