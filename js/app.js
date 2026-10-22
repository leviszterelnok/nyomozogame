/*
 * Nyomozós játék – fő logika
 * Sorrend: kikapcsolt monitor -> bejelentkezés -> betöltő -> asztal
 * Adatok: js/data.js (GAME_DATA). Nincs fetch, így dupla kattintással is fut.
 */
(function () {
  'use strict';

  // ---------- Beállítások ----------
  // A betöltő képernyő sorai (2003-as hangulat)
  var BOOT_LINES = [
    'AjtOS betöltése...',
    'Memória ellenőrzése... 640K OK',
    'Merevlemez keresése... C: OK',
    'Hálózati kártya... nincs',
    'Felhasználói profil betöltése...',
    'Asztal előkészítése...'
  ];
  var BOOT_STEP_MS = 350;      // egy sor megjelenési ideje
  var BOOT_END_DELAY_MS = 700; // a 100% után ennyit várunk az asztalig

  // ---------- DOM elemek ----------
  var $ = function (sel) { return document.querySelector(sel); };

  var screens = {
    off: $('#screen-off'),
    login: $('#screen-login'),
    boot: $('#screen-boot'),
    desktop: $('#screen-desktop')
  };
  var powerBtn = $('#power-btn');
  var offError = $('#off-error');
  var infoBtn = $('#info-btn');
  var infoText = $('#info-text');
  var infoPopup = $('#info-popup');
  var infoClose = $('#info-close');
  var loginForm = $('#login-form');
  var passwordInput = $('#password');
  var loginError = $('#login-error');
  var bootLog = $('#boot-log');
  var progressBar = $('#progress-bar');
  var desktopIcons = $('#desktop-icons');
  var iconEls = [];   // az asztali ikonok (gomb, kép-keret, adat) a rácsos elrendezéshez
  var desktopScreen = $('#screen-desktop');

  // ---------- Adatok (js/data.js) ----------
  // A GAME_DATA objektumot a data.js tölti be, nincs fetch.
  var data = GAME_DATA;

  // ---------- Játéktér területe (config.area) ----------
  // Szám = % (pl. 10), "px"-es szöveg = pixel (pl. "120px"). Mindkét érték keverhető.
  function toCssUnit(v) {
    return (typeof v === 'string' && /px$/.test(v)) ? v : (Number(v) || 0) + '%';
  }

  function applyArea() {
    var a = (data.config && data.config.area) || { x1: 0, y1: 0, x2: 100, y2: 100 };
    var stage = $('#stage');
    // A sarkok fordítva is megadhatók (pl. x1 > x2): min/max rendezi a két értéket
    var l = 'min(' + toCssUnit(a.x1) + ', ' + toCssUnit(a.x2) + ')';
    var r = 'max(' + toCssUnit(a.x1) + ', ' + toCssUnit(a.x2) + ')';
    var t = 'min(' + toCssUnit(a.y1) + ', ' + toCssUnit(a.y2) + ')';
    var b = 'max(' + toCssUnit(a.y1) + ', ' + toCssUnit(a.y2) + ')';
    stage.style.left = l;
    stage.style.top = t;
    stage.style.width = 'calc(' + r + ' - ' + l + ')';
    stage.style.height = 'calc(' + b + ' - ' + t + ')';

    // Kijelző háttere: szín vagy kép (képnél a fájl neve .png/.jpg/... végű)
    var bg = a.background || '#000';
    stage.style.background = /\.(png|jpe?g|gif|webp)$/i.test(bg)
      ? 'url("' + bg + '") center / cover no-repeat'
      : bg;
  }

  // Bekapcsoló gomb helye és mérete (config.powerButton). A megadott pont a gomb közepe.
  function applyPowerButton() {
    var pb = (data.config && data.config.powerButton) || { x: 50, y: 80, size: 48 };
    var size = Number(pb.size) || 48;
    powerBtn.style.width = size + 'px';
    powerBtn.style.height = size + 'px';
    powerBtn.style.left = toCssUnit(pb.x);
    powerBtn.style.top = toCssUnit(pb.y);
  }

  // Monitor-kép és profilkép a data.js-ből
  function applyImages() {
    var imgs = (data.config && data.config.images) || {};
    // A keret a monitor-kép arányát veszi fel, így a % értékek a képhez igazodnak
    var frame = $('#frame');
    var back = $('#backdrop');
    back.onload = function () {
      if (back.naturalWidth && back.naturalHeight) {
        frame.style.setProperty('--ar', back.naturalWidth / back.naturalHeight);
      }
    };
    if (imgs.backdrop) back.src = imgs.backdrop;
    if (imgs.avatar) $('#avatar').src = imgs.avatar;
  }

  applyArea();
  applyImages();
  applyPowerButton();
  applyDesktopBackground();
  applyDesktopSize();

  // ---------- Képernyőváltás ----------
  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle('active', key === name);
    });
    if (name === 'desktop') layoutDesktop();
  }

  // ---------- 1. Monitor bekapcsolása ----------
  powerBtn.addEventListener('click', function () {
    showScreen('login');
    passwordInput.focus();
  });

  // ---------- Beágyazott mód (?embed=1): a 3D monitor (tools/3d-monitor) képernyőjeként ----------
  // Ilyenkor nincs háttérkép és saját gomb; a 3D monitor a 'power' üzenettel kéri a bekapcsolást.
  if (/[?&]embed=1/.test(location.search)) {
    document.body.classList.add('embed');
  }
  window.addEventListener('message', function (e) {
    if (e.data === 'power') powerBtn.click();
  });

  // ---------- 2. Info gomb (<h>…</h> részek kiemelése) ----------
  function renderInfo() {
    var text = data.info || '';
    var re = /<h>([\s\S]*?)<\/h>/g;
    var last = 0;
    var match;

    infoText.textContent = '';
    while ((match = re.exec(text)) !== null) {
      infoText.appendChild(document.createTextNode(text.slice(last, match.index)));
      var mark = document.createElement('mark');
      mark.textContent = match[1];
      infoText.appendChild(mark);
      last = re.lastIndex;
    }
    infoText.appendChild(document.createTextNode(text.slice(last)));
  }

  // Info popup: az info gombból nyílik; bezárható az × gombbal, a doboz mellé kattintva vagy Esc-kel
  function setInfoOpen(open) {
    if (open) renderInfo();
    infoPopup.hidden = !open;
    infoBtn.setAttribute('aria-expanded', String(open));
    if (open) infoText.focus();
  }
  infoBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setInfoOpen(infoPopup.hidden);
  });
  infoClose.addEventListener('click', function () { setInfoOpen(false); });
  document.addEventListener('click', function (e) {
    if (!infoPopup.hidden && !infoPopup.contains(e.target)) setInfoOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !infoPopup.hidden) setInfoOpen(false);
  });

  // ---------- 3. Bejelentkezés ----------
  function shakeLoginBox() {
    var box = $('.login-box');
    box.classList.remove('shake');
    // reflow, hogy az animáció újra induljon
    void box.offsetWidth;
    box.classList.add('shake');
  }

  // Bejelentkezés: nem űrlapküldéssel, hanem gombbal és Enterrel (így a böngésző
  // jelszókezelője nem kezeli a belépést mentendő űrlapként)
  // A jelszó a szövegmezőben pontokkal látszik; a valódi értéket a secret tárolja
  // (a böngésző így nem kezeli jelszóként, nincs jelszókezelő popup).
  var secret = '';
  function renderSecret() {
    passwordInput.value = new Array(secret.length + 1).join('•');
  }

  function tryLogin() {
    loginError.textContent = '';

    var expected = String(data.config.password || '');
    if (expected === '') {
      loginError.textContent = 'Nincs jelszó beállítva (js/data.js, config.password).';
      return;
    }

    if (secret === expected) {
      secret = '';
      renderSecret();
      startBoot();
    } else {
      secret = '';
      renderSecret();
      loginError.textContent = 'Hibás jelszó.';
      shakeLoginBox();
    }
  }
  $('#login-btn').addEventListener('click', tryLogin);

  passwordInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      tryLogin();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      secret = secret.slice(0, -1);
      renderSecret();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      secret += e.key;
      renderSecret();
    }
  });
  passwordInput.addEventListener('paste', function (e) {
    e.preventDefault();
    var text = (e.clipboardData || window.clipboardData).getData('text');
    secret += text;
    renderSecret();
  });

  // ---------- 4. Betöltő ----------
  function startBoot() {
    showScreen('boot');
    bootLog.textContent = '';
    progressBar.style.width = '0%';

    var i = 0;
    var timer = setInterval(function () {
      bootLog.textContent += BOOT_LINES[i] + '\n';
      i++;
      progressBar.style.width = Math.round((i / BOOT_LINES.length) * 100) + '%';
      if (i >= BOOT_LINES.length) {
        clearInterval(timer);
        setTimeout(openDesktop, BOOT_END_DELAY_MS);
      }
    }, BOOT_STEP_MS);
  }

  // ---------- 5. Asztal ----------
  function openDesktop() {
    renderDesktopIcons();
    showScreen('desktop');
    if (window.Game) Game.start();   // a játék eseményei az asztal megjelenésétől
  }

  // Ikonok a data.js desktop.icons listája alapján, rácson (a sorrend számít)
  function renderDesktopIcons() {
    desktopIcons.textContent = '';
    iconEls.length = 0;
    var icons = data.desktop.icons || [];

    icons.forEach(function (icon) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'icon' + (icon.important === true ? ' important' : '');
      btn.setAttribute('data-launch', icon.launch || '');
      btn.title = icon.name || '';


      // Kép: ha nincs vagy nem tölthető be, a szürke alap marad
      var wrap = document.createElement('span');
      wrap.className = 'icon-img';
      if (icon.appicon) {
        var img = document.createElement('img');
        img.alt = '';
        img.src = icon.appicon;
        img.onerror = function () { img.remove(); };
        wrap.appendChild(img);
      }
      btn.appendChild(wrap);

      var label = document.createElement('span');
      label.className = 'icon-label';
      label.textContent = icon.name || '';
      btn.appendChild(label);

      btn.addEventListener('click', function () { launchApp(icon); });
      desktopIcons.appendChild(btn);
      iconEls.push({ btn: btn, wrap: wrap, icon: icon });
    });
    layoutDesktop();
    if (window.Mail) Mail.applyDots();
  }

  // Appot indít: ablakot nyit (js/wm.js). A launch az app azonosítója (data.js apps).
  function launchApp(icon) {
    if (window.WM && icon.launch) {
      WM.open(icon.launch);
    } else {
      console.log('[launch] ' + (icon.launch || icon.name || '(nincs launch)'));
    }
  }

  // Asztal mérete (desktop.width, desktop.height): szám = %, "px" végű szöveg = pixel.
  // Az asztal a kijelző közepére kerül.
  // Asztali rács (data.js desktop.cols x desktop.rows): a cellák az asztal méretéből adódnak.
  // Az ikon mérete a cellából jön (nem nyúlik), és csak a rácson belülre kerülhet.
  function layoutDesktop() {
    var d = data.desktop || {};
    var cols = Math.max(1, parseInt(d.cols, 10) || 9);
    var rows = Math.max(1, parseInt(d.rows, 10) || 6);
    var GAP = 4, PAD = 8;   // a CSS-ben: .desktop-icons padding 8px
    var W = desktopIcons.clientWidth - PAD * 2;
    var H = desktopIcons.clientHeight - PAD * 2;
    if (W <= 0 || H <= 0) return;   // az asztal még nem látszik

    var cellW = Math.floor((W - GAP * (cols - 1)) / cols);
    var cellH = Math.floor((H - GAP * (rows - 1)) / rows);
    // Az ikon a cella kisebbik méretének ~60%-a, a felirat helyével együtt
    var size = Math.max(16, Math.min(Math.floor(cellW * 0.6), cellH - 22));

    desktopIcons.style.gridTemplateColumns = 'repeat(' + cols + ', ' + cellW + 'px)';
    desktopIcons.style.gridTemplateRows = 'repeat(' + rows + ', ' + cellH + 'px)';
    desktopIcons.style.gap = GAP + 'px';

    var taken = {};
    function place(p, c, r) {
      p.btn.style.display = '';
      p.btn.style.gridColumn = String(c + 1);
      p.btn.style.gridRow = String(r + 1);
      p.btn.style.width = cellW + 'px';
      p.btn.style.height = cellH + 'px';
      p.btn.style.overflow = 'hidden';
      p.wrap.style.width = size + 'px';
      p.wrap.style.height = size + 'px';
      taken[c + ',' + r] = true;
    }

    // 1. A megadott x, y pozíciók. Ami a rácson kívül esik, rejtve marad.
    var auto = [];
    iconEls.forEach(function (p) {
      var x = p.icon.x, y = p.icon.y;
      if (typeof x === 'number' && typeof y === 'number') {
        if (x >= 0 && y >= 0 && x < cols && y < rows) {
          place(p, x, y);
        } else {
          p.btn.style.display = 'none';
          console.warn('[asztal] a rácson kívül, kihagyva: ' + (p.icon.name || ''));
        }
      } else {
        auto.push(p);
      }
    });

    // 2. A többi ikon a következő szabad cellába kerül (oszloponként, felülről lefelé)
    auto.forEach(function (p) {
      var spot = null;
      for (var c = 0; c < cols && !spot; c++) {
        for (var r = 0; r < rows && !spot; r++) {
          if (!taken[c + ',' + r]) spot = [c, r];
        }
      }
      if (spot) {
        place(p, spot[0], spot[1]);
      } else {
        p.btn.style.display = 'none';
        console.warn('[asztal] nincs szabad hely, kihagyva: ' + (p.icon.name || ''));
      }
    });
  }

  window.addEventListener('resize', function () {
    if (screens.desktop.classList.contains('active')) layoutDesktop();
  });

  function applyDesktopSize() {
    var d = data.desktop || {};
    var cssSize = function (v) {
      if (typeof v === 'string' && /(px|%)$/.test(v)) return v;
      if (typeof v === 'number') return v + '%';
      return '100%';
    };
    desktopScreen.style.left = '50%';
    desktopScreen.style.top = '50%';
    desktopScreen.style.right = 'auto';
    desktopScreen.style.bottom = 'auto';
    desktopScreen.style.transform = 'translate(-50%, -50%)';
    desktopScreen.style.width = cssSize(d.width);
    desktopScreen.style.height = cssSize(d.height);
  }

  // Asztal háttere (desktop.background): szín vagy kép
  function applyDesktopBackground() {
    var bg = (data.desktop && data.desktop.background) || '#008080';
    desktopScreen.style.background = /\.(png|jpe?g|gif|webp)$/i.test(bg)
      ? 'url("' + bg + '") center / cover no-repeat'
      : bg;
  }

  $('#start-btn').addEventListener('click', function () {
    console.log('[start] a start menü még nincs kész');
  });
})();
