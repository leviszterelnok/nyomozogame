# Nyomozós játék – dokumentáció

**Verzió:** v0.1.1 (alap: monitor → bejelentkezés → betöltő → asztal)
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
| `assets/szamitogep.png` | Háttér és számítógép (hiányzik, még feltöltendő) |
| `assets/nyomozo_fej.png` | Profilkép (hiányzik, még feltöltendő) |
| `assets/tracebook.png`, `notes.png`, `amail.png` | Ikonképek (hiányoznak, még feltöltendők) |

## Beállítások szerkesztése

- **Jelszó:** `js/data.js` → `config.password`
- **Ikonok:** `js/data.js` → `desktop.icons`. Új ikon: új `{ name: …, x: …, y: …, important: …, appicon: …, launch: … }` sor a listába.
- **Info szöveg:** `js/data.js` → `info`. A `<h>…</h>` közé írt rész lesz kiemelve.
- **Bekapcsoló gomb helye:** `css/style.css` → `:root` → `--power-x`, `--power-y` (a monitor alján lévő pont, képernyő %-ban). A képhez kell igazítani.
- **Betöltő szövegei:** `js/app.js` → `BOOT_LINES`.

## Változásnapló

- **v0.1.1** – Nincs fetch: az adatok a `js/data.js`-ben vannak, a `file://` megnyitás is működik. A YAML-olvasó és a `.yml`/`.txt` fájlok törölve.
- **v0.1** – Alap váz: monitor bekapcsolása, bejelentkezés (kör profilkép, info gomb, jelszó), régi stílusú betöltő ("AjtOS"), asztal tálcával, ikonok a desktop.yml alapján, ikon launch = konzolba írás.

## Ismert hiányosságok / nyitott kérdések

- A képek (`assets/*.png`) még nincsenek a repóban; ezért a képek helyén hibás kép vagy szürke alap látszik.
- A bekapcsoló gomb helye a monitoron becsült (`--power-x`, `--power-y`), a képhez kell igazítani.
- A `<h>` jelölés: jelenleg `<h>…</h>` párban van értelmezve. Ha más jelölésre gondoltatok, szólni kell.
- A jelszó a böngészőből olvasható (a `js/data.js` nyílt fájl). Iskolai játékhoz elfogadható, de nem biztonság.
- Az app-indítás (launch) egyelőre csak konzolba ír.
- Nincs mentés, nincs több képernyő a három appnak (Tracebook, Notes, Amail).
- Reszponzivitás: kis képernyőn az ikonok és a bejelentkező doboz még nincs teljesen ellenőrizve.
- Tesztelve még nincs: Chrome, Firefox, Edge, Safari.
