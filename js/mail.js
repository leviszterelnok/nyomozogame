/*
 * Levelek és értesítések.
 *
 * sendAmail(mail, opts): a játék ezzel juttat levelet a játékosnak.
 *   mail: { from, to, subject, body, date }  (id és dátum automatikus, ha nincs)
 *   opts (felülírja a data.js amail.notification értékeit):
 *     text:     az értesítés szövege; {from} és {subject} behelyettesíthető
 *     duration: meddig látszik a szöveg (ms)
 *     dot:      legyen-e piros pötty az Amail ikonján
 *     toast:    legyen-e szöveges értesítés a jobb alsó sarokban
 *     notify:   false esetén a levél csak megérkezik, értesítés nincs
 * Példa: sendAmail({ from: "ismeretlen@example.com", subject: "Hello", body: "..." }, { text: "Új üzenet: {subject}" })
 */
(function () {
  'use strict';

  var D = GAME_DATA.amail;
  var NOTE = Object.assign(
    { text: 'Értesítést kaptál az Amailtól', duration: 4000, dot: true, toast: true },
    D.notification || {}
  );

  var inbox = (D.mails || []).slice();  // beérkezett levelek, legújabb elöl
  var nextId = inbox.reduce(function (mx, m) { return Math.max(mx, Number(m.id) || 0); }, 0) + 1;
  var unread = 0;                       // olvasatlan értesítések száma
  var toastTimer = null;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function nowText() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function fill(template, mail) {
    return String(template).replace(/\{(from|subject)\}/g, function (_, k) { return mail[k] || ''; });
  }

  // Piros pötty az Amail ikonján (ha van olvasatlan értesítés)
  function applyDots() {
    var icon = document.querySelector('#desktop-icons .icon[data-launch="amail"]');
    if (icon) icon.classList.toggle('has-notify', unread > 0);
  }

  // Szöveges értesítés a jobb alsó sarokban
  function showToast(text, duration) {
    var screen = document.getElementById('screen-desktop');
    var t = document.getElementById('notify');
    if (!t) {
      t = document.createElement('div');
      t.id = 'notify';
      t.className = 'notify';
      t.setAttribute('role', 'status');
      screen.appendChild(t);
    }
    t.textContent = text;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, duration);
  }

  // Ha az Amail nyitva van, a friss listát átküldjük neki
  function pushToOpenAmail() {
    var win = window.WM && WM.frame('amail');
    if (win) win.postMessage({ type: 'amail:list', mails: inbox }, '*');
  }

  // Az Amail betöltéskor kéri a listát
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'amail:ready' && e.source) {
      e.source.postMessage({ type: 'amail:list', mails: inbox }, '*');
    }
  });

  // Az Amail megnyitásakor az olvasatlanok nullázódnak
  document.addEventListener('wm:open', function (e) {
    if (e.detail && e.detail.appId === 'amail') {
      unread = 0;
      applyDots();
    }
  });

  function sendAmail(mail, opts) {
    var o = Object.assign({}, NOTE, opts || {});
    var m = Object.assign({ to: D.owner || '', subject: '', body: '' }, mail || {});
    m.id = m.id != null ? m.id : nextId++;
    m.date = m.date || nowText();

    inbox.unshift(m);
    pushToOpenAmail();

    if (o.notify === false) return m;
    if (o.dot) {
      unread++;
      applyDots();
    }
    if (o.toast) showToast(fill(o.text, m), o.duration);
    return m;
  }

  window.sendAmail = sendAmail;
  window.Mail = { applyDots: applyDots };
})();
