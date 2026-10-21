/*
 * 3D monitor prototípus (Three.js r128).
 * Minden geometria kódból épül, nincs külső modellfájl. Textúrák canvas-ból készülnek.
 * A kijelölt képernyő-sík (screen) adatai a window.Monitor3D-n keresztül érhetők el.
 */
(function () {
  'use strict';

  // ---- Méretek (méterben) ----
  var SCREEN_W = 0.5;   // képernyő szélessége
  var SCREEN_H = 0.4;   // képernyő magassága

  var stage = document.getElementById('stage');
  var overlayPoly = document.getElementById('plane');
  var btnPlane = document.getElementById('btn-plane');
  var pickedEl = document.getElementById('picked');
  var infoEl = document.getElementById('info');

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
  scene.background = new THREE.Color(0x0a0908);
  scene.fog = new THREE.FogExp2(0x0a0908, 0.1);

  var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.05, 50);
  var camBase = new THREE.Vector3(0, 1.22, 0.95);   // közel a monitorhoz
  var lookAt = new THREE.Vector3(0, 0.9, -0.2);
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
  var screenTex = canvasTex(512, 400, function (g, w, h) {
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
  var floorMat = new THREE.MeshStandardMaterial({ color: 0x1d150f, roughness: 0.9 });
  var wallMat = new THREE.MeshStandardMaterial({ color: 0x241c15, roughness: 0.95 });
  var ledMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 1.2 });
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

  // open: true -> nyitott henger (lámpaernyő)
  function cyl(rt, rb, h, seg, mat, x, y, z, parent, open) {
    return addMesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, !!open), mat, x, y, z, parent);
  }

  // ---- Helyiség ----
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  var backWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), wallMat);
  backWall.position.set(0, 2, -3.2);
  backWall.receiveShadow = true;
  scene.add(backWall);

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
  mon.position.set(0, 0.77, -0.15);
  scene.add(mon);

  // Előlap (keret)
  var bezel = box(0.66, 0.56, 0.06, beige, 0, 0.28, 0, mon);
  bezel.name = 'Monitor-keret';

  // Hosszú, csonkakúpos "tubus" hátul: a szögletes CRT-test.
  // A 4 oldalú henger 45 fokos forgatással szögletes lesz, Rx(-90) után a hátsó vég kisebb.
  var tube = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.42, 0.42, 4, 1, false), beigeDark);
  tube.rotation.set(-Math.PI / 2, Math.PI / 4, 0);
  tube.position.set(0, 0.28, -0.21);
  tube.castShadow = true;
  tube.receiveShadow = true;
  tube.name = 'Tubus';
  mon.add(tube);

  // Képernyő (sík): ez a kijelölhető felület
  var screen = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), screenMat);
  screen.position.set(0, 0.28, 0.031);
  screen.name = 'Képernyő';
  mon.add(screen);

  // Üveg-réteg a képernyő előtt
  var glass = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), glassMat);
  glass.position.set(0, 0.28, 0.034);
  mon.add(glass);

  // Gombok és LED az előlap alján
  var knobA = cyl(0.018, 0.018, 0.02, 24, black, 0.22, 0.04, 0.035, mon);
  knobA.rotation.x = Math.PI / 2;
  knobA.name = 'Gomb';
  var knobB = cyl(0.018, 0.018, 0.02, 24, black, 0.27, 0.04, 0.035, mon);
  knobB.rotation.x = Math.PI / 2;
  knobB.name = 'Gomb';
  var led = box(0.02, 0.02, 0.01, ledMat, 0.13, 0.04, 0.036, mon);
  led.name = 'LED';

  // ---- Távoli asztal lámpával ----
  box(1.5, 0.05, 0.7, wood, 1.6, 0.725, -2.5);
  box(0.05, 0.7, 0.6, wood, 0.9, 0.35, -2.5);
  box(0.05, 0.7, 0.6, wood, 2.3, 0.35, -2.5);

  cyl(0.07, 0.07, 0.03, 24, black, 1.45, 0.765, -2.6);
  cyl(0.01, 0.01, 0.4, 8, black, 1.45, 0.97, -2.6);
  cyl(0.07, 0.13, 0.18, 24, shadeMat, 1.45, 1.2, -2.6, null, true);

  // ---- Fények ----
  // Hideg, halvány alapfény: sötét könyvtár
  scene.add(new THREE.AmbientLight(0x2a3142, 0.25));

  // Meleg fény a távoli lámpából (árnyékot is vet)
  var lampLight = new THREE.PointLight(0xffb36b, 3.2, 6, 2);
  lampLight.position.set(1.45, 1.1, -2.6);
  lampLight.castShadow = true;
  lampLight.shadow.mapSize.set(512, 512);
  scene.add(lampLight);

  // A képernyő kék fénye az asztalra
  var screenLight = new THREE.PointLight(0x7fd6ff, 0.35, 1.2, 2);
  screenLight.position.set(0, 0.95, 0.05);
  scene.add(screenLight);

  // ---- Kijelölhető elemek ----
  var pickables = [bezel, tube, screen, keyboard, deskTopMesh()];

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
      var h = hits[0];
      var name = h.object.name || 'Asztal';
      pickedEl.textContent = 'Kijelölt elem: ' + name +
        ' (távolság: ' + h.distance.toFixed(2) + ' m)';
    } else {
      pickedEl.textContent = '';
    }
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

  // A képernyő-sík körvonalának kirajzolása (SVG)
  var showPlane = false;
  btnPlane.addEventListener('click', function () {
    showPlane = !showPlane;
    btnPlane.textContent = showPlane ? 'Képernyő-sík elrejtése' : 'Képernyő-sík mutatása';
    overlayPoly.setAttribute('points', '');
    infoEl.textContent = '';
  });

  function updatePlaneOverlay() {
    var info = screenInfo();
    overlayPoly.setAttribute('points', info.corners.map(function (c) {
      return c.px.x.toFixed(1) + ',' + c.px.y.toFixed(1);
    }).join(' '));
    var n = info.normal;
    infoEl.textContent = 'Normálvektor: (' + n.x.toFixed(2) + ', ' + n.y.toFixed(2) + ', ' + n.z.toFixed(2) + ')';
  }

  // ---- Nézet: enyhe egérkövetés ----
  var pointer = { x: 0, y: 0 };
  window.addEventListener('pointermove', function (e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // ---- Animáció ----
  var t0 = performance.now();
  function animate(now) {
    requestAnimationFrame(animate);
    var t = (now - t0) / 1000;

    camera.position.set(
      camBase.x + pointer.x * 0.05,
      camBase.y - pointer.y * 0.03,
      camBase.z
    );
    camera.lookAt(lookAt);

    // Finom CRT-villogás
    screenMat.emissiveIntensity = 0.85 + Math.sin(t * 37) * 0.02 + Math.sin(t * 1.3) * 0.02;

    if (showPlane) updatePlaneOverlay();

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

  // ---- Átméretezés ----
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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
