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
  var loginForm = $('#login-form');
  var passwordInput = $('#password');
  var loginError = $('#login-error');
  var bootLog = $('#boot-log');
  var progressBar = $('#progress-bar');
  var desktopIcons = $('#desktop-icons');
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

  // ---------- Képernyőváltás ----------
  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle('active', key === name);
    });
  }

  // ---------- 1. Monitor bekapcsolása ----------
  powerBtn.addEventListener('click', function () {
    showScreen('login');
    passwordInput.focus();
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

  infoBtn.addEventListener('click', function () {
    var willOpen = infoText.hidden;
    if (willOpen) renderInfo();
    infoText.hidden = !willOpen;
    infoBtn.setAttribute('aria-expanded', String(willOpen));
  });

  // ---------- 3. Bejelentkezés ----------
  function shakeLoginBox() {
    var box = $('.login-box');
    box.classList.remove('shake');
    // reflow, hogy az animáció újra induljon
    void box.offsetWidth;
    box.classList.add('shake');
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    loginError.textContent = '';

    var expected = String(data.config.password || '');
    if (expected === '') {
      loginError.textContent = 'Nincs jelszó beállítva (js/data.js, config.password).';
      return;
    }

    if (passwordInput.value === expected) {
      passwordInput.value = '';
      startBoot();
    } else {
      loginError.textContent = 'Hibás jelszó.';
      shakeLoginBox();
      passwordInput.select();
    }
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
    });
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
