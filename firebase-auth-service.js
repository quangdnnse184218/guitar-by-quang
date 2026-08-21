/**
 * GUITAR BY QUANG — Firebase Auth Service Layer (Model)
 * 
 * Quản lý phiên đăng nhập/đăng xuất cho Admin.
 * Không throw lỗi kỹ thuật thô ra ngoài — bọc try/catch và trả về kết quả
 * với thông điệp tiếng Việt dễ hiểu để UI hiển thị thân thiện.
 */

import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

/**
 * Đăng nhập Admin bằng Email và Mật khẩu
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function loginAdmin(email, password) {
  try {
    if (!email || !password) {
      return { success: false, error: 'Vui lòng nhập đầy đủ Email và Mật khẩu nhé.' };
    }
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('[AuthService] Lỗi đăng nhập:', error.code, error.message);
    let errorMsg = 'Đăng nhập không thành công, vui lòng thử lại.';
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      errorMsg = 'Sai email hoặc mật khẩu, thử lại giúp mình nhé.';
    } else if (error.code === 'auth/invalid-email') {
      errorMsg = 'Định dạng email không hợp lệ.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMsg = 'Đăng nhập sai quá nhiều lần. Vui lòng chờ ít phút rồi thử lại nhé.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMsg = 'Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền.';
    }
    return { success: false, error: errorMsg };
  }
}

/**
 * Đăng xuất Admin
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function logoutAdmin() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('[AuthService] Lỗi đăng xuất:', error);
    return { success: false, error: 'Không thể đăng xuất, vui lòng thử lại.' };
  }
}

/**
 * Lắng nghe thay đổi trạng thái Authentication (dùng để route-guard)
 * @param {function(Object|null): void} callback
 * @returns {function(): void} Unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
