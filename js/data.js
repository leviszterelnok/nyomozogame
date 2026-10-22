/*
 * Játék adatai – ezt a fájlt szerkeszd, nem kell fetch vagy szerver.
 * (Korábbi assets/*.yml és *.txt fájlok tartalma ide került.)
 */
var GAME_DATA = {

  // Jelszó a bejelentkezéshez
  // FIGYELEM: a böngészőből olvasható, ez iskolai játékhoz elég, biztonságnak nem.
  config: {
    password: "197009",

    // Képek. A monitor-kép mindig látszik az ablakban, a többi kép a kijelzőn belül jelenik meg.
    images: {
      backdrop: "assets/szamitogep.png",   // számítógép / monitor kép (teljes ablak)
      avatar: "assets/nyomozo_fej.png"     // profilkép a bejelentkezésnél
    },

    // Játéktér területe: honnan (x1, y1) hová (x2, y2) tart a képernyő.
    // Számok = a böngészőablak %-a (pl. 10 = 10%). "120px" alakú szöveg = pixel.
    // Alapértelmezés: a teljes ablak (0,0 -> 100,100).
    // background: a kijelző háttere: szín (pl. "#000") vagy kép (pl. "assets/hatter.png").
    area: { x1: 17.2, y1: 6.4, x2: 83.8, y2: 75.0, background: "#000" },

    // Hörcsög a ketrecben (3D monitor főoldal, tools nélkül): hoverre ezt a nevet írja ki.
    hamster: { name: "Gombóc" },

    // Bekapcsoló gomb: a közepe (x, y) az ablak %-ában (vagy "px"), size: átmérő pixelben.
    // A monitor-kép alján kell lennie, ehhez igazítsd.
    powerButton: { x: 50.1, y: 81.4, size: 48 }

  },

  // Info gomb szövege a profilkép mellett.
  // A <h>…</h> közé írt rész kiemelve jelenik meg.
  info:
    "<h>Beke Imre — Magánnyomozó</h>\n" +
    "Beke Imre <h>1970. szeptember</h> 28-án született, és tíz év technikai rendőri munka után nyitotta meg saját, padlástéri magánnyomozói irodáját — ahol egyetlen állandó társa <h>Gombóc</h>, a hörcsöge. Pályafutása során a Kibervédelmi Osztályon szerzett tapasztalatával a legösszetettebb digitális és vállalati ügyekre szakosodott, hírnevét pedig borotvaéles logikájának és a számítógépes rendszerek rejtett kiskapuinak köszönheti: ő derítette fel a Kékkúti Bank belső adócsalási rendszerét a régi tesztfájlok elemzésével, ő leplezte le a magángyűjteményből eltűnt festmény ügyében a manipulatív videófelvétellel trükköző biztonsági őrt, és ő azonosította a Belvárosi Zsarolási Ügyben a vállalati adatokat kiszivárogtató tettest is. Szaktudásának és diszkréciójának köszönhetően a legbonyolultabb, nagy téttel bíró rejtélyek elismert szakértőjévé vált.",

  // Asztali ikonok
  // A sorrend határozza meg a rácson az elhelyezést (felülről lefelé, oszloponként).
  // important : true -> sárga keret az ikonon, false -> nincs keret (szürke kijelölés)
  // appicon   : az ikon képe (assets/ alatt). Ha hiányzik, szürke alap látszik.
  // launch    : az app azonosítója. Jelenleg csak a konzolba íródik.
  desktop: {
    // Asztal háttere: szín (pl. "#008080") vagy kép (pl. "assets/hatter.png")
    background: "#008080",
    // Asztal mérete: width, height. Szám = a kijelző %-a, "640px" alakú szöveg = pixel.
    // Az asztal a kijelző közepére kerül.
    width: "100%",
    height: "100%",
    // Rács: hány oszlop (cols) és sor (rows) fér az asztalra. Az ikonok mérete ebből adódik,
    // nem nyúlnak, és a rácson kívülre eső ikon rejtve marad.
    cols: 9,
    rows: 6,
    // x, y (nem kötelező): az ikon rácsmezője, 0-tól számolva (x = oszlop, y = sor).
    // Ha nincs megadva, az ikon a sorrend szerint kerül a következő szabad helyre.
    icons: [
      { name: "Tracebook", important: true,  appicon: "assets/tracebook.png", launch: "tracebook", x: 0, y: 0 },
      { name: "Notes",     important: true,  appicon: "assets/notes.png",     launch: "notes",     x: 0, y: 1 },
      { name: "Amail",     important: true,  appicon: "assets/amail.png",     launch: "amail",     x: 0, y: 2 },
      { name: "Trash",     important: false, appicon: "assets/trash.png",     launch: "nothing",   x: 0, y: 3 },

      { name: "CraftMine",     important: false, appicon: "assets/craftmine.png",     launch: "nothing",   x: 8, y: 0 }
    ]
  },

  // Appok ablakai. src: az app HTML-je (apps/<név>/index.html).
  // width, height: kezdeti méret pixelben. Egy appból egyszerre csak 1 ablak lehet.
  apps: {
    tracebook: { title: "Tracebook", src: "apps/tracebook/index.html", width: 640, height: 440 },
    amail:     { title: "Amail",     src: "apps/amail/index.html",     width: 640, height: 440 },
    notes:     { title: "Notes",     src: "apps/notes/index.html",     width: 480, height: 360 }
  },

  // ---------- Tracebook ----------
  tracebook: {
    texts: {
      searchPlaceholder: "Keresés (felhasználónév vagy név)…",
      searchButton: "Keresés",
      clearSearch: "×",
      mainTitle: "Főoldal",
      searchResultTitle: "Találatok erre: ",
      backToMain: "← Főoldal",
      profileFriends: "Ismerősök",
      profilePosts: "Bejegyzések",
      noFriends: "Nincs még ismerős.",
      noPosts: "Ettől a felhasználótól még nincs bejegyzés.",
      noPostsAtAll: "Még nincs bejegyzés.",
      notFound: "Nem találtuk meg azt a felhasználót",
      notFoundMs: 3000
    },
    // Felhasználók. avatar: profilkép (assets/ alatt), friends: a felhasználónevek.
    // posts (nem kötelező): a felhasználó saját bejegyzései. Ezek csak a profilján látszanak,
    // a főoldalon nem, csak akkor, ha rákeresel a felhasználóra. A szerző automatikusan ő lesz.
    users: [
      { username: "kovacs_anna", name: "Kovács Anna", avatar: "assets/profil_anna.png", friends: ["szabo_bence", "nagy_lili"] },
      { username: "szabo_bence", name: "Szabó Bence", avatar: "assets/profil_bence.png", friends: ["kovacs_anna"] },
      { username: "nagy_lili",   name: "Nagy Lili",   avatar: "",                        friends: ["kovacs_anna", "szabo_bence"],
        posts: [
          { id: 101, date: "2026-10-21 10:00", text: "Ez a bejegyzés csak Lili profilján látszik, a főoldalon nem." }
        ] }
    ],
    // Főoldali bejegyzések: mindig ezek látszanak a főoldalon. A szövegbe <img src="assets/kep.png"> is írható.
    // Bejegyzés nem törölhető. A szerző profilján is megjelennek.
    main_menu_posts: [
      { id: 1, author: "kovacs_anna", date: "2026-10-19 18:02",
        text: "Új kedvenc kávézó a belvárosban! <img src=\"assets/kep_kave.png\"> Ha valaki arra jár, szóljon." },
      { id: 2, author: "szabo_bence", date: "2026-10-20 09:15",
        text: "Ma reggel 6:30-kor futottam. A telefonom a térképen is elmentette az útvonalat, pedig nem kértem." },
      { id: 3, author: "nagy_lili", date: "2026-10-20 21:40",
        text: "Gondolkodjatok el, mielőtt kiposztoltok egy képet: a fotón látszik a házszám vagy a rendszám is?" }
    ]
  },

  // ---------- Amail ----------
  amail: {
    texts: {
      searchPlaceholder: "Szűrés feladóra vagy tárgyra…",
      clearFilter: "Szűrő törlése",
      noMatch: "Nincs találat.",
      back: "← Vissza",
      reply: "Válasz",
      send: "Küldés",
      drafts: "Piszkozatok",
      inbox: "Beérkezett",
      sendStub: "A küldés még nincs bekötve."
    },
    // A játékos saját címe (sendAmail alapértelmezett címzettje)
    owner: "te@example.com",
    // Értesítés új levélnél (sendAmail felülírhatja): {from}, {subject} behelyettesíthető
    notification: { text: "Értesítést kaptál az Amailtól", duration: 4000, dot: true, toast: true },

    // Beérkezett levelek
    mails: [
      { id: 1, from: "info@suli-portal.example", to: "te@example.com", subject: "Jelszó-visszaállítás kérése", date: "2026-10-21 07:10",
        body: "Valaki jelszó-visszaállítást kért a fiókodhoz.\nHa nem te voltál, ne kattints semmilyen linkre, és változtasd meg a jelszavadat." },
      { id: 2, from: "kovacs_anna@example.com", to: "te@example.com", subject: "Holnapi találkozó", date: "2026-10-20 16:30",
        body: "Szia! Holnap 17:00 jó neked a könyvtár előtt?" }
    ],
    // Előre megadott levelek, amiket később lehet küldeni (sendMail)
    outgoing: [
      { id: "o1", to: "kovacs_anna@example.com", subject: "Köszönöm", body: "Köszi a segítséget, holnap találkozunk." }
    ]
  },

  // ---------- Notes ----------
  notes: {
    title: "jegyzet.txt",
    placeholder: "Írj ide valamit…",
    saveLabel: "Mentés",
    savedText: "Mentve",
    unsavedText: "Nincs mentve"
  },

  // Játék menete (js/game_logic.js)
  game: {
    // Az asztal megjelenése után ennyi ms múlva érkezik az első levél
    introMailDelay: 30000,
    introMail: {
      from: "info@suli-portal.example",
      subject: "Üdvözlünk az Amailben",
      body: "Szia!\n\nEz az első levél a rendszerből. Nézz körül nyugodtan a gépen.\n\nÜdv,\nAz ügyeletes"
    }
  }
};
