/*
 * Levelezőpartnerek és válaszok.
 *
 * Az Amail (apps/amail/amail.js) "amail:send" üzenetben küldi el a levelet.
 * Itt dől el, mi történik vele:
 *   names   : a Balognak küldött névválasz = a megoldás (Ending mutatja az eredményt)
 *   options : előre megadott kérdésre a megadott válasz érkezik, késleltetve
 *   free    : szabad szöveg, kulcsszó alapján válasz, késleltetve
 * Az amail:status üzenettel visszajelzi az Amailnek, sikerült-e a küldés.
 *
 * Beállítások: js/data.js → GAME_DATA.contacts és GAME_DATA.solution
 */
(function () {
  'use strict';

  var C = GAME_DATA.contacts;
  var S = GAME_DATA.solution;
  var answered = false;   // a megoldás egyszer adható meg

  // Kisbetűs, ékezet nélküli, egyszeres szóközű szöveg (összehasonlításhoz)
  function norm(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, ' ').trim();
  }

  // Címzett keresése név vagy e-mail-cím alapján
  function findPerson(to) {
    var key = norm(to);
    for (var i = 0; i < C.people.length; i++) {
      var p = C.people[i];
      if (norm(p.name) === key || norm(p.address) === key) return p;
    }
    return null;
  }

  // Véletlen válaszidő a beállított tartományból
  function replyDelay() {
    var r = C.replyDelay || [10000, 15000];
    return r[0] + Math.random() * (r[1] - r[0]);
  }

  // Válasz késleltetve: a címzett (a játék szereplője) levelet küld a játékosnak
  function scheduleReply(person, subject, text) {
    setTimeout(function () {
      if (window.sendAmail) {
        sendAmail({ from: person.name + ' <' + person.address + '>', subject: subject, body: text });
      }
    }, replyDelay());
  }

  // Megoldás: a név a listából való; a helyes név "Király vagy!", a rossz a valódi történetet mutatja
  // A nevek vesszővel vagy "és"-sel sorolhatók fel; csak akkor helyes, ha pontosan a helyes nevek vannak benne
  function answerWithName(text) {
    if (answered) return { ok: false, reason: 'Már válaszoltál.' };
    var names = String(text || '').split(/,|\s+és\s+/).map(norm).filter(function (n) { return n; });
    var choices = (S.answerChoices || []).map(norm);
    var valid = names.length > 0 && names.every(function (n) { return choices.indexOf(n) !== -1; });
    if (!valid) return { ok: false, reason: 'Csak nevet válassz a listából.' };

    var picked = names.filter(function (n, i) { return names.indexOf(n) === i; }).sort();
    var want = (S.culprits || []).map(norm).sort();
    answered = true;
    var correct = picked.length === want.length &&
      picked.every(function (n, i) { return n === want[i]; });
    setTimeout(function () {
      if (window.Ending) {
        Ending.show(correct
          ? { title: S.winTitle, text: S.winText, win: true }
          : { title: S.loseTitle, text: S.loseText, win: false });
      }
    }, 1200);
    return { ok: true, reason: 'Elküldve.' };
  }

  // Előre megadott kérdés: a játékos csak a listából választhat
  function answerWithOption(p, id) {
    var opt = (p.options || []).filter(function (o) { return o.id === id; })[0];
    if (!opt) return { ok: false, reason: 'Válassz a listából.' };
    scheduleReply(p, 'Re: ' + opt.subject, opt.reply);
    return { ok: true, reason: 'Elküldve.' };
  }

  // Szabad szöveg: kulcsszó alapján válasz, különben a fallback
  function answerFree(p, mail) {
    var text = norm((mail.subject || '') + ' ' + (mail.body || ''));
    if (!norm(mail.body)) return { ok: false, reason: 'Írj szöveget.' };
    var hit = (p.replies || []).filter(function (r) {
      return (r.match || []).some(function (m) { return text.indexOf(norm(m)) !== -1; });
    })[0];
    scheduleReply(p, 'Re: ' + (mail.subject || ''), hit ? hit.text : C.fallbackReply);
    return { ok: true, reason: 'Elküldve.' };
  }

  // Egy elküldött levél feldolgozása
  function handleSend(mail) {
    var p = findPerson(mail.to);
    if (!p) return { ok: false, reason: C.unknownRecipient };
    if (p.mode === 'names') return answerWithName(mail.body);
    if (p.mode === 'options') return answerWithOption(p, mail.optionId);
    return answerFree(p, mail);
  }

  // Az Amail küldi a levelet; a választ visszaküldjük neki
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'amail:send' || !e.source) return;
    var r = handleSend(e.data.mail || {});
    e.source.postMessage({ type: 'amail:status', ok: r.ok, reason: r.reason }, '*');
  });

  window.Contacts = { findPerson: findPerson };
})();
