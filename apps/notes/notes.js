/*
 * Notes – egyfájlos, csak szöveges jegyzet.
 * A szöveg a böngészőben (localStorage) marad meg, ezen a gépen.
 * Mentés: a Mentés gomb vagy Ctrl+S / Cmd+S.
 */
(function () {
  'use strict';

  var D = GAME_DATA.notes;
  var KEY = 'nyomozo.notes';

  var titleEl = document.getElementById('nt-title');
  var statusEl = document.getElementById('nt-status');
  var saveBtn = document.getElementById('nt-save');
  var text = document.getElementById('nt-text');

  titleEl.textContent = D.title;
  saveBtn.textContent = D.saveLabel;
  text.placeholder = D.placeholder;

  var saved = '';  // az utoljára mentett szöveg

  function setStatus(msg) { statusEl.textContent = msg; }

  function refreshStatus() {
    setStatus(text.value === saved ? D.savedText : D.unsavedText);
  }

  // Betöltés (ha nincs mentett szöveg, üres marad)
  try {
    saved = localStorage.getItem(KEY) || '';
  } catch (e) {
    saved = '';  // a tárolás nem elérhető (pl. privát ablak): csak a munkamenetre megy
  }
  text.value = saved;
  refreshStatus();

  function save() {
    try {
      localStorage.setItem(KEY, text.value);
      saved = text.value;
      refreshStatus();
    } catch (e) {
      setStatus('Nem sikerült menteni.');
    }
  }

  text.addEventListener('input', refreshStatus);
  saveBtn.addEventListener('click', save);

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      save();
    }
  });

  text.focus();
})();
