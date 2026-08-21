/**
 * GUITAR BY QUANG — admin-login.js
 * Controller xử lý đăng nhập cho trang admin-login.html
 */

import { loginAdmin, onAuthChange } from './firebase-auth-service.js';

// Route Guard: Nếu đã đăng nhập từ trước, tự động chuyển vào dashboard
onAuthChange((user) => {
  if (user) {
    window.location.href = 'admin-dashboard.html';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('admin-login-form');
  const emailInput = document.getElementById('admin-email');
  const passwordInput = document.getElementById('admin-password');
  const errorBox = document.getElementById('login-error');
  const errorText = document.getElementById('login-error-text');
  const submitBtn = document.getElementById('login-submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');

  function showError(msg) {
    if (errorText) errorText.textContent = msg;
    if (errorBox) errorBox.classList.remove('hidden');
  }

  function hideError() {
    if (errorBox) errorBox.classList.add('hidden');
  }

  function setLoading(loading) {
    if (submitBtn) submitBtn.disabled = loading;
    if (btnText) btnText.classList.toggle('hidden', loading);
    if (btnSpinner) btnSpinner.classList.toggle('hidden', !loading);
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError();

      const email = emailInput?.value || '';
      const password = passwordInput?.value || '';

      if (!email.trim() || !password) {
        showError('Vui lòng nhập đầy đủ Email và Mật khẩu nhé.');
        return;
      }

      setLoading(true);
      const result = await loginAdmin(email, password);
      setLoading(false);

      if (result.success) {
        window.location.href = 'admin-dashboard.html';
      } else {
        showError(result.error || 'Đăng nhập không thành công, vui lòng thử lại.');
      }
    });
  }
});
