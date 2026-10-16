/* CTekAI hero: a Texas brick ranch frames itself up in blueprint linework, then the selected
   trade installs its system in yellow. Needs THREE (r128) loaded first.
   Markup hooks: [data-hero] (optional data-lock="roofing"), #stageWrap, #stage, .trades buttons,
   #co0-2 callouts, #L0-2 leader groups, #status, #progress, #replay. */
(function () {
  var hero = document.querySelector('[data-hero]');
  var wrap = document.getElementById('stageWrap'), stage = document.getElementById('stage');
  if (!hero || !wrap || !stage) return;
  var lock = hero.getAttribute('data-lock');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fail() { wrap.classList.add('no3d'); }
  if (!window.THREE) return fail();
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return fail(); }
  var T = THREE;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(1.75, window.devicePixelRatio || 1));
  stage.insertBefore(renderer.domElement, stage.firstChild);

  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(30, 1, 0.1, 300);
  var C = { line: 0xF1F6FF, fill: 0x2B6CB8, hi: 0xFFE14D, grid: 0x9CC3FF };

  /* ---------- helpers ---------- */
  function lm(op, color) { return new T.LineBasicMaterial({ color: color || C.line, transparent: true, opacity: op }); }
  function fm(op, color) { return new T.MeshBasicMaterial({ color: color || C.fill, transparent: true, opacity: op, side: T.DoubleSide, depthWrite: false }); }
  function outlined(geom, lineOp, fillOp, color) {
    var g = new T.Group();
    if (fillOp) g.add(new T.Mesh(geom, fm(fillOp, color === C.hi ? C.hi : undefined)));
    g.add(new T.LineSegments(new T.EdgesGeometry(geom), lm(lineOp, color)));
    return g;
  }
  function segs(pts, op, color) {
    var g = new T.BufferGeometry().setFromPoints(pts.map(function (p) { return new T.Vector3(p[0], p[1], p[2]); }));
    return new T.LineSegments(g, lm(op, color));
  }
  function poly(pts) { var out = []; for (var i = 0; i < pts.length - 1; i++) out.push(pts[i], pts[i + 1]); return out; }
  function path(pts, op, color) {
    var P = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var a = new T.Vector3().fromArray(pts[i]), b = new T.Vector3().fromArray(pts[i + 1]), n = Math.max(1, Math.ceil(a.distanceTo(b) / .06));
      for (var j = 0; j < n; j++) P.push(a.clone().lerp(b, j / n));
    }
    P.push(new T.Vector3().fromArray(pts[pts.length - 1]));
    var line = new T.Line(new T.BufferGeometry().setFromPoints(P), lm(op, color || C.hi));
    line.userData.count = P.length; line.geometry.setDrawRange(0, 0);
    return line;
  }
  function reveal(line, p) { line.geometry.setDrawRange(0, Math.round(p * line.userData.count)); line.visible = p > 0; }
  function setOp(obj, k) {
    obj.traverse(function (o) {
      if (!o.material) return;
      if (o.userData.base === undefined) o.userData.base = o.material.opacity;
      o.material.opacity = o.userData.base * k; o.visible = k > 0.002;
    });
  }
  function grow(obj, axis, p) { obj.scale[axis] = Math.max(.001, p); setOp(obj, p > 0 ? 1 : 0); }
  function ease(p) { return 1 - Math.pow(1 - p, 3); }
  function quad(a, b, c, d) { var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute([].concat(a, b, c, a, c, d), 3)); return g; }
  function tri(a, b, c) { var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute([].concat(a, b, c), 3)); return g; }
  function boxAt(w, h, d, x, y, z, lineOp, fillOp, color) { var g = new T.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); var o = outlined(g, lineOp, fillOp, color); o.position.set(x, y, z); return o; }

  /* ---------- dimensions: Texas brick ranch ---------- */
  var FL = .25, WH = 2.6, TOP = FL + WH, E = 2.95;
  var MX = 4, MZ = 2.5;
  var OX = 4.3, OZ = 2.8, HR = 1.5, RID = OX - OZ;
  var GX0 = -4, GX1 = -.8, GZ0 = MZ, GZ1 = 4.3;
  var GCX = (GX0 + GX1) / 2, GR = 1.0, GZB = .95;

  var parts = [];
  function part(start, dur, fn) { parts.push({ s: start, d: dur, fn: fn }); }
  var house = new T.Group(); scene.add(house);

  var grid = new T.GridHelper(26, 52, C.grid, C.grid); grid.material.transparent = true; grid.material.opacity = .18; scene.add(grid);
  part(0, .5, function (p) { setOp(grid, p); });

  var slabs = new T.Group();
  slabs.add(boxAt(MX * 2 + .3, FL, MZ * 2 + .3, 0, 0, 0, .95, .28));
  slabs.add(boxAt(GX1 - GX0 + .3, FL, GZ1 - GZ0 + .15, GCX, 0, (GZ0 + GZ1) / 2 + .07, .95, .28));
  slabs.add(boxAt(3.2, .12, 1.7, 2, 0, -MZ - .85, .7, .15));
  slabs.add(boxAt(GX1 - GX0 - .2, .05, 3.2, GCX, 0, GZ1 + 1.75, .5, .08));
  house.add(slabs);
  part(.3, .5, function (p) { grow(slabs, 'y', p); });

  var studPos = [], x, z;
  for (x = GX1; x <= MX + .001; x += .5) studPos.push([x, MZ]);
  for (z = GZ0 + .45; z <= GZ1 + .001; z += .45) studPos.push([GX1, z]);
  [GX1, GX1 - .3, GX0 + .3, GX0].forEach(function (gx) { studPos.push([gx, GZ1]); });
  for (z = GZ1 - .45; z >= GZ0 + .4; z -= .45) studPos.push([GX0, z]);
  for (z = MZ - .5; z >= -MZ + .001; z -= .5) studPos.push([MX, z]);
  for (x = MX - .5; x >= -MX - .001; x -= .5) studPos.push([x, -MZ]);
  for (z = -MZ + .5; z <= MZ + .001; z += .5) studPos.push([-MX, z]);
  var studG = new T.BoxGeometry(.08, WH, .08); studG.translate(0, WH / 2, 0);
  studPos.forEach(function (sp, i) {
    var s = outlined(studG, .85, 0); s.position.set(sp[0], FL, sp[1]); house.add(s);
    part(.8 + i * .017, .3, function (p) { grow(s, 'y', p); });
  });

  var plates = segs([].concat(
    poly([[-MX, TOP, -MZ], [MX, TOP, -MZ], [MX, TOP, MZ], [-MX, TOP, MZ], [-MX, TOP, -MZ]]),
    poly([[GX0, TOP, GZ0], [GX0, TOP, GZ1], [GX1, TOP, GZ1], [GX1, TOP, GZ0]])), .95);
  house.add(plates); part(2.0, .35, function (p) { setOp(plates, p); });

  var walls = new T.Group();
  function wallFill(w, x, z, ry) { var m = new T.Mesh(new T.PlaneGeometry(w, WH), fm(.17)); m.position.set(x, FL + WH / 2, z); m.rotation.y = ry; walls.add(m); }
  wallFill(MX * 2, 0, MZ, 0); wallFill(MX * 2, 0, -MZ, 0); wallFill(MZ * 2, MX, 0, Math.PI / 2); wallFill(MZ * 2, -MX, 0, Math.PI / 2);
  wallFill(GX1 - GX0, GCX, GZ1, 0); wallFill(GZ1 - GZ0, GX0, (GZ0 + GZ1) / 2, Math.PI / 2); wallFill(GZ1 - GZ0, GX1, (GZ0 + GZ1) / 2, Math.PI / 2);
  house.add(walls); part(2.3, .45, function (p) { setOp(walls, p); });

  function courses(axis, fixed, a0, a1, holes) {
    var out = [];
    for (var y = FL + .2; y < TOP - .05; y += .2) {
      var cuts = holes.filter(function (h) { return y > h[2] && y < h[3]; }).sort(function (p, q) { return p[0] - q[0]; });
      var s = a0;
      cuts.concat([[a1, a1]]).forEach(function (h) {
        var e = Math.min(h[0], a1);
        if (e - s > .05) out.push(axis === 'x' ? [s, y, fixed] : [fixed, y, s], axis === 'x' ? [e, y, fixed] : [fixed, y, e]);
        s = Math.max(s, h[1]);
      });
    }
    return out;
  }
  var WIN = [[1.55, 2.45, 1.15, 2.3], [2.85, 3.75, 1.15, 2.3]], DOOR = [-.3, 1.0, FL, 2.35], GDOOR = [-3.75, -1.05, FL, 2.25];
  var brick = segs([].concat(
    courses('x', MZ + .02, GX1, MX, WIN.concat([DOOR])),
    courses('x', GZ1 + .02, GX0, GX1, [GDOOR]),
    courses('z', GX0 - .02, GZ0, GZ1, []),
    courses('z', GX1 + .02, GZ0, GZ1, []),
    courses('z', MX + .02, -MZ, MZ, [[-.5, .5, 1.15, 2.3]]),
    courses('z', -MX - .02, -MZ, GZ0 - .01, [[-1, 0, 1.15, 2.3]])), .2);
  house.add(brick); part(2.45, .5, function (p) { setOp(brick, p); });

  var openings = new T.Group();
  function rectXY(x0, x1, y0, y1, z) { return [[x0, y0, z], [x1, y0, z], [x1, y0, z], [x1, y1, z], [x1, y1, z], [x0, y1, z], [x0, y1, z], [x0, y0, z]]; }
  function rectZY(z0, z1, y0, y1, x) { return [[x, y0, z0], [x, y0, z1], [x, y0, z1], [x, y1, z1], [x, y1, z1], [x, y1, z0], [x, y1, z0], [x, y0, z0]]; }
  var op = [];
  WIN.forEach(function (w) { var mx = (w[0] + w[1]) / 2; op = op.concat(rectXY(w[0], w[1], w[2], w[3], MZ + .03), [[mx, w[2], MZ + .03], [mx, w[3], MZ + .03]], rectXY(w[0] - .12, w[0], w[2], w[3], MZ + .03), rectXY(w[1], w[1] + .12, w[2], w[3], MZ + .03)); });
  op = op.concat(rectXY(-.05, .75, FL, 2.25, MZ + .03), rectXY(-.28, -.1, FL + .2, 2.25, MZ + .03), [[-.05, 2.35, MZ + .03], [.75, 2.35, MZ + .03]]);
  op = op.concat(rectXY(GDOOR[0], GDOOR[1], GDOOR[2], GDOOR[3], GZ1 + .03));
  for (var gp = 1; gp <= 3; gp++) { var gy = FL + (GDOOR[3] - FL) * gp / 4; op.push([GDOOR[0], gy, GZ1 + .03], [GDOOR[1], gy, GZ1 + .03]); }
  op = op.concat(rectZY(-.5, .5, 1.15, 2.3, MX + .03), rectZY(-1, 0, 1.15, 2.3, -MX - .03));
  openings.add(segs(op, 1));
  [-.55, 1.25].forEach(function (cx) { openings.add(boxAt(.18, WH, .18, cx, FL, MZ + 1, .95, 0)); });
  openings.add(segs([[-.7, TOP - .1, MZ + 1], [1.4, TOP - .1, MZ + 1]], 1));
  [.6, 3.4].forEach(function (px) { openings.add(boxAt(.16, 2.45, .16, px, .12, -MZ - 1.6, .9, 0)); });
  openings.add(segs([[.4, 2.6, -MZ - 1.6], [3.6, 2.6, -MZ - 1.6]], .9));
  house.add(openings); part(2.6, .45, function (p) { setOp(openings, p); });

  var raf = [];
  function hipPt(sx, sz, s) { return [sx * (OX - OZ * s), E + HR * s, sz * OZ * (1 - s)]; }
  for (x = -RID; x <= RID + .001; x += .5) { raf.push([[x, E, OZ], [x, E + HR, 0]]); raf.push([[x, E, -OZ], [x, E + HR, 0]]); }
  [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sz) { raf.push([[sx * OX, E, sz * OZ], [sx * RID, E + HR, 0]]); }); });
  [.6, 1.2, 1.8, 2.4].forEach(function (d) {
    [-1, 1].forEach(function (sx) {
      [-1, 1].forEach(function (sz) {
        raf.push([[sx * OX, E, sz * d], hipPt(sx, sz, 1 - d / OZ)]);
        raf.push([[sx * (OX - d), E, sz * OZ], hipPt(sx, sz, d / OZ)]);
      });
    });
  });
  for (z = GZ1 + .25; z >= GZB; z -= .5) raf.push([[GX0 - .2, E, z], [GCX, E + GR, z], [GCX, E + GR, z], [GX1 + .2, E, z]]);
  raf.sort(function (a, b) { return a[0][0] - b[0][0]; });
  raf.forEach(function (r, i) {
    var l = segs(r, .75); house.add(l);
    part(2.85 + i * .016, .35, function (p) { l.position.y = (1 - p) * 1.2; setOp(l, p); });
  });

  var roof = new T.Group();
  var c = [[-OX, E, OZ], [OX, E, OZ], [OX, E, -OZ], [-OX, E, -OZ]], r0 = [-RID, E + HR, 0], r1 = [RID, E + HR, 0];
  roof.add(new T.Mesh(quad(c[0], c[1], r1, r0), fm(.3)));
  roof.add(new T.Mesh(quad(c[2], c[3], r0, r1), fm(.3)));
  roof.add(new T.Mesh(tri(c[1], c[2], r1), fm(.26)));
  roof.add(new T.Mesh(tri(c[3], c[0], r0), fm(.26)));
  roof.add(segs([].concat(poly([c[0], c[1], c[2], c[3], c[0]]), [c[0], r0, c[3], r0, c[1], r1, c[2], r1, r0, r1]), 1));
  var gL = [GX0 - .2, E, GZ1 + .25], gR = [GX1 + .2, E, GZ1 + .25], gT = [GCX, E + GR, GZ1 + .25];
  var gLb = [GX0 - .2, E, GZB], gRb = [GX1 + .2, E, GZB], gTb = [GCX, E + GR, GZB];
  roof.add(new T.Mesh(quad(gL, gT, gTb, gLb), fm(.32)));
  roof.add(new T.Mesh(quad(gR, gT, gTb, gRb), fm(.32)));
  roof.add(new T.Mesh(tri([GX0, TOP, GZ1 + .02], [GX1, TOP, GZ1 + .02], [GCX, E + GR - .08, GZ1 + .02]), fm(.22)));
  roof.add(segs([gL, gT, gT, gR, gL, gLb, gR, gRb, gT, gTb], 1));
  var pL = [-.75, E - .05, MZ + 1.15], pR = [1.45, E - .05, MZ + 1.15], pT = [.35, E + .75, MZ + 1.15], pTb = [.35, E + .75, MZ + .2];
  roof.add(new T.Mesh(quad(pL, pT, pTb, [-.75, E - .05, MZ + .2]), fm(.3)));
  roof.add(new T.Mesh(quad(pR, pT, pTb, [1.45, E - .05, MZ + .2]), fm(.3)));
  roof.add(segs([pL, pT, pT, pR, pL, pR, pT, pTb], 1));
  roof.add(new T.Mesh(quad([.4, E, -OZ], [3.6, E, -OZ], [3.6, 2.68, -MZ - 1.8], [.4, 2.68, -MZ - 1.8]), fm(.26)));
  roof.add(segs(poly([[.4, E, -OZ], [.4, 2.68, -MZ - 1.8], [3.6, 2.68, -MZ - 1.8], [3.6, E, -OZ]]), .95));
  house.add(roof);
  part(4.2, .5, function (p) { setOp(roof, p); roof.position.y = (1 - p) * .3; });

  var star = [];
  for (var k = 0; k <= 10; k++) { var ang = Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? .12 : .3; star.push([GCX + Math.cos(ang) * rr, E + .42 + Math.sin(ang) * rr, GZ1 + .05]); }
  var starL = segs(poly(star), 1); house.add(starL);
  part(4.6, .3, function (p) { setOp(starL, p); });
  var BUILD_END = 4.8;

  /* ---------- trade installs (yellow) ---------- */
  var TR = {};
  function trade(key, cfg) { cfg.group = new T.Group(); cfg.parts = []; cfg.dur = 0; scene.add(cfg.group); TR[key] = cfg; return cfg; }
  function tp(tr, s, d, fn) { tr.parts.push({ s: s, d: d, fn: fn }); tr.dur = Math.max(tr.dur, s + d); }
  function add(tr, obj) { tr.group.add(obj); return obj; }

  var roofing = trade('roofing', { pin: [2.2, E + HR * .45, OZ * .55], aim: .62,
    lead: 'Hail damage form · 9:47 PM', cb: 'in 0:00:23', book: 'Inspection Thu 9:00 AM', what: 'shingles + ridge cap' });
  var drip = add(roofing, path([[-OX, E - .05, OZ + .01], [OX, E - .05, OZ + .01], [OX, E - .05, -OZ - .01], [-OX, E - .05, -OZ - .01], [-OX, E - .05, OZ + .01]], 1));
  tp(roofing, 0, .45, function (p) { reveal(drip, p); });
  for (var kk = 1; kk <= 7; kk++) (function (k) {
    var f = k / 8, hx = OX - OZ * f, hz = OZ * (1 - f), y = E + HR * f + .02;
    var ring = add(roofing, path([[-hx, y, hz], [hx, y, hz], [hx, y, -hz], [-hx, y, -hz], [-hx, y, hz]], .95));
    tp(roofing, .25 + k * .12, .45, function (p) { reveal(ring, p); });
  })(kk);
  [GX0 - .2, GX1 + .2].forEach(function (ex) {
    for (var k = 1; k <= 4; k++) (function (k) {
      var f = k / 5, xx = ex + (GCX - ex) * f, y = E + GR * f + .02;
      var l = add(roofing, path([[xx, y, GZ1 + .25], [xx, y, GZB + .4]], .95));
      tp(roofing, .5 + k * .1, .35, function (p) { reveal(l, p); });
    })(k);
  });
  var caps = add(roofing, segs([r0, r1, c[0], r0, c[3], r0, c[1], r1, c[2], r1, gT, gTb], 1, C.hi));
  tp(roofing, 1.3, .35, function (p) { setOp(caps, p); });

  var hvac = trade('hvac', { pin: [5.1, .95, .3], aim: 1.0,
    lead: 'AC not cooling · 2:14 PM, 104°F', cb: 'in 0:00:19', book: 'Tech visit today 5:00 PM', what: 'condenser + ductwork' });
  var pad = add(hvac, boxAt(1.3, .08, 1.3, 5.1, 0, .3, .9, .3, C.hi));
  tp(hvac, 0, .25, function (p) { setOp(pad, p); });
  var cond = add(hvac, boxAt(1, .8, 1, 0, 0, 0, 1, .25, C.hi));
  var fanPts = []; for (var a = 0; a <= 32; a++) fanPts.push(new T.Vector3(Math.cos(a / 32 * 6.283) * .35, .81, Math.sin(a / 32 * 6.283) * .35));
  cond.add(new T.Line(new T.BufferGeometry().setFromPoints(fanPts), lm(1, C.hi)));
  cond.add(segs([[-.35, .81, 0], [.35, .81, 0], [0, .81, -.35], [0, .81, .35]], .9, C.hi));
  tp(hvac, .15, .45, function (p) { cond.position.set(5.1, .08 + (1 - p) * 2, .3); setOp(cond, p); });
  var lineset = add(hvac, path([[4.6, .55, .3], [MX + .05, .55, .3], [MX + .05, 3.1, .3], [.6, 3.1, 0]], 1));
  tp(hvac, .6, .6, function (p) { reveal(lineset, p); });
  var ah = add(hvac, boxAt(1.1, .5, .8, 0, E + .02, 0, 1, .3, C.hi));
  tp(hvac, 1.0, .3, function (p) { grow(ah, 'y', p); });
  var trunk = add(hvac, outlined(new T.BoxGeometry(6, .26, .34), 1, .2, C.hi)); trunk.position.set(0, E + .2, 0);
  tp(hvac, 1.2, .5, function (p) { grow(trunk, 'x', p); });
  [-2.6, -1, 1, 2.6].forEach(function (vx, i) {
    var sd = i % 2 ? 1 : -1;
    var run = add(hvac, path([[vx, E + .2, sd * .17], [vx, E + .2, sd * 1.5], [vx, TOP + .01, sd * 1.5]], .95));
    var vent = add(hvac, new T.LineSegments(new T.EdgesGeometry(new T.PlaneGeometry(.45, .3)), lm(1, C.hi)));
    vent.rotation.x = -Math.PI / 2; vent.position.set(vx, TOP - .01, sd * 1.5);
    tp(hvac, 1.6 + i * .12, .35, function (p) { reveal(run, p); });
    tp(hvac, 1.85 + i * .12, .2, function (p) { setOp(vent, p); });
  });

  var plumbing = trade('plumbing', { pin: [2.6, 1.05, 2.1], aim: .5,
    lead: 'Burst pipe, kitchen · 6:31 AM', cb: 'in 0:00:21', book: 'Plumber today 9:00 AM', what: 'water heater + supply lines' });
  var main = add(plumbing, path([[-7, .3, 3.9], [GX0 - .05, .3, 3.9], [-3.85, .3, 3.9]], 1));
  tp(plumbing, 0, .45, function (p) { reveal(main, p); });
  var whG = new T.CylinderGeometry(.3, .3, 1.25, 16); whG.translate(0, .625, 0);
  var wh = add(plumbing, outlined(whG, 1, .25, C.hi)); wh.position.set(-3.5, FL, 3.9);
  tp(plumbing, .35, .35, function (p) { grow(wh, 'y', p); });
  var hot = add(plumbing, path([[-3.5, 1.5, 3.9], [-3.5, 2.7, 3.9], [-3.5, 2.7, 1.8], [2.6, 2.7, 1.8], [2.6, 1.15, 1.8]], 1));
  var cold = add(plumbing, path([[-3.85, .3, 3.75], [-3.85, 2.6, 3.75], [-3.85, 2.6, 1.65], [2.45, 2.6, 1.65], [2.45, 1.15, 1.65]], .75, C.line));
  tp(plumbing, .7, .9, function (p) { reveal(hot, p); });
  tp(plumbing, .8, .9, function (p) { reveal(cold, p); });
  var sink = add(plumbing, boxAt(1.4, .9, .6, 2.6, FL, 2.05, 1, .2, C.hi));
  tp(plumbing, 1.5, .3, function (p) { grow(sink, 'y', p); });
  var shower = add(plumbing, path([[-1.5, 2.7, 1.8], [-1.5, 2.7, -2.1], [-1.5, 2.0, -2.1], [-1.2, 2.0, -2.1]], 1));
  tp(plumbing, 1.1, .5, function (p) { reveal(shower, p); });
  var drain = add(plumbing, path([[2.6, .55, 2.05], [2.6, .3, 2.05], [-.6, .3, 2.05], [-.6, .3, -MZ - .05], [-.6, .1, -6]], .6, C.line));
  tp(plumbing, 1.7, .6, function (p) { reveal(drain, p); });

  var electrical = trade('electrical', { pin: [MX + .1, 1.35, -1.2], aim: 1.1,
    lead: 'Breaker keeps tripping · 8:05 PM', cb: 'in 0:00:24', book: 'Electrician Fri 10:00 AM', what: 'panel + wiring' });
  var poleG = new T.CylinderGeometry(.08, .1, 4.6, 8); poleG.translate(0, 2.3, 0);
  var pole = add(electrical, outlined(poleG, .9, 0, C.hi)); pole.position.set(7.4, 0, -3.6);
  pole.add(segs([[0, 4.3, -.6], [0, 4.3, .6]], 1, C.hi));
  tp(electrical, 0, .4, function (p) { grow(pole, 'y', p); });
  var drop = add(electrical, path([[7.4, 4.3, -3.6], [6.2, 3.7, -2.7], [MX + .3, 3.35, -1.4], [MX + .05, 3.35, -1.2], [MX + .05, 1.6, -1.2]], 1));
  tp(electrical, .35, .6, function (p) { reveal(drop, p); });
  var panel = add(electrical, outlined(new T.BoxGeometry(.1, .6, .42), 1, .35, C.hi)); panel.position.set(MX + .07, 1.3, -1.2);
  tp(electrical, .9, .25, function (p) { setOp(panel, p); });
  var circ = add(electrical, path([[MX - .05, 1.6, -1.2], [MX - .3, 3.05, -1.2], [-3.4, 3.05, -1.2]], 1));
  tp(electrical, 1.1, .55, function (p) { reveal(circ, p); });
  var outl = add(electrical, path([[MX - .05, 1.05, -1.2], [MX - .08, .45, -1.2], [MX - .08, .45, MZ - .08], [-.6, .45, MZ - .08]], .8));
  tp(electrical, 1.15, .6, function (p) { reveal(outl, p); });
  [3.2, 1.3, -.2].forEach(function (ox, i) {
    var o = add(electrical, outlined(new T.BoxGeometry(.16, .22, .05), 1, .5, C.hi)); o.position.set(ox, .45, MZ - .07);
    tp(electrical, 1.55 + i * .08, .2, function (p) { setOp(o, p); });
  });
  [-2.6, 0, 2.6].forEach(function (lx, i) {
    var d = add(electrical, path([[lx, 3.05, -1.2], [lx, 3.05, .4], [lx, TOP, .4]], .9));
    var bulb = add(electrical, new T.Mesh(new T.SphereGeometry(.14, 12, 10), fm(.95, C.hi))); bulb.position.set(lx, TOP - .15, .4);
    var halo = add(electrical, new T.Mesh(new T.SphereGeometry(.42, 16, 12), fm(.12, C.hi))); halo.position.set(lx, TOP - .15, .4);
    tp(electrical, 1.6 + i * .12, .3, function (p) { reveal(d, p); });
    tp(electrical, 1.95 + i * .12, .25, function (p) { bulb.scale.setScalar(Math.max(.001, p)); setOp(bulb, p > 0 ? 1 : 0); halo.scale.setScalar(Math.max(.001, p)); setOp(halo, p); });
  });

  var pest = trade('pest', { pin: [MX + .7, .3, MZ + .7], aim: .72,
    lead: 'Termite swarm spotted · Sat 11 AM', cb: 'in 0:00:26', book: 'Inspection Mon 8:00 AM', what: 'perimeter barrier + bait stations' });
  var Ed = .7, outline = [[GX0 - Ed, GZ1 + Ed], [GX1 + Ed, GZ1 + Ed], [GX1 + Ed, MZ + Ed], [MX + Ed, MZ + Ed], [MX + Ed, -MZ - Ed], [-MX - Ed, -MZ - Ed], [GX0 - Ed, GZ1 + Ed]];
  var barrier = add(pest, path(outline.map(function (q) { return [q[0], .05, q[1]]; }), 1));
  tp(pest, 0, 1.2, function (p) { reveal(barrier, p); });
  var band = new T.Group();
  for (var bi = 0; bi < outline.length - 1; bi++) {
    var a0 = outline[bi], a1 = outline[bi + 1], len = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]);
    var m = new T.Mesh(new T.PlaneGeometry(len, .5), fm(.14, C.hi));
    m.rotation.order = 'YXZ'; m.rotation.y = -Math.atan2(a1[1] - a0[1], a1[0] - a0[0]); m.rotation.x = -Math.PI / 2;
    var nx = -(a1[1] - a0[1]) / len, nz = (a1[0] - a0[0]) / len;
    m.position.set((a0[0] + a1[0]) / 2 - nx * .3, .04, (a0[1] + a1[1]) / 2 - nz * .3); band.add(m);
  }
  add(pest, band); tp(pest, 1.0, .4, function (p) { setOp(band, p); });
  outline.slice(0, -1).concat([[0, MZ + Ed], [0, -MZ - Ed], [MX + Ed, 0]]).forEach(function (bs, i) {
    var b = add(pest, boxAt(.3, .18, .3, bs[0], .02, bs[1], 1, .45, C.hi));
    tp(pest, 1.2 + i * .07, .25, function (p) { b.scale.setScalar(Math.max(.001, p)); setOp(b, p > 0 ? 1 : 0); });
  });

  var ORDER = ['roofing', 'hvac', 'plumbing', 'electrical', 'pest'];
  ORDER.forEach(function (k) { TR[k].parts.forEach(function (pt) { pt.fn(0); }); });

  /* ---------- callouts ---------- */
  var co = [0, 1, 2].map(function (k) { return document.getElementById('co' + k); });
  var Ls = [0, 1, 2].map(function (k) { var g = document.getElementById('L' + k); return { g: g, line: g.querySelector('line'), dots: g.querySelectorAll('circle') }; });
  var fixedPins = [new T.Vector3(3.3, 1.75, MZ + .05), new T.Vector3(.35, 1.1, MZ + .05)];
  var rects = [];
  function measure() { rects = co.map(function (el) { return { l: el.offsetLeft, t: el.offsetTop, r: el.offsetLeft + el.offsetWidth, b: el.offsetTop + el.offsetHeight }; }); }

  /* ---------- state ---------- */
  var active = TR[lock] ? lock : 'roofing', prev = null, tradeAt = BUILD_END, prevAt = 0, auto = !reduce && !lock;
  var curAim = TR[active].aim;
  var statusEl = document.getElementById('status');
  var phases = [.3, .8, 2.85, BUILD_END, 5.6], phaseEls = document.querySelectorAll('#progress span');
  var t0 = performance.now(), W = 0, H = 0, v = new T.Vector3(), pinV = new T.Vector3();
  var NAMES = { roofing: 'Roofing', hvac: 'HVAC', plumbing: 'Plumbing', electrical: 'Electrical', pest: 'Pest control' };

  function nowT(now) { return reduce ? 99 : (now - t0) / 1000; }
  function setTexts() {
    var tr = TR[active];
    co[0].querySelector('.txt').textContent = tr.lead;
    co[1].querySelector('.txt').textContent = tr.cb;
    co[2].querySelector('.txt').textContent = tr.book;
    document.querySelectorAll('.trades button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-trade') === active ? 'true' : 'false'); });
    measure();
  }
  function activate(key, t) {
    if (key === active && t > tradeAt) return;
    if (active !== key) { prev = active; prevAt = t; if (reduce) { setOp(TR[prev].group, 0); prev = null; } }
    active = key; tradeAt = Math.max(t, BUILD_END);
    var tr = TR[key]; setOp(tr.group, 1); tr.parts.forEach(function (pt) { pt.fn(0); });
    setTexts();
  }
  document.querySelectorAll('.trades button').forEach(function (b) {
    b.addEventListener('click', function () { auto = false; activate(b.getAttribute('data-trade'), nowT(performance.now())); if (reduce) frame(performance.now()); });
  });

  function size() {
    var r = stage.getBoundingClientRect(); W = r.width; H = r.height;
    renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    measure();
  }

  function frame(now) {
    var t = nowT(now);
    parts.forEach(function (pt) { var p = Math.min(1, Math.max(0, (t - pt.s) / pt.d)); pt.fn(p > 0 ? ease(p) : 0); });
    if (auto && t > tradeAt + TR[active].dur + 4.5) activate(ORDER[(ORDER.indexOf(active) + 1) % ORDER.length], t);
    if (prev) { var k = 1 - (t - prevAt) / .45; if (k <= 0) { setOp(TR[prev].group, 0); prev = null; } else setOp(TR[prev].group, k); }
    var tr = TR[active], tt = reduce ? 99 : t - tradeAt;
    tr.parts.forEach(function (pt) { var p = Math.min(1, Math.max(0, (tt - pt.s) / pt.d)); pt.fn(p > 0 ? ease(p) : 0); });

    curAim += (tr.aim - curAim) * (reduce ? 1 : .035);
    var a = reduce ? curAim : curAim + Math.sin(t * .14) * .16, narrow = W < 560 ? 3 : 0, rad = 24 - 2.5 * ease(Math.min(1, t / 5)) + narrow;
    camera.position.set(Math.sin(a) * rad, 10.5 + narrow * .5, Math.cos(a) * rad);
    camera.lookAt(0, 1.2, .4);
    renderer.render(scene, camera);

    var installed = tt >= tr.dur * .85;
    pinV.fromArray(tr.pin);
    [pinV, fixedPins[0], fixedPins[1]].forEach(function (pt, k) {
      v.copy(pt).project(camera);
      var px = (v.x + 1) / 2 * W, py = (-v.y + 1) / 2 * H, R = rects[k];
      var ax = Math.min(Math.max(px, R.l), R.r), ay = Math.min(Math.max(py, R.t), R.b);
      Ls[k].line.setAttribute('x1', ax); Ls[k].line.setAttribute('y1', ay); Ls[k].line.setAttribute('x2', px); Ls[k].line.setAttribute('y2', py);
      Ls[k].dots.forEach(function (d) { d.setAttribute('cx', px); d.setAttribute('cy', py); });
      var show = t > 5.2 && (k > 0 ? t > 5.6 + k * .4 : installed);
      co[k].classList.toggle('off', !show); Ls[k].g.classList.toggle('off', !show);
    });

    if (statusEl) {
      if (t < BUILD_END) statusEl.textContent = 'Framing the house…';
      else statusEl.innerHTML = (installed ? 'Installed: ' : 'Installing: ') + '<b>' + NAMES[active] + '</b> · ' + tr.what;
    }
    var cur = -1; phases.forEach(function (ph, k) { if (t >= ph) cur = k; });
    phaseEls.forEach(function (el, k) { el.className = k < cur ? 'done' : (k === cur ? 'now' : ''); });
  }

  var rafId = 0, visible = true;
  function loop(n) { rafId = 0; if (!visible || document.hidden) return; frame(n); rafId = requestAnimationFrame(loop); }
  function kick() { if (!reduce && visible && !document.hidden && !rafId) rafId = requestAnimationFrame(loop); }
  size(); setTexts(); frame(performance.now());
  window.addEventListener('resize', function () { size(); frame(performance.now()); });
  document.addEventListener('visibilitychange', kick);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; kick(); }).observe(stage);
  kick();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  var replay = document.getElementById('replay');
  if (replay) replay.addEventListener('click', function () {
    t0 = performance.now();
    ORDER.forEach(function (k) { setOp(TR[k].group, k === active ? 1 : 0); TR[k].parts.forEach(function (pt) { pt.fn(0); }); });
    prev = null; tradeAt = BUILD_END;
    if (reduce) frame(performance.now()); else kick();
  });
})();
