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

import { db, storage } from './firebase-config.js';
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
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

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

/**
 * Upload file media (video/ảnh) lên Firebase Storage.
 * @param {File} file - File object từ <input type="file">
 * @param {string} folder - Thư mục lưu trữ ('videos' | 'images')
 * @param {Function} onProgress - Callback(percent: number) cập nhật tiến trình (0-100)
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export function uploadMediaFile(file, folder = 'videos', onProgress) {
  return new Promise((resolve) => {
    try {
      if (!file) {
        resolve({ success: false, error: 'Không có file để upload.' });
        return;
      }

      // Tạo tên file duy nhất: timestamp_originalname
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${folder}/${Date.now()}_${safeName}`;
      const fileRef = storageRef(storage, filePath);

      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (typeof onProgress === 'function') onProgress(percent);
        },
        (error) => {
          console.error('[GuitarByQuang] Lỗi upload Storage:', error);
          resolve({ success: false, error: 'Upload thất bại: ' + error.message });
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ success: true, url: downloadUrl });
          } catch (err) {
            resolve({ success: false, error: 'Không lấy được URL sau upload.' });
          }
        }
      );
    } catch (error) {
      console.error('[GuitarByQuang] Lỗi khởi tạo upload:', error);
      resolve({ success: false, error: 'Không thể khởi động upload.' });
    }
  });
}


// ==========================================================================
// GEARS (BỘ ĐỒ NGHỀ) CRUD OPERATIONS
// ==========================================================================

const GEARS_COLLECTION = 'gears';

export const DEFAULT_GEARS = [
  {
    id: 'gear-clover-914c',
    category: 'GUITAR CHÍNH',
    title: 'Clover 914c Custom',
    image: 'assets/clover.jpg',
    description: 'Mặt Sitka Spruce, lưng hông Rosewood. Tiếng mộc dày, âm bass ấm và action được căn rất êm tay.',
    buyUrl: '',
    buyText: '',
    footerText: 'Cần mua đàn nhắn mình tư vấn giá ưu đãi nhé.',
    order: 1
  },
  {
    id: 'gear-akg-ara',
    category: 'MICROPHONE THU ÂM',
    title: 'AKG Ara C22 USB',
    image: 'assets/akg.jpg',
    description: 'Mic thu cắm cổng USB trực tiếp vào máy tính, thu âm mộc qua Audacity, chỉ chỉnh âm lượng chứ không can thiệp hiệu ứng.',
    buyUrl: 'https://s.shopee.vn/3VjbUzpuHA',
    buyText: 'Mua trên Shopee',
    footerText: '',
    order: 2
  },
  {
    id: 'gear-elixir-bronze',
    category: 'DÂY ĐÀN & PHỤ KIỆN',
    title: 'Elixir Bronze (11-52)',
    image: 'assets/elixer.jpg',
    description: 'Dây phủ nanoweb bấm êm tay, lâu rỉ. Kẹp kèm Capo Shubb C1B bằng đồng chống phô nốt.',
    buyUrl: 'https://s.shopee.vn/gPQ7oVDzX',
    buyText: 'Mua trên Shopee',
    footerText: '',
    order: 3
  },
  {
    id: 'gear-guitar-pro-8',
    category: 'PHẦN MỀM SOẠN TAB',
    title: 'Guitar Pro 8',
    image: 'assets/gp8.jpg',
    description: 'Phần mềm để mình viết tab, xuất file nhạc và căn chỉnh nhịp phách chi tiết trước khi quay video.',
    buyUrl: '',
    buyText: '',
    footerText: 'Lên YouTube tìm cách tải Guitar Pro 8 là có nhé.',
    order: 4
  }
];

/**
 * Lấy toàn bộ danh sách đồ nghề từ Firestore (fallback DEFAULT_GEARS nếu rỗng)
 * @returns {Promise<Array>}
 */
export async function fetchAllGears() {
  try {
    const q = query(collection(db, GEARS_COLLECTION), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return DEFAULT_GEARS;
    }

    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.warn('[GuitarByQuang] Lỗi fetch gears từ Firestore, dùng DEFAULT_GEARS:', error);
    return DEFAULT_GEARS;
  }
}

/**
 * Lấy chi tiết 1 món đồ nghề
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function fetchGearById(id) {
  try {
    const docRef = doc(db, GEARS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error(`[GuitarByQuang] Lỗi fetch gear id="${id}":`, error);
    return null;
  }
}

/**
 * Kiểm tra xem ID đồ nghề đã tồn tại trong collection gears chưa
 * @param {string} id
 * @returns {Promise<boolean>}
 */
async function checkGearIdExists(id) {
  try {
    const docRef = doc(db, GEARS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error(`[GuitarByQuang] Lỗi kiểm tra tồn tại gear id="${id}":`, error);
    return false;
  }
}

/**
 * Thêm món đồ nghề mới
 * @param {Object} gearData
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function createGear(gearData) {
  try {
    if (!gearData || !gearData.title) {
      return { success: false, error: 'Tên món đồ nghề không được để trống.' };
    }

    let baseSlug = generateSlugId(gearData.title);
    let targetId = `gear-${baseSlug}`;
    let counter = 2;

    while (await checkGearIdExists(targetId)) {
      targetId = `gear-${baseSlug}-${counter}`;
      counter++;
    }

    const dataToSave = { ...gearData };
    delete dataToSave.id;

    dataToSave.order = Number(dataToSave.order) || 1;
    dataToSave.category = dataToSave.category || 'THIẾT BỊ';
    dataToSave.image = dataToSave.image || 'assets/clover.jpg';
    dataToSave.description = dataToSave.description || '';
    dataToSave.buyUrl = dataToSave.buyUrl || '';
    dataToSave.buyText = dataToSave.buyText || 'Mua ngay';
    dataToSave.footerText = dataToSave.footerText || '';

    await setDoc(doc(db, GEARS_COLLECTION, targetId), dataToSave);
    return { success: true, id: targetId };
  } catch (error) {
    console.error('[GuitarByQuang] Lỗi khi tạo gear:', error);
    return { success: false, error: 'Không thể thêm món đồ nghề. Vui lòng thử lại.' };
  }
}

/**
 * Cập nhật món đồ nghề
 * @param {string} id
 * @param {Object} gearData
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateGear(id, gearData) {
  try {
    if (!id) return { success: false, error: 'Không tìm thấy ID món đồ nghề.' };

    const dataToSave = { ...gearData };
    delete dataToSave.id;

    if (dataToSave.order !== undefined) dataToSave.order = Number(dataToSave.order);

    const docRef = doc(db, GEARS_COLLECTION, id);
    await updateDoc(docRef, dataToSave);
    return { success: true };
  } catch (error) {
    console.error(`[GuitarByQuang] Lỗi cập nhật gear id="${id}":`, error);
    return { success: false, error: 'Không thể cập nhật món đồ nghề. Vui lòng thử lại.' };
  }
}

/**
 * Xóa món đồ nghề khỏi Firestore
 * @param {string} id
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteGear(id) {
  try {
    if (!id) return { success: false, error: 'Không tìm thấy ID món đồ nghề để xóa.' };
    const docRef = doc(db, GEARS_COLLECTION, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error(`[GuitarByQuang] Lỗi xóa gear id="${id}":`, error);
    return { success: false, error: 'Không thể xóa món đồ nghề. Vui lòng thử lại.' };
  }
}


