$chunk1 = @'
<!DOCTYPE html>
<html lang="vi" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Guitar By Quang - Kho Video Tab Fingerstyle</title>
  <meta name="description" content="Góc chia sẻ video cover acoustic và Video Tab guitar fingerstyle do Nhật Quang tự làm. Hướng dẫn chi tiết, thực tế và dễ tập." />

  <!-- Open Graph / Social Share Preview -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Guitar By Quang - Kho Video Tab Fingerstyle" />
  <meta property="og:description" content="Góc chia sẻ video cover acoustic và Video Tab guitar fingerstyle do Nhật Quang tự làm." />
  <meta property="og:image" content="assets/avatar.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Guitar By Quang - Kho Video Tab Fingerstyle" />
  <meta name="twitter:description" content="Kho video tab guitar acoustic và fingerstyle của Nhật Quang." />
  <meta name="twitter:image" content="assets/avatar.jpg" />

  <!-- Favicon -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎸</text></svg>">

  <!-- Google Font: Nunito -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600;1,700&display=swap" rel="stylesheet">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Tailwind Custom Theme (script thường, không phải module) -->
  <script src="assets/theme-config.js"></script>
  <!-- Custom CSS dùng chung -->
  <link rel="stylesheet" href="assets/theme.css">
</head>
<body class="bg-grain min-h-screen flex flex-col selection:bg-terracotta-light selection:text-terracotta">

  <!-- NAVIGATION BAR -->
  <header id="navbar" class="sticky top-0 z-40 transition-all duration-300 bg-[#E4D3BF]/95 backdrop-blur-md border-b border-[#D4BFAB] shadow-sm">
    <div class="navbar-inner max-w-7xl mx-auto px-4 sm:px-8 md:px-12 h-20 flex items-center justify-between flex-nowrap gap-2">
      
      <a href="#hero" class="group flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0">
        <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-terracotta/80 shadow-sm flex-shrink-0 bg-stone-300 group-hover:scale-105 transition-transform duration-200">
          <img src="assets/avatar.jpg" alt="Guitar By Quang" class="w-full h-full object-cover object-center" />
        </div>
        <div class="flex flex-col">
          <span class="text-lg sm:text-2xl font-extrabold tracking-tight text-charcoal group-hover:text-terracotta transition-colors duration-200 leading-tight">Guitar By Quang</span>
          <span class="text-[11px] font-semibold text-charcoal-muted hidden sm:inline-block tracking-wide">fingerstyle diary • Nhật Quang</span>
        </div>
      </a>

      <nav id="desktop-nav" class="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm font-bold text-charcoal-muted flex-nowrap whitespace-nowrap">
        <a href="#about" data-nav="about" class="nav-tab-link hover:text-charcoal py-1">Giới thiệu</a>
        <a href="kho-tab.html" class="nav-tab-link hover:text-charcoal py-1">Kho Video Tab</a>
        <a href="#faq" data-nav="faq" class="nav-tab-link hover:text-charcoal py-1">Hỏi đáp</a>
        <a href="#contact" data-nav="contact" class="nav-tab-link hover:text-charcoal py-1">Liên hệ</a>
      </nav>

      <div class="md:hidden flex items-center justify-center flex-1 mx-1 overflow-hidden">
        <a id="mobile-active-tab-link" href="#about" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surfaceCard/95 border border-[#D4BFAB] text-xs font-extrabold text-terracotta shadow-xs transition-all duration-300 max-w-full group">
          <span class="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse flex-shrink-0"></span>
          <span id="mobile-active-tab-text" class="truncate transition-all duration-200 inline-block">Giới thiệu</span>
        </a>
      </div>

      <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <a href="https://www.tiktok.com/@quangdnn104" target="_blank" rel="noopener noreferrer" class="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-surfaceCard text-charcoal hover:bg-terracotta hover:text-white border border-charcoal-border/80 transition-all shadow-sm">
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
          <span>TikTok @quangdnn104</span>
        </a>
        <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg text-charcoal hover:bg-surface/80 transition-colors cursor-pointer" aria-label="Mở menu" aria-expanded="false" aria-controls="mobile-menu">
          <svg id="menu-icon-open" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" /></svg>
          <svg id="menu-icon-close" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>

    <div id="mobile-menu" class="hidden md:hidden bg-[#E4D3BF] border-b border-[#D4BFAB] px-6 py-5">
      <div class="flex flex-col space-y-3 text-base font-bold text-charcoal">
        <a href="#about" class="mobile-nav-link py-2 border-b border-charcoal-border/40 hover:text-terracotta">Giới thiệu</a>
        <a href="kho-tab.html" class="mobile-nav-link py-2 border-b border-charcoal-border/40 hover:text-terracotta">Kho Video Tab Guitar</a>
        <a href="#faq" class="mobile-nav-link py-2 border-b border-charcoal-border/40 hover:text-terracotta">Hỏi đáp</a>
        <a href="#contact" class="mobile-nav-link py-2 hover:text-terracotta">Liên hệ (TikTok, Zalo, Facebook)</a>
      </div>
    </div>
  </header>
'@
$chunk1 | Out-File -FilePath 'd:\My_guitar_web\index.html' -Encoding UTF8

$chunk2 = @'


  <main class="flex-grow">

    <!-- HERO SECTION -->
    <section id="hero" class="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-hero-glow">
      <svg class="music-motif motif-fade-terracotta absolute -top-6 right-4 sm:right-10 w-28 h-28 sm:w-40 sm:h-40" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <path d="M52 8c-7 0-12 6-12 13 0 5 3 9 7 13-6 6-12 12-12 21 0 10 8 17 18 17 9 0 16-7 16-16 0-8-6-14-13-16v-19c4 3 7 7 7 12 0 3-1 5-3 7l3 3c3-3 5-7 5-11 0-8-5-14-12-17V13c0-3 2-5 4-5s4 2 4 5c0 2-1 3-2 4l3 3c2-2 3-5 3-7 0-6-5-11-11-11Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
        <circle cx="49" cy="66" r="9" stroke="currentColor" stroke-width="2.2"/>
      </svg>
      <svg class="music-motif motif-fade-sage motif-float absolute top-24 right-24 sm:right-40 w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 18V5l10-2v11.5M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-3.5a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      <svg class="music-motif motif-fade-terracotta motif-float absolute top-10 left-6 sm:left-16 w-6 h-6" style="animation-delay: -2s;" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 18V5l10-2v11.5M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-3.5a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      <div class="music-motif motif-fade-faint staff-lines absolute inset-x-0 bottom-0 h-24 sm:h-32" aria-hidden="true"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 md:px-12">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-charcoal-border/80 text-xs font-bold text-charcoal-muted tracking-wide">
              <span class="w-2 h-2 rounded-full bg-terracotta animate-pulse"></span>
              <span>Acoustic & Fingerstyle • Nhật Quang</span>
            </div>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl lg:leading-[1.2] text-charcoal font-extrabold tracking-tight">
              Chào mọi người, đây là nơi mình lưu trữ <span class="text-terracotta font-extrabold">bản cover & Video Tab</span> .
            </h1>
            <div class="space-y-3 text-charcoal-muted text-base sm:text-lg leading-relaxed max-w-2xl font-medium">
              <p>Mình là <strong class="font-bold text-charcoal">Nhật Quang</strong>. Toàn bộ video cover và Video Tab ở đây đều do mình tự thu mộc và ngồi soạn lại từng nốt. Hi vọng giúp anh em tập bài dễ hơn và đỡ mất công mò nốt.</p>
              <div class="p-4 rounded-2xl bg-surfaceCard border-l-4 border-terracotta shadow-soft text-sm sm:text-base text-charcoal font-semibold">
                💡 <span class="text-charcoal-muted">Mẹo nhỏ:</span> Khi mới tập fingerstyle, anh em cứ đánh thật chậm theo nhịp metronome trước, đúng nốt và sạch tiếng rồi hẵng tăng tốc độ nhé!
              </div>
            </div>
            <div class="pt-3 flex flex-wrap items-center gap-4 sm:gap-6">
              <a href="https://www.tiktok.com/@quangdnn104" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-surfaceCard hover:bg-charcoal text-charcoal hover:text-white border border-charcoal-border/80 text-sm font-bold transition-all shadow-soft group">
                <svg class="w-4 h-4 fill-current text-terracotta group-hover:text-white transition-colors" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
                <span>Xem TikTok của Quang</span>
              </a>
              <a href="kho-tab.html" class="inline-flex items-center gap-2 text-sm font-bold text-charcoal hover:text-terracotta group py-2">
                <span>Xem kho Video Tab</span>
                <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </a>
            </div>
          </div>

          <div class="lg:col-span-5 relative">
            <div class="relative mx-auto max-w-md lg:max-w-none">
              <div class="absolute -top-6 -right-6 w-72 h-72 bg-ochre-light/50 rounded-full blur-3xl pointer-events-none"></div>
              <div class="absolute -bottom-8 -left-6 w-64 h-64 bg-terracotta-light/60 rounded-full blur-3xl pointer-events-none"></div>
              <div class="relative bg-surface rounded-3xl p-3 sm:p-4 border border-charcoal-border/90 shadow-soft">
                <div class="relative overflow-hidden rounded-2xl aspect-video bg-charcoal shadow-lg">
                  <video id="hero-cover-video" controls playsinline preload="metadata" class="w-full h-full aspect-video rounded-2xl shadow-lg object-cover">
                    <source src="assets/resg1ctk.mp4" type="video/mp4">
                    Trình duyệt của bạn không hỗ trợ phát video trực tiếp.
                  </video>
                </div>
                <div class="pt-3 px-1 flex items-center justify-between gap-2">
                  <div class="space-y-0.5">
                    <h4 class="font-bold text-charcoal text-sm sm:text-base">Rồi em sẽ gặp 1 chàng trai khác</h4>
                    <p class="text-xs text-charcoal-muted font-medium">Cover Fingerstyle • Nhật Quang</p>
                  </div>
                  <a href="kho-tab.html" class="px-3 py-1.5 rounded-full bg-warm-gradient hover:brightness-105 text-white text-xs font-bold whitespace-nowrap transition-all shadow-glow">Xem Video Tab</a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>


    <!-- ABOUT ME -->
    <section id="about" class="relative py-20 bg-surface/60 border-y border-charcoal-border/60 overflow-hidden">
      <svg class="music-motif motif-fade-sage motif-float absolute top-10 left-4 sm:left-10 w-10 h-10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 18V5l10-2v11.5M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-3.5a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      <svg class="music-motif motif-fade-terracotta absolute bottom-6 right-6 sm:right-16 w-24 h-24 sm:w-32 sm:h-32" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <path d="M20 70c0-22 18-40 40-40M20 70c0-11 9-20 20-20M20 70c0-5.5 4.5-10 10-10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="60" cy="30" r="4" fill="currentColor"/>
      </svg>

      <div class="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 md:px-12 space-y-16">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start reveal">
          <div class="lg:col-span-4 space-y-3">
            <h2 class="text-3xl sm:text-4xl text-charcoal font-extrabold">Tự học đàn & <br><span class="text-terracotta">chuyện làm tab.</span></h2>
            <p class="text-charcoal-muted text-sm leading-relaxed font-medium">Không qua trường lớp bài bản, mình tự nghe nốt rồi soạn lại theo cách bấm thuận tay và dễ tiếp cận nhất cho anh em.</p>
          </div>
          <div class="lg:col-span-8 space-y-4 text-charcoal text-base sm:text-lg leading-relaxed font-medium">
            <p>Hồi cấp 3 mình bắt đầu tự mò học guitar qua YouTube. Cứ xem clip cover của các anh em trên mạng rồi tua chậm từng giây, nhìn thế tay người ta bấm để bắt chước lại từng nốt một.</p>
            <p>Tập nhiều thành quen, từ việc nhìn tab đánh theo, mình bắt đầu <span class="font-bold text-terracotta">tự nghe nốt và tự soạn lại tab</span> cho các bài hát yêu thích sang fingerstyle. Mỗi bài mình thường mất vài ngày nghe đi nghe lại, xếp thế tay sao cho vừa giữ được giai điệu gốc mà vừa dễ bấm, không bị với ngón quá gắt.</p>
            <p>Mỗi ngày rảnh rỗi mình vẫn dành vài tiếng để ôm đàn luyện ngón. Tất cả Video Tab chia sẻ trên web này đều được mình kiểm tra kỹ từng ô nhịp và quay hướng dẫn rõ ràng để anh em xem là tập được ngay.</p>
          </div>
        </div>

        <div class="pt-10 border-t border-charcoal-border/70 w-full">
          <div class="text-center max-w-2xl mx-auto mb-10 space-y-2 reveal">
            <h3 class="text-2xl sm:text-3xl font-extrabold text-charcoal">Bộ đồ nghề mình đang dùng</h3>
            <p class="text-xs sm:text-sm text-charcoal-muted font-medium">Mấy món đồ đơn giản mình dùng để quay clip và thu âm hằng ngày.</p>
          </div>

          <div class="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-5 pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-7 md:overflow-visible md:snap-none w-full">

            <div class="reveal flex-shrink-0 w-[76%] snap-center md:w-auto md:flex-shrink md:snap-none p-5 sm:p-6 rounded-3xl bg-surfaceCard/95 border border-charcoal-border/80 hover:border-terracotta-border hover:shadow-float hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col gap-4 group">
              <div class="w-full aspect-square rounded-2xl bg-[#EDE5D8] flex items-center justify-center p-4 border border-charcoal-border/40 shadow-inner overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                <img src="assets/clover.jpg" alt="Đàn Clover 914c Custom" class="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div class="flex-grow flex flex-col justify-between space-y-2">
                <div>
                  <span class="text-[11px] font-extrabold font-mono tracking-widest text-terracotta uppercase block">GUITAR CHÍNH</span>
                  <h4 class="text-lg font-bold text-charcoal group-hover:text-terracotta transition-colors leading-snug">Clover 914c Custom</h4>
                  <p class="text-xs sm:text-sm text-charcoal-muted font-medium leading-relaxed mt-1">Mặt Sitka Spruce, lưng hông Rosewood. Tiếng mộc dày, âm bass ấm và action được căn rất êm tay.</p>
                </div>
                <div class="pt-1 text-xs sm:text-sm font-bold text-terracotta italic">"Anh em cần mua đàn cứ nhắn mình tư vấn và xin giá ưu đãi nhé."</div>
              </div>
            </div>

            <div class="reveal flex-shrink-0 w-[76%] snap-center md:w-auto md:flex-shrink md:snap-none p-5 sm:p-6 rounded-3xl bg-surfaceCard/95 border border-charcoal-border/80 hover:border-terracotta-border hover:shadow-float hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col gap-4 group">
              <div class="w-full aspect-square rounded-2xl bg-[#EDE5D8] flex items-center justify-center p-5 border border-charcoal-border/40 shadow-inner overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                <img src="assets/akg.jpg" alt="AKG Ara C22 USB Microphone" class="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div class="flex-grow flex flex-col justify-between space-y-2">
                <div>
                  <span class="text-[11px] font-extrabold font-mono tracking-widest text-terracotta uppercase block">MICROPHONE THU ÂM</span>
                  <h4 class="text-lg font-bold text-charcoal group-hover:text-terracotta transition-colors leading-snug">AKG Ara C22 USB</h4>
                  <p class="text-xs sm:text-sm text-charcoal-muted font-medium leading-relaxed mt-1">Mic thu cắm cổng USB trực tiếp vào máy tính, thu âm mộc qua Audacity, chỉ chỉnh âm lượng chứ không can thiệp hiệu ứng.</p>
                </div>
                <div class="pt-1">
                  <a href="https://s.shopee.vn/3VjbUzpuHA" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-terracotta hover:text-terracotta-hover">
                    <span>Mua trên Shopee</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </a>
                </div>
              </div>
            </div>

            <div class="reveal flex-shrink-0 w-[76%] snap-center md:w-auto md:flex-shrink md:snap-none p-5 sm:p-6 rounded-3xl bg-surfaceCard/95 border border-charcoal-border/80 hover:border-terracotta-border hover:shadow-float hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col gap-4 group">
              <div class="w-full aspect-square rounded-2xl bg-[#EDE5D8] flex items-center justify-center p-5 border border-charcoal-border/40 shadow-inner overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                <img src="assets/elixer.jpg" alt="Dây Đàn Elixir Phosphor Bronze" class="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div class="flex-grow flex flex-col justify-between space-y-2">
                <div>
                  <span class="text-[11px] font-extrabold font-mono tracking-widest text-terracotta uppercase block">DÂY ĐÀN & PHỤ KIỆN</span>
                  <h4 class="text-lg font-bold text-charcoal group-hover:text-terracotta transition-colors leading-snug">Elixir Phosphor Bronze (11-52)</h4>
                  <p class="text-xs sm:text-sm text-charcoal-muted font-medium leading-relaxed mt-1">Dây phủ nanoweb bấm êm tay, lâu rỉ. Kẹp kèm Capo Shubb C1B bằng đồng để khi kẹp phím cao không bị phô nốt.</p>
                </div>
                <div class="pt-1">
                  <a href="https://s.shopee.vn/gPQ7oVDzX" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-terracotta hover:text-terracotta-hover">
                    <span>Mua trên Shopee</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </a>
                </div>
              </div>
            </div>

            <div class="reveal flex-shrink-0 w-[76%] snap-center md:w-auto md:flex-shrink md:snap-none p-5 sm:p-6 rounded-3xl bg-surfaceCard/95 border border-charcoal-border/80 hover:border-terracotta-border hover:shadow-float hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col gap-4 group">
              <div class="w-full aspect-square rounded-2xl bg-[#EDE5D8] flex items-center justify-center p-5 border border-charcoal-border/40 shadow-inner overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                <img src="assets/gp8.jpg" alt="Guitar Pro 8 Software" class="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div class="flex-grow flex flex-col justify-between space-y-2">
                <div>
                  <span class="text-[11px] font-extrabold font-mono tracking-widest text-terracotta uppercase block">PHẦN MỀM SOẠN TAB</span>
                  <h4 class="text-lg font-bold text-charcoal group-hover:text-terracotta transition-colors leading-snug">Guitar Pro 8 & TuxGuitar</h4>
                  <p class="text-xs sm:text-sm text-charcoal-muted font-medium leading-relaxed mt-1">Phần mềm để mình viết tab, xuất file nhạc và căn chỉnh nhịp phách chi tiết trước khi quay video hướng dẫn.</p>
                </div>
                <div class="pt-1 text-xs sm:text-sm font-bold text-charcoal-muted italic">"Anh em lên YouTube gõ cách tải Guitar Pro 8 là có nhé."</div>
              </div>
            </div>

          </div>
          <p class="md:hidden text-center text-[11px] text-charcoal-faint font-semibold mt-3">← Vuốt để xem hết đồ nghề →</p>
        </div>

      </div>
    </section>
'@
$chunk2 | Out-File -FilePath 'd:\My_guitar_web\index.html' -Encoding UTF8 -Append

$chunk3 = @'


    <!-- BÀI HÁT NỔI BẬT -->
    <section id="kho-tab" class="py-24 relative overflow-hidden">
      <div class="music-motif motif-fade-faint staff-lines absolute inset-x-0 top-0 h-20" aria-hidden="true"></div>
      <svg class="music-motif motif-fade-sage motif-float absolute top-16 right-6 sm:right-14 w-9 h-9" style="animation-delay: -3s;" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 18V5l10-2v11.5M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-3.5a3 3 0 11-6 0 3 3 0 016 0z"/></svg>

      <div class="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 md:px-12">

        <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-charcoal-border/70 gap-4 reveal">
          <div class="space-y-2 max-w-2xl">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-terracotta">Kho Video Tab</span>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl text-charcoal font-extrabold">Bài Hát Nổi Bật</h2>
            <p class="text-charcoal-muted text-sm sm:text-base font-medium leading-relaxed pt-1">Mấy bài được anh em yêu thích nhất — xem hết rồi ghé qua Kho Video Tab để khám phá thêm nhé!</p>
          </div>
          <a href="kho-tab.html" class="flex-shrink-0 inline-flex items-center gap-2 text-sm font-bold text-charcoal-muted hover:text-terracotta transition-colors">
            <span>Xem toàn bộ</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </a>
        </div>

        <div id="featured-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="skeleton-card rounded-3xl bg-surface/50 border border-charcoal-border/60 aspect-[3/4]"></div>
          <div class="skeleton-card rounded-3xl bg-surface/50 border border-charcoal-border/60 aspect-[3/4]"></div>
          <div class="skeleton-card rounded-3xl bg-surface/50 border border-charcoal-border/60 aspect-[3/4]"></div>
        </div>

        <div class="mt-10 text-center reveal">
          <a href="kho-tab.html" class="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-warm-gradient hover:brightness-105 text-white font-bold text-sm transition-all shadow-glow active:scale-[0.98]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
            <span>Xem toàn bộ kho Video Tab →</span>
          </a>
        </div>

      </div>
    </section>


    <!-- FAQ -->
    <section id="faq" class="relative py-20 overflow-hidden">
      <svg class="music-motif motif-fade-terracotta motif-float absolute top-8 right-6 sm:right-16 w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 18V5l10-2v11.5M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-3.5a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      <div class="relative z-10 max-w-3xl mx-auto px-6 sm:px-8 md:px-12">
        <div class="text-center mb-10 space-y-2 reveal">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-terracotta">Giải đáp thắc mắc</span>
          <h2 class="text-3xl sm:text-4xl text-charcoal font-extrabold">Câu hỏi thường gặp</h2>
          <p class="text-xs sm:text-sm text-charcoal-muted font-medium">Mấy thắc mắc anh em hay nhắn hỏi mình nhất trước khi bắt đầu tập.</p>
        </div>
        <div class="space-y-3 reveal">
          <details class="faq-item group p-5 sm:p-6 rounded-2xl bg-surfaceCard/95 border border-charcoal-border/80 shadow-soft">
            <summary class="flex items-center justify-between gap-4 font-bold text-charcoal text-sm sm:text-base"><span>Sau khi chuyển khoản thì nhận Video Tab như thế nào?</span><span class="faq-icon flex-shrink-0 w-7 h-7 rounded-full bg-terracotta-light text-terracotta flex items-center justify-center text-lg font-black">+</span></summary>
            <p class="pt-3 text-xs sm:text-sm text-charcoal-muted font-medium leading-relaxed">Bạn chuyển khoản xong chụp lại ảnh giao dịch rồi gửi qua Zalo (0326.768.885) cho mình. Mình check xong sẽ gửi link video tab chất lượng cao (Google Drive / YouTube) qua Zalo cho bạn ngay.</p>
          </details>
          <details class="faq-item group p-5 sm:p-6 rounded-2xl bg-surfaceCard/95 border border-charcoal-border/80 shadow-soft">
            <summary class="flex items-center justify-between gap-4 font-bold text-charcoal text-sm sm:text-base"><span>Người mới tập, chưa rành đọc tab có học được không?</span><span class="faq-icon flex-shrink-0 w-7 h-7 rounded-full bg-terracotta-light text-terracotta flex items-center justify-center text-lg font-black">+</span></summary>
            <p class="pt-3 text-xs sm:text-sm text-charcoal-muted font-medium leading-relaxed">Tập tốt bạn nhé. Video Tab của mình hiển thị nốt chạy khớp theo tiếng đàn thật, bạn chỉ cần bấm theo thế tay trên màn hình và nghe nhịp là đánh được. Chỗ nào chưa rõ cứ nhắn mình hỗ trợ thêm.</p>
          </details>
          <details class="faq-item group p-5 sm:p-6 rounded-2xl bg-surfaceCard/95 border border-charcoal-border/80 shadow-soft">
            <summary class="flex items-center justify-between gap-4 font-bold text-charcoal text-sm sm:text-base"><span>Video Tab khác gì so với file Tab thông thường (Guitar Pro/PDF)?</span><span class="faq-icon flex-shrink-0 w-7 h-7 rounded-full bg-terracotta-light text-terracotta flex items-center justify-center text-lg font-black">+</span></summary>
            <p class="pt-3 text-xs sm:text-sm text-charcoal-muted font-medium leading-relaxed">File PDF chỉ có hình ảnh tĩnh, còn file Guitar Pro chạy tiếng MIDI giả lập rất khô. Video Tab là video quay nốt chạy đồng bộ với tiếng đàn mộc thật mình đánh, nghe rõ luyến láy và nhịp gõ thùng nên tập nhanh hơn nhiều.</p>
          </details>
          <details class="faq-item group p-5 sm:p-6 rounded-2xl bg-surfaceCard/95 border border-charcoal-border/80 shadow-soft">
            <summary class="flex items-center justify-between gap-4 font-bold text-charcoal text-sm sm:text-base"><span>Tập mãi một đoạn mà không bấm được thì làm sao?</span><span class="faq-icon flex-shrink-0 w-7 h-7 rounded-full bg-terracotta-light text-terracotta flex items-center justify-center text-lg font-black">+</span></summary>
            <p class="pt-3 text-xs sm:text-sm text-charcoal-muted font-medium leading-relaxed">Cứ quay một đoạn video ngắn tay bạn đang bấm rồi gửi qua Zalo cho mình. Mình xem lỗi sai ở đâu (thế ngón, cổ tay hay lực bấm) rồi gửi clip chỉ lại cho bạn. Yên tâm không lo bị bỏ rơi đâu nhé!</p>
          </details>
          <details class="faq-item group p-5 sm:p-6 rounded-2xl bg-surfaceCard/95 border border-charcoal-border/80 shadow-soft">
            <summary class="flex items-center justify-between gap-4 font-bold text-charcoal text-sm sm:text-base"><span>Mình muốn đặt làm Video Tab bài hát riêng thì sao?</span><span class="faq-icon flex-shrink-0 w-7 h-7 rounded-full bg-terracotta-light text-terracotta flex items-center justify-center text-lg font-black">+</span></summary>
            <p class="pt-3 text-xs sm:text-sm text-charcoal-muted font-medium leading-relaxed">Bạn nhắn tên bài hát hoặc gửi link qua Zalo/TikTok cho mình. Mình sẽ nghe thử, báo lại độ khó, thời gian hoàn thành và chi phí cho bạn.</p>
          </details>
        </div>
      </div>
    </section>


    <!-- CONTACT -->
    <section id="contact" class="relative py-20 bg-surface border-t border-charcoal-border/60 overflow-hidden">
      <svg class="music-motif motif-fade-sage motif-float absolute top-10 left-6 sm:left-16 w-9 h-9" style="animation-delay: -1.5s;" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 18V5l10-2v11.5M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-3.5a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      <svg class="music-motif motif-fade-terracotta absolute bottom-4 right-8 sm:right-20 w-20 h-20" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <path d="M20 70c0-22 18-40 40-40M20 70c0-11 9-20 20-20M20 70c0-5.5 4.5-10 10-10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="60" cy="30" r="4" fill="currentColor"/>
      </svg>
      <div class="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 md:px-12 text-center space-y-6">
        <h2 class="text-3xl sm:text-4xl text-charcoal font-extrabold">Liên hệ & Giao lưu</h2>
        <p class="text-charcoal-muted text-sm sm:text-base max-w-xl mx-auto font-medium leading-relaxed">Anh em cần hỏi thế tay, trao đổi về fingerstyle hoặc muốn đặt làm tab riêng cứ nhắn cho mình nhé.</p>
        <div class="my-8 max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-surfaceCard/95 border border-charcoal-border/80 shadow-soft text-left">
          <div class="text-center max-w-xl mx-auto mb-8 space-y-1.5">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-terracotta">Hỗ Trợ & Đồng Hành</span>
            <h3 class="text-xl sm:text-2xl font-extrabold text-charcoal">Các dịch vụ mình hỗ trợ</h3>
          </div>
          <div class="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-5 lg:gap-6 md:overflow-visible md:snap-none">
            <div class="reveal flex-shrink-0 w-[78%] snap-center md:w-auto md:flex-shrink md:snap-none p-5 rounded-2xl bg-surface/60 border border-charcoal-border/70 hover:border-terracotta-border hover:shadow-soft hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between space-y-3 group text-left">
              <div class="space-y-2.5"><div class="w-11 h-11 rounded-xl bg-terracotta-light text-terracotta flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">🎼</div><h4 class="text-base font-bold text-charcoal group-hover:text-terracotta transition-colors leading-snug">Làm Tab & Video theo yêu cầu</h4><p class="text-xs text-charcoal-muted leading-relaxed font-medium">Nhận viết tab Guitar Pro chi tiết và quay video chạy nốt hướng dẫn chậm cho bài hát bạn thích.</p></div>
            </div>
            <div class="reveal flex-shrink-0 w-[78%] snap-center md:w-auto md:flex-shrink md:snap-none p-5 rounded-2xl bg-surface/60 border border-charcoal-border/70 hover:border-terracotta-border hover:shadow-soft hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between space-y-3 group text-left">
              <div class="space-y-2.5"><div class="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">🤝</div><h4 class="text-base font-bold text-charcoal group-hover:text-terracotta transition-colors leading-snug">Hỗ trợ sửa ngón & Đồng hành 1-1</h4><p class="text-xs text-charcoal-muted leading-relaxed font-medium">Mua tab xong gặp đoạn khó cứ nhắn Zalo. Mình xem clip tay bạn đánh rồi sửa lỗi ngón tận tình, không bỏ rơi.</p></div>
            </div>
            <div class="reveal flex-shrink-0 w-[78%] snap-center md:w-auto md:flex-shrink md:snap-none p-5 rounded-2xl bg-surface/60 border border-charcoal-border/70 hover:border-terracotta-border hover:shadow-soft hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between space-y-3 group text-left">
              <div class="space-y-2.5"><div class="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">🎸</div><h4 class="text-base font-bold text-charcoal group-hover:text-terracotta transition-colors leading-snug">Tư vấn chọn đàn & Mua giá tốt</h4><p class="text-xs text-charcoal-muted leading-relaxed font-medium">Giúp anh em chọn dáng đàn hợp tay, test âm mộc kỹ càng và lấy đàn giá ưu đãi kèm căn chỉnh action êm ái.</p></div>
            </div>
          </div>
          <p class="md:hidden text-center text-[11px] text-charcoal-faint font-semibold mt-3">← Vuốt để xem các dịch vụ →</p>
        </div>
        <div class="pt-4 flex flex-wrap justify-center items-center gap-4">
          <a href="https://www.tiktok.com/@quangdnn104" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-surfaceCard border border-charcoal-border/90 hover:bg-charcoal hover:text-white text-xs font-bold text-charcoal transition-all shadow-soft group">
            <svg class="w-4 h-4 fill-current text-terracotta group-hover:text-white transition-colors" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
            <span>TikTok: @quangdnn104</span>
          </a>
          <a href="https://zalo.me/0326768885" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-surfaceCard border border-charcoal-border/90 hover:border-terracotta text-xs font-bold text-charcoal hover:text-terracotta transition-all shadow-soft">
            <span class="w-4 h-4 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-[9px]">Z</span>
            <span>Zalo: 0326.768.885</span>
          </a>
          <a href="https://www.facebook.com/quang.doan.969429" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-surfaceCard border border-charcoal-border/90 hover:border-terracotta text-xs font-bold text-charcoal hover:text-terracotta transition-all shadow-soft">
            <svg class="w-4 h-4 text-blue-800 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span>Facebook: Nhật Quang</span>
          </a>
        </div>
      </div>
    </section>

  </main>
'@
$chunk3 | Out-File -FilePath 'd:\My_guitar_web\index.html' -Encoding UTF8 -Append

$chunk4 = @'



  <!-- FOOTER -->
  <footer class="py-10 bg-canvas border-t border-charcoal-border/60 text-center">
    <div class="max-w-7xl mx-auto px-6 space-y-3">
      <p class="text-sm sm:text-base font-bold text-charcoal max-w-2xl mx-auto leading-relaxed">Chúc anh em tập đàn vui vẻ và sớm đánh trọn vẹn bài hát mình thích! 🎸</p>
      <p class="text-xs text-charcoal-muted font-medium">© 2026 Guitar By Quang (Nhật Quang).</p>
      <div class="flex justify-center space-x-6 text-xs text-charcoal-muted font-semibold pt-1">
        <a href="#about" class="hover:text-terracotta transition-colors">Giới thiệu</a>
        <span>•</span>
        <a href="kho-tab.html" class="hover:text-terracotta transition-colors">Kho Video Tab</a>
        <span>•</span>
        <a href="#faq" class="hover:text-terracotta transition-colors">Hỏi đáp</a>
        <span>•</span>
        <a href="https://www.tiktok.com/@quangdnn104" target="_blank" rel="noopener noreferrer" class="hover:text-terracotta transition-colors">TikTok</a>
      </div>
    </div>
  </footer>


  <!-- MODAL: MUA VIDEO TAB -->
  <div id="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="modal-tab-title" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300">
    <div class="modal-dialog relative w-full max-w-lg bg-canvas rounded-3xl p-6 sm:p-8 shadow-float border border-charcoal-border max-h-[90vh] overflow-y-auto scale-95" tabindex="-1">
      <button id="close-checkout-modal" class="absolute top-5 right-5 p-2 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-surface transition-colors cursor-pointer" aria-label="Đóng cửa sổ">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      <div class="space-y-1 mb-6">
        <span class="text-xs font-mono font-bold uppercase tracking-wider text-terracotta">Mua Bản Video Tab</span>
        <h3 id="modal-tab-title" class="text-2xl font-extrabold text-charcoal">Tên bài hát</h3>
        <p id="modal-tab-meta" class="text-xs text-charcoal-muted font-medium">Tuning: Standard • Bản Video Tab quay chi tiết từng thế tay và nhịp gõ</p>
      </div>
      <div class="p-5 sm:p-6 rounded-2xl bg-surface border border-charcoal-border/80 space-y-5">
        <div class="flex items-center justify-between border-b border-charcoal-border/60 pb-3">
          <div><span class="text-xs font-bold text-charcoal-muted block">Số tiền chuyển khoản:</span><span class="text-[11px] text-terracotta font-bold" id="modal-discount-tag">(HSSV ưu đãi còn 179k)</span></div>
          <span id="modal-tab-price" class="text-xl font-extrabold text-terracotta">239.000 VNĐ</span>
        </div>
        <div class="flex flex-col items-center justify-center">
          <div class="w-56 h-56 sm:w-64 sm:h-64 bg-white p-3 rounded-2xl border border-charcoal-border/80 flex items-center justify-center shadow-md flex-shrink-0">
            <img id="modal-qr-img" src="assets/qr.jpg" alt="Mã QR Chuyển Khoản TpBank" class="w-full h-full object-contain" />
          </div>
          <span class="text-[11px] font-bold text-charcoal-muted mt-2">Quét mã QR bằng App Ngân hàng bất kỳ</span>
        </div>
        <div class="space-y-2.5 text-xs text-charcoal bg-surfaceCard p-4 rounded-xl border border-charcoal-border/60">
          <div><span class="text-charcoal-muted block text-[11px] font-bold">Ngân hàng:</span><strong class="font-bold text-charcoal text-sm">TpBank (Ngân hàng Tiên Phong)</strong></div>
          <div><span class="text-charcoal-muted block text-[11px] font-bold">Số tài khoản:</span><div class="flex items-center gap-2"><span class="font-mono text-sm font-extrabold text-charcoal tracking-wide">03970202801</span><button id="copy-stk-btn" class="px-2.5 py-0.5 rounded bg-surfaceAlt hover:bg-terracotta-light text-[10px] font-bold text-terracotta border border-charcoal-border transition-colors cursor-pointer">Sao chép</button></div></div>
          <div><span class="text-charcoal-muted block text-[11px] font-bold">Tên chủ tài khoản:</span><span class="font-bold text-charcoal">DOAN NGUYEN NHAT QUANG</span></div>
          <div><span class="text-charcoal-muted block text-[11px] font-bold">Nội dung chuyển khoản:</span><div class="flex items-center gap-2"><span id="modal-transfer-syntax" class="font-mono font-bold text-terracotta bg-terracotta-light px-2 py-0.5 rounded">VIDEOTAB RESG1CTK</span><button id="copy-syntax-btn" class="px-2.5 py-0.5 rounded bg-surfaceAlt hover:bg-terracotta-light text-[10px] font-bold text-terracotta border border-charcoal-border transition-colors cursor-pointer">Sao chép</button></div></div>
        </div>
      </div>
      <div class="mt-6 space-y-4">
        <div class="p-4 rounded-2xl bg-surfaceCard border-l-4 border-terracotta shadow-soft">
          <p class="text-xs sm:text-sm font-bold text-charcoal leading-relaxed">Chuyển khoản xong anh em nhớ chụp lại màn hình bill rồi gửi qua Zalo 0326.768.885 để mình gửi link video nhé! 🎸</p>
        </div>
        <a href="https://zalo.me/0326768885" target="_blank" rel="noopener noreferrer" class="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-soft active:scale-[0.99] flex items-center justify-center gap-2">
          <span class="w-5 h-5 rounded-full bg-white text-blue-600 font-black flex items-center justify-center text-[10px]">Z</span>
          <span>Gửi bill qua Zalo: 0326.768.885</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
      </div>
    </div>
  </div>


  <!-- MODAL: VIDEO DEMO -->
  <div id="video-demo-modal" role="dialog" aria-modal="true" aria-labelledby="video-demo-title" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-md opacity-0 pointer-events-none transition-opacity duration-300">
    <div class="modal-dialog relative w-full max-w-2xl bg-canvas rounded-3xl p-5 sm:p-6 shadow-float border border-charcoal-border scale-95" tabindex="-1">
      <button id="close-video-demo-modal" class="absolute top-4 right-4 p-2 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-surface transition-colors z-10 cursor-pointer" aria-label="Đóng video">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      <div class="space-y-1 mb-4 pr-10">
        <span class="text-xs font-mono font-bold uppercase tracking-wider text-terracotta">Video Demo</span>
        <h3 id="video-demo-title" class="text-xl sm:text-2xl font-extrabold text-charcoal">Tên bài hát</h3>
      </div>
      <div class="relative overflow-hidden rounded-2xl aspect-video bg-charcoal shadow-lg">
        <video id="demo-modal-video" controls playsinline class="w-full h-full aspect-video rounded-2xl object-cover">
          <source src="" type="video/mp4">
          Trình duyệt của bạn không hỗ trợ phát video trực tiếp.
        </video>
      </div>
    </div>
  </div>


  <!-- TOAST -->
  <div id="toast-notification" class="fixed top-6 right-6 z-50 bg-charcoal text-canvas text-xs font-bold px-5 py-3 rounded-full shadow-float flex items-center gap-2.5 transition-all duration-300 opacity-0 -translate-y-4 pointer-events-none border border-charcoal-border/50">
    <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
    <span id="toast-message">Đã sao chép vào bộ nhớ tạm!</span>
  </div>

  <!-- JavaScript -->
  <script type="module" src="firebase-config.js"></script>
  <script type="module" src="firebase-service.js"></script>
  <script type="module" src="common.js"></script>
  <script type="module" src="home.js"></script>

</body>
</html>
'@
$chunk4 | Out-File -FilePath 'd:\My_guitar_web\index.html' -Encoding UTF8 -Append
