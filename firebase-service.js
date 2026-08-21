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
  setDoc,
  updateDoc,
  deleteDoc,
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
    // Sắp xếp theo id để giữ đúng thứ tự
    const q = query(collection(db, SONGS_COLLECTION), orderBy('__name__'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn('[GuitarByQuang] Firestore: collection "songs" trống hoặc chưa có data.');
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

/**
 * Tạo slug ID chuẩn hóa từ tiêu đề bài hát tiếng Việt
 * Ví dụ: "Nơi Này Có Anh" -> "noi-nay-co-anh"
 * @param {string} title
 * @returns {string}
 */
export function generateSlugId(title) {
  if (!title) return `song-${Date.now()}`;
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // Bỏ ký tự đặc biệt
    .trim()
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng -
    .replace(/-+/g, '-'); // Tránh dấu -- liên tiếp
}

/**
 * Kiểm tra xem ID bài hát đã tồn tại trong collection chưa
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function checkSongIdExists(id) {
  try {
    const docRef = doc(db, SONGS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error(`[GuitarByQuang] Lỗi kiểm tra tồn tại id="${id}":`, error);
    return false;
  }
}

/**
 * Thêm bài hát mới vào Firestore.
 * Tự sinh Slug ID, kiểm tra trùng (nếu trùng tự thêm -2, -3) rồi lưu.
 * @param {Object} songData
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function createSong(songData) {
  try {
    if (!songData || !songData.title) {
      return { success: false, error: 'Tiêu đề bài hát không được để trống.' };
    }

    // Tự sinh ID slug
    let baseSlug = generateSlugId(songData.title);
    let targetId = baseSlug;
    let counter = 2;

    while (await checkSongIdExists(targetId)) {
      targetId = `${baseSlug}-${counter}`;
      counter++;
    }

    // Clone dữ liệu và bỏ field id nếu có (vì Firestore dùng doc id)
    const dataToSave = { ...songData };
    delete dataToSave.id;

    // Đảm bảo kiểu dữ liệu đúng schema
    dataToSave.levelNum = Number(dataToSave.levelNum) || 5;
    dataToSave.price = Number(dataToSave.price) || 0;
    dataToSave.isFree = Boolean(dataToSave.isFree);
    dataToSave.hasDemo = Boolean(dataToSave.hasDemo);

    await setDoc(doc(db, SONGS_COLLECTION, targetId), dataToSave);
    return { success: true, id: targetId };
  } catch (error) {
    console.error('[GuitarByQuang] Lỗi khi tạo bài hát mới:', error);
    return { success: false, error: 'Không thể thêm bài hát. Vui lòng thử lại.' };
  }
}

/**
 * Cập nhật bài hát đã có trong Firestore
 * @param {string} id - Document ID
 * @param {Object} songData - Dữ liệu cập nhật
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateSong(id, songData) {
  try {
    if (!id) {
      return { success: false, error: 'Không tìm thấy ID bài hát để cập nhật.' };
    }

    const dataToSave = { ...songData };
    delete dataToSave.id;

    if (dataToSave.levelNum !== undefined) dataToSave.levelNum = Number(dataToSave.levelNum);
    if (dataToSave.price !== undefined) dataToSave.price = Number(dataToSave.price);
    if (dataToSave.isFree !== undefined) dataToSave.isFree = Boolean(dataToSave.isFree);
    if (dataToSave.hasDemo !== undefined) dataToSave.hasDemo = Boolean(dataToSave.hasDemo);

    const docRef = doc(db, SONGS_COLLECTION, id);
    await updateDoc(docRef, dataToSave);
    return { success: true };
  } catch (error) {
    console.error(`[GuitarByQuang] Lỗi khi cập nhật bài hát id="${id}":`, error);
    return { success: false, error: 'Không thể cập nhật bài hát. Vui lòng thử lại.' };
  }
}

/**
 * Xóa bài hát khỏi Firestore
 * @param {string} id - Document ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteSong(id) {
  try {
    if (!id) {
      return { success: false, error: 'Không tìm thấy ID bài hát để xóa.' };
    }
    const docRef = doc(db, SONGS_COLLECTION, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error(`[GuitarByQuang] Lỗi khi xóa bài hát id="${id}":`, error);
    return { success: false, error: 'Không thể xóa bài hát. Vui lòng thử lại.' };
  }
}
