# Nyomozós játék – dokumentáció

**Verzió:** v0.2.3 (alap: monitor → bejelentkezés → betöltő → asztal)
**Téma:** digitális lábnyom
**Technológia:** tiszta HTML, CSS, JavaScript – nincs build, nincs külső könyvtár

## Futtatás

Nincs szerver, nincs Python: a `index.html` fájlt dupla kattintással megnyithatod a böngészőben.
Az adatok a `js/data.js` fájlban vannak, nincs `fetch()`.

## Felépítés

| Fájl | Tartalom |
|---|---|
| `index.html` | Képernyők (monitor, bejelentkezés, betöltő, asztal) |
| `css/style.css` | Megjelenés, reszponzív alapok |
| `js/data.js` | Minden beállítás: jelszó, asztali ikonok, info szöveg (`GAME_DATA`) |
| `js/app.js` | Képernyőváltás, jelszó, info gomb, betöltő, asztal, ikonok |
| `js/game_logic.js` | Játéklogika: haladás, időzített események (pl. az első levél) |
| `js/mail.js` | `sendAmail()`: levélküldés, értesítések |
| `js/wm.js`, `css/wm.css` | Ablakkezelő: ablakok, tálca, mozgatás, átméretezés |
| `apps/tracebook/` | Tracebook (HTML, CSS, JS) |
| `apps/amail/` | Amail (HTML, CSS, JS) |
| `apps/notes/` | Notes (HTML, CSS, JS) |
| `tools/kepponto-mero.html` | Képpont-mérő: kép feltöltése, kattintással % értékek, a data.js-be másolható sorok |
| `assets/szamitogep.png` | Háttér és számítógép (hiányzik, még feltöltendő) |
| `assets/nyomozo_fej.png` | Profilkép (hiányzik, még feltöltendő) |
| `assets/tracebook.png`, `notes.png`, `amail.png` | Ikonképek (hiányoznak, még feltöltendők) |

## Beállítások szerkesztése

- **Jelszó:** `js/data.js` → `config.password`
- **Ikonok:** `js/data.js` → `desktop.icons`. Új ikon: új `{ name: …, important: …, appicon: …, launch: … }` sor a listába. Az ikonok rácson, felülről lefelé, oszloponként rendeződnek (a sorrend számít).
- **Info szöveg:** `js/data.js` → `info`. A `<h>…</h>` közé írt rész lesz kiemelve.
- **Játéktér területe:** `js/data.js` → `config.area` (`x1`, `y1` = bal felső sarok, `x2`, `y2` = jobb alsó sarok). Számok = %, `"120px"` = pixel. A kijelző háttere: `background` (szín vagy kép).
- **Képek:** `js/data.js` → `config.images` (`backdrop` = monitor-kép, mindig látszik; `avatar` = profilkép). Ikonképek: `desktop.icons` → `appicon`.
- **Bekapcsoló gomb helye és mérete:** `js/data.js` → `config.powerButton` (`x`, `y` = a gomb közepe az ablak %-ában, `size` = átmérő px). A képhez kell igazítani.
- **Képpont-mérő:** nyisd meg a `tools/kepponto-mero.html` fájlt böngészőben, töltsd fel a képet, kattints a kijelző sarkaira és a gombra. Az alsó szövegdobozt másold a `js/data.js`-be.
- **Betöltő szövegei:** `js/app.js` → `BOOT_LINES`.

## Változásnapló

- **v0.2.1** – Tracebook: a főoldal csak `main_menu_posts` bejegyzéseket mutat. A felhasználók saját bejegyzései (`users[].posts`) csak a profilon látszanak. Notes: a többi apphoz igazított (szürke, Tahoma) stílus.
- **v0.2.3** – Új `js/game_logic.js` (`Game`): az asztal megjelenésétől indul, az első levelet 30 mp múlva küldi (`game.introMailDelay`, `game.introMail` a data.js-ben). Haladás: `Game.setFlag` / `Game.hasFlag`.
- **v0.2.2** – Asztali ikonok kisebbek, rácson (x/y már nincs). Új `js/mail.js`: `sendAmail(mail, opts)` levelet ad a beérkezetthez; piros pötty az Amail ikonján, szöveges értesítés a jobb alsó sarokban. Az értesítés szövege és ideje `amail.notification`-ben vagy `sendAmail` opts-ban állítható. Az Amail megnyitásakor a pötty eltűnik.
- **v0.2.0** – Asztal háttere (`desktop.background`). Ablakkezelő (`js/wm.js`, `css/wm.css`): húzható, átméretezhető ablakok, csak az asztal területén belül, apponként 1 ablak. Három app külön mappában (`apps/tracebook`, `apps/amail`, `apps/notes`), mindegyik külön HTML/CSS/JS. Tracebook: főoldal, keresés, profil, bejegyzések (`tracebook.main_menu_posts`, felhasználónként `users[].posts`). Amail: lista, szűrés, levél nézet, válasz, `sendMail()` (még nincs bekötve). Notes: egyfájlos jegyzet, localStorage-ba mentve.
- **v0.1.5** – Bekapcsoló gomb helye és mérete a `config.powerButton`-ban. A gomb jól látható (sötét alap, fehér keret). A képpont-mérő bekerült: `tools/kepponto-mero.html`.
- **v0.1.4** – Javítás: a kijelző háttere alapból átlátszó, így a monitor-kép látszik. A kikapcsolt monitor (`#screen-off`) fekete.
- **v0.1.3** – A monitor-kép (`config.images.backdrop`) mindig látszik, a bekapcsoló gomb hozzá igazodik. A kijelző (`config.area`) háttere beállítható (`background`). Fontos ikon: sárga outline, nem "!" jelölés. Nem fontos ikon: szürke kijelölés. Minden kép a `data.js`-ben szerkeszthető.
- **v0.1.2** – Játéktér területe beállítható (`config.area`), az ablak többi része fekete.
- **v0.1.1** – Nincs fetch: az adatok a `js/data.js`-ben vannak, a `file://` megnyitás is működik. A YAML-olvasó és a `.yml`/`.txt` fájlok törölve.
- **v0.1** – Alap váz: monitor bekapcsolása, bejelentkezés (kör profilkép, info gomb, jelszó), régi stílusú betöltő ("AjtOS"), asztal tálcával, ikonok a desktop.yml alapján, ikon launch = konzolba írás.

## Appok adatai (js/data.js)

- `desktop.background`: asztal háttere.
- `apps`: az appok címe, fájlja és kezdeti mérete. Új app: itt és a `desktop.icons`-ban.
- `tracebook.users`: felhasználók (`username`, `name`, `avatar`, `friends`, opcionálisan `posts`). A `posts` a felhasználó saját bejegyzései: csak a profilján látszanak, a főoldalon és a szövegkeresésben nem.
- `tracebook.main_menu_posts`: a főoldali bejegyzések (`id`, `author`, `date`, `text`). Mindig ezek látszanak a főoldalon, a szerzőjük profilján is megjelennek. A szövegbe `<img src="assets/kep.png">` írható. `tracebook.texts`: minden felirat, a nem létező felhasználó üzenete (`notFound`) és az időtartama (`notFoundMs`, ms).
- `amail.mails`: beérkezett levelek. `amail.outgoing`: piszkozatok. `amail.texts`: feliratok.
- `notes`: cím és feliratok.

## Ismert hiányosságok / nyitott kérdések

- Amail válasz küldése (a játékos írja): a `sendMail()` (apps/amail/amail.js) még csak konzolba ír. A játék levélküldése a `sendAmail()` (js/mail.js), az már működik.
- A képek hiányoznak az `assets/` mappából (profilképek, appikonok, bejegyzés-képek): a böngésző hibát jelez, ahol nincs kép.
- Az ablakkezelőben nincs az ablakok közti sorrend mentése, és nincs mobil támogatás.

- A képek (`assets/*.png`) még nincsenek a repóban; ezért a képek helyén hibás kép vagy szürke alap látszik.
- A bekapcsoló gomb helye alapból becsült (`config.powerButton`), a képhez kell igazítani.
- A `<h>` jelölés: jelenleg `<h>…</h>` párban van értelmezve. Ha más jelölésre gondoltatok, szólni kell.
- A jelszó a böngészőből olvasható (a `js/data.js` nyílt fájl). Iskolai játékhoz elfogadható, de nem biztonság.
- Az app-indítás (launch) egyelőre csak konzolba ír.
- Nincs mentés, nincs több képernyő a három appnak (Tracebook, Notes, Amail).
- Reszponzivitás: kis képernyőn az ikonok és a bejelentkező doboz még nincs teljesen ellenőrizve.
- Tesztelve még nincs: Chrome, Firefox, Edge, Safari.
