/*
 * Játék adatai – ezt a fájlt szerkeszd, nem kell fetch vagy szerver.
 * (Korábbi assets/*.yml és *.txt fájlok tartalma ide került.)
 */
var GAME_DATA = {

  // Jelszó a bejelentkezéshez
  // FIGYELEM: a böngészőből olvasható, ez iskolai játékhoz elég, biztonságnak nem.
  config: {
    password: "valami-jelszo"
  },

  // Info gomb szövege a profilkép mellett.
  // A <h>…</h> közé írt rész kiemelve jelenik meg.
  info:
    "Te vagy <h>a nyomozó</h>, aki este 8:30-kor otthon ül a gép előtt.\n" +
    "Az ügy: <h>digitális lábnyom</h> – valaki nyomot hagyott az interneten.\n" +
    "Ez a szöveg példa: a <h>…</h> közé írt részek kiemelve jelennek meg.",

  // Asztali ikonok
  // x, y      : pixel koordináta a bal felső sarokhoz (az asztal bal felső sarkától)
  // important : true -> piros "!" jelölés, false -> nincs jelölés
  // appicon   : az ikon képe (assets/ alatt). Ha hiányzik, szürke alap látszik.
  // launch    : az app azonosítója. Jelenleg csak a konzolba íródik.
  desktop: {
    icons: [
      { name: "Tracebook", x: 30,  y: 30,  important: true,  appicon: "assets/tracebook.png", launch: "tracebook" },
      { name: "Notes",     x: 30,  y: 130, important: false, appicon: "assets/notes.png",     launch: "notes" },
      { name: "Amail",     x: 30,  y: 230, important: true,  appicon: "assets/amail.png",     launch: "amail" }
    ]
  }
};
