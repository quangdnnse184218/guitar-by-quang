/**
 * GUITAR BY QUANG — Firebase Configuration
 * Firebase JS SDK v10+ (Modular / ESM via CDN)
 *
 * File này khởi tạo Firebase App và export Firestore instance (`db`)
 * để các module khác (firebase-service.js, app.js) có thể import dùng.
 *
 * QUAN TRỌNG: File này phải được load bằng <script type="module"> trong index.html.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js';

// ============================================================
// Firebase Project Config — "guitar-by-quang"
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyAPLn7o99JZxO_A77P-qKiHIllMoakriKs",
  authDomain: "guitar-by-quang.firebaseapp.com",
  projectId: "guitar-by-quang",
  storageBucket: "guitar-by-quang.firebasestorage.app",
  messagingSenderId: "1001713030454",
  appId: "1:1001713030454:web:e68a106efc9194d1dd0f97",
  measurementId: "G-TKZH7KFXRG"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo Firestore — đây là instance chính dùng cho toàn bộ app
export const db = getFirestore(app);

// Analytics (optional — chỉ chạy trên browser thật, không chạy khi localhost)
try {
  getAnalytics(app);
} catch (e) {
  // Analytics có thể bị block bởi ad blocker hoặc không hỗ trợ môi trường — không sao
  console.info('[Firebase] Analytics không khởi tạo được, bỏ qua.');
}
