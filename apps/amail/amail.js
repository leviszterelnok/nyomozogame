/*
 * Amail – levelek listája, szűrés, levél megnyitása, válasz.
 * Adatok: js/data.js → GAME_DATA.amail (mails, outgoing, texts), GAME_DATA.contacts.
 *
 * A küldést a játék dolgozza fel (js/contacts.js): az Amail "amail:send" üzenetet küld,
 * a választ "amail:status" üzenetben kapja vissza. A címzett szerint a válasz
 * szabad szöveg, névválasztó vagy kérdésválasztó (contacts.people[].mode).
 */
(function () {
  'use strict';

  var D = GAME_DATA.amail;
  var T = D.texts;

  var tabInbox = document.getElementById('am-tab-inbox');
  var tabDrafts = document.getElementById('am-tab-drafts');
  var filter = document.getElementById('am-filter');
  var clearBtn = document.getElementById('am-clear');
  var list = document.getElementById('am-list');
  var detail = document.getElementById('am-detail');
  var metaEl = document.getElementById('am-meta');
  var bodyEl = document.getElementById('am-body');
  var backBtn = document.getElementById('am-back');
  var replyBtn = document.getElementById('am-reply');
  var sendDraftBtn = document.getElementById('am-send-draft');
  var compose = document.getElementById('am-compose');
  var toInput = document.getElementById('am-to');
  var subjectInput = document.getElementById('am-subject');
  var textInput = document.getElementById('am-text');
  var statusEl = document.getElementById('am-status');

  // Névválasztó vagy kérdésválasztó (a címzett módjától függ): a szöveg helyett jelenik meg
  var textLabel = textInput.parentNode;
  var pickLabel = document.createElement('label');
  var pickInput = document.createElement('select');
  pickInput.setAttribute('aria-label', 'Válasz');
  pickLabel.appendChild(document.createTextNode('Válasz '));
  pickLabel.appendChild(pickInput);
  pickLabel.hidden = true;
  compose.insertBefore(pickLabel, textLabel);

  var tab = 'inbox';        // 'inbox' | 'drafts'
  var currentDraft = null;  // a megnyitott levél (lista-elem)

  tabInbox.textContent = T.inbox;
  tabDrafts.textContent = T.drafts;
  filter.placeholder = T.searchPlaceholder;
  clearBtn.textContent = '×';
  clearBtn.setAttribute('aria-label', T.clearFilter);
  backBtn.textContent = T.back;
  replyBtn.textContent = T.reply;
  sendDraftBtn.textContent = T.send;
  document.getElementById('am-send').textContent = T.send;

  // ---------- Küldés: a játék dolgozza fel (js/contacts.js) ----------
  // mail: { to, subject, body, optionId }. Az eredményt "amail:status" üzenetben kapjuk vissza.
  function sendMail(mail) {
    window.parent.postMessage({ type: 'amail:send', mail: mail }, '*');
  }

  // ---------- Címzett és beviteli mód ----------
  function norm(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, ' ').trim();
  }

  // A beírt címzett (név vagy cím) alapján a játék szereplője
  function currentPerson() {
    var key = norm(toInput.value);
    var people = GAME_DATA.contacts.people;
    for (var i = 0; i < people.length; i++) {
      if (norm(people[i].name) === key || norm(people[i].address) === key) return people[i];
    }
    return null;
  }

  // A címzett módja szerint: névválasztó, kérdésválasztó vagy szövegdoboz
  function updateCompose() {
    var p = currentPerson();
    var mode = p ? p.mode : 'free';
    pickInput.textContent = '';
    if (mode === 'names') {
      GAME_DATA.solution.answerChoices.forEach(function (n) { pickInput.appendChild(new Option(n, n)); });
    } else if (mode === 'options') {
      p.options.forEach(function (o) { pickInput.appendChild(new Option(o.label, o.id)); });
    }
    var pick = mode === 'names' || mode === 'options';
    pickLabel.hidden = !pick;
    textLabel.hidden = pick;
  }
  toInput.addEventListener('input', updateCompose);

  // ---------- Segédfüggvények ----------
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function currentList() {
    return tab === 'inbox' ? D.mails : D.outgoing;
  }

  // Szűrés: beérkezettnél feladó és tárgy, piszkozatnál címzett és tárgy
  function matches(mail, q) {
    if (!q) return true;
    var fields = tab === 'inbox' ? [mail.from, mail.subject] : [mail.to, mail.subject];
    return fields.some(function (f) { return String(f || '').toLowerCase().indexOf(q) !== -1; });
  }

  // ---------- Lista ----------
  function renderList() {
    var q = filter.value.trim().toLowerCase();
    clearBtn.hidden = filter.value === '';
    list.textContent = '';

    var items = currentList().filter(function (m) { return matches(m, q); });
    if (items.length === 0) {
      list.appendChild(el('p', 'am-empty', T.noMatch));
      return;
    }

    items.forEach(function (m) {
      var row = el('button', 'am-row');
      row.type = 'button';
      if (tab === 'inbox') {
        row.appendChild(el('span', 'am-row-from', m.from));
        row.appendChild(el('span', 'am-row-date', m.date));
      } else {
        row.appendChild(el('span', 'am-row-from', 'Címzett: ' + m.to));
        row.appendChild(el('span', 'am-row-date', 'piszkozat'));
      }
      row.appendChild(el('span', 'am-row-subject', m.subject));
      row.addEventListener('click', function () { showDetail(m); });
      list.appendChild(row);
    });
  }

  function setTab(name) {
    tab = name;
    tabInbox.classList.toggle('active', name === 'inbox');
    tabDrafts.classList.toggle('active', name === 'drafts');
    showList();
  }

  // ---------- Nézetek ----------
  function showList() {
    detail.hidden = true;
    list.hidden = false;
    renderList();
  }

  function showDetail(mail) {
    currentDraft = mail;
    var isDraft = tab === 'drafts';
    list.hidden = true;
    detail.hidden = false;
    compose.hidden = true;
    statusEl.textContent = '';

    replyBtn.hidden = isDraft;
    sendDraftBtn.hidden = !isDraft;

    metaEl.textContent = '';
    metaEl.appendChild(metaRow('Feladó', mail.from || '—'));
    metaEl.appendChild(metaRow('Címzett', mail.to || '—'));
    metaEl.appendChild(metaRow('Tárgy', mail.subject || '—'));
    if (mail.date) metaEl.appendChild(metaRow('Dátum', mail.date));

    bodyEl.textContent = mail.body || '';
  }

  function metaRow(label, value) {
    var row = el('div');
    row.appendChild(el('span', 'am-label', label + ': '));
    row.appendChild(document.createTextNode(value));
    return row;
  }

  // Válasz: a feladó lesz a címzett, a tárgy elé "Re:" kerül (ha még nincs)
  function openReply() {
    if (!currentDraft) return;
    var subj = currentDraft.subject || '';
    // A feladó neve (cím nélkül) lesz a címzett, így a játék is felismeri
    toInput.value = (currentDraft.from || '').replace(/\s*<[^>]*>\s*$/, '');
    subjectInput.value = /^re:/i.test(subj) ? subj : 'Re: ' + subj;
    textInput.value = '';
    compose.hidden = false;
    statusEl.textContent = '';
    updateCompose();
    if (!textLabel.hidden) textInput.focus();
    else pickInput.focus();
  }

  // ---------- Események ----------
  tabInbox.addEventListener('click', function () { setTab('inbox'); });
  tabDrafts.addEventListener('click', function () { setTab('drafts'); });

  filter.addEventListener('input', renderList);
  clearBtn.addEventListener('click', function () {
    filter.value = '';
    renderList();
    filter.focus();
  });

  backBtn.addEventListener('click', function () { showList(); });
  replyBtn.addEventListener('click', openReply);

  sendDraftBtn.addEventListener('click', function () {
    if (!currentDraft) return;
    sendMail({ to: currentDraft.to, subject: currentDraft.subject, body: currentDraft.body });
  });

  compose.addEventListener('submit', function (e) {
    e.preventDefault();
    var p = currentPerson();
    var pick = p && (p.mode === 'names' || p.mode === 'options');
    sendMail({
      to: toInput.value.trim(),
      subject: subjectInput.value.trim(),
      // Névválasztónál a név, kérdésválasztónál a kérdés szövege megy el
      body: pick ? pickInput.options[pickInput.selectedIndex].text : textInput.value,
      optionId: p && p.mode === 'options' ? pickInput.value : undefined
    });
  });

  // A játéktól jön: a levelek listája (amail:list) és a küldés eredménye (amail:status)
  window.addEventListener('message', function (e) {
    if (e.source !== window.parent || !e.data) return;
    if (e.data.type === 'amail:list') {
      D.mails = e.data.mails || [];
      renderList();
    }
    if (e.data.type === 'amail:status') {
      statusEl.textContent = e.data.ok ? 'Elküldve.' : (e.data.reason || T.sendStub);
      if (e.data.ok && !textLabel.hidden) textInput.value = '';
    }
  });

  // Betöltéskor kérjük a levelek listáját a játéktól
  window.parent.postMessage({ type: 'amail:ready' }, '*');

  showList();
})();
