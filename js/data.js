/*
 * Játék adatai – ezt a fájlt szerkeszd, nem kell fetch vagy szerver.
 * (Korábbi assets/*.yml és *.txt fájlok tartalma ide került.)
 */
var GAME_DATA = {

  // Jelszó a bejelentkezéshez
  // FIGYELEM: a böngészőből olvasható, ez iskolai játékhoz elég, biztonságnak nem.
  config: {
    password: "valami-jelszo",

    // Képek. A monitor-kép mindig látszik az ablakban, a többi kép a kijelzőn belül jelenik meg.
    images: {
      backdrop: "assets/szamitogep.png",   // számítógép / monitor kép (teljes ablak)
      avatar: "assets/nyomozo_fej.png"     // profilkép a bejelentkezésnél
    },

    // Játéktér területe: honnan (x1, y1) hová (x2, y2) tart a képernyő.
    // Számok = a böngészőablak %-a (pl. 10 = 10%). "120px" alakú szöveg = pixel.
    // Alapértelmezés: a teljes ablak (0,0 -> 100,100).
    // background: a kijelző háttere: szín (pl. "#000") vagy kép (pl. "assets/hatter.png").
    area: { x1: 0, y1: 0, x2: 100, y2: 100, background: "#000" }
  },

  // Info gomb szövege a profilkép mellett.
  // A <h>…</h> közé írt rész kiemelve jelenik meg.
  info:
    "Te vagy <h>a nyomozó</h>, aki este 8:30-kor otthon ül a gép előtt.\n" +
    "Az ügy: <h>digitális lábnyom</h> – valaki nyomot hagyott az interneten.\n" +
    "Ez a szöveg példa: a <h>…</h> közé írt részek kiemelve jelennek meg.",

  // Asztali ikonok
  // x, y      : pixel koordináta a bal felső sarokhoz (az asztal bal felső sarkától)
  // important : true -> sárga keret az ikonon, false -> nincs keret (szürke kijelölés)
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
