/*
 * Nyomozós játék – fő logika
 * Sorrend: kikapcsolt monitor -> bejelentkezés -> betöltő -> asztal
 * Adatok: assets/config.yml, assets/desktop.yml, assets/te_login_info.txt
 */
(function () {
  'use strict';

  // ---------- Beállítások ----------
  var CONFIG_PATH = 'assets/config.yml';
  var DESKTOP_PATH = 'assets/desktop.yml';
  var INFO_PATH = 'assets/te_login_info.txt';

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

  // ---------- Adatok betöltése ----------
  // Megjegyzés: a fetch() file:// megnyitásnál a böngészőktől általában hibát kap,
  // ezért a projektet helyi szerveren kell futtatni (lásd docs/DOCS.md).
  function loadText(path) {
    return fetch(path, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error(path + ' – HTTP ' + res.status);
      return res.text();
    });
  }

  var dataPromise = Promise.all([
    loadText(CONFIG_PATH),
    loadText(DESKTOP_PATH),
    loadText(INFO_PATH)
  ]).then(function (parts) {
    return {
      config: parseYaml(parts[0]),
      desktop: parseYaml(parts[1]),
      info: parts[2]
    };
  });
  // Ha valami hibás, a hiba csak a bekapcsolásnál jelenik meg
  dataPromise.catch(function (err) { console.error(err); });

  var data = null;

  // ---------- Képernyőváltás ----------
  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle('active', key === name);
    });
  }

  // ---------- 1. Monitor bekapcsolása ----------
  powerBtn.addEventListener('click', function () {
    offError.textContent = '';
    dataPromise.then(function (loaded) {
      data = loaded;
      showScreen('login');
      passwordInput.focus();
    }, function () {
      offError.textContent = 'Nem sikerült betölteni az assets fájlokat. Helyi szerveren futtasd (lásd docs/DOCS.md).';
    });
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

    var expected = String(data.config.password == null ? '' : data.config.password);
    if (expected === '') {
      loginError.textContent = 'Nincs jelszó beállítva (assets/config.yml, "password:").';
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
  }

  // Ikonok a desktop.yml alapján (x, y: pixel a bal felső sarokhoz)
  function renderDesktopIcons() {
    desktopIcons.textContent = '';
    var icons = data.desktop.icons || [];

    icons.forEach(function (icon) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'icon' + (icon.important === true ? ' important' : '');
      btn.style.left = (Number(icon.x) || 0) + 'px';
      btn.style.top = (Number(icon.y) || 0) + 'px';
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
  }

  // Egyelőre csak konzolba írja a launch értéket
  function launchApp(icon) {
    console.log('[launch] ' + (icon.launch || icon.name || '(nincs launch)'));
  }

  $('#start-btn').addEventListener('click', function () {
    console.log('[start] a start menü még nincs kész');
  });
})();
