/* der · die · das — banco de práctica generado de forma determinista. v1.0.1
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
    // 3. Escucha y elige (v1.0.1, N3): el mismo sustantivo con der / die / das; hay que oír el artículo
    items.push({ id: 'hor-' + p.n, kind: 'mc', type: 'hor', topic: p.a, noun: p.n, w: w(p), fast: false, listen: true,
      q: '🎧 Escucha y elige lo que oíste.', o: ART.map(function (a) { return a + ' ' + p.n; }), a: p.a + ' ' + p.n, say: p.a + ' ' + p.n,
      help: 'Se oye: «' + p.a + ' ' + p.n + '» (' + p.es + ').', e: ex(p) });
  });

  // 4. Ordenar en las cajas DER / DIE / DAS (como la hoja): 9 rondas de 6 palabras.
  //    v1.0.1 (N7): el reparto por artículo cambia de ronda en ronda (no siempre 2-2-2), así las últimas no se deducen;
  //    cada ronda tiene al menos una de cada artículo, y cada una de las 27 palabras sale exactamente 2 veces.
  var SORT_N = 9;
  var SPLIT = { der: [3, 2, 1, 3, 2, 3, 2, 3, 1], die: [2, 3, 2, 1, 3, 1, 2, 2, 2], das: [1, 1, 3, 2, 1, 2, 2, 1, 3] };
  var SEQ = {}, POS = { der: 0, die: 0, das: 0 };
  ART.forEach(function (a) {
    /* dos pasadas: la segunda empieza a la mitad de la lista, para variar las parejas y no repetir palabra en una ronda */
    var L = byArt[a].map(function (p) { return p.n; }), h = Math.floor(L.length / 2);
    SEQ[a] = L.concat(L.slice(h), L.slice(0, h));
  });
  for (var s = 0; s < SORT_N; s++) {
    var words = [];
    ART.forEach(function (a) { for (var j = 0; j < SPLIT[a][s]; j++) words.push(SEQ[a][POS[a]++]); });
    var hasHard = words.some(function (n) { return D.place(n).hard; });
    items.push({ id: 'sort-' + (s + 1), kind: 'sort', type: 'sort', topic: 'mix', w: hasHard ? 2 : 1, fast: false,
      q: 'Ordena en las cajas: toca una palabra y luego su caja.', words: words,
      a: words.map(function (n) { return D.place(n).a; }),
      help: 'der = caja azul · die = caja roja · das = caja verde.',
      e: words.map(function (n) { var p = D.place(n); return p.a + ' ' + p.n; }).join(' · ') });
  }
  g.ARTIKEL_BANK = { items: items, HARD_W: HARD_W };
})(typeof window !== 'undefined' ? window : globalThis);
