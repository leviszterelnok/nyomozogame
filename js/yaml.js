/*
 * Minimális YAML-olvasó a projekthez (nincs külső könyvtár).
 * Csak az egyszerű formát érti:
 *   kulcs: érték                  -> egyszerű érték
 *   kulcs:                        -> lista következik
 *     - név: érték                -> új listaelem
       másik: érték                -> ugyanazon elem további mezője (behúzva)
 * Kommentet csak külön sorba írj (# az első nem üres karakter).
 * Beágyazott objektum nincs támogatva.
 */
(function (global) {
  'use strict';

  // Érték átalakítása: idézőjel levétele, true/false, szám
  function parseScalar(raw) {
    var v = raw.trim();
    if (v === '') return '';
    if ((v.charAt(0) === '"' && v.charAt(v.length - 1) === '"') ||
        (v.charAt(0) === "'" && v.charAt(v.length - 1) === "'")) {
      return v.slice(1, -1);
    }
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
    return v;
  }

  // "kulcs: érték" szétbontása az első kettőspontnál
  function splitKeyValue(text, lineNo) {
    var idx = text.indexOf(':');
    if (idx === -1) {
      throw new Error('YAML hiba (' + lineNo + '. sor): hiányzik a ":" jel');
    }
    return [text.slice(0, idx).trim(), text.slice(idx + 1)];
  }

  function parseYaml(source) {
    var result = {};
    var list = null;   // az aktuális lista (pl. icons)
    var item = null;   // az aktuális listaelem

    source.split(/\r?\n/).forEach(function (raw, i) {
      var lineNo = i + 1;
      var trimmed = raw.trim();
      if (trimmed === '' || trimmed.charAt(0) === '#') return;

      var indent = raw.length - raw.replace(/^\s+/, '').length;

      // Főszintű kulcs
      if (indent === 0) {
        var top = splitKeyValue(trimmed, lineNo);
        if (top[1].trim() === '') {
          list = [];
          result[top[0]] = list;
        } else {
          list = null;
          result[top[0]] = parseScalar(top[1]);
        }
        item = null;
        return;
      }

      // Behúzott sor: lista tartozik hozzá
      if (!list) {
        throw new Error('YAML hiba (' + lineNo + '. sor): behúzott sor lista nélkül');
      }

      if (trimmed.indexOf('- ') === 0) {
        item = {};
        list.push(item);
        var first = splitKeyValue(trimmed.slice(2), lineNo);
        item[first[0]] = parseScalar(first[1]);
      } else {
        if (!item) {
          throw new Error('YAML hiba (' + lineNo + '. sor): nincs listaelem');
        }
        var field = splitKeyValue(trimmed, lineNo);
        item[field[0]] = parseScalar(field[1]);
      }
    });

    return result;
  }

  global.parseYaml = parseYaml;
})(window);
