/**
 * GUITAR BY QUANG — Firebase Service Layer (Model)
 * 
 * Đây là lớp "Model" trong kiến trúc MVC — chịu trách nhiệm DUY NHẤT
 * về việc đọc dữ liệu từ Firestore. Controller (app.js) và View (index.html)
 * không được trực tiếp gọi Firestore SDK ngoài file này.
 *
 * Collection Firestore: `songs`
 * Document ID: đúng field `id` của từng bài (`tab-1`, `tab-2`, ..., `tab-10`)
 * Schema field: giữ nguyên 100% tên field so với tabsData cũ.
 */

import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  orderBy,
  query
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Tên collection trên Firestore
const SONGS_COLLECTION = 'songs';

/**
 * Lấy toàn bộ danh sách bài hát từ Firestore.
 * Trả về mảng object có schema y hệt tabsData cũ.
 * Nếu lỗi (mất mạng, config sai, ...) → log console + trả về [] để trang không bị crash.
 *
 * @returns {Promise<Array>}
 */
export async function fetchAllSongs() {
  try {
    // Sắp xếp theo id để giữ đúng thứ tự tab-1, tab-2, ... tab-10
    const q = query(collection(db, SONGS_COLLECTION), orderBy('__name__'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn('[GuitarByQuang] Firestore: collection "songs" trống hoặc chưa có data. Chạy seed script nhé!');
      return [];
    }

    return snapshot.docs.map(docSnap => ({
      // Lấy đúng document ID làm field `id` (tab-1, tab-2, ...)
      id: docSnap.id,
      // Spread toàn bộ field của document — giữ nguyên tên field
      ...docSnap.data()
    }));
  } catch (error) {
    console.error('[GuitarByQuang] Lỗi khi fetch danh sách bài hát từ Firestore:', error);
    return [];
  }
}

/**
 * Lấy thông tin 1 bài hát theo ID.
 * Dùng cho openCheckoutModal() — nhưng hiện tại hàm đó vẫn đọc từ
 * biến tabsData trong bộ nhớ nên hàm này là dự phòng / dùng cho giai đoạn sau.
 *
 * @param {string} id - Document ID (ví dụ: "tab-1")
 * @returns {Promise<Object|null>}
 */
export async function fetchSongById(id) {
  try {
    const docRef = doc(db, SONGS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn(`[GuitarByQuang] Firestore: không tìm thấy bài hát với id="${id}"`);
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error(`[GuitarByQuang] Lỗi khi fetch bài hát id="${id}" từ Firestore:`, error);
    return null;
  }
}
