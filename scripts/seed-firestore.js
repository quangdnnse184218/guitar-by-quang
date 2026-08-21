/**
 * GUITAR BY QUANG — Seed Script (Firestore)
 * ============================================================
 * Script Node.js chạy MỘT LẦN DUY NHẤT để ghi 10 bài hát lên Firestore.
 * KHÔNG phải file production — không cần deploy lên hosting.
 *
 * CÁCH CHẠY:
 * 1. Vào Firebase Console → Project Settings → Service Accounts
 *    → "Generate new private key" → tải file JSON về
 * 2. Đặt file JSON đó vào thư mục scripts/ (ví dụ: scripts/serviceAccountKey.json)
 * 3. Mở terminal tại thư mục gốc dự án (My_guitar_web/):
 *      node scripts/seed-firestore.js
 * 4. Xem log để xác nhận 10 bài đã được ghi thành công.
 *
 * DEPENDENCY:
 *    npm install firebase-admin
 * (chỉ cần cài 1 lần, không ảnh hưởng gì đến production site)
 * ============================================================
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = require(SERVICE_ACCOUNT_PATH);

initializeApp({
  credential: cert(serviceAccount),
  projectId: 'guitar-by-quang'
});

const db = getFirestore();

// ============================================================
// DATA: Copy y nguyên từ tabsData cũ trong app.js
// Document ID = field `id` của mỗi bài (tab-1 ... tab-10)
// Field `id` sẽ KHÔNG được lưu trong document body (tránh dư thừa)
// vì khi fetch sẽ lấy docSnap.id là document ID rồi.
// ============================================================
const tabsData = [
  {
    id: 'tab-1',
    title: 'Rồi em sẽ gặp 1 chàng trai khác',
    category: 'Nhạc Việt',
    level: '9/10',
    levelNum: 9,
    isFree: false,
    price: 239000,
    priceFormatted: '239.000đ',
    discountNote: 'HSSV ưu đãi còn 179k',
    tuning: 'Standard',
    duration: '03:40',
    description: 'Fingerstyle nâng cao: nhiều đoạn hammer-on/pull-off tốc độ cao, thế tay dãn rộng và có slap kết hợp tỉa nốt. Anh em nên luyện chậm từng ô nhịp.',
    hasDemo: true,
    videoDemo: 'assets/resg1ctkdemo.mp4',
    buttonType: 'buy',
    buttonText: 'Mua Video Tab',
    thumbnailBg: 'from-[#C1602F] to-[#6E3B1F]'
  },
  {
    id: 'tab-2',
    title: 'Nổi gió lên',
    category: 'Nhạc Việt',
    level: '4/10',
    levelNum: 4,
    isFree: true,
    price: 0,
    priceFormatted: 'Miễn phí',
    tuning: 'Standard',
    duration: '03:15',
    description: 'Ballad cơ bản: đi bass theo nhịp 4/4 kết hợp rải ngón dây 1-2-3 đơn giản. Rất hợp cho anh em mới bắt đầu làm quen với fingerstyle.',
    hasDemo: true,
    videoDemo: 'assets/noigiolendemo.mp4',
    buttonType: 'link',
    targetUrl: 'https://www.tiktok.com/@quangdnn104/video/7627688728240147732?is_from_webapp=1&sender_device=pc&web_id=7570986163722601985',
    buttonText: 'Tải video tab',
    thumbnailBg: 'from-[#CBB79E] to-[#7E9885]'
  },
  {
    id: 'tab-3',
    title: 'Intro tháng 4 là lời nói dối của em',
    category: 'Nhạc Việt',
    level: '6/10',
    levelNum: 6,
    isFree: true,
    price: 0,
    priceFormatted: 'Miễn phí',
    tuning: 'Standard',
    duration: '01:15',
    description: 'Đoạn intro kinh điển: chú ý các nốt slide (vuốt dây) liền mạch và kỹ thuật let-ring để giữ hợp âm ngân vang đều tay.',
    hasDemo: true,
    videoDemo: 'assets/thangtudemo.mp4',
    buttonType: 'link',
    targetUrl: 'https://www.tiktok.com/@quangdnn104/video/7625293561130405141?is_from_webapp=1&sender_device=pc&web_id=7570986163722601985',
    buttonText: 'Tải video tab (Miễn phí)',
    thumbnailBg: 'from-[#D9C3A0] to-[#8C6E8A]'
  },
  {
    id: 'tab-4',
    title: 'Chắc ai đó sẽ về',
    category: 'Nhạc Việt',
    level: '4/10',
    levelNum: 4,
    isFree: true,
    price: 0,
    priceFormatted: 'Miễn phí',
    tuning: 'Standard',
    duration: '03:50',
    description: 'Vòng hợp âm quen thuộc, không có thế bấm khó. Bài này chủ yếu giữ đều nhịp rải và đổi hợp âm dứt khoát.',
    hasDemo: false,
    buttonType: 'link',
    targetUrl: 'https://youtu.be/z9jFiANmQTs?si=3N703CQfBFtX7Dx9',
    buttonText: 'Link xem tab',
    thumbnailBg: 'from-[#C7B49C] to-[#6B5844]'
  },
  {
    id: 'tab-5',
    title: 'Em của ngày hôm qua',
    category: 'Nhạc Việt',
    level: '7/10',
    levelNum: 7,
    isFree: true,
    price: 0,
    priceFormatted: 'Miễn phí',
    tuning: 'Standard',
    duration: '03:35',
    description: 'Tiết tấu nhanh: kết hợp slap ngón cái (bass thumb) vào phách 2 và 4 để tạo nhịp gõ thùng, đoạn điệp khúc solo nốt liền tay.',
    hasDemo: false,
    buttonType: 'link',
    targetUrl: 'https://youtu.be/4MQ4mfm5mDs?si=y0Wm8PhRbTjh1qrF',
    buttonText: 'Link xem tab',
    thumbnailBg: 'from-[#D6BE9E] to-[#7E9885]'
  },
  {
    id: 'tab-6',
    title: 'Bạc phận',
    category: 'Nhạc Việt',
    level: '7.5/10',
    levelNum: 7.5,
    isFree: true,
    price: 0,
    priceFormatted: 'Miễn phí',
    tuning: 'Standard',
    duration: '03:40',
    description: 'Nhiều đoạn chuyển thế bấm chặn (barre chord) liên tục ở phím cao. Cần giữ lực ngón trỏ tốt để nốt không bị tịt tiếng.',
    hasDemo: false,
    buttonType: 'link',
    targetUrl: 'https://youtu.be/4pHsZuNtcZo?si=3XrQIwyXBBvhFCmO',
    buttonText: 'Link xem tab',
    thumbnailBg: 'from-[#BFA88E] to-[#5F4C3B]'
  },
  {
    id: 'tab-7',
    title: 'Golden hour',
    category: 'Nhạc Nước Ngoài',
    level: '6/10',
    levelNum: 6,
    isFree: true,
    price: 0,
    priceFormatted: 'Miễn phí',
    tuning: 'Standard',
    duration: '03:30',
    description: 'Mẫu rải arpeggio lặp lại liên tục với tốc độ đều. Anh em tập trung thả lỏng cổ tay phải để chuỗi nốt chạy thật mượt.',
    hasDemo: false,
    buttonType: 'link',
    targetUrl: 'https://youtu.be/83pXGn1t-94?si=a9GVYFPvRSRJBqyE',
    buttonText: 'Link xem tab',
    thumbnailBg: 'from-[#E0C9A6] to-[#CE9145]'
  },
  {
    id: 'tab-8',
    title: 'Sóng gió',
    category: 'Nhạc Việt',
    level: '7.5/10',
    levelNum: 7.5,
    isFree: true,
    price: 0,
    priceFormatted: 'Miễn phí',
    tuning: 'Standard',
    duration: '04:05',
    description: 'Tuyến bassline chạy liên tục, đòi hỏi tay trái bấm chắc và giữ nhịp chuẩn để không bị hụt nốt khi chuyển hợp âm.',
    hasDemo: false,
    buttonType: 'link',
    targetUrl: 'https://youtu.be/z28fkDnirKY?si=eLIvQpSSoxCZQaWr',
    buttonText: 'Link xem tab',
    thumbnailBg: 'from-[#C9AE92] to-[#8C6E8A]'
  },
  {
    id: 'tab-9',
    title: 'Âm thầm bên em',
    category: 'Nhạc Việt',
    level: '6.5/10',
    levelNum: 6.5,
    isFree: true,
    price: 0,
    priceFormatted: 'Miễn phí',
    tuning: 'Standard',
    duration: '04:15',
    description: 'Bài này xài hợp âm chặn vừa phải, đi bass nhịp 4/4 mộc mạc. Anh em chú ý lực ngón tay trái để tiếng đàn ngân tròn trịa.',
    hasDemo: false,
    buttonType: 'link',
    targetUrl: 'https://youtu.be/NPWSiVFlPf0?si=ZDdTXuL7mZbhnhv2',
    buttonText: 'Link xem tab',
    thumbnailBg: 'from-[#D8C4AC] to-[#647A6C]'
  },
  {
    id: 'tab-10',
    title: 'Nợ duyên',
    category: 'Nhạc Việt',
    level: '6/10',
    levelNum: 6,
    isFree: true,
    price: 0,
    priceFormatted: 'Miễn phí',
    tuning: 'Standard',
    duration: '03:10',
    description: 'Giai điệu vui tươi, nhịp điệu rộn rã. Chú ý các câu tỉa solo nốt luyến láy và các nhịp ngắt tiếng (staccato) dứt khoát.',
    hasDemo: false,
    buttonType: 'link',
    targetUrl: 'https://youtu.be/It3GVRIy3gs?si=KlPfcyWcCoHcQ6sp',
    buttonText: 'Link xem tab',
    thumbnailBg: 'from-[#C4AC93] to-[#6B5844]'
  }
];

// ============================================================
// SEED FUNCTION: Ghi từng bài lên Firestore
// ============================================================
async function seedFirestore() {
  console.log('[Seed] Bắt đầu ghi dữ liệu lên Firestore collection "songs"...\n');

  const batch = db.batch();

  tabsData.forEach(tab => {
    const { id, ...data } = tab; // Tách id ra — id sẽ là document ID, không lưu trong body
    const docRef = db.collection('songs').doc(id);
    batch.set(docRef, data);
    console.log(`  [Seed] Đã thêm vào batch: ${id} — "${tab.title}"`);
  });

  await batch.commit();
  console.log('\n[Seed] ✅ Xong! Đã ghi ' + tabsData.length + ' bài lên Firestore.');
  console.log('[Seed] Vào Firebase Console → Firestore → collection "songs" để kiểm tra nhé!');
}

seedFirestore().catch(err => {
  console.error('[Seed] ❌ Lỗi khi seed Firestore:', err);
  process.exit(1);
});
