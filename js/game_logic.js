/*
 * Játéklogika: a játék haladása és az eseménysor.
 *
 * Game.start(): az asztal megjelenésekor hívódik (js/app.js).
 * Az eseményeket időzítve futtatja (pl. az első levél 30 mp múlva).
 * A haladás (flags) a játékos állapotát tárolja: később ezekre épülnek a feladatok.
 *
 * Beállítások: js/data.js → GAME_DATA.game
 */
var Game = (function () {
  'use strict';

  var CFG = GAME_DATA.game || {};

  var started = false;
  var timers = [];
  var flags = {};   // haladás: pl. flags.introMailSent = true

  // Időzített esemény; a timer azonosítóit eltároljuk, hogy később törölhetők legyenek
  function after(ms, fn) {
    var id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  function setFlag(name, value) {
    flags[name] = value === undefined ? true : value;
  }

  function hasFlag(name) {
    return !!flags[name];
  }

  // Az első levél: 30 mp az asztal megjelenése után
  function sendIntroMail() {
    if (hasFlag('introMailSent') || !CFG.introMail) return;
    setFlag('introMailSent');
    if (window.sendAmail) sendAmail(CFG.introMail);
  }

  // Egyszer indul el, újrahívás nem csinál semmit
  function start() {
    if (started) return;
    started = true;
    after(CFG.introMailDelay != null ? CFG.introMailDelay : 30000, sendIntroMail);

    // Későbbi levelek (game.scheduledMails): a megadott idő után érkeznek
    (CFG.scheduledMails || []).forEach(function (s) {
      after(s.delay || 0, function () {
        if (window.sendAmail) sendAmail(s.mail);
      });
    });
  }

  // Minden időzítés leállítása (pl. új játék indításakor)
  function stop() {
    timers.forEach(clearTimeout);
    timers = [];
    started = false;
  }

  return {
    start: start,
    stop: stop,
    setFlag: setFlag,
    hasFlag: hasFlag
  };
})();
