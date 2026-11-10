/* der · die · das — lógica pura (sin DOM): puntaje, marca verde, selección ponderada sin repetir. v1.0.0 */
(function (g) {
  'use strict';
  var CK = 'aleman_check_artikel', BK = 'artikel_best', TOPICS = ['der', 'die', 'das'];
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
  /* Practicar: ítems de los artículos elegidos; las rondas de cajas (mezclan los tres) solo con los tres elegidos.
     Desafío: solo opción múltiple rápida (sin audio ni cajas). */
  function pool(items, topics, chal) {
    var all3 = TOPICS.every(function (t) { return topics.indexOf(t) >= 0; });
    return items.filter(function (it) {
      if (it.topic === 'mix') return !chal && all3;
      if (topics.indexOf(it.topic) < 0) return false;
      if (chal) return it.kind === 'mc' && it.fast === true;
      return true;
    });
  }
  function rightOf(it) { return it.kind === 'sort' ? it.a.join(' ') : it.a; }
  function isRight(it, given) { return (Array.isArray(given) ? given.join(' ') : given) === rightOf(it); }
  /* Elige al azar con peso (it.w, por defecto 1; en el Desafío todos pesan 1) y evita los últimos N ids */
  function makePicker(list, rng, recentN, weighted) {
    rng = rng || Math.random;
    var recent = [];
    var N = Math.min(recentN == null ? 10 : recentN, Math.max(0, list.length - 1));
    function wt(it) { return weighted ? (it.w || 1) : 1; }
    return function () {
      var cand = list.filter(function (x) { return recent.indexOf(x.id) < 0; });
      if (!cand.length) cand = list.slice();
      var tot = cand.reduce(function (s, x) { return s + wt(x); }, 0), r = rng() * tot, pick = cand[cand.length - 1];
      for (var i = 0; i < cand.length; i++) { r -= wt(cand[i]); if (r < 0) { pick = cand[i]; break; } }
      recent.push(pick.id); if (recent.length > N) recent.shift();
      return pick;
    };
  }
  function shuffle(a, rng) { rng = rng || Math.random; a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  g.ARTIKEL_ENGINE = { CK: CK, BK: BK, TOPICS: TOPICS, qualifies: qualifies, getChecks: getChecks, applyChallenge: applyChallenge, pool: pool, isRight: isRight, rightOf: rightOf, makePicker: makePicker, shuffle: shuffle };
})(typeof window !== 'undefined' ? window : globalThis);
