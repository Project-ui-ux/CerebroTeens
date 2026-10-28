/**
 * LOGIKA APLIKASI SERIOUS GAME: EDUKASI STROKE PADA REMAJA
 * Fitur:
 * 1. Manajemen Sesi Partisipan & Sinkronisasi Google Sheets Web App
 * 2. Navigasi Antarmuka (Login, Dashboard, Menu Level, TTS Board, Word Search Board)
 * 3. Mesin TTS: Grid Generator, Navigasi Panah/Keyboard, Validasi Real-time, Clues Tracker
 * 4. Mesin Cari Kata: Generator Matriks Huruf Acak, Drag & Click Selection, Word Checking
 * 5. Timer, Skor Otomatis, Edu-Feedback Modal, dan Ekspor/Simpan Data Penelitian
 */

// Konfigurasi URL Google Apps Script Web App (Otomatis)
const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx53NC2XDNdMLqwnHjjinHz8oaymUk0tSWX6bapkp5lmxkqw4FFEVNAa4msX8Yu0Q0-/exec";

const AppState = {
  user: null, // { nama, usia, jenisKelamin, sekolah, id }
  scriptUrl: DEFAULT_APPS_SCRIPT_URL,
  currentGame: null, // "tts" atau "wordsearch"
  currentLevel: 1,
  gameTimer: null,
  timerSeconds: 0,
  initialTimeSeconds: 180,
  score: 0,
  completedLevels: {},

  // Jatah waktu hitungan mundur (semakin tinggi level semakin berkurang)
  levelTimeLimits: {
    1: 180, // Level 1: 3 menit (180 detik)
    2: 150, // Level 2: 2.5 menit (150 detik)
    3: 120, // Level 3: 2 menit (120 detik)
    4: 90   // Level 4: 1.5 menit (90 detik)
  },
  
  // TTS State
  ttsGrid: [],
  ttsActiveCell: null,
  ttsActiveClue: null,
  ttsActiveDirection: "across",
  
  // Word Search State
  wsGrid: [],
  wsGridSize: 10,
  wsFoundWords: [],
  wsIsSelecting: false,
  wsSelectionStart: null,
  wsSelectedCells: []
};

// ==========================================
// INISIALISASI SAAT HALAMAN DIBUKA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initUserSession();
  setupEventListeners();
  updateUIBadges();
});

function initUserSession() {
  // Setiap kali web dibuka / refresh, selalu reset ke form identitas partisipan baru
  AppState.user = null;
  AppState.completedLevels = {};
  
  // Bersihkan data user lama yang mungkin masih tersisa di browser
  localStorage.removeItem("stroke_user_session");
  localStorage.removeItem("stroke_all_users");
  localStorage.removeItem("stroke_user_progress");
  localStorage.removeItem("stroke_completed_levels");

  showView("view-login");
}

function updateUIBadges() {
  const badgeName = document.getElementById("nav-user-name");
  const dbStatus = document.getElementById("db-status-dot");
  
  if (AppState.user) {
    badgeName.textContent = AppState.user.nama + " (" + AppState.user.id + ")";
  } else {
    badgeName.textContent = "Tamu / Belum Login";
  }

  if (AppState.scriptUrl && AppState.scriptUrl.startsWith("http")) {
    dbStatus.classList.remove("offline");
    dbStatus.title = "Google Sheets Terhubung";
  } else {
    dbStatus.classList.add("offline");
    dbStatus.title = "Google Sheets Offline (Data tersimpan di perangkat lokal)";
  }
}

function showView(viewId) {
  document.querySelectorAll(".view-screen").forEach(el => el.classList.remove("active"));
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function showToast(msg, isSuccess = true) {
  const toast = document.getElementById("toast");
  toast.innerHTML = (isSuccess ? "✓ " : "⚠️ ") + msg;
  toast.style.borderColor = isSuccess ? "#10b981" : "#ef4444";
  toast.style.display = "flex";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}

// ==========================================
// PENGATURAN TEMA SIANG & MALAM (LIGHT / DARK)
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem("cerebro_theme") || "dark";
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("btn-theme-toggle");
  if (btn) {
    if (theme === "light") {
      btn.textContent = "☀️";
      btn.title = "Beralih ke Mode Malam";
      btn.setAttribute("aria-label", "Beralih ke Mode Malam");
    } else {
      btn.textContent = "🌙";
      btn.title = "Beralih ke Mode Siang";
      btn.setAttribute("aria-label", "Beralih ke Mode Siang");
    }
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  applyTheme(newTheme);
  localStorage.setItem("cerebro_theme", newTheme);
  showToast(newTheme === "light" ? "Mode Siang diaktifkan ☀️" : "Mode Malam diaktifkan 🌙");
}

// ==========================================
// EVENT LISTENERS & NAVIGASI
// ==========================================
function setupEventListeners() {
  // Tab Switch Daftar vs Login Kembali
  const tabBtnReg = document.getElementById("tab-btn-register");
  const tabBtnLog = document.getElementById("tab-btn-login");
  const panelReg = document.getElementById("panel-register");
  const panelLog = document.getElementById("panel-login");

  if (tabBtnReg && tabBtnLog) {
    tabBtnReg.addEventListener("click", () => {
      tabBtnReg.classList.add("active");
      tabBtnLog.classList.remove("active");
      panelReg.classList.add("active");
      panelLog.classList.remove("active");
    });

    tabBtnLog.addEventListener("click", () => {
      tabBtnLog.classList.add("active");
      tabBtnReg.classList.remove("active");
      panelLog.classList.add("active");
      panelReg.classList.remove("active");
    });
  }

  // Form Identitas Responden (Daftar Baru)
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegisterSubmit);
  }

  // Form Login Kembali
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  // Tombol Mode Siang & Malam (Theme Toggle)
  const btnThemeToggle = document.getElementById("btn-theme-toggle");
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener("click", toggleTheme);
  }

  // Tombol Logout / Keluar Sesi
  document.getElementById("btn-logout").addEventListener("click", () => {
    if (confirm("Apakah Anda ingin mengakhiri sesi partisipan?")) {
      AppState.user = null;
      AppState.completedLevels = {};
      updateUIBadges();
      showView("view-login");
      // Kosongkan form input
      if (registerForm) registerForm.reset();
      if (loginForm) loginForm.reset();
    }
  });

  // Navigasi Pilihan Game di Dashboard
  document.getElementById("btn-play-tts").addEventListener("click", () => openGameSelector("tts"));
  document.getElementById("btn-play-wordsearch").addEventListener("click", () => openGameSelector("wordsearch"));

  // Tombol Kembali
  document.getElementById("btn-back-to-dash").addEventListener("click", () => {
    showView("view-dashboard");
    renderDashboardStats();
  });
  document.getElementById("btn-back-to-levels").addEventListener("click", () => {
    stopTimer();
    openGameSelector(AppState.currentGame);
  });
  document.getElementById("btn-back-to-levels-ws").addEventListener("click", () => {
    stopTimer();
    openGameSelector(AppState.currentGame);
  });

  // Action Buttons TTS
  document.getElementById("btn-check-tts").addEventListener("click", checkTTSAnswers);
  document.getElementById("btn-reset-tts").addEventListener("click", () => {
    if (confirm("Reset ulang isian TTS level ini?")) startTTSLevel(AppState.currentLevel);
  });

  // Action Buttons Word Search
  document.getElementById("btn-reset-ws").addEventListener("click", () => {
    if (confirm("Acak dan mulai ulang level ini?")) startWordSearchLevel(AppState.currentLevel);
  });

  // Modal Actions (Sukses)
  document.getElementById("btn-modal-next").addEventListener("click", handleModalNextLevel);
  document.getElementById("btn-modal-menu").addEventListener("click", () => {
    closeModal();
    openGameSelector(AppState.currentGame);
  });
  document.getElementById("btn-modal-home").addEventListener("click", () => {
    closeModal();
    showView("view-dashboard");
    renderDashboardStats();
  });

  // Modal Actions (Timeout / Waktu Habis)
  document.getElementById("btn-timeout-retry").addEventListener("click", () => {
    closeTimeoutModal();
    if (AppState.currentGame === "tts") {
      startTTSLevel(AppState.currentLevel);
    } else {
      startWordSearchLevel(AppState.currentLevel);
    }
  });
  document.getElementById("btn-timeout-menu").addEventListener("click", () => {
    closeTimeoutModal();
    openGameSelector(AppState.currentGame);
  });
  document.getElementById("btn-timeout-home").addEventListener("click", () => {
    closeTimeoutModal();
    showView("view-dashboard");
    renderDashboardStats();
  });
}

// ==========================================
// REGISTRASI IDENTITAS RESPONDEN
// ==========================================
async function handleRegisterSubmit(e) {
  e.preventDefault();
  const nama = document.getElementById("reg-nama").value.trim();
  const usia = document.getElementById("reg-usia").value;
  const jenisKelamin = document.getElementById("reg-gender").value;
  const sekolah = document.getElementById("reg-sekolah").value.trim();

  if (!nama || !usia || !jenisKelamin || !sekolah) {
    alert("Harap lengkapi semua data identitas!");
    return;
  }

  const idPeserta = "R-" + Math.floor(1000 + Math.random() * 9000);
  const userData = {
    nama,
    usia,
    jenisKelamin,
    sekolah,
    id: idPeserta,
    registeredAt: new Date().toISOString()
  };

  // Set di memori sesi aktif saat ini saja (tidak disimpan permanen di browser)
  AppState.user = userData;
  AppState.completedLevels = {};
  updateUIBadges();

  showToast(`Selamat datang, ${nama}! ID Partisipan: ${idPeserta}`, true);

  // Kirim data partisipan langsung ke Google Sheets
  postToGoogleSheet({
    action: "register",
    ...userData
  });

  showView("view-dashboard");
  renderDashboardStats();
}

// ==========================================
// LOGIN KEMBALI RESPONDEN
// ==========================================
async function handleLoginSubmit(e) {
  e.preventDefault();
  const query = document.getElementById("login-id").value.trim();

  if (!query) {
    alert("Harap masukkan ID Peserta atau Nama!");
    return;
  }

  // Bentuk profil sesi sementara untuk ID / Nama yang dimasukkan (tanpa disimpan di localStorage)
  const userData = {
    nama: query,
    usia: "-",
    jenisKelamin: "-",
    sekolah: "-",
    id: query.toUpperCase().startsWith("R-") ? query.toUpperCase() : ("R-" + Math.floor(1000 + Math.random() * 9000)),
    lastLogin: new Date().toISOString()
  };

  AppState.user = userData;
  AppState.completedLevels = {};
  updateUIBadges();

  showToast(`Selamat datang kembali, ${userData.nama}!`, true);

  // Catat login ke Google Sheets
  postToGoogleSheet({
    action: "login",
    ...userData
  });

  showView("view-dashboard");
  renderDashboardStats();
}

async function postToGoogleSheet(payload) {
  if (!AppState.scriptUrl || !AppState.scriptUrl.startsWith("http")) {
    console.log("Offline mode: Payload dicatat lokal", payload);
    return;
  }

  try {
    // Mode no-cors atau JSONP aman untuk Google Apps Script
    await fetch(AppState.scriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log("Data berhasil dikirim ke Google Sheets.");
  } catch (err) {
    console.warn("Gagal mengirim data ke Google Sheets, disimpan secara lokal:", err);
  }
}

// ==========================================
// DASHBOARD & LEVEL SELECTOR
// ==========================================
function renderDashboardStats() {
  const ttsCompleted = Object.keys(AppState.completedLevels).filter(k => k.startsWith("tts_")).length;
  const wsCompleted = Object.keys(AppState.completedLevels).filter(k => k.startsWith("ws_")).length;
  
  document.getElementById("stat-tts-done").textContent = `${ttsCompleted}/4`;
  document.getElementById("stat-ws-done").textContent = `${wsCompleted}/4`;
}

function openGameSelector(gameType) {
  AppState.currentGame = gameType;
  showView("view-level-select");

  const titleEl = document.getElementById("level-selector-title");
  const descEl = document.getElementById("level-selector-desc");
  const listEl = document.getElementById("level-cards-container");
  listEl.innerHTML = "";

  const levels = gameType === "tts" ? STROKE_KNOWLEDGE.tts : STROKE_KNOWLEDGE.wordSearch;
  
  if (gameType === "tts") {
    titleEl.textContent = "Teka-Teki Silang: Edukasi Stroke";
    descEl.textContent = "Pilih level untuk menguji pemahaman konsep klinis dan pencegahan stroke:";
  } else {
    titleEl.textContent = "Cari Kata: Waspada Stroke";
    descEl.textContent = "Cari kata-kata kunci tentang faktor risiko dan penanganan darurat stroke:";
  }

  levels.forEach((lvl, idx) => {
    const isDone = AppState.completedLevels[`${gameType}_${lvl.level}`];
    // Level 1 selalu terbuka, level berikutnya hanya terbuka jika level sebelumnya sudah selesai
    const prevDone = lvl.level === 1 || AppState.completedLevels[`${gameType}_${lvl.level - 1}`];
    const isLocked = !prevDone;

    const card = document.createElement("div");
    card.className = `level-card ${isDone ? "completed" : ""} ${isLocked ? "locked" : ""}`;
    const timeLimitSec = AppState.levelTimeLimits[lvl.level] || 120;
    const timeLimitMinStr = `${Math.floor(timeLimitSec / 60)}m ${timeLimitSec % 60 ? (timeLimitSec % 60) + "s" : ""}`;

    card.innerHTML = `
      <div class="level-num-badge">${isLocked ? "🔒" : lvl.level}</div>
      <h4>${lvl.title}</h4>
      <p>${lvl.subtitle}</p>
      <div class="level-meta">
        <span>${gameType === "tts" ? lvl.clues.length + " Soal" : lvl.words.length + " Kata"} • ⏳ ${timeLimitMinStr}</span>
        <span>${isDone ? "Skor: " + isDone.skor : (isLocked ? "Selesaikan Lvl " + (lvl.level - 1) : "Tersedia")}</span>
      </div>
    `;

    card.addEventListener("click", () => {
      if (isLocked) {
        showToast(`Level ${lvl.level} masih terkunci! Selesaikan Level ${lvl.level - 1} terlebih dahulu.`, false);
        return;
      }
      if (gameType === "tts") {
        startTTSLevel(lvl.level);
      } else {
        startWordSearchLevel(lvl.level);
      }
    });
    listEl.appendChild(card);
  });
}

// ==========================================
// TIMER ENGINE (HITUNGAN MUNDUR BERDASARKAN LEVEL)
// ==========================================
function startTimer(timerElementId, boxElementId) {
  stopTimer();

  // Dapatkan jatah waktu sesuai level (Level 1: 180s, Level 2: 150s, Level 3: 120s, Level 4: 90s)
  const initialSeconds = AppState.levelTimeLimits[AppState.currentLevel] || 120;
  AppState.initialTimeSeconds = initialSeconds;
  AppState.timerSeconds = initialSeconds;

  const el = document.getElementById(timerElementId);
  const box = document.getElementById(boxElementId);
  
  if (box) {
    box.classList.remove("timer-warning", "timer-danger");
  }

  updateTimerDisplay(el, box, AppState.timerSeconds);
  
  AppState.gameTimer = setInterval(() => {
    AppState.timerSeconds--;
    updateTimerDisplay(el, box, AppState.timerSeconds);

    if (AppState.timerSeconds <= 0) {
      stopTimer();
      handleTimeOut();
    }
  }, 1000);
}

function updateTimerDisplay(el, box, seconds) {
  if (!el) return;
  const clamped = Math.max(0, seconds);
  const m = Math.floor(clamped / 60).toString().padStart(2, "0");
  const s = (clamped % 60).toString().padStart(2, "0");
  el.textContent = `${m}:${s}`;

  if (box) {
    if (clamped <= 20) {
      box.classList.add("timer-danger");
      box.classList.remove("timer-warning");
    } else if (clamped <= 45) {
      box.classList.add("timer-warning");
      box.classList.remove("timer-danger");
    } else {
      box.classList.remove("timer-warning", "timer-danger");
    }
  }
}

function stopTimer() {
  if (AppState.gameTimer) {
    clearInterval(AppState.gameTimer);
    AppState.gameTimer = null;
  }
}

function handleTimeOut() {
  if (AppState.currentGame === "tts") {
    handleTTSTimeout();
  } else {
    handleWordSearchTimeout();
  }
}

// ==========================================
// GAME 1: TEKA-TEKI SILANG (TTS)
// ==========================================
function startTTSLevel(levelNum) {
  AppState.currentLevel = levelNum;
  showView("view-tts-game");
  startTimer("tts-timer", "tts-timer-box");

  const levelData = STROKE_KNOWLEDGE.tts.find(l => l.level === levelNum);
  document.getElementById("tts-level-title").textContent = levelData.title;
  document.getElementById("tts-level-subtitle").textContent = levelData.subtitle;
  document.getElementById("tts-fact-badge").textContent = "💡 " + levelData.factBadge;

  // Build Matrix
  const size = levelData.gridSize;
  const grid = Array.from({ length: size }, () => Array(size).fill(null));

  levelData.clues.forEach(clue => {
    const letters = clue.answer.toUpperCase().split("");
    let r = clue.row;
    let c = clue.col;
    for (let i = 0; i < letters.length; i++) {
      if (!grid[r][c]) {
        grid[r][c] = {
          char: letters[i],
          number: (i === 0) ? clue.number : null,
          clues: [clue.id]
        };
      } else {
        if (i === 0 && !grid[r][c].number) grid[r][c].number = clue.number;
        grid[r][c].clues.push(clue.id);
      }
      if (clue.direction === "across") c++;
      else r++;
    }
  });

  AppState.ttsGrid = grid;
  renderTTSGrid(grid, size, levelData.clues);
  renderTTSClues(levelData.clues);
}

function renderTTSGrid(grid, size, clues) {
  const container = document.getElementById("tts-grid-board");
  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cellData = grid[r][c];
      const cell = document.createElement("div");
      cell.className = "tts-cell";
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (!cellData) {
        cell.classList.add("empty");
      } else {
        if (cellData.number) {
          const numSpan = document.createElement("span");
          numSpan.className = "tts-number";
          numSpan.textContent = cellData.number;
          cell.appendChild(numSpan);
        }

        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.className = "tts-input";
        input.dataset.row = r;
        input.dataset.col = c;

        input.addEventListener("focus", () => onTTSCellFocus(r, c, cellData));
        input.addEventListener("click", () => onTTSCellClick(r, c, cellData));
        input.addEventListener("keydown", (e) => onTTSKeyDown(e, r, c, size));
        input.addEventListener("input", (e) => onTTSInput(e, r, c, size));

        cell.appendChild(input);
      }
      container.appendChild(cell);
    }
  }
}

function renderTTSClues(clues) {
  const acrossList = document.getElementById("tts-clues-across");
  const downList = document.getElementById("tts-clues-down");
  acrossList.innerHTML = "";
  downList.innerHTML = "";

  clues.forEach(clue => {
    const item = document.createElement("div");
    item.className = "clue-item";
    item.id = `clue-item-${clue.id}`;
    item.innerHTML = `<span class="clue-num">${clue.number}.</span> ${clue.question} (${clue.answer.length} huruf)`;
    item.addEventListener("click", () => focusTTSClue(clue));

    if (clue.direction === "across") {
      acrossList.appendChild(item);
    } else {
      downList.appendChild(item);
    }
  });
}

function focusTTSClue(clue) {
  AppState.ttsActiveClue = clue;
  AppState.ttsActiveDirection = clue.direction;
  
  // Highlight clue di samping
  document.querySelectorAll(".clue-item").forEach(el => el.classList.remove("active"));
  const item = document.getElementById(`clue-item-${clue.id}`);
  if (item) item.classList.add("active");

  // Focus input awal kata
  const input = document.querySelector(`.tts-input[data-row="${clue.row}"][data-col="${clue.col}"]`);
  if (input) input.focus();
}

function onTTSCellFocus(r, c, cellData) {
  AppState.ttsActiveCell = { r, c };
  highlightActiveTTSWord(r, c, cellData);
}

function onTTSCellClick(r, c, cellData) {
  // Jika kotak yang sama diklik dan memiliki lebih dari 1 clue (persilangan mendatar & menurun), toggle arahnya
  if (cellData && cellData.clues && cellData.clues.length > 1) {
    AppState.ttsActiveDirection = (AppState.ttsActiveDirection === "across") ? "down" : "across";
    highlightActiveTTSWord(r, c, cellData);
  }
}

function highlightActiveTTSWord(r, c, cellData) {
  document.querySelectorAll(".tts-cell").forEach(el => el.classList.remove("selected", "active-word"));
  
  // Pilih clue yang cocok dengan arah saat ini
  const levelData = STROKE_KNOWLEDGE.tts.find(l => l.level === AppState.currentLevel);
  const matchingClues = levelData.clues.filter(cl => cellData.clues.includes(cl.id));
  
  let clueToHighlight = matchingClues.find(cl => cl.direction === AppState.ttsActiveDirection) || matchingClues[0];

  if (clueToHighlight) {
    AppState.ttsActiveClue = clueToHighlight;
    AppState.ttsActiveDirection = clueToHighlight.direction;

    document.querySelectorAll(".clue-item").forEach(el => el.classList.remove("active"));
    const activeItem = document.getElementById(`clue-item-${clueToHighlight.id}`);
    if (activeItem) activeItem.classList.add("active");

    let cr = clueToHighlight.row;
    let cc = clueToHighlight.col;
    for (let i = 0; i < clueToHighlight.answer.length; i++) {
      const cellEl = document.querySelector(`.tts-cell[data-row="${cr}"][data-col="${cc}"]`);
      if (cellEl) cellEl.classList.add("active-word");
      if (clueToHighlight.direction === "across") cc++;
      else cr++;
    }
  }

  const curCell = document.querySelector(`.tts-cell[data-row="${r}"][data-col="${c}"]`);
  if (curCell) curCell.classList.add("selected");
}

function onTTSInput(e, r, c, size) {
  const val = e.target.value.toUpperCase();
  e.target.value = val;

  if (val && AppState.ttsActiveClue) {
    // Geser ke kotak berikutnya
    let nextR = r;
    let nextC = c;
    if (AppState.ttsActiveDirection === "across") nextC++;
    else nextR++;

    const nextInput = document.querySelector(`.tts-input[data-row="${nextR}"][data-col="${nextC}"]`);
    if (nextInput) nextInput.focus();
  }
}

function onTTSKeyDown(e, r, c, size) {
  if (e.key === "Backspace" && !e.target.value) {
    let prevR = r;
    let prevC = c;
    if (AppState.ttsActiveDirection === "across") prevC--;
    else prevR--;

    const prevInput = document.querySelector(`.tts-input[data-row="${prevR}"][data-col="${prevC}"]`);
    if (prevInput) prevInput.focus();
  } else if (e.key === "ArrowRight") {
    const next = document.querySelector(`.tts-input[data-row="${r}"][data-col="${c + 1}"]`);
    if (next) next.focus();
  } else if (e.key === "ArrowLeft") {
    const prev = document.querySelector(`.tts-input[data-row="${r}"][data-col="${c - 1}"]`);
    if (prev) prev.focus();
  } else if (e.key === "ArrowDown") {
    const down = document.querySelector(`.tts-input[data-row="${r + 1}"][data-col="${c}"]`);
    if (down) down.focus();
  } else if (e.key === "ArrowUp") {
    const up = document.querySelector(`.tts-input[data-row="${r - 1}"][data-col="${c}"]`);
    if (up) up.focus();
  }
}

function checkTTSAnswers() {
  const isConfirmed = confirm("Apakah Anda yakin ingin memeriksa dan menyimpan jawaban? Permainan akan langsung diakhiri.");
  if (!isConfirmed) {
    return;
  }

  // Hentikan timer permainan langsung saat dikonfirmasi
  stopTimer();

  const levelData = STROKE_KNOWLEDGE.tts.find(l => l.level === AppState.currentLevel);
  let correctWordsCount = 0;
  let allCorrect = true;

  levelData.clues.forEach(clue => {
    let r = clue.row;
    let c = clue.col;
    let userWord = "";
    const cellsToStyle = [];

    for (let i = 0; i < clue.answer.length; i++) {
      const input = document.querySelector(`.tts-input[data-row="${r}"][data-col="${c}"]`);
      userWord += (input ? input.value.toUpperCase() : "");
      cellsToStyle.push(document.querySelector(`.tts-cell[data-row="${r}"][data-col="${c}"]`));
      if (clue.direction === "across") c++;
      else r++;
    }

    if (userWord === clue.answer.toUpperCase()) {
      correctWordsCount++;
      cellsToStyle.forEach(cEl => {
        if (cEl) cEl.classList.add("correct-letter");
      });
      const clueItem = document.getElementById(`clue-item-${clue.id}`);
      if (clueItem) clueItem.classList.add("solved");
    } else {
      allCorrect = false;
    }
  });

  const totalWords = levelData.clues.length;
  const score = Math.round((correctWordsCount / totalWords) * 100);
  const timeSpent = Math.max(1, AppState.initialTimeSeconds - AppState.timerSeconds);
  const status = allCorrect ? "Completed" : "Submitted";

  // Nonaktifkan semua input TTS agar permainan benar-benar berhenti
  document.querySelectorAll(".tts-input").forEach(inp => {
    inp.disabled = true;
  });

  saveLevelResult("tts", AppState.currentLevel, score, correctWordsCount, totalWords, status, timeSpent);

  const titleModal = allCorrect ? "TTS Selesai Sempurna!" : "Permainan TTS Selesai!";
  const msgModal = allCorrect
    ? `Luar biasa! Anda berhasil memecahkan semua teka-teki silang Level ${AppState.currentLevel}.`
    : `Permainan telah diakhiri. Anda berhasil menjawab benar ${correctWordsCount} dari ${totalWords} kata (Skor: ${score}).`;

  showSuccessModal(titleModal, msgModal, score, timeSpent, levelData.clues[0].explanation);
}

// ==========================================
// GAME 2: CARI KATA (WORD SEARCH)
// ==========================================
function startWordSearchLevel(levelNum) {
  AppState.currentLevel = levelNum;
  showView("view-wordsearch-game");
  startTimer("ws-timer", "ws-timer-box");

  const levelData = STROKE_KNOWLEDGE.wordSearch.find(l => l.level === levelNum);
  document.getElementById("ws-level-title").textContent = levelData.title;
  document.getElementById("ws-level-subtitle").textContent = levelData.subtitle;
  document.getElementById("ws-fact-badge").textContent = "💡 " + levelData.factBadge;

  AppState.wsFoundWords = [];
  AppState.wsGridSize = levelData.gridSize;

  generateWordSearchGrid(levelData);
  renderWordSearchBoard();
  renderWordSearchTargetList(levelData.words);
}

function generateWordSearchGrid(levelData) {
  const size = levelData.gridSize;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // 8 Arah penempatan lengkap (Horizontal, Vertikal, Diagonal - maju & mundur)
  const directions = [
    { dr: 0, dc: 1, name: "horizontal-right" },
    { dr: 0, dc: -1, name: "horizontal-left" },
    { dr: 1, dc: 0, name: "vertical-down" },
    { dr: -1, dc: 0, name: "vertical-up" },
    { dr: 1, dc: 1, name: "diagonal-down-right" },
    { dr: -1, dc: -1, name: "diagonal-up-left" },
    { dr: 1, dc: -1, name: "diagonal-down-left" },
    { dr: -1, dc: 1, name: "diagonal-up-right" }
  ];

  let grid = [];
  let successfulPlacement = false;
  let overallAttempts = 0;

  // Lakukan percobaan pembentukan grid lengkap jika terjadi kebuntuan (collision)
  while (!successfulPlacement && overallAttempts < 50) {
    overallAttempts++;
    grid = Array.from({ length: size }, () => Array(size).fill(""));

    // Acak urutan kata yang akan dipasang (Fisher-Yates shuffle)
    const shuffledWords = [...levelData.words].sort(() => Math.random() - 0.5);
    let allPlaced = true;

    for (const wObj of shuffledWords) {
      const word = wObj.word.toUpperCase();
      let placed = false;
      let wordAttempts = 0;

      // Kumpulkan semua posisi dan arah yang mungkin lalu acak secara menyeluruh
      const allPossiblePositions = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          for (const dir of directions) {
            const endR = r + dir.dr * (word.length - 1);
            const endC = c + dir.dc * (word.length - 1);
            if (endR >= 0 && endR < size && endC >= 0 && endC < size) {
              allPossiblePositions.push({ r, c, dir });
            }
          }
        }
      }

      // Acak urutan penempatan kandidat
      allPossiblePositions.sort(() => Math.random() - 0.5);

      for (const pos of allPossiblePositions) {
        wordAttempts++;
        let canPlace = true;

        for (let i = 0; i < word.length; i++) {
          const checkR = pos.r + i * pos.dir.dr;
          const checkC = pos.c + i * pos.dir.dc;
          const currentCell = grid[checkR][checkC];

          if (currentCell !== "" && currentCell !== word[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            grid[pos.r + i * pos.dir.dr][pos.c + i * pos.dir.dc] = word[i];
          }
          placed = true;
          break;
        }
      }

      if (!placed) {
        allPlaced = false;
        break; // Ulangi dari awal jika satu kata tidak muat
      }
    }

    if (allPlaced) {
      successfulPlacement = true;
    }
  }

  // Isi seluruh sel sisa yang kosong dengan huruf acak A-Z
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  AppState.wsGrid = grid;
}

function renderWordSearchBoard() {
  const board = document.getElementById("ws-grid-board");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${AppState.wsGridSize}, 1fr)`;

  for (let r = 0; r < AppState.wsGridSize; r++) {
    for (let c = 0; c < AppState.wsGridSize; c++) {
      const cell = document.createElement("div");
      cell.className = "ws-cell";
      cell.textContent = AppState.wsGrid[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;

      // Event Mouse
      cell.addEventListener("mousedown", () => onWSStartSelect(r, c));
      cell.addEventListener("mouseenter", () => onWSEnterSelect(r, c));
      board.appendChild(cell);
    }
  }

  // Handle Touch Events untuk layar smartphone / tablet
  board.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.classList.contains("ws-cell")) {
      e.preventDefault();
      const r = parseInt(target.dataset.row);
      const c = parseInt(target.dataset.col);
      onWSStartSelect(r, c);
    }
  }, { passive: false });

  board.addEventListener("touchmove", (e) => {
    if (!AppState.wsIsSelecting) return;
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.classList.contains("ws-cell")) {
      e.preventDefault();
      const r = parseInt(target.dataset.row);
      const c = parseInt(target.dataset.col);
      onWSEnterSelect(r, c);
    }
  }, { passive: false });

  board.addEventListener("touchend", () => {
    if (AppState.wsIsSelecting) {
      onWSEndSelect();
    }
  });

  // Handle Mouse Up di luar atau di dalam grid
  document.onmouseup = onWSEndSelect;
}

function renderWordSearchTargetList(words) {
  const list = document.getElementById("ws-words-list");
  list.innerHTML = "";

  words.forEach(w => {
    const card = document.createElement("div");
    card.className = "target-word-card";
    card.id = `ws-target-${w.word.toUpperCase()}`;
    card.innerHTML = `
      <div>
        <span class="word-text">${w.word}</span>
        <span class="word-hint">${w.hint}</span>
      </div>
      <span class="status-icon">○</span>
    `;
    list.appendChild(card);
  });

  updateWSFoundCount();
}

function updateWSFoundCount() {
  const levelData = STROKE_KNOWLEDGE.wordSearch.find(l => l.level === AppState.currentLevel);
  document.getElementById("ws-found-count").textContent = `${AppState.wsFoundWords.length}/${levelData.words.length}`;
}

function onWSStartSelect(r, c) {
  AppState.wsIsSelecting = true;
  AppState.wsSelectionStart = { r, c };
  AppState.wsSelectedCells = [{ r, c }];
  updateWSSelectionStyles();
}

function onWSEnterSelect(r, c) {
  if (!AppState.wsIsSelecting || !AppState.wsSelectionStart) return;

  const startR = AppState.wsSelectionStart.r;
  const startC = AppState.wsSelectionStart.c;

  // Tentukan garis lurus (horizontal, vertical, diagonal)
  const dR = r - startR;
  const dC = c - startC;

  const stepR = dR === 0 ? 0 : dR > 0 ? 1 : -1;
  const stepC = dC === 0 ? 0 : dC > 0 ? 1 : -1;

  if (dR === 0 || dC === 0 || Math.abs(dR) === Math.abs(dC)) {
    const len = Math.max(Math.abs(dR), Math.abs(dC));
    AppState.wsSelectedCells = [];
    for (let i = 0; i <= len; i++) {
      AppState.wsSelectedCells.push({
        r: startR + i * stepR,
        c: startC + i * stepC
      });
    }
    updateWSSelectionStyles();
  }
}

function updateWSSelectionStyles() {
  document.querySelectorAll(".ws-cell").forEach(el => el.classList.remove("selecting"));
  AppState.wsSelectedCells.forEach(cell => {
    const el = document.querySelector(`.ws-cell[data-row="${cell.r}"][data-col="${cell.c}"]`);
    if (el) el.classList.add("selecting");
  });
}

function onWSEndSelect() {
  if (!AppState.wsIsSelecting) return;
  AppState.wsIsSelecting = false;

  const word = AppState.wsSelectedCells.map(c => AppState.wsGrid[c.r][c.c]).join("");
  const wordReversed = word.split("").reverse().join("");

  const levelData = STROKE_KNOWLEDGE.wordSearch.find(l => l.level === AppState.currentLevel);
  const matched = levelData.words.find(w => w.word.toUpperCase() === word || w.word.toUpperCase() === wordReversed);

  if (matched && !AppState.wsFoundWords.includes(matched.word.toUpperCase())) {
    const foundWord = matched.word.toUpperCase();
    AppState.wsFoundWords.push(foundWord);

    // Tandai permanen cell yang ditemukan
    AppState.wsSelectedCells.forEach(c => {
      const el = document.querySelector(`.ws-cell[data-row="${c.r}"][data-col="${c.c}"]`);
      if (el) el.classList.add("found");
    });

    // Tandai target list
    const card = document.getElementById(`ws-target-${foundWord}`);
    if (card) {
      card.classList.add("found");
      card.querySelector(".status-icon").textContent = "✓";
    }

    updateWSFoundCount();
    showToast(`Kata ditemukan: "${foundWord}"!`);

    // Cek kemenangan level
    if (AppState.wsFoundWords.length === levelData.words.length) {
      stopTimer();
      const score = 100;
      const timeSpent = AppState.initialTimeSeconds - AppState.timerSeconds;
      saveLevelResult("wordsearch", AppState.currentLevel, score, levelData.words.length, levelData.words.length, "Completed", timeSpent);
      showSuccessModal("Selamat! Cari Kata Tuntas", `Semua kata edukasi stroke pada Level ${AppState.currentLevel} telah ditemukan!`, score, timeSpent, matched.hint);
    }
  }

  // Clear selection styles
  document.querySelectorAll(".ws-cell").forEach(el => el.classList.remove("selecting"));
  AppState.wsSelectedCells = [];
}

// ==========================================
// SIMPAN PROGRESS & MODAL EDUKASI
// ==========================================
function saveLevelResult(gameType, levelNum, score, benar, total, status, durationSec) {
  const actualDuration = durationSec !== undefined ? durationSec : (AppState.initialTimeSeconds - AppState.timerSeconds);
  const key = `${gameType === "tts" ? "tts" : "ws"}_${levelNum}`;
  const res = {
    game: gameType.toUpperCase(),
    level: levelNum,
    skor: score,
    waktu: actualDuration,
    benar,
    total,
    status,
    timestamp: new Date().toISOString()
  };

  AppState.completedLevels[key] = res;

  // Sync langsung ke Google Sheets (Data murni tersimpan di spreadsheet, bukan di browser)
  postToGoogleSheet({
    action: "saveScore",
    id: AppState.user ? AppState.user.id : "ANON",
    nama: AppState.user ? AppState.user.nama : "Anonim",
    game: res.game,
    level: res.level,
    skor: res.skor,
    waktu: res.waktu,
    benar: res.benar,
    total: res.total,
    status: res.status
  });
}

function showSuccessModal(title, message, score, timeSec, takeaway) {
  const modal = document.getElementById("success-modal");
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-message").textContent = message;
  document.getElementById("modal-score").textContent = score;
  
  const m = Math.floor(timeSec / 60).toString().padStart(2, "0");
  const s = (timeSec % 60).toString().padStart(2, "0");
  document.getElementById("modal-time").textContent = `${m}:${s}`;
  document.getElementById("modal-takeaway").textContent = "Poin Edukasi Penting: " + takeaway;

  const nextBtn = document.getElementById("btn-modal-next");
  if (AppState.currentLevel < 4) {
    nextBtn.style.display = "block";
    nextBtn.textContent = `Lanjut ke Level ${AppState.currentLevel + 1} →`;
  } else {
    nextBtn.style.display = "none";
  }

  modal.classList.add("active");
}

function closeModal() {
  document.getElementById("success-modal").classList.remove("active");
}

function handleModalNextLevel() {
  closeModal();
  if (AppState.currentLevel < 4) {
    const nextLvl = AppState.currentLevel + 1;
    if (AppState.currentGame === "tts") {
      startTTSLevel(nextLvl);
    } else {
      startWordSearchLevel(nextLvl);
    }
  }
}

// ==========================================
// PENANGANAN WAKTU HABIS (TIMEOUT / GAME OVER)
// ==========================================
function handleTTSTimeout() {
  const levelData = STROKE_KNOWLEDGE.tts.find(l => l.level === AppState.currentLevel);
  let correctWordsCount = 0;

  levelData.clues.forEach(clue => {
    let r = clue.row;
    let c = clue.col;
    let userWord = "";

    for (let i = 0; i < clue.answer.length; i++) {
      const input = document.querySelector(`.tts-input[data-row="${r}"][data-col="${c}"]`);
      userWord += (input ? input.value.toUpperCase() : "");
      if (clue.direction === "across") c++;
      else r++;
    }

    if (userWord === clue.answer.toUpperCase()) {
      correctWordsCount++;
    }
  });

  const totalWords = levelData.clues.length;
  const score = Math.round((correctWordsCount / totalWords) * 100);

  saveLevelResult("tts", AppState.currentLevel, score, correctWordsCount, totalWords, "Timed Out", AppState.initialTimeSeconds);
  showTimeoutModal(score, `${correctWordsCount}/${totalWords} kata`);
}

function handleWordSearchTimeout() {
  const levelData = STROKE_KNOWLEDGE.wordSearch.find(l => l.level === AppState.currentLevel);
  const found = AppState.wsFoundWords.length;
  const total = levelData.words.length;
  const score = Math.round((found / total) * 100);

  saveLevelResult("wordsearch", AppState.currentLevel, score, found, total, "Timed Out", AppState.initialTimeSeconds);
  showTimeoutModal(score, `${found}/${total} kata`);
}

function showTimeoutModal(score, solvedText) {
  const modal = document.getElementById("timeout-modal");
  document.getElementById("timeout-score").textContent = score;
  document.getElementById("timeout-solved").textContent = solvedText;
  modal.classList.add("active");
}

function closeTimeoutModal() {
  document.getElementById("timeout-modal").classList.remove("active");
}

