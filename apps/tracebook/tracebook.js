/*
 * Tracebook – főoldal, keresés, felhasználói profil.
 * Adatok: js/data.js → GAME_DATA.tracebook (users, posts, texts).
 * Bejegyzés nem törölhető. A szövegbe <img src="..."> írható.
 */
(function () {
  'use strict';

  var D = GAME_DATA.tracebook;
  var T = D.texts;
  var mainPosts = D.main_menu_posts || [];  // ezek látszanak a főoldalon

  var form = document.getElementById('tb-search');
  var input = document.getElementById('tb-q');
  var goBtn = document.getElementById('tb-go');
  var clearBtn = document.getElementById('tb-clear');
  var view = document.getElementById('tb-view');
  var toast = document.getElementById('tb-toast');
  var toastTimer = null;

  input.placeholder = T.searchPlaceholder;
  goBtn.textContent = T.searchButton;
  clearBtn.textContent = T.clearSearch;

  // ---------- Segédfüggvények ----------
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function userByUsername(username) {
    return D.users.find(function (u) { return u.username === username; }) || null;
  }

  // Pontos egyezés csak a felhasználónévre (kis/nagybetű nem számít, a @ opcionális).
  // Részleges név vagy a megjelenő név nem talál profilt.
  function userByExactName(term) {
    var t = term.trim().toLowerCase().replace(/^@/, '');
    return D.users.find(function (u) {
      return u.username.toLowerCase() === t;
    }) || null;
  }

  // Legújabb elöl
  function sortedPosts(list) {
    return list.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
  }

  // Egy felhasználó bejegyzései: a főoldali (szerzőre szűrve) + a saját listájából.
  // Azonos id csak egyszer szerepel.
  function postsFor(username) {
    var user = userByUsername(username);
    var own = ((user && user.posts) || []).map(function (p) {
      return Object.assign({ author: username }, p);
    });
    var fromMain = mainPosts.filter(function (p) { return p.author === username; });
    var seen = {};
    var merged = [];
    fromMain.concat(own).forEach(function (p) {
      var key = String(p.id);
      if (!seen[key]) { seen[key] = true; merged.push(p); }
    });
    return sortedPosts(merged);
  }

  // Szöveg: a <img src="..."> részek képként, a többi szövegként jelenik meg
  function renderText(container, text) {
    var re = /<img\s+src="([^"]+)"\s*\/?>/g;
    var last = 0;
    var m;
    while ((m = re.exec(text)) !== null) {
      container.appendChild(document.createTextNode(text.slice(last, m.index)));
      var img = el('img', 'tb-img');
      img.alt = '';
      img.src = m[1];
      container.appendChild(img);
      last = re.lastIndex;
    }
    container.appendChild(document.createTextNode(text.slice(last)));
  }

  // Profilkép: ha nincs vagy nem tölthető be, szürke kör marad
  function avatar(user, big) {
    var wrap = el('div', 'tb-avatar' + (big ? ' big' : ''));
    if (user && user.avatar) {
      var img = el('img');
      img.alt = '';
      img.src = user.avatar;
      img.onerror = function () { img.remove(); };
      wrap.appendChild(img);
    }
    return wrap;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, T.notFoundMs);
  }

  function backButton() {
    var b = el('button', 'tb-back', T.backToMain);
    b.type = 'button';
    b.addEventListener('click', function () { showMain(); });
    return b;
  }

  // ---------- Bejegyzés kártya ----------
  function postCard(p) {
    var card = el('article', 'tb-post');
    var head = el('header', 'tb-post-head');
    var author = userByUsername(p.author);

    head.appendChild(avatar(author, false));
    // A szerző neve nem link: fiókot csak a keresésben lehet megnyitni
    head.appendChild(el('strong', 'tb-author', author ? author.name : p.author));
    head.appendChild(el('time', 'tb-date', p.date));

    var body = el('div', 'tb-post-text');
    renderText(body, p.text);

    card.appendChild(head);
    card.appendChild(body);
    return card;
  }

  function postList(posts, emptyText) {
    var wrap = el('div', 'tb-posts');
    if (posts.length === 0) {
      wrap.appendChild(el('p', 'tb-empty', emptyText));
    }
    posts.forEach(function (p) { wrap.appendChild(postCard(p)); });
    return wrap;
  }

  // ---------- Nézetek ----------
  // A főoldal üres: a bejegyzéseket és a fiókokat csak keresésre lehet megtalálni.
  // (A mainPosts a keresésben él tovább; ha ide kell tartalom, itt lehet megjeleníteni.)
  function showMain() {
    view.textContent = '';
    view.scrollTop = 0;
  }

  function showResults(term, posts) {
    view.textContent = '';
    view.appendChild(backButton());
    view.appendChild(el('h2', 'tb-h', T.searchResultTitle + term));
    view.appendChild(postList(posts, T.noPostsAtAll));
    view.scrollTop = 0;
  }

  function showProfile(username) {
    var user = userByUsername(username);
    if (!user) {
      showMain();
      showToast(T.notFound);
      return;
    }

    view.textContent = '';
    view.appendChild(backButton());

    // Fejléc: profilkép, név, felhasználónév
    var head = el('div', 'tb-profile');
    head.appendChild(avatar(user, true));
    var names = el('div');
    names.appendChild(el('div', 'tb-profile-name', user.name));
    names.appendChild(el('div', 'tb-username', '@' + user.username));
    head.appendChild(names);
    view.appendChild(head);

    // Ismerősök
    view.appendChild(el('h3', 'tb-h', T.profileFriends));
    if (user.friends && user.friends.length) {
      var list = el('ul', 'tb-friends');
      user.friends.forEach(function (fname) {
        var f = userByUsername(fname);
        var li = el('li');
        // Az ismerős neve nem link: a profilt csak keresésre lehet megnyitni
        li.appendChild(el('span', 'tb-friend-name', f ? f.name : fname));
        list.appendChild(li);
      });
      view.appendChild(list);
    } else {
      view.appendChild(el('p', 'tb-empty', T.noFriends));
    }

    // Bejegyzések (a nézet görgethető)
    view.appendChild(el('h3', 'tb-h', T.profilePosts));
    var mine = postsFor(username);
    view.appendChild(postList(mine, T.noPosts));
    view.scrollTop = 0;
  }

  // ---------- Keresés ----------
  function doSearch(term) {
    var t = term.trim();
    clearBtn.hidden = t === '';
    if (t === '') {
      showMain();
      return;
    }

    // Pontos felhasználónév / név: a profilra visz
    var user = userByExactName(t);
    if (user) {
      showProfile(user.username);
      return;
    }

    // Egyébként a bejegyzések szövegében keresünk
    var low = t.toLowerCase();
    var found = sortedPosts(mainPosts.filter(function (p) {
      return p.text.toLowerCase().indexOf(low) !== -1;
    }));
    if (found.length) {
      showResults(t, found);
    } else {
      showMain();
      showToast(T.notFound);
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    doSearch(input.value);
  });

  clearBtn.addEventListener('click', function () {
    input.value = '';
    clearBtn.hidden = true;
    showMain();
    input.focus();
  });

  showMain();
})();
