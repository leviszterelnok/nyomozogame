/*
 * 3D monitor (Three.js r128). A főoldal (index.html) ezt futtatja.
 * Minden geometria kódból épül, nincs külső modellfájl. Textúrák canvas-ból készülnek.
 * A játék képernyője (kepernyo.html) a monitor síkján, CSS 3D iframe-ként fut.
 * A képernyő-sík adatai a window.Monitor3D-n keresztül érhetők el.
 */
(function () {
  'use strict';

  // ---- Méretek (méterben) ----
  var SCREEN_W = 0.76;  // képernyő szélessége (széles monitor)
  var SCREEN_H = 0.46;  // képernyő magassága

  var stage = document.getElementById('stage');

  // ---- Renderer, jelenet, kamera ----
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  stage.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  // Meleg, nyugodt este: barna-narancs tónusok, kevés köd
  scene.background = new THREE.Color(0x1e150f);
  scene.fog = new THREE.FogExp2(0x2a1d14, 0.05);

  // Szélesebb látószög, a kamera közel a képernyőhöz, a képernyő közepére nézve
  // Közeli kamera, széles látószög. Az egér a nézetet mozgatja (lásd lent).
  var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 50);
  var camBase = new THREE.Vector3(0, 1.1, 0.85);   // nézelődés: a monitor kicsit távolabb
  var lookAt = new THREE.Vector3(0, 1.0, -0.12);
  camera.position.copy(camBase);
  camera.lookAt(lookAt);

  // ---- Textúrák (canvas-ból) ----
  function canvasTex(w, h, draw, srgb) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d'), w, h);
    var t = new THREE.CanvasTexture(c);
    if (srgb) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  }

  // Fa textúra: vízszintes erezet
  var woodTex = canvasTex(512, 512, function (g, w, h) {
    g.fillStyle = '#5a3a22';
    g.fillRect(0, 0, w, h);
    for (var i = 0; i < 260; i++) {
      var dark = 30 + Math.random() * 40 | 0;
      g.strokeStyle = 'rgba(' + dark + ',18,8,' + (0.05 + Math.random() * 0.15) + ')';
      g.lineWidth = 0.5 + Math.random() * 2;
      var x = Math.random() * w;
      g.beginPath();
      g.moveTo(x, 0);
      g.bezierCurveTo(x + Math.random() * 10 - 5, h * 0.33, x + Math.random() * 10 - 5, h * 0.66, x + Math.random() * 6 - 3, h);
      g.stroke();
    }
  }, true);

  // Billentyűzet: gombok rácsa (a felső lapra kerül)
  var keysTex = canvasTex(256, 96, function (g, w, h) {
    g.fillStyle = '#c9c1a6';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#e8e2cc';
    for (var r = 0; r < 5; r++) {
      for (var c = 0; c < 15; c++) {
        g.fillRect(4 + c * 16 + r * 3, 4 + r * 17, 13, 13);
      }
    }
  }, true);

  // Képernyő tartalma: egyszerű bejelentkező képernyő-szerű kép (később a játék váltja)
  var screenTex = canvasTex(620, 375, function (g, w, h) {
    var grd = g.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.7);
    grd.addColorStop(0, '#0d3b52');
    grd.addColorStop(1, '#021018');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.textAlign = 'center';
    g.fillStyle = '#9ff3ff';
    g.font = 'bold 34px monospace';
    g.fillText('ÜDVÖZÖLJÜK', w / 2, h / 2 - 10);
    g.font = '22px monospace';
    g.fillStyle = '#5fb8cc';
    g.fillText('BEJELENTKEZÉS', w / 2, h / 2 + 30);
    // Sorok: CRT jelleg
    g.fillStyle = 'rgba(0,0,0,0.18)';
    for (var y = 0; y < h; y += 3) {
      g.fillRect(0, y, w, 1);
    }
  }, true);

  // ---- Anyagok ----
  var beige = new THREE.MeshStandardMaterial({ color: 0xcfc6a6, roughness: 0.55 });
  var beigeDark = new THREE.MeshStandardMaterial({ color: 0xa89f84, roughness: 0.6 });
  var black = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.7 });
  var wood = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.6 });
  var floorMat = new THREE.MeshStandardMaterial({ color: 0x5a3b26, roughness: 0.9 });
  var wallMat = new THREE.MeshStandardMaterial({ color: 0x6b4f3a, roughness: 0.95 });
  var ledMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0 });
  // Kikapcsolt képernyő: fekete üveg
  var screenOffMat = new THREE.MeshStandardMaterial({ color: 0x020202, roughness: 0.2 });
  var shadeMat = new THREE.MeshStandardMaterial({ color: 0xd9a25a, emissive: 0xffa040, emissiveIntensity: 0.6, side: THREE.DoubleSide, roughness: 0.8 });
  var screenMat = new THREE.MeshStandardMaterial({
    map: screenTex,
    emissiveMap: screenTex,
    emissive: 0xffffff,
    emissiveIntensity: 0.9,
    roughness: 0.25
  });
  // Üveg: tükröződés a képernyő előtt
  var glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x000000,
    roughness: 0.05,
    transparent: true,
    opacity: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.05
  });

  // ---- Segédfüggvények ----
  function addMesh(geo, mat, x, y, z, parent) {
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    (parent || scene).add(m);
    return m;
  }

  function box(w, h, d, mat, x, y, z, parent) {
    return addMesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
  }

  // Csonkagúla-test (téglalap keresztmetszet, két végén más méret): a CRT tubus.
  // Minden lap normálját a test közepe felé nem mutató irányba állítja.
  function makeFrustum(wf, hf, wb, hb, len) {
    var v = [
      -wf / 2, -hf / 2, 0,   wf / 2, -hf / 2, 0,   wf / 2, hf / 2, 0,   -wf / 2, hf / 2, 0,
      -wb / 2, -hb / 2, -len, wb / 2, -hb / 2, -len, wb / 2, hb / 2, -len, -wb / 2, hb / 2, -len
    ];
    var center = new THREE.Vector3(0, 0, -len / 2);
    var idx = [];
    function quad(a, b, c, d) {
      var P = function (i) { return new THREE.Vector3(v[i * 3], v[i * 3 + 1], v[i * 3 + 2]); };
      var pa = P(a), pb = P(b), pc = P(c), pd = P(d);
      var n = new THREE.Vector3().subVectors(pb, pa).cross(new THREE.Vector3().subVectors(pc, pa));
      var fc = new THREE.Vector3().add(pa).add(pb).add(pc).add(pd).multiplyScalar(0.25);
      if (n.dot(fc.sub(center)) < 0) {
        idx.push(a, c, b, a, d, c);
      } else {
        idx.push(a, b, c, a, c, d);
      }
    }
    quad(4, 5, 6, 7);  // hátsó lap
    quad(0, 1, 5, 4);  // alsó
    quad(1, 2, 6, 5);  // jobb
    quad(2, 3, 7, 6);  // felső
    quad(3, 0, 4, 7);  // bal
    quad(0, 3, 2, 1);  // elülső (a keret takarja)
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    geo.setIndex(idx);
    var flat = geo.toNonIndexed();   // lapos árnyalás
    flat.computeVertexNormals();
    return flat;
  }

  // open: true -> nyitott henger (lámpaernyő)
  function cyl(rt, rb, h, seg, mat, x, y, z, parent, open) {
    return addMesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, !!open), mat, x, y, z, parent);
  }

  // ---- Helyiség ----
  var ROOM_H = 2.7;   // belmagasság (m): a padló és a mennyezet távolsága
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  var backWall = new THREE.Mesh(new THREE.PlaneGeometry(10, ROOM_H), wallMat);
  backWall.position.set(0, ROOM_H / 2, -3.2);
  backWall.receiveShadow = true;
  scene.add(backWall);

  // Oldalsó falak és mennyezet: zárt, sötét szoba
  var sideWallL = new THREE.Mesh(new THREE.PlaneGeometry(6.5, ROOM_H), wallMat);
  sideWallL.rotation.y = Math.PI / 2;
  sideWallL.position.set(-2.6, ROOM_H / 2, -1.2);
  sideWallL.receiveShadow = true;
  scene.add(sideWallL);
  var sideWallR = new THREE.Mesh(new THREE.PlaneGeometry(6.5, ROOM_H), wallMat);
  sideWallR.rotation.y = -Math.PI / 2;
  sideWallR.position.set(2.6, ROOM_H / 2, -1.2);
  sideWallR.receiveShadow = true;
  scene.add(sideWallR);
  var ceiling = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 6.5), wallMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, ROOM_H, -1.2);
  scene.add(ceiling);

  // Falikép a jobb oldali falon: sötét, festett tájkép
  var paintingTex = canvasTex(256, 192, function (g, w, h) {
    var gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#2b3d5c');
    gr.addColorStop(1, '#6b3a2a');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(230,210,160,0.7)';
    g.beginPath();
    g.arc(w * 0.7, h * 0.35, 28, 0, Math.PI * 2);
    g.fill();
  }, true);
  // Falikép fakerettel: a keret és a kép egy csoportban, a csoport a jobb falra néz
  var paintingGroup = new THREE.Group();
  paintingGroup.position.set(2.575, 1.6, -1.5);
  paintingGroup.rotation.y = -Math.PI / 2;
  scene.add(paintingGroup);
  var painting = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.6),
    new THREE.MeshStandardMaterial({ map: paintingTex, roughness: 0.8 })
  );
  painting.position.set(0, 0, 0.012);
  paintingGroup.add(painting);
  var frameWoodMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.5 });
  box(0.92, 0.06, 0.03, frameWoodMat, 0, 0.33, 0, paintingGroup);
  box(0.92, 0.06, 0.03, frameWoodMat, 0, -0.33, 0, paintingGroup);
  box(0.06, 0.6, 0.03, frameWoodMat, -0.43, 0, 0, paintingGroup);
  box(0.06, 0.6, 0.03, frameWoodMat, 0.43, 0, 0, paintingGroup);

  // Könyvespolc: polcok és könyvek (egy közös doboz-geometria, színes anyagokkal)
  var planks = [0.1, 0.6, 1.1, 1.6, 2.1];
  planks.forEach(function (p) {
    box(3.0, 0.03, 0.3, wallMat, -0.9, p, -3.0);
  });
  box(0.03, 2.1, 0.3, wallMat, -2.4, 1.05, -3.0);
  box(0.03, 2.1, 0.3, wallMat, 0.6, 1.05, -3.0);

  var bookColors = [0x6b1e1e, 0x1e3a5f, 0x2f4f2f, 0x5a4a1f, 0x3a2a4a, 0x222222, 0x7a5a2a];
  var bookMats = bookColors.map(function (c) {
    return new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 });
  });
  var bookGeo = new THREE.BoxGeometry(1, 1, 1);

  function addBooks(y0, x0, x1, z) {
    var x = x0;
    while (x < x1) {
      var bw = 0.025 + Math.random() * 0.02;
      var bh = 0.2 + Math.random() * 0.14;
      var bd = 0.2 + Math.random() * 0.05;
      if (x + bw > x1) break;
      var m = new THREE.Mesh(bookGeo, bookMats[(Math.random() * bookMats.length) | 0]);
      m.scale.set(bw, bh, bd);
      m.position.set(x + bw / 2, y0 + bh / 2, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
      x += bw + 0.002;
      if (Math.random() < 0.05) x += 0.03; // hiány a polcon
    }
  }
  for (var i = 0; i < planks.length - 1; i++) {
    addBooks(planks[i] + 0.015, -2.37, 0.57, -3.0);
  }

  // Asztal (a monitor alatt)
  var desk = new THREE.Group();
  scene.add(desk);
  box(2.4, 0.05, 1.1, wood, 0, 0.725, 0.1, desk);
  [-1.12, 1.12].forEach(function (x) {
    [-0.4, 0.6].forEach(function (z) {
      box(0.06, 0.7, 0.06, wood, x, 0.35, z, desk);
    });
  });

  // Billentyűzet (a monitor előtt)
  var kbMats = [beigeDark, beigeDark,
    new THREE.MeshStandardMaterial({ map: keysTex, roughness: 0.5 }),
    beigeDark, beigeDark, beigeDark];
  var keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.025, 0.16), kbMats);
  keyboard.position.set(0, 0.7625, 0.33);
  keyboard.castShadow = true;
  keyboard.receiveShadow = true;
  scene.add(keyboard);

  // ---- Régi, dobozos monitor ----
  var mon = new THREE.Group();
  mon.position.set(0, 0.77, 0.0);   // közelebb a nézőhöz (a korábbi -0,15 helyett)
  scene.add(mon);

  // Előlap (keret)
  var bezel = box(0.92, 0.6, 0.06, beige, 0, 0.3, 0, mon);
  bezel.name = 'Monitor-keret';

  // Belső keret: a képernyő körül kiálló sávok, így a kijelző mélyebben ül a monitorban
  var frameParts = [bezel];
  frameParts.push(box(0.92, 0.07, 0.024, beige, 0, 0.565, 0.042, mon));    // felső sáv
  frameParts.push(box(0.84, 0.012, 0.024, beige, 0, 0.065, 0.042, mon));   // alsó vékony sáv
  frameParts.push(box(0.08, 0.46, 0.024, beige, -0.42, 0.3, 0.042, mon));  // bal sáv
  frameParts.push(box(0.08, 0.46, 0.024, beige, 0.42, 0.3, 0.042, mon));   // jobb sáv
  frameParts.forEach(function (p) { p.name = 'Monitor-keret'; });

  // Hosszú, csonkakúpos "tubus" hátul: a szögletes CRT-test (a hátsó vég kisebb).
  var tube = new THREE.Mesh(makeFrustum(0.86, 0.56, 0.5, 0.34, 0.45), beigeDark);
  tube.position.set(0, 0.3, 0);
  tube.castShadow = true;
  tube.receiveShadow = true;
  tube.name = 'Tubus';
  mon.add(tube);

  // Képernyő (sík): ez a kijelölhető felület
  var screen = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), screenOffMat);
  screen.position.set(0, 0.3, 0.031);
  screen.name = 'Képernyő';
  mon.add(screen);

  // Üveg-réteg a képernyő előtt
  var glass = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), glassMat);
  glass.position.set(0, 0.3, 0.034);
  mon.add(glass);

  // Kiugró részletek: talp, szellőzőrácsok a tubus tetején, hátsó dudor
  box(0.36, 0.04, 0.24, beige, 0, -0.01, -0.05, mon);
  [-0.2, 0, 0.2].forEach(function (x) {
    box(0.2, 0.01, 0.02, black, x, 0.53, -0.25, mon);
  });
  box(0.2, 0.12, 0.12, beigeDark, 0, 0.3, -0.51, mon);

  // Gombok és LED az előlap alján
  var knobA = cyl(0.018, 0.018, 0.02, 24, black, -0.36, 0.04, 0.035, mon);
  knobA.rotation.x = Math.PI / 2;
  knobA.name = 'Gomb';
  var knobB = cyl(0.018, 0.018, 0.02, 24, black, -0.31, 0.04, 0.035, mon);
  knobB.rotation.x = Math.PI / 2;
  knobB.name = 'Gomb';
  var led = box(0.02, 0.02, 0.01, ledMat, 0.33, 0.04, 0.036, mon);
  led.name = 'LED';

  // Bekapcsoló gomb: a játék gombja, a bejelentkezést indítja (app.js: #power-btn -> 'login')
  var powerBtn = box(0.05, 0.02, 0.015, black, 0.4, 0.04, 0.036, mon);
  powerBtn.name = 'Bekapcsoló gomb';
  var isOn = false;

  // Bekapcsolás: a képernyő és a LED felkapcsolódik. Egyszer kapcsol be, mint a játékban.
  function powerOn() {
    if (isOn) return;
    isOn = true;
    screen.material = screenMat;
    ledMat.emissiveIntensity = 1.2;
    screenLight.intensity = 0.35;
    // A játék a 'power' üzenetre ugyanazt csinálja, mint a saját bekapcsoló gombja (bejelentkezés)
    if (gameFrame.contentWindow) gameFrame.contentWindow.postMessage('power', '*');
  }

  // ---- Jegyzet és toll az asztalon (csak vizuál, nem kijelölhető) ----
  var paperTex = canvasTex(256, 180, function (g, w, h) {
    g.fillStyle = '#f4f1e6';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(90,140,200,0.55)';
    g.lineWidth = 1;
    for (var y = 22; y < h; y += 14) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
    g.strokeStyle = 'rgba(200,60,60,0.5)';
    g.beginPath();
    g.moveTo(26, 0);
    g.lineTo(26, h);
    g.stroke();
  }, true);

  // Számítógép-egér a billentyűzet bal oldalán (csak vizuál, nem kijelölhető)
  var mouseObj = box(0.06, 0.03, 0.1, beige, -0.36, 0.765, 0.3, desk);
  mouseObj.name = 'Egér';

  // Jegyzet: kék borító és lapok (a lapok felső oldalán vonalas papír)
  var coverMat = new THREE.MeshStandardMaterial({ color: 0x2a3b6b, roughness: 0.7 });
  var pageSideMat = new THREE.MeshStandardMaterial({ color: 0xefeadb, roughness: 0.9 });
  var paperMat = new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.9 });
  var notebook = box(0.3, 0.012, 0.21, coverMat, 0.45, 0.756, 0.25);
  notebook.name = 'Jegyzet';
  var pagesGeo = new THREE.BoxGeometry(0.28, 0.01, 0.195);
  var pages = new THREE.Mesh(pagesGeo, [pageSideMat, pageSideMat, paperMat, pageSideMat, pageSideMat, pageSideMat]);
  pages.position.set(0.45, 0.7675, 0.25);
  pages.castShadow = true;
  pages.receiveShadow = true;
  scene.add(pages);

  // Toll a jegyzet bal oldalán (a nézőhöz képest), az asztalon fekve
  var penMat = new THREE.MeshStandardMaterial({ color: 0x1b2a6b, roughness: 0.35 });
  var pen = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.15, 12), penMat);
  pen.rotation.x = Math.PI / 2;
  pen.position.set(0.265, 0.7565, 0.25);
  pen.castShadow = true;
  scene.add(pen);

  // ---- Távoli asztal lámpával ----
  box(1.5, 0.05, 0.7, wood, 1.6, 0.725, -2.5);
  box(0.05, 0.7, 0.6, wood, 0.9, 0.35, -2.5);
  box(0.05, 0.7, 0.6, wood, 2.3, 0.35, -2.5);

  cyl(0.07, 0.07, 0.03, 24, black, 1.45, 0.765, -2.6);
  cyl(0.01, 0.01, 0.4, 8, black, 1.45, 0.97, -2.6);
  cyl(0.07, 0.13, 0.18, 24, shadeMat, 1.45, 1.2, -2.6, null, true);

  // ---- További bútorok és tárgyak ----
  // Szőnyeg az asztal alatt
  var rug = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x4a1d1d, roughness: 0.95 })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.002, 0.1);
  rug.receiveShadow = true;
  scene.add(rug);

  // Parafa tábla cetlikkel a hátsó falon, fa kerettel
  var corkTex = canvasTex(512, 320, function (g, w, h) {
    g.fillStyle = '#b08050';
    g.fillRect(0, 0, w, h);
    for (var i = 0; i < 400; i++) {
      g.fillStyle = 'rgba(70,40,15,' + (Math.random() * 0.25) + ')';
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    var colors = ['#f6f0a0', '#f3d6e0', '#cfe8ff', '#ffffff'];
    for (var n = 0; n < 9; n++) {
      g.save();
      g.translate(30 + Math.random() * (w - 120), 25 + Math.random() * (h - 100));
      g.rotate((Math.random() - 0.5) * 0.3);
      g.fillStyle = colors[n % colors.length];
      g.fillRect(0, 0, 80, 60);
      g.fillStyle = 'rgba(40,40,40,0.6)';
      for (var l = 0; l < 4; l++) {
        g.fillRect(8, 12 + l * 11, 60 - Math.random() * 20, 2);
      }
      g.fillStyle = '#c03030';
      g.beginPath();
      g.arc(40, 4, 3, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
  }, true);
  box(1.3, 0.85, 0.04, wood, 1.05, 1.9, -3.18);
  var board = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.75),
    new THREE.MeshStandardMaterial({ map: corkTex, roughness: 0.9 })
  );
  board.position.set(1.05, 1.9, -3.155);
  scene.add(board);

  // Bögre és növény az asztalon (a monitor mellett)
  var mugMat = new THREE.MeshStandardMaterial({ color: 0x8a2c2c, roughness: 0.5 });
  cyl(0.04, 0.04, 0.1, 20, mugMat, -0.58, 0.8, -0.12);
  var potMat = new THREE.MeshStandardMaterial({ color: 0x6b3d2a, roughness: 0.8 });
  var leafMat = new THREE.MeshStandardMaterial({ color: 0x2f6b34, roughness: 0.9 });
  cyl(0.07, 0.05, 0.12, 16, potMat, 0.72, 0.81, -0.2);
  addMesh(new THREE.SphereGeometry(0.1, 16, 12), leafMat, 0.72, 0.98, -0.2);

  // Bal oldali szekrény a falnál
  box(0.5, 1.6, 0.9, wood, -2.35, 0.8, -1.2);

  // ---- Hörcsög ketrecben, az asztal bal végén (kamu, dísz) ----
  // A neve a data.js config.hamster.name mezőben van; hoverre ezt írja ki.
  var hamsterCfg = (typeof GAME_DATA !== 'undefined' && GAME_DATA.config && GAME_DATA.config.hamster) || {};
  var hamsterName = hamsterCfg.name || 'Hörcsög';

  var cageGroup = new THREE.Group();
  cageGroup.position.set(-0.9, 0.75, 0.05);
  cageGroup.scale.setScalar(1.4);   // nagyobb ketrec (a belső részek ezzel együtt skálázódnak)
  scene.add(cageGroup);
  box(0.34, 0.02, 0.22, new THREE.MeshStandardMaterial({ color: 0xc9c2ae, roughness: 0.6 }), 0, 0.01, 0, cageGroup);
  box(0.3, 0.008, 0.18, new THREE.MeshStandardMaterial({ color: 0xd2ae72, roughness: 1 }), 0, 0.024, 0, cageGroup);
  var wire = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.24, 0.22, 12, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xe6e0d0, wireframe: true, transparent: true, opacity: 0.55 })
  );
  wire.position.set(0, 0.14, 0);
  cageGroup.add(wire);

  // Ketrec belső pontjai (a ketrec helyi koordinátái): tálka, kerék
  var BOWL = { x: 0.08, z: -0.03 };
  var EAT = { x: BOWL.x, z: 0.045 };                          // a hörcsög a tál ELŐTT áll, nem benne
  var WHEEL = { x: -0.07, y: 0.125, z: -0.04, r: 0.085 };     // a kerék közepe és sugara

  // Nagyobb tál, ételtel
  var bowlMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c0, roughness: 0.4 });
  cyl(0.036, 0.03, 0.02, 24, bowlMat, BOWL.x, 0.036, BOWL.z, cageGroup);
  cyl(0.031, 0.031, 0.003, 24, new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.9 }), BOWL.x, 0.0475, BOWL.z, cageGroup);

  // Futókerék a ketrec bal oldalán, két tartóoszlop közt: a hörcsög a kerékben fut
  var wheelMat = new THREE.MeshStandardMaterial({ color: 0xbfa27a, roughness: 0.6 });
  var wheelGroup = new THREE.Group();
  wheelGroup.position.set(WHEEL.x, WHEEL.y, WHEEL.z);
  cageGroup.add(wheelGroup);
  // Maga a kerék (nincs küllő, így a hörcsög szabadon fut benne)
  wheelGroup.add(new THREE.Mesh(new THREE.TorusGeometry(WHEEL.r, 0.006, 10, 40), wheelMat));
  // Két tartóoszlop a kerék mellett (a kerék szélétől kis résre, hogy ne érjen hozzájuk)
  var postX = WHEEL.r + 0.015;
  cyl(0.006, 0.006, WHEEL.y, 8, wheelMat, WHEEL.x - postX, WHEEL.y / 2, WHEEL.z, cageGroup);
  cyl(0.006, 0.006, WHEEL.y, 8, wheelMat, WHEEL.x + postX, WHEEL.y / 2, WHEEL.z, cageGroup);

  var hamster = new THREE.Group();
  hamster.position.set(0, 0.028, 0);   // az ágyon ül
  hamster.scale.setScalar(0.82);       // kicsit kisebb hörcsög a ketrechez képest
  cageGroup.add(hamster);
  var furMat = new THREE.MeshStandardMaterial({ color: 0xd9a766, roughness: 0.9 });
  var bellyMat = new THREE.MeshStandardMaterial({ color: 0xf3e0bc, roughness: 0.9 });
  var eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
  var noseMat = new THREE.MeshStandardMaterial({ color: 0xe09a9a, roughness: 0.5 });

  var hBody = addMesh(new THREE.SphereGeometry(0.05, 20, 16), furMat, 0, 0.04, 0, hamster);
  hBody.scale.set(1, 0.85, 1.25);
  addMesh(new THREE.SphereGeometry(0.035, 16, 12), bellyMat, 0, 0.03, 0.02, hamster).scale.set(1, 0.7, 1.1);
  var hHead = new THREE.Group();       // a fej forgatható (néz körül)
  hHead.position.set(0, 0.075, 0.05);
  hamster.add(hHead);
  addMesh(new THREE.SphereGeometry(0.036, 18, 14), furMat, 0, 0, 0, hHead);
  [-1, 1].forEach(function (s) {
    addMesh(new THREE.SphereGeometry(0.015, 12, 10), furMat, s * 0.027, 0.03, 0, hHead).scale.set(1, 1, 0.5);
    addMesh(new THREE.SphereGeometry(0.0045, 8, 6), eyeMat, s * 0.014, 0.012, 0.032, hHead);
  });
  var hNose = addMesh(new THREE.SphereGeometry(0.0035, 8, 6), noseMat, 0, -0.004, 0.038, hHead);
  addMesh(new THREE.SphereGeometry(0.012, 10, 8), furMat, 0, -0.03, -0.06, hamster);   // farok
  [-1, 1].forEach(function (s) {
    addMesh(new THREE.SphereGeometry(0.012, 10, 8), furMat, s * 0.022, -0.022, 0.04, hamster).scale.set(1, 0.5, 1.3);
  });

  // Halvány meleg fény a ketrecre: kicsit megvilágítja
  var cageLight = new THREE.SpotLight(0xffd39a, 1.0, 1.4, 0.7, 0.6, 2);
  cageLight.position.set(-0.95, 1.3, 0.3);
  scene.add(cageLight);
  cageLight.target.position.set(-0.95, 0.8, 0.05);
  scene.add(cageLight.target);

  // ---- Hörcsög viselkedése: sétál, eszik a tálból, kerékben fut, mosakodik ----
  var CAGE_X = 0.1, CAGE_Z = 0.06;     // a mozgás határa (a ketrec belsejében)
  var HAMSTER_Y = 0.028;               // az ágy felszíne fölött
  var WHEEL_RUN_Y = 0.072;             // a hörcsög magassága a kerék alján futva
  var hMode = 'idle', hUntil = 0, hTx = 0, hTz = 0, hLast = 0, hSpin = 0, hBaseY = HAMSTER_Y;

  // Tiltott terület a járáshoz: a tál és a kerék (a hörcsög nem gázol át rajtuk)
  function hBlocked(x, z) {
    if (Math.hypot(x - BOWL.x, z - BOWL.z) < 0.07) return true;
    return Math.abs(x - WHEEL.x) < 0.1 && Math.abs(z - WHEEL.z) < 0.06;
  }

  // Új célpont a ketrecen belül (a tál és a kerék környéke kimarad)
  function hPickTarget() {
    var x, z;
    do {
      x = (Math.random() * 2 - 1) * CAGE_X;
      z = (Math.random() * 2 - 1) * CAGE_Z;
    } while (hBlocked(x, z));
    hTx = x;
    hTz = z;
  }

  // Következő tevékenység véletlenszerűen, a jelenlegi idő után
  function hChooseNext(now) {
    var r = Math.random();
    if (r < 0.35) { hMode = 'walk'; hPickTarget(); hUntil = now + 10; }
    else if (r < 0.55) { hMode = 'eat'; hUntil = now + 6; }
    else if (r < 0.8) { hMode = 'wheel'; hUntil = now + 7; }
    else if (r < 0.92) { hMode = 'groom'; hUntil = now + 5; }
    else { hMode = 'idle'; hUntil = now + 3; }
  }

  function hDist(tx, tz) {
    return Math.hypot(tx - hamster.position.x, tz - hamster.position.z);
  }

  // Egy lépés a cél felé; a visszaadott érték a járás fel-le mozgása
  function hStepTo(tx, tz, now, dt) {
    var dx = tx - hamster.position.x, dz = tz - hamster.position.z;
    var d = Math.sqrt(dx * dx + dz * dz);
    if (d < 0.004) return 0;
    var s = Math.min(d, 0.12 * dt);
    hamster.position.x += dx / d * s;
    hamster.position.z += dz / d * s;
    hamster.rotation.y = Math.atan2(dx, dz);
    return Math.abs(Math.sin(now * 16)) * 0.004;
  }

  // Fejmozgás: ritka fordulások, megállások közöttük, és szimatolás (nem folyamatos rázás)
  var hLook = { yaw: 0, pitch: 0, tYaw: 0, tPitch: 0, next: 0, sniffUntil: 0, sniffing: false };
  function hLookUpdate(now, dt) {
    if (now >= hLook.next) {
      if (Math.random() < 0.25) {
        // Szimatolás: lefelé dőlve, apró rángatásokkal
        hLook.sniffUntil = now + 0.8 + Math.random() * 0.6;
        hLook.tYaw = (Math.random() * 2 - 1) * 0.25;
        hLook.tPitch = 0.25;
        hLook.next = hLook.sniffUntil;
      } else {
        // Fordulás egy irányba, aztán egy kicsit megáll
        hLook.tYaw = (Math.random() * 2 - 1) * 0.7;
        hLook.tPitch = Math.random() * 0.15 - 0.03;
        hLook.next = now + 1.2 + Math.random() * 2.5;
      }
    }
    var k = 1 - Math.exp(-dt * 9);   // gyors, de nem azonnali fordulás
    hLook.yaw += (hLook.tYaw - hLook.yaw) * k;
    hLook.pitch += (hLook.tPitch - hLook.pitch) * k;
    hLook.sniffing = now < hLook.sniffUntil;
  }

  function hUpdate(now, dt) {
    if (now >= hUntil) hChooseNext(now);
    hLookUpdate(now, dt);
    var bob = 0;
    var yaw = hLook.yaw;
    // Légzéssel együtt mozgó fej, szimatolás közben apró rángatással
    var headX = hLook.pitch + Math.sin(now * 2.2) * 0.01 + (hLook.sniffing ? Math.sin(now * 28) * 0.02 : 0);
    var headZ = 0;

    if (hMode === 'walk') {
      bob = hStepTo(hTx, hTz, now, dt);
      if (hDist(hTx, hTz) < 0.01) hUntil = now;   // célba ért: következő tevékenység
    } else if (hMode === 'eat') {
      if (hDist(EAT.x, EAT.z) > 0.01) {
        bob = hStepTo(EAT.x, EAT.z, now, dt);
      } else {
        hamster.rotation.y = Math.PI;               // a tál felé néz, a tál előtt áll
        yaw = 0;
        headX = 0.7 + Math.sin(now * 14) * 0.08;   // a tálba hajol és rágcsál
      }
    } else if (hMode === 'wheel') {
      if (hDist(WHEEL.x, WHEEL.z) > 0.01) {
        bob = hStepTo(WHEEL.x, WHEEL.z, now, dt);
      } else {
        hamster.rotation.y = 0;
        yaw = 0;
        bob = Math.abs(Math.sin(now * 18)) * 0.004;   // fut a kerékben
      }
      hSpin += dt * 9;
      wheelGroup.rotation.z = hSpin;
    } else if (hMode === 'groom') {
      yaw = 0;
      headX = 0.3 + Math.sin(now * 3.5) * 0.06;
      headZ = Math.max(0, Math.sin(now * 2.2)) * 0.2;   // mosakodik: lassú, ritmusos dörzsölés
    }

    // A kerékben a hörcsög a kerék alján fut (magasabbra emelkedik), egyébként a talajon
    var inWheel = hMode === 'wheel' && hDist(WHEEL.x, WHEEL.z) <= 0.01;
    hBaseY += ((inWheel ? WHEEL_RUN_Y : HAMSTER_Y) - hBaseY) * (1 - Math.exp(-dt * 6));
    hamster.position.y = hBaseY + bob;
    hHead.rotation.set(headX, yaw, headZ);
  }

  // ---- Fények ----
  // Meleg, egyenletes alapfény: nyugodt szobai hangulat
  scene.add(new THREE.AmbientLight(0xffe2b8, 0.36));

  // Meleg fény a távoli lámpából (árnyékot is vet)
  var lampLight = new THREE.PointLight(0xffc07a, 2.8, 7, 2);
  lampLight.position.set(1.45, 1.1, -2.6);
  lampLight.castShadow = true;
  lampLight.shadow.mapSize.set(512, 512);
  scene.add(lampLight);

  // A képernyő kék fénye az asztalra
  var screenLight = new THREE.PointLight(0x7fd6ff, 0, 1.2, 2);   // kezdetben kikapcsolt
  screenLight.position.set(0, 0.95, 0.05);
  scene.add(screenLight);

  // ---- A játék képernyője: CSS 3D (a játék iframe-je a képernyő síkjára kerül) ----
  // A CSS3DRenderer 1 egységet 1 pixelnek vesz, ezért a jelenetet 1000-szeresre nagyítjuk
  // (1 m = 1000 egység), a kamerát is. Így a perspektíva megegyezik a WebGL-lel.
  var CSS_SCALE = 1000;
  var cssRenderer = new THREE.CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.domElement.style.position = 'absolute';
  cssRenderer.domElement.style.top = '0';
  cssRenderer.domElement.style.left = '0';
  cssRenderer.domElement.style.pointerEvents = 'none';   // a WebGL-réteg kapja a kattintást
  stage.appendChild(cssRenderer.domElement);

  // 760 px = a képernyő szélessége (1 px = 1 mm): így a szöveg nagyobb a képernyőn
  var GAME_W = 760;                                        // az iframe szélessége px-ben
  var GAME_H = Math.round(GAME_W * SCREEN_H / SCREEN_W);   // ugyanaz az arány, mint a képernyő

  var gameFrame = document.createElement('iframe');
  gameFrame.src = 'kepernyo.html?embed=1';
  gameFrame.title = 'Nyomozós játék';
  gameFrame.style.width = GAME_W + 'px';
  gameFrame.style.height = GAME_H + 'px';
  gameFrame.style.border = '0';
  gameFrame.style.background = '#000';
  gameFrame.style.pointerEvents = 'auto';                  // a játék saját elemei kapják a kattintást
  var gameObj = new THREE.CSS3DObject(gameFrame);
  // GAME_W px = SCREEN_W * CSS_SCALE egység
  var cssS = SCREEN_W * CSS_SCALE / GAME_W;
  gameObj.scale.set(cssS, cssS, 1);
  // A képernyő közepe a világban, a sík kissé előtt (a keret takarja a szélét)
  mon.updateMatrixWorld(true);
  gameObj.position.copy(new THREE.Vector3(0, 0.3, 0.033).applyMatrix4(mon.matrixWorld).multiplyScalar(CSS_SCALE));
  var cssScene = new THREE.Scene();
  cssScene.add(gameObj);
  var cssCam = new THREE.PerspectiveCamera(camera.fov, camera.aspect, 1, 100000);

  // ---- Kijelölhető elemek ----
  var pickables = frameParts.concat([tube, screen, keyboard, deskTopMesh(), powerBtn]);

  function deskTopMesh() {
    return desk.children[0];
  }

  // Kattintás: sugárkövetés (raycast) a kijelölhető elemekre
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  var canvas = renderer.domElement;

  canvas.addEventListener('pointerdown', function (e) {
    var r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var hits = raycaster.intersectObjects(pickables, false);
    if (hits.length) {
      if (hits[0].object === powerBtn) {
        // Gombnyomás: a gomb egy pillanatra lenyomódik, és bekapcsol
        powerBtn.position.z = 0.03;
        setTimeout(function () { powerBtn.position.z = 0.036; }, 120);
        powerOn();
      } else if (hits[0].object === screen || frameParts.indexOf(hits[0].object) >= 0) {
        // A képernyőre kattintva a játék veszi át az egeret
        setGameMode(true);
      }
    }
  });

  // ---- Hörcsög hover: a neve a data.js config.hamster.name mezőből ----
  var tooltip = document.getElementById('tooltip');
  canvas.addEventListener('pointermove', function (e) {
    var r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var over = raycaster.intersectObject(hamster, true).length > 0;
    tooltip.hidden = !over;
    if (over) {
      tooltip.textContent = hamsterName;
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top = (e.clientY + 14) + 'px';
    }
    canvas.style.cursor = over ? 'help' : '';
  });

  // ---- Képernyő-sík adatai (kijelölés) ----
  // Visszaadja a sík négy sarkát világkoordinátában és képernyő-pixelben, valamint a normálvektort.
  function screenInfo() {
    screen.updateMatrixWorld(true);
    var hw = SCREEN_W / 2;
    var hh = SCREEN_H / 2;
    var local = [[-hw, hh], [hw, hh], [hw, -hh], [-hw, -hh]];
    var corners = local.map(function (c) {
      var world = new THREE.Vector3(c[0], c[1], 0).applyMatrix4(screen.matrixWorld);
      var p = world.clone().project(camera);
      return {
        world: world,
        px: {
          x: (p.x + 1) / 2 * window.innerWidth,
          y: (1 - p.y) / 2 * window.innerHeight
        }
      };
    });
    var normal = new THREE.Vector3(0, 0, 1).transformDirection(screen.matrixWorld);
    return { corners: corners, normal: normal };
  }

  // ---- Egér-vezérelt nézet ----
  // Két mód: 'nézet' (alapból): az egér forgatja a kamerát, a képernyő átlátszó az egérnek.
  // 'játék': a képernyőre kattintva az iframe kapja az egeret, a kamera megáll.
  // Vissza: ha az egér a képernyőről a kerethez (canvas) visszatér, újra 'nézet' lesz.
  var pointerTarget = { x: 0, y: 0 };
  var pointerCur = { x: 0, y: 0 };
  var gameMode = false;
  var focusAmt = 0;   // 0 = egérrel forgatott nézet, 1 = szembe a képernyővel (játék mód)

  function setGameMode(on) {
    gameMode = on;
    gameFrame.style.pointerEvents = on ? 'auto' : 'none';
  }
  setGameMode(false);

  // Játék módban az egér a kereten belül marad a játék módban; a keret elhagyásakor
  // visszatér a nézelődés. Nézelődés módban az egér mindenhol forgatja a kamerát.
  var frameHover = frameParts.concat([screen]);
  canvas.addEventListener('pointermove', function (e) {
    var r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    if (gameMode) {
      if (raycaster.intersectObjects(frameHover, false).length > 0) return;
      setGameMode(false);   // kiment a keretről: vissza nézelődés módba
    }

    pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointerTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // ---- Animáció ----
  var t0 = performance.now();
  function animate(now) {
    requestAnimationFrame(animate);
    var t = (now - t0) / 1000;

    // Az egér pozíciója sima átmenettel fordítja a kamerát (játék módban megáll)
    pointerCur.x += (pointerTarget.x - pointerCur.x) * 0.08;
    pointerCur.y += (pointerTarget.y - pointerCur.y) * 0.08;
    var yaw = pointerCur.x * 0.5;                    // balra-jobbra: ±0,5 rad
    var pitch = -0.16 - pointerCur.y * 0.45;         // fel-le: lefelé nézve az asztal látszik
    var dir = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      -Math.cos(yaw) * Math.cos(pitch)
    );
    // Játék módban a kamera egyenesen szembe áll a képernyővel, nézetmódban az egérrel forog
    focusAmt += ((gameMode ? 1 : 0) - focusAmt) * 0.06;
    var screenPos = screen.getWorldPosition(new THREE.Vector3());
    var focusPos = screenPos.clone().add(new THREE.Vector3(0, 0, 0.55));
    var mouseLook = camBase.clone().add(dir);
    camera.position.lerpVectors(camBase, focusPos, focusAmt);
    camera.lookAt(mouseLook.lerp(screenPos, focusAmt));

    // Kamu hörcsög: viselkedés, légzés, orrrángás
    hUpdate(t, Math.min(0.1, t - hLast));
    hLast = t;
    hBody.scale.y = 0.85 + Math.sin(t * 2.2) * 0.012;
    hNose.scale.setScalar(hLook.sniffing ? 1 + Math.max(0, Math.sin(t * 28)) * 0.3 : 1);   // orrrángás csak szimatoláskor

    // Finom CRT-villogás
    screenMat.emissiveIntensity = 0.85 + Math.sin(t * 37) * 0.02 + Math.sin(t * 1.3) * 0.02;

    renderer.render(scene, camera);

    // A CSS-réteg kamerája: ugyanaz a nézet, 1000-szeres léptékben
    cssCam.fov = camera.fov;
    cssCam.aspect = camera.aspect;
    cssCam.updateProjectionMatrix();
    cssCam.position.copy(camera.position).multiplyScalar(CSS_SCALE);
    cssCam.quaternion.copy(camera.quaternion);
    cssCam.updateMatrixWorld();
    cssRenderer.render(cssScene, cssCam);
  }
  requestAnimationFrame(animate);

  // ---- Átméretezés ----
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Hozzáférés a konzolból és a későbbi integrációhoz
  window.Monitor3D = {
    scene: scene,
    camera: camera,
    renderer: renderer,
    screen: screen,
    screenInfo: screenInfo
  };
})();
