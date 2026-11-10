/* der · die · das — banco de práctica generado de forma determinista. v1.0.0
   Tipos: art (elige el artículo), cual (¿Cuál está bien?), hor (escucha y elige), sort (ordena en las cajas). */
(function (g) {
  'use strict';
  var D = g.ARTIKEL_DATA, P = D.PLACES, ART = D.ART;
  var items = [];
  var HARD_W = 3; /* las palabras que se confunden fácilmente salen ~3 veces más en Practicar */
  function w(p) { return p.hard ? HARD_W : 1; }
  function ex(p) { return '<b>' + p.a + ' ' + p.n + '</b> = ' + p.es + '. 💡 ' + p.tip; }
  var byArt = { der: [], die: [], das: [] };
  P.forEach(function (p) { byArt[p.a].push(p); });

  P.forEach(function (p, idx) {
    // 1. Elige el artículo (con dibujo)
    items.push({ id: 'art-' + p.n, kind: 'mc', type: 'art', topic: p.a, noun: p.n, w: w(p), fast: true,
      q: '¿Qué artículo va?', pic: p.i, de: '___ ' + p.n, o: ART.slice(), a: p.a, say: p.a + ' ' + p.n,
      help: p.n + ' = ' + p.es + '.', e: ex(p) });
    // 2. ¿Cuál está bien?
    items.push({ id: 'cual-' + p.n, kind: 'mc', type: 'cual', topic: p.a, noun: p.n, w: w(p), fast: true,
      q: '¿Cuál está bien?', pic: p.i, o: ART.map(function (a) { return a + ' ' + p.n; }), a: p.a + ' ' + p.n, say: p.a + ' ' + p.n,
      help: p.n + ' = ' + p.es + '.', e: ex(p) });
    // 3. Escucha y elige: una opción por artículo; solo una coincide con lo que se oye
    var o = ART.map(function (a) {
      if (a === p.a) return p.a + ' ' + p.n;
      var list = byArt[a], q = list[(idx * 5 + ART.indexOf(a) * 3) % list.length];
      return q.a + ' ' + q.n;
    });
    items.push({ id: 'hor-' + p.n, kind: 'mc', type: 'hor', topic: p.a, noun: p.n, w: w(p), fast: false, listen: true,
      q: '🎧 Escucha y elige lo que oíste.', o: o, a: p.a + ' ' + p.n, say: p.a + ' ' + p.n,
      help: 'Se oye: «' + p.a + ' ' + p.n + '» (' + p.es + ').', e: ex(p) });
  });

  // 4. Ordenar en las cajas DER / DIE / DAS (como la hoja): 9 rondas de 6 palabras (2 de cada artículo).
  //    Las 27 palabras salen al menos una vez; las que se confunden fácilmente, al menos dos. Nunca se repite una palabra en la misma ronda.
  var SORT_N = 9, SEQ = {};
  ART.forEach(function (a) {
    /* 18 casillas por artículo: primero todas sus palabras, luego otra vez (primero las que se confunden fácilmente) */
    var L = byArt[a], again = L.filter(function (p) { return p.hard; }).concat(L.filter(function (p) { return !p.hard; }));
    var seq = L.map(function (p) { return p.n; }), k = 0;
    while (seq.length < SORT_N * 2) { seq.push(again[k % again.length].n); k++; }
    SEQ[a] = seq;
  });
  for (var s = 0; s < SORT_N; s++) {
    var words = [];
    ART.forEach(function (a) { words.push(SEQ[a][s * 2], SEQ[a][s * 2 + 1]); });
    var hasHard = words.some(function (n) { return D.place(n).hard; });
    items.push({ id: 'sort-' + (s + 1), kind: 'sort', type: 'sort', topic: 'mix', w: hasHard ? 2 : 1, fast: false,
      q: 'Ordena en las cajas: toca una palabra y luego su caja.', words: words,
      a: words.map(function (n) { return D.place(n).a; }),
      help: 'der = caja azul · die = caja roja · das = caja verde.',
      e: words.map(function (n) { var p = D.place(n); return p.a + ' ' + p.n; }).join(' · ') });
  }
  g.ARTIKEL_BANK = { items: items, HARD_W: HARD_W };
})(typeof window !== 'undefined' ? window : globalThis);
