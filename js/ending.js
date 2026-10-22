/*
 * Végkép: "Király vagy!" (jó megoldás) vagy a valódi történet (rossz megoldás).
 * Ending.show({ title, text, win }). A szövegek: js/data.js → GAME_DATA.solution
 */
var Ending = (function () {
  'use strict';

  function show(o) {
    var host = document.getElementById('screen-desktop') || document.body;
    var old = document.getElementById('ending');
    if (old) old.parentNode.removeChild(old);

    var box = document.createElement('div');
    box.id = 'ending';
    box.className = 'ending ' + (o.win ? 'ending-win' : 'ending-lose');
    box.setAttribute('role', 'alertdialog');

    var title = document.createElement('h2');
    title.textContent = o.title || '';

    var text = document.createElement('p');
    text.textContent = o.text || '';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Rendben';
    btn.addEventListener('click', function () {
      box.parentNode.removeChild(box);
    });

    box.appendChild(title);
    box.appendChild(text);
    box.appendChild(btn);
    host.appendChild(box);
    btn.focus();
  }

  return { show: show };
})();
