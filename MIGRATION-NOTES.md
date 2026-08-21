# Guitar By Quang — Migration Notes
## Giai đoạn 1: Data Layer → Firebase Firestore

---

## Files đã tạo / sửa

| File | Hành động | Mô tả |
|---|---|---|
| `firebase-config.js` | **MỚI** | Khởi tạo Firebase App + Firestore (`db`) qua CDN ESM |
| `firebase-service.js` | **MỚI** | Service layer: `fetchAllSongs()`, `fetchSongById()` |
| `scripts/seed-firestore.js` | **MỚI** | Script Node.js ghi 10 bài hát lên Firestore (chạy 1 lần) |
| `app.js` | **SỬA** | Xóa `tabsData` cứng, thêm async fetch, skeleton/error states |
| `index.html` | **SỬA** | Đổi `<script src="app.js">` → 3 `<script type="module">` |

---

## Những việc bạn cần tự làm thủ công

### Bước 1 — Bật Firestore trên Firebase Console
1. Vào [Firebase Console](https://console.firebase.google.com/) → Project **guitar-by-quang**
2. Menu trái → **Build** → **Firestore Database**
3. Nhấn **Create database** → chọn **Start in test mode** (cho phép đọc/ghi thoải mái khi dev)
4. Chọn region gần nhất (ví dụ: `asia-southeast1` — Singapore)
5. Nhấn **Done**

### Bước 2 — Seed data lên Firestore (chạy 1 lần)

```bash
# Cài firebase-admin (chỉ cần cho seed script, không deploy lên production)
npm install firebase-admin

# Lấy service account key:
# Firebase Console → Project Settings → Service Accounts
# → "Generate new private key" → tải file JSON về
# → Đặt vào: scripts/serviceAccountKey.json

# Chạy seed script
node scripts/seed-firestore.js
```

Sau khi chạy xong, vào Firebase Console → Firestore → collection `songs` sẽ thấy 10 documents.

### Bước 3 — Test website

> **QUAN TRỌNG**: Phải mở qua server (http://) không phải file:// vì Firebase SDK dùng CORS.

```bash
# Cách nhanh nhất nếu có Python:
python -m http.server 8080
# Rồi mở: http://localhost:8080

# Hoặc dùng VS Code extension "Live Server"
# Hoặc: npx serve .
```

Kiểm tra:
- [ ] 10 bài hát hiện ra đúng thứ tự
- [ ] Filter "Nhạc Việt" / "Nhạc Nước Ngoài" hoạt động
- [ ] Tìm kiếm tên bài (có dấu / không dấu) hoạt động
- [ ] Nút "Xem Video Demo" mở modal đúng bài
- [ ] Nút "Mua Video Tab" mở modal thanh toán đúng bài
- [ ] Copy STK / cú pháp chuyển khoản hoạt động

---

## Firestore Security Rules (Khuyến nghị sau khi test xong)

Vào Firebase Console → Firestore → **Rules**, paste nội dung sau:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collection songs: cho phép đọc công khai, KHÔNG cho phép ghi từ client
    match /songs/{songId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

## ROLLBACK — Quay về tabsData cứng nếu Firebase có vấn đề

Nếu cần tắt Firebase khẩn cấp và quay về dữ liệu cứng:

### Bước 1 — Sửa `index.html` (cuối `<body>`):
```html
<!-- Xóa 3 dòng này: -->
<script type="module" src="firebase-config.js"></script>
<script type="module" src="firebase-service.js"></script>
<script type="module" src="app.js"></script>

<!-- Thay lại bằng: -->
<script src="app.js"></script>
```

### Bước 2 — Sửa `app.js`:
1. Xóa dòng `import { fetchAllSongs } from './firebase-service.js';`
2. Đổi `DOMContentLoaded` callback từ `async` về thường
3. Thêm lại mảng `tabsData` cứng (10 object) vào đầu file
4. Xóa block fetch (`showSkeletonLoading`, `await fetchAllSongs()`, `showConnectionError()`)
5. Giữ lại dòng `computeNormalizedFields(tabsData)` và `renderTabs()`

> Toàn bộ data backup vẫn còn trong `scripts/seed-firestore.js` — copy từ mảng `tabsData` trong file đó.

---

## Kiến trúc sau refactor

```
index.html          ← View (HTML/CSS/Tailwind) — KHÔNG THAY ĐỔI GÌ
app.js              ← Controller (UI state, filter, search, render, modal)
firebase-service.js ← Model (fetch data từ Firestore)
firebase-config.js  ← Infrastructure (Firebase init)
```

```
Luồng dữ liệu:
Firestore (cloud) → fetchAllSongs() → tabsData[] → renderTabs() → DOM
```

---

## Ghi chú kỹ thuật

- **Firebase SDK**: v10.12.2 via CDN ESM (`https://www.gstatic.com/firebasejs/10.12.2/...`)
- **Collection**: `songs` — Document ID = `tab-1`, `tab-2`, ..., `tab-10`
- **Field `id`** không lưu trong document body — được lấy từ `docSnap.id` khi fetch
- **`type="module"`** bắt buộc để `import/export` hoạt động giữa các file JS trên static HTML
- Các hàm `openVideoDemoModal()` và `openCheckoutModal()` được expose qua `window.xxx = function` để `onclick` trong HTML template strings gọi được trong môi trường ES module

---

## Giai đoạn 2 — Tách trang Kho Tab & Tối ưu Trang chủ

**Ngày thực hiện:** 2026-08-21

### Mục tiêu
Tách kho bài hát thành trang riêng `kho-tab.html`, tối ưu trang chủ `index.html` chỉ hiển thị 3 bài nổi bật, chia JS thành các file có trách nhiệm rõ ràng.

### Files tạo mới
- `assets/theme-config.js` — Tách `tailwind.config = {...}` ra khỏi `index.html`. **Script thường (không phải module)**, phải chạy đồng bộ sau Tailwind CDN.
- `assets/theme.css` — Tách `<style>` block ra khỏi `index.html`. Dùng chung cả 2 trang.
- `common.js` — Shared utilities: normalize, debounce, renderSongCard, modal system (`toggleModal`, `openCheckoutModal`, `openVideoDemoModal`), scroll reveal, navbar shrink, mobile menu, modal listeners.
- `home.js` — Controller cho `index.html`: `getFeaturedSongs()`, `renderFeaturedSongs()`, `initScrollSpy()` (bản trang chủ), DOMContentLoaded.
- `kho-tab.js` — Controller cho `kho-tab.html`: filter, search, `renderTabs()` đầy đủ, DOMContentLoaded.
- `kho-tab.html` — Trang mới: full kho tab với filter/search/grid, 2 modals, footer.

### Files sửa đổi
- `index.html` — Tách inline style/config ra file ngoài; section `#kho-tab` → `#featured-grid` (3 bài nổi bật + CTA); nav/footer links `#kho-tab` → `kho-tab.html`; scripts: `app.js` → `common.js` + `home.js`.

### Files xóa
- `app.js` — Đã tách thành `common.js` + `home.js` + `kho-tab.js`.

### Quyết định kỹ thuật quan trọng
1. **`theme-config.js` là script thường** (không phải ES module): Tailwind CDN scan class ngay khi DOM parse, nếu dùng `type="module"` (deferred) thì config đến sau → màu custom mất.
2. **`window.__currentSongs` pattern**: `openCheckoutModal` và `openVideoDemoModal` trong `common.js` đọc từ `window.__currentSongs`. Cả `home.js` và `kho-tab.js` đều set `window.__currentSongs = songs` sau khi fetch xong.
3. **Guard chống race condition**: `openCheckoutModal` kiểm tra `if (!window.__currentSongs || !window.__currentSongs.length) return` ở đầu hàm — tránh crash khi user click quá nhanh trước khi Firestore fetch xong.
4. **Không có `initScrollSpy` trong `kho-tab.html`**: Trang chỉ có 1 section chính, không cần scroll-spy. Header dùng badge tĩnh "Kho Video Tab" thay cho dynamic indicator.
5. **Script loading order**: `firebase-config.js` → `firebase-service.js` → `common.js` → page-specific JS. Tất cả đều `type="module"` (trừ `theme-config.js`) — browser tôn trọng thứ tự khai báo.

### Kiến trúc sau Giai đoạn 2
```
index.html:
  <script src="assets/theme-config.js"> (sync, tailwind config)
  <link href="assets/theme.css">
  <script module> firebase-config.js → firebase-service.js → common.js → home.js

kho-tab.html:
  <script src="assets/theme-config.js"> (sync, tailwind config)
  <link href="assets/theme.css">
  <script module> firebase-config.js → firebase-service.js → common.js → kho-tab.js
```

### Rollback Giai đoạn 2
Nếu cần quay lại:
1. Khôi phục `app.js` từ git history: `git checkout HEAD~1 -- app.js`
2. Xóa `kho-tab.html`, `common.js`, `home.js`, `kho-tab.js`
3. Khôi phục `index.html`: `git checkout HEAD~1 -- index.html`
4. Xóa `assets/theme-config.js` và `assets/theme.css`

---

## Giai đoạn 3 — Công Cụ Hỗ Trợ Tập Đàn (Metronome Launch)

**Ngày thực hiện:** 2026-08-21

### Mục tiêu
Xây dựng trang hub "Công Cụ" và trang Metronome đầy đủ; thêm teaser section trên trang chủ; cập nhật nav/footer toàn bộ trang.

### Files tạo mới
- `cong-cu.html` — Hub page liệt kê các công cụ (Metronome hoạt động, Tuner + Chord Wheel "Sắp ra mắt").
- `cong-cu.js` — Controller tối giản cho cong-cu.html: import `initNavbarShrink`, `initMobileMenu`, `initScrollReveal` từ common.js. KHÔNG fetch Firestore.
- `metronome.html` — Trang app Metronome: layout tối giản căn giữa, BPM display lớn, slider, +/-, Play/Pause, Tap Tempo, beat flash visual, phím tắt.
- `metronome.js` — Logic Metronome đầy đủ với lookahead scheduler (Web Audio API chuẩn).

### Files sửa đổi
- `index.html` — Thêm "Công Cụ" vào desktop nav + mobile menu + footer; thêm section teaser Metronome (sau #kho-tab, trước FAQ).
- `kho-tab.html` — Thêm "Công Cụ" vào desktop nav + mobile menu + footer.

### Files KHÔNG sửa đổi (đảm bảo)
- `firebase-config.js`, `firebase-service.js`, `kho-tab.js` — Không liên quan.
- `common.js` — Chỉ import, không sửa.

### Quyết định kỹ thuật quan trọng
1. **Lookahead scheduler**: `metronome.js` dùng `AudioContext.currentTime` + `setTimeout(25ms)` polling để lên lịch `OscillatorNode` trước ~100ms. Đảm bảo tick không bị drift dù JavaScript event loop bận.
2. **rAF loop đồng bộ**: Animation flash visual (`requestAnimationFrame`) so sánh `audioCtx.currentTime` với `pendingFlashTimes[]` — không dùng setTimeout/setInterval riêng cho animation tránh lệch pha với audio.
3. **Tap Tempo**: Giữ tối đa 6 lần bấm gần nhất, reset sau 2.5s ngừng bấm, tính BPM từ khoảng cách trung bình.
4. **AudioContext trong user gesture**: `startMetronome()` tạo/resume `AudioContext` ngay trong click handler — tuân thủ browser autoplay policy.
5. **Không modal / không Firestore**: `cong-cu.html` và `metronome.html` chỉ nạp `common.js` + controller JS riêng — nhẹ, không kéo theo modal system hay firebase.
6. **2 card "Sắp ra mắt"**: `opacity-60`, `cursor-not-allowed`, `aria-disabled="true"` — không có link, không có hover effect, không tạo route thật.

### Sơ đồ trang sau Giai đoạn 3
```
index.html          ↔  kho-tab.html
    |                       |
    ↓                       ↓
cong-cu.html    ←→  (liên kết qua nav/footer toàn bộ trang)
    |
    ↓
metronome.html

Nav Order: Giới thiệu → Kho Video Tab → Công Cụ → Hỏi đáp → Liên hệ
```

---

## Giai đoạn 3.5 — Tinh chỉnh UI/UX theo Feedback thực tế

**Ngày thực hiện:** 2026-08-21

### Mục tiêu
Tinh chỉnh UI/UX dựa trên feedback thực tế: Bộ lọc Kho Tab mới (Tất cả / Trả phí / Miễn phí), Card Miễn phí tối giản kèm Free Tab Modal 2 cột (dark panel), Teaser công cụ 2 card trên trang chủ với CTA "Xem thêm" nổi bật, và đại tu toàn diện trang Metronome (theme tối studio, đèn báo nhịp xanh lá, chọn nhịp 4/4 3/4 6/8 2/4, bố cục ngang above-the-fold).

### Files tạo mới
- `assets/metronome-theme.css` — Theme CSS riêng cho Metronome: background studio tối `#1F1914`, đèn nhịp xanh lá `#10B981`, card mờ tinh tế, tối ưu contrast.

### Files sửa đổi
- `kho-tab.html`:
  - Đổi 3 filter buttons thành: "Tất cả" (`all`), "Trả phí" (`paid`), "Miễn phí" (`free`).
  - Thêm modal `#free-tab-modal` giao diện dark panel 2 cột (iframe video embed, link dự phòng, thông tin độ khó/tuning, nút tải PDFgraceful).
- `kho-tab.js`:
  - Cập nhật logic lọc theo `isFree` (`all`, `paid`, `free`).
- `common.js`:
  - Cập nhật `renderSongCard()`: rẽ nhánh nếu `tab.isFree === true` render card tối giản (badge FREE, tên bài, độ khó, toàn bộ card `cursor-pointer` gọi `openFreeTabModal()`).
  - Thêm `openFreeTabModal(tabId)` và `closeFreeTabModal()`.
  - Cập nhật `initModalListeners()` để quản lý `#free-tab-modal` và Escape key.
- `index.html`:
  - Cập nhật teaser công cụ thành 2 card: Card 1 Metronome + Card 2 Tuner "Sắp ra mắt".
  - Di chuyển nút CTA xuống dưới cùng khối, đổi text thành "Xem thêm", dùng style `bg-warm-gradient` nổi bật.
- `metronome.html`:
  - Nạp `assets/metronome-theme.css`.
  - Tái cấu trúc layout thành 3 vùng ngang (Đèn nhịp | BPM lớn + / - | Dropdown chọn nhịp 4/4, 3/4, 6/8, 2/4).
  - Thu nhỏ đèn to còn ~2/3 kích thước cũ, đặt nút Tap Tempo và Play/Pause sát nhau.
  - Tối ưu Above-the-fold không cần cuộn trang.
- `metronome.js`:
  - Hỗ trợ `beatsPerBar` động theo dropdown chọn nhịp.
  - Accent phách 1 động, render chấm đèn theo `beatsPerBar`.
  - Reset `currentBeat = 0` khi đổi nhịp lúc đang phát để không lệch phách.
  - Giữ vững 100% lookahead scheduler Web Audio API.

### Quyết định thiết kế
1. **Màu nền Metronome**: Dùng tông studio gỗ tối `#1F1914` và card `rgba(43, 34, 27, 0.85)` kết hợp đèn xanh lá Emerald `#10B981` — tạo cảm giác phòng thu tập đàn chuyên nghiệp, tách biệt nhưng cùng ngôn ngữ mộc với tổng thể web.
2. **Modal Free Tab**: Giao diện dark panel 2 cột với iframe tỉ lệ 16:9 phát video tab trực tiếp, hỗ trợ parse link YouTube sang embed URL tự động, link dự phòng nếu chặn nhúng, và nút PDF graceful fallback "Đang cập nhật".

---

## Fix cập nhật: Đồng bộ Free Tab Modal cho index.html & Tái thiết kế Card Free

**Ngày thực hiện:** 2026-08-21

### Thay đổi:
1. **Đồng bộ `#free-tab-modal` vào `index.html`**: Đã bổ sung cấu trúc Modal Dark Panel 2 cột vào cuối `index.html`, giúp khi bấm vào các bài hát Miễn phí trên trang chủ (như "Nợ duyên", "Nổi gió lên") thì modal hiển thị video tab và chi tiết đầy đủ giống như trên `kho-tab.html`.
2. **Tái thiết kế Card Free trong `common.js`**:
   - Bổ sung **Visual Banner Header** phía trên với tỉ lệ `aspect-[16/10]`, nền gradient xanh rêu mộc mạc `from-[#2D4A3E] via-[#385E4F] to-[#20362C]`, ở giữa có nút tròn icon Play trắng sáng kèm text "Xem Tab Miễn Phí".
   - Đồng bộ padding `p-4 sm:p-5` cho cả Card Free và Card Trả phí, giúp chiều cao 2 loại thẻ cân đối 1:1, không còn bị lệch hoặc trống trải.
   - Nút CTA phía dưới: "Xem Video Tab (Miễn phí) →" với style xanh lá trang nhã, toàn bộ thẻ hỗ trợ `cursor-pointer` và hiệu ứng hover mượt mà.

---

## Nâng cấp: Bổ sung thông tin chuyên sâu cho Free Tab Modal (#free-tab-modal)

**Ngày thực hiện:** 2026-08-21

### Thay đổi:
1. **Thông số Capo & Tempo**: Bổ sung hiển thị Capo (kẹp ngăn mấy / không kẹp) và Tempo gốc (~95 BPM) trong bảng thông số luyện tập.
2. **Nút mở nhanh Metronome**: Thêm nút `"🥁 Mở Metronome luyện bài này →"` trỏ trực tiếp sang `metronome.html`.
3. **Thẻ Kỹ Thuật (Technique Tags)**: Hiển thị các tag kỹ thuật sử dụng trong bài (Slap, Nail Attack, Hammer-on / Pull-off, Tỉa ngón, v.v.).
4. **Nút Chia Sẻ Nhanh**:
   - Nút **Zalo**: Tự động copy link kèm tiêu đề bài hát và hiển thị Toast thông báo.
   - Nút **Facebook**: Mở popup hộp thoại share trực tiếp của Facebook.
5. **Đồng bộ**: Cập nhật đồng bộ trên cả `index.html`, `kho-tab.html` và file điều khiển `common.js`.

---

## Nâng cấp: Grid 4 Cột & Modal Xem Phóng To Ảnh Đồ Nghề (index.html)

**Ngày thực hiện:** 2026-08-21

### Thay đổi:
1. **Lưới 4 cột trên Desktop**: Khối "Bộ đồ nghề mình đang dùng" trên `index.html` được chuyển sang lưới `lg:grid-cols-4`, padding gọn gàng `p-4 sm:p-5`, tỷ lệ ảnh `aspect-[4/3]`, thu gọn font chữ giúp hiển thị trọn vẹn cả 4 món đồ nghề trên 1 màn hình mà không bị che khuất khi cuộn trang.
2. **Modal Phóng To Ảnh (`#image-preview-modal`)**: Bổ sung Lightbox Modal nền tối mờ `bg-charcoal/85 backdrop-blur-md`, hiển thị ảnh sản phẩm sắc nét cùng tiêu đề và mô tả chi tiết.
3. **Tương tác trực quan**: Từng khung ảnh của 4 món đồ có hiệu ứng `cursor-zoom-in`, icon kính lúp xuất hiện khi hover và click để bung ảnh phóng to mượt mà.
4. **Điều khiển Modal**: Thêm `openImageModal` và `closeImageModal` trong `common.js`, hỗ trợ nút tắt `X`, click backdrop ngoài nền đen hoặc nhấn phím `Escape`.

---

## Nâng cấp: Phân Tầng Màu Nền (Section Contrast) & Đóng Khung Nổi Khối (index.html)

**Ngày thực hiện:** 2026-08-21

### Thay đổi:
1. **Phân tầng màu nền so le**:
   - **Hero (`#hero`)**: Nền kem sáng ấm tự nhiên có hiệu ứng hạt grain mộc mạc.
   - **Giới Thiệu (`#about`)**: Đổi sang màu nền trầm ấm hơn (`#EFE3D3`) kèm viền phân cách `border-[#D4BFAB]/70` giúp tạo điểm ngắt thị giác rõ ràng khi người dùng cuộn từ Hero xuống.
   - **Kho Video Tab Nổi Bật (`#kho-tab`)**: Đổi sang màu nền sáng nổi bật (`#FDFBF7`) kèm đường kẻ phân cách viền mờ `border-[#D4BFAB]/50` giúp các card bài hát tách biệt sắc nét.
   - **Teaser Công Cụ Hỗ Trợ Tập Đàn**: Dùng nền kem trầm nhẹ (`#EFE3D3]/60`).
   - **FAQ (`#faq`)**: Đổi sang tông kem ấm (`#F8F2E9`) tạo nhịp điệu màu nền xen kẽ nhẹ nhàng, thư giãn.
2. **Đóng khung nổi khối cho phần "Tự học đàn & chuyện làm tab"**:
   - Toàn bộ nội dung kể chuyện và tiêu đề phần Giới thiệu được đưa vào một **Container Card** nổi bật: `bg-surfaceCard/95 border border-[#D4BFAB] rounded-3xl p-6 sm:p-10 shadow-soft backdrop-blur-sm`, tạo cảm giác chỉn chu, sang trọng như một trang tạp chí acoustic.
3. **Hiệu ứng Scroll Reveal**:
   - Tinh chỉnh `.reveal` trong `assets/theme.css` trượt nhẹ 20px với thời gian transition 0.6s cubic-bezier mượt mà khi cuộn tới.
