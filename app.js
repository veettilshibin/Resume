/* ─── WINDOWS 3.1 RESUME — APP LOGIC ─── */

// ─── BOOT SEQUENCE ───
const dosMessages = [
  { text: 'HIMEM is testing extended memory...done.', delay: 0 },
  { text: 'MS-DOS Extended Memory Specification (XMS) Version 3.0', delay: 200 },
  { text: 'Copyright 1988-1993 Microsoft Corp.', delay: 350 },
  { text: '', delay: 500 },
  { text: 'EMM386 not installed.', delay: 600 },
  { text: 'SMARTDRV cache: 2048K ReadAhead, 0K Write-Behind', delay: 800 },
  { text: '', delay: 1000 },
  { text: 'Microsoft Windows Version 3.1', delay: 1050, cls: 'ok' },
  { text: 'Copyright 1985-1993 Microsoft Corp.', delay: 1200 },
  { text: '', delay: 1400 },
  { text: 'Loading C:\\WINDOWS\\WIN.COM...', delay: 1500 },
  { text: '', delay: 1800 },
  { text: 'Starting Resume.exe by Shibin Puthen Veettil...', delay: 2000, cls: 'ok' },
];

function runBoot() {
  const dosLines = document.getElementById('dos-lines');
  const winLogo = document.getElementById('win-logo');
  const bootFill = document.getElementById('boot-fill');
  let bootDots = document.getElementById('boot-dots');

  dosMessages.forEach(({ text, delay, cls }) => {
    setTimeout(() => {
      const line = document.createElement('span');
      line.className = 'dos-line' + (cls ? ' ' + cls : '');
      line.textContent = text;
      dosLines.appendChild(line);
    }, delay);
  });

  // Show Win logo after DOS lines
  setTimeout(() => {
    dosLines.style.display = 'none';
    winLogo.style.display = 'block';
    // Animate progress bar
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        // Transition to desktop
        setTimeout(transitionToDesktop, 500);
      }
      bootFill.style.width = progress + '%';
    }, 120);
    // Animate dots
    let dotCount = 0;
    setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      bootDots.textContent = '.'.repeat(dotCount + 1);
    }, 400);
  }, 2400);
}

function transitionToDesktop() {
  const bootScreen = document.getElementById('boot-screen');
  const desktop = document.getElementById('desktop');
  bootScreen.classList.add('fade-out');
  desktop.style.display = 'block';
  desktop.style.opacity = '0';
  setTimeout(() => {
    desktop.style.transition = 'opacity 0.5s ease';
    desktop.style.opacity = '1';
    bootScreen.style.display = 'none';
    startClock();
    // Show hint tooltip after a moment
    setTimeout(showHint, 1200);
  }, 600);
}

// ─── CLOCK ───
function startClock() {
  const clockEl = document.getElementById('taskbar-clock');
  function tick() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    clockEl.textContent = h + ':' + m;
  }
  tick();
  setInterval(tick, 30000);
}

// ─── HINT ───
function showHint() {
  const hint = document.createElement('div');
  hint.className = 'help-hint';
  hint.innerHTML = '💡 <strong>Tip:</strong> Double-click the icons in Program Manager to open resume sections. Drag windows by their title bar.';
  document.getElementById('desktop').appendChild(hint);
  setTimeout(() => {
    hint.style.transition = 'opacity 0.5s ease';
    hint.style.opacity = '0';
    setTimeout(() => hint.remove(), 500);
  }, 5000);
}

// ─── WINDOW MANAGEMENT ───
let zCounter = 20;
let dragState = null;
const minimizedWindows = {};
const windowTitles = {
  'win-about': 'About Me',
  'win-experience': 'Experience',
  'win-skills': 'Skills',
  'win-projects': 'Projects',
  'win-education': 'Education',
  'win-contact': 'Contact',
};
const openWindows = new Set();

function openApp(appName) {
  const winId = 'win-' + appName;
  const win = document.getElementById(winId);
  if (!win) return;

  if (minimizedWindows[winId]) {
    restoreWindow(winId);
    return;
  }

  if (win.style.display !== 'none') {
    bringToFront(winId);
    return;
  }

  // Cascade offset
  const count = openWindows.size;
  const baseLeft = 130 + (count * 24);
  const baseTop = 70 + (count * 20);

  if (!win.dataset.positioned) {
    win.style.left = baseLeft + 'px';
    win.style.top = baseTop + 'px';
    win.dataset.positioned = '1';
  }

  win.style.display = 'flex';
  bringToFront(winId);
  openWindows.add(winId);
  updateTaskbar();
}

function closeWindow(winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  win.style.display = 'none';
  openWindows.delete(winId);
  if (minimizedWindows[winId]) {
    delete minimizedWindows[winId];
  }
  updateTaskbar();
}

function minimizeWindow(winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  minimizedWindows[winId] = {
    left: win.style.left,
    top: win.style.top,
    width: win.style.width,
    height: win.style.height,
  };
  win.style.display = 'none';
  openWindows.add(winId);
  updateTaskbar();
}

function restoreWindow(winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  const saved = minimizedWindows[winId];
  if (saved) {
    win.style.left = saved.left;
    win.style.top = saved.top;
    if (saved.width) win.style.width = saved.width;
    if (saved.height) win.style.height = saved.height;
    delete minimizedWindows[winId];
  }
  win.style.display = 'flex';
  bringToFront(winId);
  updateTaskbar();
}

let maximizedState = {};
function toggleMaximize(winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  if (maximizedState[winId]) {
    // Restore
    const s = maximizedState[winId];
    win.style.left = s.left;
    win.style.top = s.top;
    win.style.width = s.width;
    win.style.height = s.height;
    delete maximizedState[winId];
  } else {
    // Maximize
    maximizedState[winId] = {
      left: win.style.left,
      top: win.style.top,
      width: win.style.width,
      height: win.style.height,
    };
    win.style.left = '0px';
    win.style.top = '0px';
    win.style.width = '100vw';
    win.style.height = 'calc(100vh - 28px)';
    bringToFront(winId);
  }
}

function bringToFront(winId) {
  // Deactivate all
  document.querySelectorAll('.win-window').forEach(w => {
    w.classList.remove('active-window');
    const tb = w.querySelector('.win-titlebar');
    if (tb) tb.style.background = 'var(--win-titlebar-inactive)';
  });
  // Activate target
  const win = document.getElementById(winId);
  if (win) {
    zCounter++;
    win.style.zIndex = zCounter;
    win.classList.add('active-window');
    const tb = win.querySelector('.win-titlebar');
    if (tb) tb.style.background = 'var(--win-titlebar)';
  }
}

// ─── TASKBAR ───
function updateTaskbar() {
  const bar = document.getElementById('taskbar-items');
  bar.innerHTML = '';
  openWindows.forEach(winId => {
    const item = document.createElement('div');
    item.className = 'taskbar-item';
    item.textContent = windowTitles[winId] || winId;
    item.onclick = () => {
      if (minimizedWindows[winId]) {
        restoreWindow(winId);
      } else {
        bringToFront(winId);
      }
    };
    bar.appendChild(item);
  });
}

// ─── DRAG ───
function startDrag(e, winId) {
  if (e.target.closest('.win-btn')) return;
  const win = document.getElementById(winId);
  if (!win) return;
  bringToFront(winId);
  const rect = win.getBoundingClientRect();
  dragState = {
    winId,
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top,
  };
  e.preventDefault();
}

document.addEventListener('mousemove', (e) => {
  if (!dragState) return;
  const win = document.getElementById(dragState.winId);
  if (!win) return;
  let newLeft = e.clientX - dragState.offsetX;
  let newTop = e.clientY - dragState.offsetY;
  // Keep on screen
  newLeft = Math.max(0, Math.min(window.innerWidth - 40, newLeft));
  newTop = Math.max(0, Math.min(window.innerHeight - 48, newTop));
  win.style.left = newLeft + 'px';
  win.style.top = newTop + 'px';
});

document.addEventListener('mouseup', () => { dragState = null; });

// ─── TOUCH DRAG ───
document.addEventListener('touchstart', (e) => {
  const tb = e.target.closest('.win-titlebar');
  if (!tb) return;
  const win = tb.closest('.win-window');
  if (!win) return;
  const t = e.touches[0];
  const rect = win.getBoundingClientRect();
  dragState = {
    winId: win.id,
    offsetX: t.clientX - rect.left,
    offsetY: t.clientY - rect.top,
  };
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (!dragState) return;
  const t = e.touches[0];
  const win = document.getElementById(dragState.winId);
  if (!win) return;
  let newLeft = t.clientX - dragState.offsetX;
  let newTop = t.clientY - dragState.offsetY;
  newLeft = Math.max(0, Math.min(window.innerWidth - 40, newLeft));
  newTop = Math.max(0, Math.min(window.innerHeight - 48, newTop));
  win.style.left = newLeft + 'px';
  win.style.top = newTop + 'px';
}, { passive: true });

document.addEventListener('touchend', () => { dragState = null; });

// ─── PROGRAM MANAGER AS DRAGGABLE ───
document.addEventListener('DOMContentLoaded', () => {
  // Make PM bringable on click
  const pm = document.getElementById('program-manager');
  if (pm) {
    pm.addEventListener('mousedown', () => bringToFront('program-manager'));
    bringToFront('program-manager');
  }
  // Start boot
  runBoot();
});

// ─── KEYBOARD: ESC closes topmost window ───
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Find highest z-index visible app window
    let highest = null, highZ = 0;
    document.querySelectorAll('.app-window').forEach(w => {
      if (w.style.display !== 'none') {
        const z = parseInt(w.style.zIndex) || 0;
        if (z > highZ) { highZ = z; highest = w; }
      }
    });
    if (highest) closeWindow(highest.id);
  }
});


// ─── CERTIFICATES APP ───
function setupCertificatesApp() {
  if (document.getElementById('win-certificates')) return;

  const educationWindow = document.getElementById('win-education');
  const desktop = document.getElementById('desktop');
  if (!educationWindow || !desktop) return;

  windowTitles['win-certificates'] = 'Certificates';

  const certificateIcon = `
    <svg viewBox="0 0 32 32" fill="none"
         xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="4" width="26" height="22"
            fill="#ffffe0" stroke="#404040" stroke-width="2"/>
      <rect x="6" y="7" width="20" height="16"
            stroke="#808000"/>
      <path d="M9 11h14M9 15h10"
            stroke="#000080" stroke-width="2"/>
      <path d="M19 23l-2 7 5-2 4 2-2-7"
            fill="#800000"/>
      <circle cx="22" cy="21" r="5"
              fill="#c8c800" stroke="#808000"/>
      <path d="M20 21l1.5 1.5 3-3"
            stroke="#000080" stroke-width="1.5"/>
    </svg>
  `;

  // Add matching icons to both launch location
