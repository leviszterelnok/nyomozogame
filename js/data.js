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
    // Ikonok látható része: a képek üres szélét a játék levágja, így az ikon kitölti a helyét.
    // Kulcs: az ikon képe (appicon). box: [x1, y1, x2, y2] a látható rész pixelben; size: a kép mérete.
    imageTrim: {
      "assets/tracebook.png":     { size: [500, 500], box: [129, 120, 371, 379] },
      "assets/notes.png":         { size: [500, 500], box: [65, 62, 435, 438] },
      "assets/amail.png":         { size: [500, 500], box: [13, 11, 487, 486] },
      "assets/trash.png":         { size: [500, 500], box: [129, 121, 371, 427] },
      "assets/craftmine.png":     { size: [676, 369], box: [185, 9, 491, 360] },
      "assets/speedforneed.png":  { size: [676, 369], box: [214, 59, 462, 310] },
      "assets/extreme_mario.png": { size: [676, 369], box: [213, 50, 462, 285] },
      "assets/manhit.png":        { size: [676, 369], box: [191, 33, 485, 339] },
      "assets/csakrajongók.png":  { size: [500, 500], box: [129, 101, 358, 352] },
      "assets/szoveg.png":        { size: [676, 369], box: [281, 76, 400, 237] }
    },
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

      { name: "CraftMine",     important: false, appicon: "assets/craftmine.png",     launch: "nothing",   x: 8, y: 0 },
      { name: "SpeedforNeed",     important: false, appicon: "assets/speedforneed.png",     launch: "nothing",   x: 8, y: 1 },
      { name: "ExtremeMario",     important: false, appicon: "assets/extreme_mario.png",     launch: "nothing",   x: 8, y: 2 },
      { name: "Manhit",     important: false, appicon: "assets/manhit.png",     launch: "nothing",   x: 8, y: 3 },
      { name: "Csakrajongók",     important: false, appicon: "assets/csakrajongók.png",     launch: "nothing",   x: 8, y: 4 },
      { name: "Csalókódok",     important: false, appicon: "assets/szoveg.png",     launch: "nothing",   x: 8, y: 5 }
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
      { username: "balog_tibor", name: "Balog Tibor", avatar: "", friends: ["fazekas_zoltan", "szabo_beatrix", "kovacs_daniel"] },
      { username: "fazekas_zoltan", name: "Fazekas Zoltán", avatar: "", friends: ["horvath_mark", "varga_peter"],
        posts: [
          { id: 201, date: "2026-10-21 01:30", text: "Jó volt a speedforneed Varga Péterrel!" },
          { id: 202, date: "2026-10-21 20:40", text: "Jó volt a tegnapi napom..." },
          { id: 203, date: "2026-10-21 07:05", text: "7:00 kor valamiért törölve lettek a kamerák" }
        ] },
      { username: "szabo_beatrix", name: "Szabó Beatrix", avatar: "", friends: ["notar_marika", "mezei_eva"] },
      { username: "kovacs_daniel", name: "Kovács Dániel", avatar: "", friends: [],
        posts: [
          { id: 401, date: "2026-10-18 12:00", text: "Fő építész vagyok. Az ismerősök nem számítanak." }
        ] },
      { username: "kovacs_rita", name: "Kovács Rita", avatar: "", friends: [] },
      { username: "notar_marika", name: "Nótár Marika", avatar: "", friends: [] },
      { username: "mezei_eva", name: "Mezei Éva", avatar: "", friends: [] },
      { username: "varga_peter", name: "Varga Péter", avatar: "", friends: ["fazekas_zoltan"] },
      { username: "horvath_mark", name: "Horváth Márk", avatar: "", friends: [] }
    ],
    // Főoldali bejegyzések: mindig ezek látszanak a főoldalon. A szövegbe <img src="assets/kep.png"> is írható.
    // Bejegyzés nem törölhető. A szerző profilján is megjelennek.
    main_menu_posts: [
      { id: 801, author: "balog_tibor", date: "2026-10-20 08:00",
        text: "A hónap dolgozója: Kovács Rita. Gratulálunk!" },
      { id: 501, author: "kovacs_rita", date: "2026-10-21 17:30",
        text: "Jó volt a mai @horvath_mark stream" },
      { id: 601, author: "notar_marika", date: "2026-10-21 07:40",
        text: "A mai reggelem... megérkeztem munkába, és már reggel egyből elrontotta a napomat Kovács Rita, ott volt a folyosón." },
      { id: 602, author: "notar_marika", date: "2026-10-21 19:20",
        text: "Folytatom, mert még mindig dühös vagyok. Kovács Rita a folyosón állt, a telefonját nézte, és úgy tett, mintha nem hallaná, hogy köszönök neki. Fazekas Zoltán pont akkor jött ki a szerverszobából, és csak annyit mondott: „Most nem érek rá.” Azóta sem tudom, mit kerestek ott reggel hét körül. A nap további része is ilyen volt: a kávégépben nem volt tej, a közös meghajtón nem találtam azt a táblázatot, amit Mezei Éva kért, és délután még arról is kérdeztek, miért ilyen fáradt a hangom. Ha valakinek van ötlete, mit lehet ilyenkor csinálni, szóljon nyugodtan. Már egy fél napom ráment erre az egészre." },
      { id: 701, author: "mezei_eva", date: "2026-10-18 09:00",
        text: "Álláspozíció-jelentkezések nyíltak cégünkhöz. Akit érdekel, forduljon Mezei Éva irodavezetőhöz." }
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
    mails: [],
    // Piszkozatok (előre megírt, még el nem küldött levelek)
    outgoing: []
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
      from: "Balog Tibor <balog.tibor@apex-epitkezes.example>",
      subject: "Bizalmas: ellopott tervek",
      body: "Üdvözlöm!\n\nTegnap reggel 7 óra körül ellopták az építkezésünk új terveit. A befektetőink már várják ezeket, és ha a hír kiszivárog, visszalépnek. Kérem, egyelőre maradjon ez köztünk.\n\nDerítse ki, ki lopta el a terveket! A nyomozáshoz kezdjen a Tracebookon: az én profilomon (balog_tibor) három ismerősöm látszik, akik a cégnél dolgoznak.\n\nA választ csak névvel fogadom el. Ha többen voltak benne, mindannyiukat nevezze meg.\n\nTisztelettel:\nBalog Tibor\nApex Építkezés"
    },
    // Későbbi levelek, a játék indulásától számolt idő (ms) után. Az Amailben a küldés után is érkezhetnek.
    scheduledMails: [
      { delay: 90000, mail: {
          from: "Szabó Beatrix <szabo.beatrix@apex-epitkezes.example>",
          subject: "Felvétel van",
          body: "Szia! Átnéztem az irodai kamerák mentését. Van egy felvétel a reggeli órákból, amit senki nem nézett meg. Mezei Éva is írt nekem erről:\n\n„Beatrix, nem tudom, mit kérdezett Balog úr, de a 7 órás részt nem érdemes elfelejteni.”\n\nKérdezd meg tőle, mit lát a felvételen.\n\nBeatrix"
      } },
      { delay: 100000, mail: {
          from: "Mezei Éva <mezei.eva@apex-epitkezes.example>",
          subject: "Felvétel",
          body: "Szia! Beatrix szólt, hogy van felvétel. Ha kérdezel tőlem valamit, válaszolj erre a levélre, és válassz a felkínált kérdések közül."
      } }
    ]
  },

  // ---------- Levelezőpartnerek (js/contacts.js) ----------
  contacts: {
    // Alapértelmezett válaszidő (ms): véletlen érték a két szám között
    replyDelay: [10000, 15000],
    // Ha a szabad szövegben nincs keresett kulcsszó
    fallbackReply: "Nem tudok segíteni, nem tudom, miről beszélsz.",
    // Ismeretlen címzett esetén
    unknownRecipient: "Ismeretlen címzett.",
    // Címzett: név vagy e-mail-cím alapján találja meg a játék (kis- és nagybetű, ékezet nem számít).
    // mode:
    //   "names"   : csak névvel lehet válaszolni (a megoldás), a listából kell választani; nincs automatikus válasz
    //   "options" : a játékos csak az options listából választ; a válasz a megadott reply szöveg
    //   "free"    : szabad szöveg; a replies listában a match kulcsszót keresi (a tárgyban is), különben fallbackReply
    people: [
      { name: "Balog Tibor", address: "balog.tibor@apex-epitkezes.example", mode: "names" },
      { name: "Mezei Éva", address: "mezei.eva@apex-epitkezes.example", mode: "options",
        options: [
          { id: "ki_volt_7", label: "Ki volt az irodában 7:00-kor?", subject: "Ki volt 7:00-kor?",
            reply: "7:00 körül Kovács Rita, Fazekas Zoltán és Nótár Marika volt az irodában." },
          { id: "kamerak", label: "Mi lett a kamerákkal?", subject: "A kamerák",
            reply: "Reggel 7 körül megszakadt a felvétel. A rendszer naplójában nem találtam magyarázatot." },
          { id: "allas", label: "Van nyitott állásposzíció?", subject: "Állásposzíció",
            reply: "Igen, a jelentkezések megnyíltak. Ha érdekel, küldj egy önéletrajzot." }
        ] },
      { name: "Fazekas Zoltán", address: "fazekas.zoltan@apex-epitkezes.example", mode: "free",
        replies: [
          { match: ["horvath mark"], text: "Horváth Márk? A régi rendszergazdánk volt. Azóta nem dolgozik nálunk." }
        ] },
      { name: "Szabó Beatrix", address: "szabo.beatrix@apex-epitkezes.example", mode: "free",
        replies: [
          { match: ["horvath mark"], text: "Horváth Márkot? Régi rendszergazda volt. Ennél többet nem tudok róla." }
        ] },
      { name: "Kovács Dániel", address: "kovacs.daniel@apex-epitkezes.example", mode: "free",
        replies: [
          { match: ["horvath mark"], text: "Horváth Márk? A rendszerekhez nem értek, azt Zoltántól kérdezd." }
        ] },
      { name: "Kovács Rita", address: "kovacs.rita@apex-epitkezes.example", mode: "free",
        replies: [
          { match: ["horvath mark"], text: "Horváth Márk? Személyesen nem ismerem." }
        ] },
      { name: "Nótár Marika", address: "notar.marika@apex-epitkezes.example", mode: "free",
        replies: [
          { match: ["horvath mark"], text: "Horváth Márk? Azt hallottam, kirúgták. Többet nem tudok." }
        ] },
      { name: "Varga Péter", address: "varga.peter@apex-epitkezes.example", mode: "free",
        replies: [
          { match: ["horvath mark"], text: "Horváth Márk? Én szóltam a vezetésnek, hogy rosszat mond a cégről a streamben. Utána kirúgták." }
        ] },
      { name: "Horváth Márk", address: "horvath.mark@apex-epitkezes.example", mode: "free",
        replies: [
          // Easter egg: a játék másik szereplőjének (a hörcsögnek) a neve
          { match: ["gombóc"], text: "Gombóc? Honnan tudod a nevét? Ezt csak nagyon kevesen tudják. Beszéljünk." },
          { match: ["horvath mark"], text: "Igen, én vagyok. Miért kérdezed?" }
        ] }
    ]
  },

  // ---------- Megoldás (js/contacts.js, js/ending.js) ----------
  solution: {
    // A helyes nevek: bármelyik elfogadott (több is lehet)
    culprits: ["Kovács Rita", "Horváth Márk"],
    // A Balognak írható válasz lehetséges nevei (a többi név téves)
    answerChoices: ["Fazekas Zoltán", "Szabó Beatrix", "Kovács Dániel", "Kovács Rita", "Nótár Marika", "Varga Péter", "Mezei Éva", "Horváth Márk"],
    // Jó megoldás: "Király vagy!" képernyő
    winTitle: "Király vagy!",
    winText: "Nyertél! A terveket Kovács Rita lopta el, Horváth Márk megbízásából.",
    // Rossz megoldás: a valódi történet
    loseTitle: "Ez nem stimmel...",
    loseText: "Valójában Kovács Rita lopta el a terveket. Horváth Márk, a régi rendszergazda kérte meg rá jó pénzért. Ő kapcsolta ki távolról a kamerákat, mert ismerte a széf jelszavát. A kamerák törlését az tette lehetővé, hogy a régi hozzáférését senki nem vonta vissza."
  }
};
