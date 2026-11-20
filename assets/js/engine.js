/* der · die · das — lógica pura (sin DOM): puntaje, marca verde, selección ponderada sin repetir, cola del Desafío sin tiempo. v1.1.0 */
(function (g) {
  'use strict';
  var CK = 'aleman_check_artikel', BK = 'artikel_best', TOPICS = ['der', 'die', 'das'];
  /* v1.1.0: Desafío sin tiempo. Clave propia; nunca toca CK ni BK */
  var BK_UNTIMED = 'artikel_best_untimed', UNTIMED_N = 20;
  function qualifies(score, done) { return score >= 13 && done === score; }
  function getChecks(st) { try { var v = JSON.parse(st.getItem(CK) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  /* Guarda récord y marcas. Devuelve {record, granted, checks} */
  function applyChallenge(st, topics, score, done) {
    var out = { record: false, granted: false, checks: getChecks(st) };
    var best = +(st.getItem(BK) || 0);
    if (score > best) { st.setItem(BK, String(score)); out.record = true; }
    if (qualifies(score, done)) {
      (topics || []).forEach(function (t) { if (TOPICS.indexOf(t) >= 0 && out.checks.indexOf(t) < 0) out.checks.push(t); });
      st.setItem(CK, JSON.stringify(out.checks));
      out.granted = true;
    }
    return out;
  }
  /* v1.0.1 (A1): el Desafío usa siempre las 27 palabras (der, die y das juntos), así no se gana pulsando siempre el mismo artículo.
     Practicar: ítems de los artículos elegidos; las rondas de cajas (mezclan los tres) solo con los tres elegidos. */
  function pool(items, topics, chal) {
    if (chal) return items.filter(function (it) { return it.kind === 'mc' && it.fast === true; });
    var all3 = TOPICS.every(function (t) { return topics.indexOf(t) >= 0; });
    return items.filter(function (it) {
      if (it.topic === 'mix') return all3;
      return topics.indexOf(it.topic) >= 0;
    });
  }
  function rightOf(it) { return it.kind === 'sort' ? it.a.join(' ') : it.a; }
  function isRight(it, given) { return (Array.isArray(given) ? given.join(' ') : given) === rightOf(it); }
  /* Elige al azar con peso (it.w, por defecto 1; en el Desafío todos pesan 1) y evita los últimos N ids */
  function makePicker(list, rng, recentN, weighted) {
    rng = rng || Math.random;
    var recent = [], lastNoun = null;
    var N = Math.min(recentN == null ? 10 : recentN, Math.max(0, list.length - 1));
    function wt(it) { return weighted ? (it.w || 1) : 1; }
    return function () {
      /* v1.0.1 (N6): además de los últimos N ids, nunca la misma palabra dos veces seguidas (p. ej. art-X y luego cual-X) */
      var last = lastNoun;
      var cand = list.filter(function (x) { return recent.indexOf(x.id) < 0 && !(last && x.noun === last); });
      if (!cand.length) cand = list.filter(function (x) { return !(last && x.noun === last); });
      if (!cand.length) cand = list.slice();
      var tot = cand.reduce(function (s, x) { return s + wt(x); }, 0), r = rng() * tot, pick = cand[cand.length - 1];
      for (var i = 0; i < cand.length; i++) { r -= wt(cand[i]); if (r < 0) { pick = cand[i]; break; } }
      recent.push(pick.id); if (recent.length > N) recent.shift();
      lastNoun = pick.noun || null;
      return pick;
    };
  }
  function shuffle(a, rng) { rng = rng || Math.random; a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- v1.1.0: Desafío sin tiempo ---------- */
  /* Mejor marca sin tiempo: solo enteros de 0 a max (vacío, «abc», «1e1», «999», «-3», «5.5» → 0) */
  function clampUntimedBest(v, max) {
    max = max == null ? UNTIMED_N : max;
    var s = v == null ? '' : String(v).trim();
    if (!/^\d+$/.test(s)) return 0;
    var n = Number(s);
    return Number.isInteger(n) && n >= 0 && n <= max ? n : 0;
  }
  function getUntimedBest(st) { try { return clampUntimedBest(st.getItem(BK_UNTIMED)); } catch (e) { return 0; } }
  /* Guarda solo BK_UNTIMED, solo si la ronda se completó y solo si supera la mejor marca. Nunca toca CK ni BK. */
  function applyUntimed(st, score, goal, completed) {
    var best = getUntimedBest(st), out = { record: false, best: best, saved: false };
    if (!completed) return out;
    var s = clampUntimedBest(score, goal);
    if (s !== score) return out;
    if (score > best) { st.setItem(BK_UNTIMED, String(score)); out.record = true; out.best = score; out.saved = true; }
    return out;
  }
  /* Cola de la ronda sin tiempo: n preguntas ÚNICAS del mismo pozo que el Desafío 60 s.
     - Una palabra (sustantivo) sale como mucho una vez: ni el mismo ítem ni art-X y cual-X en la misma ronda.
     - Por estratos der / die / das, proporcional al pozo (como el sorteo parejo del 60 s): 27 palabras → 7,41 · 6,67 · 5,93 de 20.
       Los decimales se reparten con muestreo sistemático: der 7 u 8, die 6 o 7, das 5 o 6, así el total por artículo no se puede contar
       y la media es exactamente la del 60 s.
     - Tipo de pregunta (¿Qué artículo? / ¿Cuál está bien?) mitad y mitad, como en el 60 s.
     - Si el pozo tiene menos palabras que n, se usa el pozo entero (ítems únicos, sin la misma palabra seguida). */
  function buildUntimedQueue(items, n, rng) {
    rng = rng || Math.random; n = n == null ? UNTIMED_N : n;
    var byNoun = {}, nouns = [];
    items.forEach(function (it) { var k = it.noun || it.id; if (!byNoun[k]) { byNoun[k] = []; nouns.push(k); } byNoun[k].push(it); });
    var goal = Math.min(n, items.length);
    if (!goal) return [];
    if (nouns.length >= goal) {
      /* 1. Cupos por artículo */
      var strata = {}, keys = [];
      nouns.forEach(function (k) { var t = byNoun[k][0].topic; if (!strata[t]) { strata[t] = []; keys.push(t); } strata[t].push(k); });
      var quota = {}, frac = [], sum = 0;
      keys.forEach(function (t) { var e = goal * strata[t].length / nouns.length; quota[t] = Math.floor(e); sum += quota[t]; frac.push([t, e - quota[t]]); });
      var extra = goal - sum;
      if (extra > 0) {
        /* muestreo sistemático: cada artículo recibe +1 con probabilidad igual a su decimal (orden al azar) */
        frac = shuffle(frac, rng);
        var u = rng(), acc = 0;
        frac.forEach(function (f) { var lo = acc; acc += f[1]; if (Math.floor(acc - u + 1) - Math.floor(lo - u + 1) > 0 && extra > 0) { quota[f[0]]++; extra--; } });
        /* respaldo por redondeo binario */
        for (var i = 0; extra > 0 && i < frac.length; i++) { var t0 = frac[i][0]; if (quota[t0] < strata[t0].length) { quota[t0]++; extra--; } }
      }
      /* 2. Palabras distintas de cada artículo */
      var chosen = [];
      keys.forEach(function (t) { chosen = chosen.concat(shuffle(strata[t], rng).slice(0, quota[t])); });
      /* 3. Tipo de pregunta mitad y mitad (si la palabra tiene los dos) */
      var types = {}; items.forEach(function (it) { types[it.type] = 1; }); types = Object.keys(types).sort();
      var plan = []; for (var j = 0; j < chosen.length; j++) plan.push(types[j % types.length]);
      plan = shuffle(plan, rng);
      var q = chosen.map(function (k, idx) {
        var opts = byNoun[k], it = opts.filter(function (x) { return x.type === plan[idx]; })[0];
        return it || opts[Math.floor(rng() * opts.length)];
      });
      return shuffle(q, rng);
    }
    /* Pozo con menos palabras que n: todos los ítems únicos hasta n, sin la misma palabra seguida si se puede */
    var pool = shuffle(items, rng).slice(0, goal), out = [];
    function nk(it) { return it.noun || it.id; }
    while (pool.length) {
      var last = out.length ? nk(out[out.length - 1]) : null, left = {};
      pool.forEach(function (it) { left[nk(it)] = (left[nk(it)] || 0) + 1; });
      /* la palabra con más ítems pendientes (distinta de la anterior) va primero: así no quedan dos iguales al final */
      var best = -1, idx2 = -1;
      pool.forEach(function (it, k) { if (nk(it) !== last && left[nk(it)] > best) { best = left[nk(it)]; idx2 = k; } });
      if (idx2 < 0) idx2 = 0;
      out.push(pool.splice(idx2, 1)[0]);
    }
    return out;
  }
  g.ARTIKEL_ENGINE = { CK: CK, BK: BK, TOPICS: TOPICS, qualifies: qualifies, getChecks: getChecks, applyChallenge: applyChallenge, pool: pool, isRight: isRight, rightOf: rightOf, makePicker: makePicker, shuffle: shuffle,
    BK_UNTIMED: BK_UNTIMED, UNTIMED_N: UNTIMED_N, clampUntimedBest: clampUntimedBest, getUntimedBest: getUntimedBest, applyUntimed: applyUntimed, buildUntimedQueue: buildUntimedQueue };
})(typeof window !== 'undefined' ? window : globalThis);
