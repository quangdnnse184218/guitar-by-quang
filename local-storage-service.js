/**
 * GUITAR BY QUANG — Local Storage Service Layer (Model)
 * 
 * Quản lý tính năng cá nhân hóa phía client không cần tài khoản:
 * 1. Bài hát Yêu thích (Favorites ❤️) — key: 'gbq_favorites'
 * 2. Bài hát Đã học xong (Completed ✓) — key: 'gbq_completed'
 * 
 * Tất cả thao tác bọc try/catch an toàn đề phòng trình duyệt chặn localStorage.
 */

const FAVORITES_KEY = 'gbq_favorites';
const COMPLETED_KEY = 'gbq_completed';

function getArrayFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(`[LocalStorageService] Lỗi khi đọc key "${key}":`, error);
    return [];
  }
}

function saveArrayToStorage(key, array) {
  try {
    localStorage.setItem(key, JSON.stringify(array));
    return true;
  } catch (error) {
    console.warn(`[LocalStorageService] Lỗi khi lưu key "${key}":`, error);
    return false;
  }
}

// ============================================================
// 1. YÊU THÍCH (Favorites)
// ============================================================

/**
 * Lấy danh sách ID các bài hát yêu thích
 * @returns {string[]}
 */
export function getFavorites() {
  return getArrayFromStorage(FAVORITES_KEY);
}

/**
 * Kiểm tra xem bài hát có trong danh sách yêu thích không
 * @param {string} songId
 * @returns {boolean}
 */
export function isFavorite(songId) {
  if (!songId) return false;
  const list = getFavorites();
  return list.includes(String(songId));
}

/**
 * Bật/Tắt trạng thái yêu thích của 1 bài hát
 * @param {string} songId
 * @returns {boolean} Trạng thái mới (true = đã thích, false = đã bỏ thích)
 */
export function toggleFavorite(songId) {
  if (!songId) return false;
  const strId = String(songId);
  let list = getFavorites();
  let nextState = false;

  if (list.includes(strId)) {
    list = list.filter(id => id !== strId);
    nextState = false;
  } else {
    list.push(strId);
    nextState = true;
  }

  saveArrayToStorage(FAVORITES_KEY, list);
  return nextState;
}

// ============================================================
// 2. ĐÃ HỌC XONG (Completed)
// ============================================================

/**
 * Lấy danh sách ID các bài hát đã học xong
 * @returns {string[]}
 */
export function getCompleted() {
  return getArrayFromStorage(COMPLETED_KEY);
}

/**
 * Kiểm tra xem bài hát có được đánh dấu đã học xong không
 * @param {string} songId
 * @returns {boolean}
 */
export function isCompleted(songId) {
  if (!songId) return false;
  const list = getCompleted();
  return list.includes(String(songId));
}

/**
 * Bật/Tắt trạng thái đã học xong của 1 bài hát
 * @param {string} songId
 * @returns {boolean} Trạng thái mới (true = đã học xong, false = chưa)
 */
export function toggleCompleted(songId) {
  if (!songId) return false;
  const strId = String(songId);
  let list = getCompleted();
  let nextState = false;

  if (list.includes(strId)) {
    list = list.filter(id => id !== strId);
    nextState = false;
  } else {
    list.push(strId);
    nextState = true;
  }

  saveArrayToStorage(COMPLETED_KEY, list);
  return nextState;
}
