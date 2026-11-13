/* Radar 3D cho hero — Three.js. Thoái lui êm nếu WebGL lỗi. */
(function () {
  var stage = document.getElementById('radar-stage');
  if (!stage || !window.THREE) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var scene = new THREE.Scene();
  var cam = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  cam.position.set(0, 5.2, 7.6);
  cam.lookAt(0, 0, 0);

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  } catch (e) { return; }
  renderer.setClearColor(0x000000, 0);
  stage.appendChild(renderer.domElement);

  var CYAN = new THREE.Color(0x4df0e0), GREEN = new THREE.Color(0x7cff6b);
  var group = new THREE.Group();
  group.rotation.x = -Math.PI / 2.35;
  scene.add(group);

  // vòng tròn đồng tâm
  for (var i = 1; i <= 4; i++) {
    var g = new THREE.RingGeometry(i - 0.012, i, 96);
    var m = new THREE.MeshBasicMaterial({ color: GREEN.clone().lerp(CYAN, i / 4), transparent: true, opacity: 0.28, side: THREE.DoubleSide });
    group.add(new THREE.Mesh(g, m));
  }
  // nan hoa
  for (var a = 0; a < 8; a++) {
    var ang = (a / 8) * Math.PI * 2;
    var pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(ang) * 4, Math.sin(ang) * 4, 0)];
    var lg = new THREE.BufferGeometry().setFromPoints(pts);
    group.add(new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0x2f6a5f, transparent: true, opacity: 0.4 })));
  }
  // tia quét (hình quạt gradient)
  var sweep = new THREE.Group();
  var sg = new THREE.CircleGeometry(4, 48, 0, Math.PI / 3.2);
  var sweepColors = [];
  var pos = sg.attributes.position;
  var cols = [];
  for (var v = 0; v < pos.count; v++) {
    var d = Math.hypot(pos.getX(v), pos.getY(v)) / 4;
    var c = CYAN.clone().lerp(GREEN, d);
    cols.push(c.r, c.g, c.b);
  }
  sg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  var sm = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.22, side: THREE.DoubleSide });
  sweep.add(new THREE.Mesh(sg, sm));
  // cạnh dẫn sáng
  var edge = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(4, 0, 0)]);
  sweep.add(new THREE.Line(edge, new THREE.LineBasicMaterial({ color: 0x7cff6b })));
  group.add(sweep);

  // các chấm thành viên
  var nodes = [];
  var defs = [[2.4, 0.5, GREEN], [-1.8, 1.9, CYAN], [1.2, -2.4, 0xff9f0a], [-2.6, -1.1, GREEN], [0.4, 2.7, 0xff453a], [-0.6, -0.4, CYAN]];
  defs.forEach(function (d) {
    var mesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20),
      new THREE.MeshBasicMaterial({ color: d[2] }));
    mesh.position.set(d[0], d[1], 0.05);
    group.add(mesh);
    var halo = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 20),
      new THREE.MeshBasicMaterial({ color: d[2], transparent: true, opacity: 0.18 }));
    halo.position.copy(mesh.position); group.add(halo);
    nodes.push(halo);
  });

  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); resize();

  var t = 0;
  function loop() {
    t += 0.016;
    sweep.rotation.z = -t * 0.9;
    group.rotation.z = Math.sin(t * 0.15) * 0.12;
    for (var i = 0; i < nodes.length; i++) {
      var s = 1 + Math.sin(t * 2 + i) * 0.18;
      nodes[i].scale.setScalar(s);
    }
    renderer.render(scene, cam);
    if (!reduce) requestAnimationFrame(loop);
  }
  loop();
  if (reduce) renderer.render(scene, cam);
})();
