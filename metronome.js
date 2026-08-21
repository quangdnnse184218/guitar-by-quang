/**
 * GUITAR BY QUANG — metronome.js
 * Máy đếm nhịp (Metronome) dùng Web Audio API lookahead scheduler.
 *
 * KỸ THUẬT: lookahead scheduler chuẩn (KHÔNG dùng setInterval để phát âm thanh).
 *   - Một vòng lặp setTimeout ngắn (~25ms) liên tục gọi scheduleNote().
 *   - scheduleNote() dùng AudioContext.currentTime để lên lịch OscillatorNode
 *     trong tương lai gần (lookahead ~100ms), đảm bảo tick không bị drift.
 *   - requestAnimationFrame đồng bộ animation visual với thời gian audio thật.
 *
 * TẠI SAO KHÔNG DÙNG setInterval TRỰC TIẾP:
 *   setInterval bị trôi nhịp vì JavaScript event loop không đảm bảo timing
 *   chính xác (có thể delay vài chục ms mỗi lần). Với bản nhạc, 30ms drift mỗi phách
 *   thành vài giây sai lệch sau 1 phút — không thể chấp nhận cho nhạc cụ.
 */

import { initNavbarShrink, initMobileMenu } from './common.js';

// ==========================================================================
// CONSTANTS
// ==========================================================================

const BPM_MIN = 40;
const BPM_MAX = 208;
const BPM_DEFAULT = 100;
const SCHEDULE_INTERVAL_MS = 25;    // setTimeout polling interval (ms)
const LOOKAHEAD_SEC = 0.1;          // Lên lịch trước bao lâu (giây)
const CLICK_DURATION_SEC = 0.04;    // Thời lượng mỗi tiếng click (giây)
const CLICK_FREQ_BEAT = 1000;       // Tần số tiếng click (Hz) — phách thường
const CLICK_FREQ_ACCENT = 1400;     // Tần số accent (phách 1 của mỗi bar)
const TAP_MAX_HISTORY = 6;          // Giữ tối đa N lần bấm tap tempo
const TAP_RESET_MS = 2500;          // Reset tap history nếu ngừng bấm > 2.5s

// ==========================================================================
// STATE
// ==========================================================================

let bpm = BPM_DEFAULT;
let isPlaying = false;
let audioCtx = null;
let nextNoteTime = 0;       // Thời điểm (AudioContext.currentTime) của phách kế tiếp
let scheduleTimerID = null; // ID của setTimeout vòng lặp scheduler
let currentBeat = 0;        // Phách hiện tại trong bar (0 -> beatsPerBar - 1)
let beatsPerBar = 4;        // Số phách mỗi bar (mặc định 4/4)
let timeSignature = '4/4';  // Chuỗi nhịp hiện tại
let tapTimes = [];          // Timestamps (ms) của các lần bấm Tap Tempo
let lastTapTime = 0;        // Timestamp lần bấm cuối (để detect reset)

// ==========================================================================
// DOM REFS (sau DOMContentLoaded)
// ==========================================================================

let bpmDisplay, bpmSlider, bpmMinus, bpmPlus;
let playBtn, playIcon, pauseIcon, playLabel;
let tapBtn;
let beatFlash, beatDots;
let timeSignatureSelect;
let webAudioUnsupported;

// ==========================================================================
// AUDIO: LOOKAHEAD SCHEDULER
// ==========================================================================

/**
 * Tạo và phát 1 tiếng click ngắn tại thời điểm `time` (AudioContext.currentTime).
 * Dùng OscillatorNode + GainNode — không cần file âm thanh ngoài.
 */
function scheduleClick(time, isAccent) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(isAccent ? CLICK_FREQ_ACCENT : CLICK_FREQ_BEAT, time);

  // Envelope: attack ngay lập tức → decay nhanh để nghe giống click
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(isAccent ? 0.9 : 0.65, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.001, time + CLICK_DURATION_SEC);

  osc.start(time);
  osc.stop(time + CLICK_DURATION_SEC + 0.005);
}

/**
 * Tính thời gian 1 phách (giây) từ BPM hiện tại.
 */
function secondsPerBeat() {
  return 60.0 / bpm;
}

/**
 * Lên lịch các phách cần được play trong cửa sổ [currentTime, currentTime + lookahead].
 * Được gọi lặp lại bởi vòng lặp scheduler (setTimeout).
 */
function scheduleNote() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  while (nextNoteTime < now + LOOKAHEAD_SEC) {
    const isAccent = (currentBeat === 0); // Phách đầu mỗi bar accent mạnh hơn
    scheduleClick(nextNoteTime, isAccent);

    // Ghi nhận thời điểm này để rAF loop hiển thị flash visual đồng bộ
    pendingFlashTimes.push({ time: nextNoteTime, accent: isAccent, beatIndex: currentBeat });

    currentBeat = (currentBeat + 1) % beatsPerBar;
    nextNoteTime += secondsPerBeat();
  }
}

/**
 * Vòng lặp setTimeout — polling ngắn để scheduleNote() luôn chạy đủ nhanh.
 */
function schedulerLoop() {
  scheduleNote();
  scheduleTimerID = setTimeout(schedulerLoop, SCHEDULE_INTERVAL_MS);
}

// ==========================================================================
// VISUAL: rAF LOOP ĐỒNG BỘ AUDIO
// ==========================================================================

const pendingFlashTimes = []; // Danh sách { time, accent, beatIndex } chờ hiển thị
let rafID = null;

/**
 * requestAnimationFrame loop: kiểm tra xem có phách nào đến thời điểm chưa,
 * nếu có thì trigger flash visual. Đồng bộ với audio vì so sánh AudioContext.currentTime.
 */
function rafLoop() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  let doFlash = false;
  let flashAccent = false;
  let activeBeatIndex = 0;

  // Duyệt qua các phách đã lên lịch
  while (pendingFlashTimes.length > 0 && pendingFlashTimes[0].time <= now + 0.01) {
    const entry = pendingFlashTimes.shift();
    doFlash = true;
    flashAccent = entry.accent;
    activeBeatIndex = entry.beatIndex;
  }

  if (doFlash) triggerBeatFlash(flashAccent, activeBeatIndex);

  rafID = requestAnimationFrame(rafLoop);
}

/**
 * Trigger animation nhấp nháy visual khi đến phách.
 */
function triggerBeatFlash(isAccent, beatIndex) {
  if (!beatFlash) return;

  // Xóa class cũ trước
  beatFlash.classList.remove('beat-active', 'beat-accent');
  // Force reflow để restart animation
  void beatFlash.offsetWidth;

  beatFlash.classList.add('beat-active');
  if (isAccent) beatFlash.classList.add('beat-accent');

  // Cập nhật các chấm phách (render động theo beatsPerBar)
  if (beatDots) {
    const dots = beatDots.querySelectorAll('.beat-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('dot-active', i === beatIndex);
      dot.classList.toggle('dot-accent', i === beatIndex && i === 0);
    });
  }
}

/**
 * Render động các chấm phách dựa trên beatsPerBar
 */
function renderBeatDots() {
  if (!beatDots) return;
  beatDots.innerHTML = '';
  for (let i = 0; i < beatsPerBar; i++) {
    const dot = document.createElement('span');
    dot.className = `beat-dot rounded-full transition-all ${i === 0 ? 'w-3 h-3' : 'w-2.5 h-2.5'}`;
    dot.setAttribute('aria-hidden', 'true');
    beatDots.appendChild(dot);
  }
}

// ==========================================================================
// PLAY / PAUSE
// ==========================================================================

async function startMetronome() {
  // AudioContext phải được tạo/resume trong user gesture
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  isPlaying = true;
  currentBeat = 0;
  nextNoteTime = audioCtx.currentTime + 0.05; // Bắt đầu sau 50ms
  pendingFlashTimes.length = 0;

  updatePlayUI(true);
  schedulerLoop();
  rafID = requestAnimationFrame(rafLoop);
}

function stopMetronome() {
  isPlaying = false;
  if (scheduleTimerID) clearTimeout(scheduleTimerID);
  if (rafID) cancelAnimationFrame(rafID);
  pendingFlashTimes.length = 0;

  updatePlayUI(false);

  // Reset flash visual
  if (beatFlash) {
    beatFlash.classList.remove('beat-active', 'beat-accent');
  }
  if (beatDots) {
    beatDots.querySelectorAll('.beat-dot').forEach(d => {
      d.classList.remove('dot-active', 'dot-accent');
    });
  }
}

function togglePlay() {
  if (isPlaying) {
    stopMetronome();
  } else {
    startMetronome();
  }
}

function updatePlayUI(playing) {
  if (!playBtn || !playIcon || !pauseIcon || !playLabel) return;

  if (playing) {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    playLabel.textContent = 'Dừng lại';
    playBtn.setAttribute('aria-label', 'Dừng metronome');
    playBtn.classList.add('is-playing');
  } else {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    playLabel.textContent = 'Bắt đầu';
    playBtn.setAttribute('aria-label', 'Bắt đầu metronome');
    playBtn.classList.remove('is-playing');
  }
}

// ==========================================================================
// BPM CONTROL
// ==========================================================================

function setBpm(newBpm) {
  bpm = Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(newBpm)));
  if (bpmDisplay) bpmDisplay.textContent = bpm;
  if (bpmSlider) bpmSlider.value = bpm;
}

function changeBpm(delta) {
  setBpm(bpm + delta);
}

// ==========================================================================
// TIME SIGNATURE
// ==========================================================================

function setTimeSignature(sig) {
  timeSignature = sig;
  switch (sig) {
    case '2/4':
      beatsPerBar = 2;
      break;
    case '3/4':
      beatsPerBar = 3;
      break;
    case '6/8':
      beatsPerBar = 6;
      break;
    case '4/4':
    default:
      beatsPerBar = 4;
      break;
  }

  renderBeatDots();

  // Nếu đang chạy mà đổi nhịp, reset về đầu bar ngay
  if (isPlaying) {
    currentBeat = 0;
  }
}

// ==========================================================================
// TAP TEMPO
// ==========================================================================

function handleTapTempo() {
  const now = Date.now();

  // Reset nếu ngừng bấm quá lâu
  if (lastTapTime > 0 && now - lastTapTime > TAP_RESET_MS) {
    tapTimes = [];
  }

  tapTimes.push(now);
  lastTapTime = now;

  // Giữ tối đa TAP_MAX_HISTORY lần gần nhất
  if (tapTimes.length > TAP_MAX_HISTORY) {
    tapTimes.shift();
  }

  // Cần ít nhất 2 lần bấm để tính BPM
  if (tapTimes.length < 2) return;

  // Tính khoảng cách trung bình giữa các lần bấm
  let totalInterval = 0;
  for (let i = 1; i < tapTimes.length; i++) {
    totalInterval += tapTimes[i] - tapTimes[i - 1];
  }
  const avgIntervalMs = totalInterval / (tapTimes.length - 1);
  const tappedBpm = Math.round(60000 / avgIntervalMs);

  setBpm(tappedBpm);
}

// ==========================================================================
// INIT
// ==========================================================================

function initMetronome() {
  // Check Web Audio API support
  if (!window.AudioContext && !window.webkitAudioContext) {
    if (webAudioUnsupported) webAudioUnsupported.classList.remove('hidden');
    const controls = document.getElementById('metronome-controls');
    if (controls) controls.classList.add('hidden');
    return;
  }

  // Bind DOM refs
  bpmDisplay           = document.getElementById('bpm-display');
  bpmSlider            = document.getElementById('bpm-slider');
  bpmMinus             = document.getElementById('bpm-minus');
  bpmPlus              = document.getElementById('bpm-plus');
  playBtn              = document.getElementById('play-btn');
  playIcon             = document.getElementById('play-icon');
  pauseIcon            = document.getElementById('pause-icon');
  playLabel            = document.getElementById('play-label');
  tapBtn               = document.getElementById('tap-btn');
  beatFlash            = document.getElementById('beat-flash');
  beatDots             = document.getElementById('beat-dots');
  timeSignatureSelect  = document.getElementById('time-signature-select');

  // Set initial values
  setBpm(BPM_DEFAULT);
  renderBeatDots();

  // Events
  if (bpmMinus)  bpmMinus.addEventListener('click', () => changeBpm(-1));
  if (bpmPlus)   bpmPlus.addEventListener('click',  () => changeBpm(+1));

  if (bpmSlider) {
    bpmSlider.addEventListener('input', (e) => setBpm(Number(e.target.value)));
  }

  if (timeSignatureSelect) {
    timeSignatureSelect.addEventListener('change', (e) => {
      setTimeSignature(e.target.value);
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', togglePlay);
  }

  if (tapBtn) {
    tapBtn.addEventListener('click', handleTapTempo);
    tapBtn.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'KeyT') {
        e.preventDefault();
        handleTapTempo();
      }
    });
  }

  // Phím tắt toàn cục: Space = Play/Pause, T = Tap Tempo, ArrowUp/ArrowDown = BPM
  document.addEventListener('keydown', (e) => {
    // Bỏ qua nếu đang focus vào input/select
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    if (e.code === 'KeyT')  { e.preventDefault(); handleTapTempo(); }
    if (e.code === 'ArrowUp')   { e.preventDefault(); changeBpm(+1); }
    if (e.code === 'ArrowDown') { e.preventDefault(); changeBpm(-1); }
  });
}

// ==========================================================================
// DOMCONTENTLOADED
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  webAudioUnsupported = document.getElementById('web-audio-unsupported');

  initNavbarShrink();
  initMobileMenu();
  initMetronome();
});
