# Nyomozós játék – dokumentáció

**Verzió:** v0.1 (alap: monitor → bejelentkezés → betöltő → asztal)
**Téma:** digitális lábnyom
**Technológia:** tiszta HTML, CSS, JavaScript – nincs build, nincs külső könyvtár

## Futtatás

A `fetch()` a `assets/` fájlokhoz a `file://` megnyitásnál a böngészőktől általában hibát ad.
Ezért helyi szerverről nyisd meg, a repó mappájában:

```
python3 -m http.server 8000
```

Majd a böngészőben: `http://localhost:8000`

## Felépítés

| Fájl | Tartalom |
|---|---|
| `index.html` | Képernyők (monitor, bejelentkezés, betöltő, asztal) |
| `css/style.css` | Megjelenés, reszponzív alapok |
| `js/yaml.js` | Egyszerű YAML-olvasó (nincs külső könyvtár) |
| `js/app.js` | Képernyőváltás, jelszó, info gomb, betöltő, asztal, ikonok |
| `assets/config.yml` | Jelszó (`password:`) |
| `assets/desktop.yml` | Asztali ikonok (x, y, important, appicon, launch) |
| `assets/te_login_info.txt` | Info gomb szövege, a `<h>…</h>` közti rész kiemelve |
| `assets/szamitogep.png` | Háttér és számítógép (hiányzik, még feltöltendő) |
| `assets/nyomozo_fej.png` | Profilkép (hiányzik, még feltöltendő) |
| `assets/tracebook.png`, `notes.png`, `amail.png` | Ikonképek (hiányoznak, még feltöltendők) |

## Beállítások szerkesztése

- **Jelszó:** `assets/config.yml` → `password:`
- **Ikonok:** `assets/desktop.yml`. Új ikonhoz új `- name:` blokk kell, a mezők két-négy szóközzel behúzva.
- **Bekapcsoló gomb helye:** `css/style.css` → `:root` → `--power-x`, `--power-y` (a monitor alján lévő pont, képernyő %-ban). A képhez kell igazítani.
- **Betöltő szövegei:** `js/app.js` → `BOOT_LINES`.

## Változásnapló

- **v0.1** – Alap váz: monitor bekapcsolása, bejelentkezés (kör profilkép, info gomb, jelszó), régi stílusú betöltő ("AjtOS"), asztal tálcával, ikonok a desktop.yml alapján, ikon launch = konzolba írás.

## Ismert hiányosságok / nyitott kérdések

- A képek (`assets/*.png`) még nincsenek a repóban; ezért a képek helyén hibás kép vagy szürke alap látszik.
- A bekapcsoló gomb helye a monitoron becsült (`--power-x`, `--power-y`), a képhez kell igazítani.
- A `<h>` jelölés: jelenleg `<h>…</h>` párban van értelmezve. Ha más jelölésre gondoltatok, szólni kell.
- A jelszó a böngészőből olvasható (a config.yml nyílt fájl). Iskolai játékhoz elfogadható, de nem biztonság.
- Az app-indítás (launch) egyelőre csak konzolba ír.
- Nincs mentés, nincs több képernyő a három appnak (Tracebook, Notes, Amail).
- Reszponzivitás: kis képernyőn az ikonok és a bejelentkező doboz még nincs teljesen ellenőrizve.
- Tesztelve még nincs: Chrome, Firefox, Edge, Safari.
