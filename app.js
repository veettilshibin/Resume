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

  // Add matching icons to both launch locations.
  [
    {
      container: document.getElementById('desktop-icons'),
      selector: '.desk-icon',
      image: '.desk-icon-img',
      label: '.desk-icon-label'
    },
    {
      container: document.querySelector('#program-manager .pm-icons'),
      selector: '.pm-icon',
      image: '.pm-icon-img',
      label: '.pm-icon-label'
    }
  ].forEach(({ container, selector, image, label }) => {
    if (!container) return;

    const template = container.querySelector(selector);
    if (!template) return;

    const icon = template.cloneNode(true);
    icon.removeAttribute('id');
    icon.dataset.app = 'certificates';
    icon.setAttribute('ondblclick', "openApp('certificates')");
    icon.setAttribute('role', 'button');
    icon.setAttribute('tabindex', '0');
    icon.setAttribute('aria-label', 'Open Certificates');

    icon.querySelector(image).innerHTML = certificateIcon;
    icon.querySelector(label).textContent = 'Certificates';

    icon.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openApp('certificates');
      }
    });

    // A single tap opens the app on touch devices.
    icon.addEventListener('click', () => {
      if (window.matchMedia('(pointer: coarse)').matches) {
        openApp('certificates');
      }
    });

    container.appendChild(icon);
  });

  // Reuse the Education window's existing structure and controls.
  const certWindow = educationWindow.cloneNode(true);
  certWindow.id = 'win-certificates';
  certWindow.style.display = 'none';
  certWindow.style.width =
    Math.min(520, Math.max(240, window.innerWidth - 16)) + 'px';
  certWindow.style.height = '420px';
  certWindow.style.maxHeight = 'calc(100vh - 44px)';
  delete certWindow.dataset.positioned;

  // Point cloned controls at the new window.
  [certWindow, ...certWindow.querySelectorAll('*')].forEach(element => {
    [...element.attributes].forEach(attribute => {
      if (attribute.name.startsWith('on')) {
        element.setAttribute(
          attribute.name,
          attribute.value.replaceAll(
            'win-education',
            'win-certificates'
          )
        );
      }
    });
  });

  const title = certWindow.querySelector('.win-title');
  title.innerHTML = certificateIcon + '<span>Certificates</span>';
  title.querySelector('svg').setAttribute('class', 'title-icon');

  const certificates = [
    {
      name: 'CompTIA CySA+',
      url: 'https://www.credly.com/badges/5f661ad9-f09f-4088-b2e6-9086c8f47ab8/public_url'
    },
    {
      name: 'CompTIA Security+',
      url: 'https://www.credly.com/badges/dd530c5a-b3d2-4136-a26e-1d0265f7430f/public_url'
    },
    {
      name: 'CSAP',
      url: 'https://www.credly.com/badges/5f661ad9-f09f-4088-b2e6-9086c8f47ab8/public_url'
    },
    {
      name: 'CC (ISC²)',
      url: null
    },
    {
      name: 'Proofpoint',
      url: 'https://www.credly.com/badges/5e87b161-1750-4ed6-a59b-c5d2714abb66/public_url'
    }
  ];

  const body = certWindow.querySelector('.win-body');
  body.innerHTML = `
    <div class="edu-section">
      <div class="edu-section-title">Certificates</div>
      <div class="cert-grid" style="grid-template-columns:1fr;">
        ${certificates.map(cert => `
          <div class="cert-card earned">
            <div class="cert-badge" aria-hidden="true">✓</div>
            <div class="cert-info">
              <div class="cert-name">${cert.name}</div>
              ${cert.url ? `
                <a class="win-link-btn"
                   style="margin-top:8px;"
                   href="${cert.url}"
                   target="_blank"
                   rel="noopener noreferrer"
                   aria-label="View ${cert.name} credential on Credly">
                  View credential
                </a>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  body.style.overflowY = 'auto';
  body.style.minHeight = '0';
  body.style.flex = '1';

  certWindow.addEventListener('mousedown', () => {
    bringToFront('win-certificates');
  });

  // Set an initial position that also fits smaller screens.
  certWindow.style.left =
    Math.max(0, Math.min(130, window.innerWidth - parseFloat(
      certWindow.style.width
    ) - 8)) + 'px';
  certWindow.style.top = '40px';
  certWindow.dataset.positioned = '1';

  desktop.appendChild(certWindow);

  // Keep Education separate from Certificates.
  const educationTitle = educationWindow.querySelector('.win-title');
  [...educationTitle.childNodes].forEach(node => {
    if (node.nodeType === Node.TEXT_NODE &&
        node.textContent.includes('Education')) {
      node.textContent = '\n          Education\n        ';
    }
  });

  educationWindow.querySelectorAll('.edu-section').forEach(section => {
    const heading = section.querySelector('.edu-section-title');
    if (heading && heading.textContent.includes('Certifications')) {
      const divider = section.previousElementSibling;
      if (divider && divider.classList.contains('edu-divider')) {
        divider.remove();
      }
      section.remove();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCertificatesApp);
} else {
  setupCertificatesApp();
}

