/*
 * Ablakkezelő (floating WM).
 * - Ablakok csak az asztal területén belül mozgathatók és méretezhetők.
 * - Egy appból egyszerre csak 1 ablak lehet (újra megnyitáskor a meglévő kerül előtérbe).
 * - Az appok ablaka egy iframe, az app saját HTML/CSS/JS fájljaival (apps/<név>/).
 * Használat: WM.open('tracebook')
 */
(function () {
  'use strict';

  var TASKBAR_H = 40;  // a tálca magassága (css/style.css: .taskbar height)
  var MIN_W = 240;
  var MIN_H = 160;

  var desktop = document.getElementById('screen-desktop');
  var layer = document.getElementById('windows');
  var tasks = document.getElementById('taskbar-tasks');

  var windows = {};     // appId -> { el, btn, g: {x, y, w, h} }
  var zTop = 10;
  var openCount = 0;    // a kaszkádos elhelyezéshez

  // Az asztal használható területe (a tálca nélkül)
  function bounds() {
    return { w: desktop.clientWidth, h: desktop.clientHeight - TASKBAR_H };
  }

  // Méret és pozíció visszafogása az asztal területére
  function clamp(g) {
    var b = bounds();
    if (b.w <= 0 || b.h <= 0) return;
    g.w = Math.min(Math.max(g.w, MIN_W), b.w);
    g.h = Math.min(Math.max(g.h, MIN_H), b.h);
    g.x = Math.max(0, Math.min(g.x, b.w - g.w));
    g.y = Math.max(0, Math.min(g.y, b.h - g.h));
  }

  function applyGeom(appId) {
    var w = windows[appId];
    w.el.style.left = w.g.x + 'px';
    w.el.style.top = w.g.y + 'px';
    w.el.style.width = w.g.w + 'px';
    w.el.style.height = w.g.h + 'px';
  }

  function focus(appId) {
    var w = windows[appId];
    if (!w) return;
    zTop++;
    w.el.style.zIndex = zTop;
    Object.keys(windows).forEach(function (id) {
      var on = id === appId;
      windows[id].el.classList.toggle('focused', on);
      windows[id].btn.classList.toggle('active', on);
    });
  }

  function closeApp(appId) {
    var w = windows[appId];
    if (!w) return;
    w.el.remove();
    w.btn.remove();
    delete windows[appId];
  }

  // Mozgatás a fejléc húzásával
  function startDrag(appId, e) {
    e.preventDefault();
    var w = windows[appId];
    var sx = e.clientX, sy = e.clientY, ox = w.g.x, oy = w.g.y;
    layer.classList.add('dragging');

    function move(ev) {
      w.g.x = ox + ev.clientX - sx;
      w.g.y = oy + ev.clientY - sy;
      clamp(w.g);
      applyGeom(appId);
    }
    function up() {
      layer.classList.remove('dragging');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  // Átméretezés a jobb alsó sarokból
  function startResize(appId, e) {
    e.preventDefault();
    e.stopPropagation();
    var w = windows[appId];
    var sx = e.clientX, sy = e.clientY, ow = w.g.w, oh = w.g.h;
    layer.classList.add('dragging');

    function move(ev) {
      w.g.w = ow + ev.clientX - sx;
      w.g.h = oh + ev.clientY - sy;
      clamp(w.g);
      applyGeom(appId);
    }
    function up() {
      layer.classList.remove('dragging');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  // App megnyitása: egy appból csak egy ablak lehet
  function open(appId) {
    // Értesítés a többi modulnak (pl. mail.js: az Amail megnyitásakor nullázza a pöttyöt)
    document.dispatchEvent(new CustomEvent('wm:open', { detail: { appId: appId } }));

    var apps = (window.GAME_DATA && GAME_DATA.apps) || {};
    var app = apps[appId];
    if (!app) {
      console.log('[launch] ismeretlen app: ' + appId);
      return;
    }
    if (windows[appId]) {
      focus(appId);
      return;
    }

    openCount++;
    var g = { w: Number(app.width) || 520, h: Number(app.height) || 360 };
    g.x = 30 + (openCount % 6) * 28;
    g.y = 20 + (openCount % 6) * 24;
    clamp(g);

    // Ablak felépítése
    var el = document.createElement('div');
    el.className = 'win';

    var head = document.createElement('div');
    head.className = 'win-title';
    var name = document.createElement('span');
    name.className = 'win-name';
    name.textContent = app.title || appId;
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'win-close';
    close.setAttribute('aria-label', 'Bezárás');
    close.textContent = '×';
    head.appendChild(name);
    head.appendChild(close);

    var frame = document.createElement('iframe');
    frame.className = 'win-body';
    frame.title = app.title || appId;
    // Nincs sandbox: a sandbox opaque origint ad, és a file:// megnyitásnál
    // a CSS/JS betöltését blokkolná. Az appok saját kódunk.
    frame.src = app.src;

    var grip = document.createElement('div');
    grip.className = 'win-grip';

    el.appendChild(head);
    el.appendChild(frame);
    el.appendChild(grip);
    layer.appendChild(el);

    // Tálca gomb
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'task-btn';
    btn.textContent = app.title || appId;
    tasks.appendChild(btn);

    windows[appId] = { el: el, btn: btn, g: g };
    applyGeom(appId);
    focus(appId);

    btn.addEventListener('click', function () { focus(appId); });
    close.addEventListener('click', function (e) { e.stopPropagation(); closeApp(appId); });
    head.addEventListener('pointerdown', function (e) {
      if (e.target === close) return;
      focus(appId);
      startDrag(appId, e);
    });
    grip.addEventListener('pointerdown', function (e) {
      focus(appId);
      startResize(appId, e);
    });
    el.addEventListener('pointerdown', function () { focus(appId); });
  }

  // Ablakméret változásakor visszafogjuk az ablakokat az asztalra
  window.addEventListener('resize', function () {
    Object.keys(windows).forEach(function (id) {
      clamp(windows[id].g);
      applyGeom(id);
    });
  });

  window.WM = {
    open: open,
    close: closeApp,
    // Az app ablakában lévő iframe ablaka (ha nyitva van), különben null
    frame: function (appId) {
      var w = windows[appId];
      var f = w && w.el.querySelector('iframe');
      return f ? f.contentWindow : null;
    }
  };
})();
