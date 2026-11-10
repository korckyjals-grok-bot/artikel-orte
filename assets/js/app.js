/* der · die · das: Orte in der Stadt — interfaz. v1.0.1 */
(function () {
  'use strict';
  var D = window.ARTIKEL_DATA, B = window.ARTIKEL_BANK, E = window.ARTIKEL_ENGINE, SP = window.ArtikelSpeech;
  var $ = function (id) { return document.getElementById(id); };
  /* La etiqueta solo dice el tipo de actividad: nunca el artículo (sería la respuesta) */
  var TYPE = { art: '🏙️ ¿Qué artículo?', cual: '✅ ¿Cuál está bien?', hor: '🎧 Escucha y elige', sort: '🗂️ Ordena en las cajas' };
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* Guiones suaves para que las palabras largas corten bien en cajas angostas (como «Einkaufs-zentrum» en la hoja) */
  var HY = { Einkaufszentrum: 'Einkaufs\u00ADzentrum', Kindergarten: 'Kinder\u00ADgarten', Krankenhaus: 'Kranken\u00ADhaus', Supermarkt: 'Super\u00ADmarkt', Spielplatz: 'Spiel\u00ADplatz', Feuerwehr: 'Feuer\u00ADwehr', Metzgerei: 'Metzge\u00ADrei', Restaurant: 'Restau\u00ADrant', Apotheke: 'Apo\u00ADtheke', Bäckerei: 'Bäcke\u00ADrei' };
  function hy(n) { return HY[n] || n; }
  function show(id) { ['home', 'study', 'play', 'sum'].forEach(function (x) { $(x).classList.toggle('hid', x !== id); }); window.scrollTo(0, 0); }
  function store() { try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return localStorage; } catch (e) { var m = {}; return { getItem: function (k) { return k in m ? m[k] : null; }, setItem: function (k, v) { m[k] = String(v); }, removeItem: function (k) { delete m[k]; } }; } }
  var ST = store();
  function toast(t) { var d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2600); }
  var NOVOICE = '🔇 Este navegador no tiene voz en alemán. Toca 🆘 Ayuda para leer la palabra.';
  function speak(text) {
    try {
      /* speech.js espera a que carguen las voces antes de decidir que no hay voz alemana; nunca usa una voz inglesa */
      if (!SP) { toast(NOVOICE); return; }
      SP.speak(String(text), {
        rate: 0.85,
        onNoVoice: function () { toast(NOVOICE); },
        onError: function (e) { var c = e && (e.error || e.message); if (c === 'interrupted' || c === 'canceled') return; toast('🔇 No se pudo reproducir el audio. Toca 🆘 Ayuda para leer la palabra.'); }
      });
    } catch (e) { toast('🔇 No se pudo reproducir el audio.'); }
  }
  function stopSpeak() { try { SP && SP.cancel(); } catch (e) {} }
  function revealAbove(el, bar) {
    try {
      if (!el || el.classList.contains('hid')) return;
      var h = bar && bar.classList.contains('stick') ? bar.offsetHeight : 0;
      var r = el.getBoundingClientRect(), limit = window.innerHeight - h - 12;
      if (r.bottom > limit) {
        var dy = r.bottom - limit, top = $('msg').getBoundingClientRect().top;
        if (el.id === 'exp' && top - dy < 8) dy = Math.max(0, top - 8);
        window.scrollBy(0, dy);
      }
    } catch (e) {}
  }
  function drawCk() { var c = E.getChecks(ST); document.querySelectorAll('.chk').forEach(function (e) { e.classList.toggle('no', c.indexOf(e.dataset.t) < 0); }); }
  function home() { stopTimer(); stopSpeak(); chal = false; drawCk(); $('best').textContent = ST.getItem(E.BK) || 0; document.querySelectorAll('.nm').forEach(function (e) { e.textContent = window.NM(); }); show('home'); }
  document.querySelectorAll('[data-home]').forEach(function (b) { b.onclick = home; });

  /* ---------------- ESTUDIAR ---------------- */
  var STABS = [['der', '🔵 der'], ['die', '🔴 die'], ['das', '🟢 das'], ['tips', '💡 Trucos']];
  var stTab = 'der', stHelp = false;
  function showStudy() { drawStudy(); show('study'); }
  function drawStudy() {
    $('stTabs').innerHTML = STABS.map(function (t) { return '<button class="btn ' + (t[0] === stTab ? 'g' : 'gray') + '" data-tab="' + t[0] + '" lang="de">' + t[1] + '</button>'; }).join('');
    $('stTabs').querySelectorAll('button').forEach(function (b) { b.onclick = function () { stTab = b.dataset.tab; stopSpeak(); drawStudy(); }; });
    var html = '';
    if (stTab === 'tips') {
      $('stTitle').textContent = '💡 Trucos para recordar';
      html = D.TIPS.map(function (t, i) {
        return '<div class="tipc"><h3>' + t.t + '</h3><div class="de" lang="de">' + colorize(t.de) + '</div><p class="es">' + t.es + '</p><button class="say" data-tip="' + i + '" aria-label="Escuchar">🔊 Escuchar</button></div>';
      }).join('');
    } else {
      var list = D.PLACES.filter(function (p) { return p.a === stTab; });
      $('stTitle').textContent = '📖 ' + stTab.toUpperCase() + ' (' + list.length + ' lugares)';
      html = '<div class="colhead ' + stTab + '" lang="de">' + stTab.toUpperCase() + ' · ' + { der: 'azul', die: 'rojo', das: 'verde' }[stTab] + '</div><div class="grid">' + list.map(function (p) {
        return '<button class="tile ' + p.a + '" data-n="' + esc(p.n) + '" aria-label="Escuchar ' + p.a + ' ' + esc(p.n) + '">' + (p.hard ? '<span class="warn" title="Se confunde fácilmente">⚠️</span>' : '') +
          '<span class="em" aria-hidden="true">' + p.i + '</span><span class="w" lang="de"><span class="a-' + p.a + '">' + p.a + '</span> ' + hy(p.n) + '</span>' +
          (stHelp ? '<span class="es">' + p.es + '</span><span class="tp">💡 ' + p.tip + '</span>' : '') + '</button>';
      }).join('') + '</div>' + (list.some(function (p) { return p.hard; }) ? '<p class="hint" style="margin:0">⚠️ = se confunde fácilmente</p>' : '');
    }
    $('stBody').innerHTML = html;
    $('stBody').querySelectorAll('.tile').forEach(function (b) { b.onclick = function () { var p = D.place(b.dataset.n); speak(p.a + ' ' + p.n); }; });
    $('stBody').querySelectorAll('[data-tip]').forEach(function (b) { b.onclick = function () { speak(D.TIPS[+b.dataset.tip].say); }; });
    $('stHelp').textContent = stHelp ? '🙈 Ocultar ayuda' : '🆘 Ayuda';
    $('stHelp').classList.toggle('hid', stTab === 'tips');
  }
  function colorize(s) { return s.replace(/\b(der|die|das) /g, function (m, a) { return '<span class="a-' + a + '">' + a + '</span> '; }); }
  $('stHelp').onclick = function () { stHelp = !stHelp; drawStudy(); };
  $('stSayAll').onclick = function () {
    if (stTab === 'tips') { speak(D.TIPS.map(function (t) { return t.say; }).join('. ')); return; }
    speak(D.PLACES.filter(function (p) { return p.a === stTab; }).map(function (p) { return p.a + ' ' + p.n; }).join(', '));
  };
  $('bStudy').onclick = showStudy;

  /* ---------------- PRACTICAR / DESAFÍO ---------------- */
  /* v1.0.1 (A1, paso 4): aviso cuando en Practicar hay un solo artículo marcado */
  var ONE_ART = '💡 Con un solo artículo todas las respuestas son iguales. Marca dos o tres para practicar de verdad.', oneArt = false;
  function oneHint() { var n = document.querySelectorAll('#topics input:checked').length; $('oneArt').textContent = ONE_ART; $('oneArt').classList.toggle('hid', n !== 1); }
  document.querySelectorAll('#topics input').forEach(function (i) { i.addEventListener('change', oneHint); });
  var cur = null, score = 0, streak = 0, done = 0, missed = [], answered = false, chal = false, timer = null, left = 0, chalT = [], repeatQ = [], picker = null;
  function sel() { var s = [].slice.call(document.querySelectorAll('#topics input:checked')).map(function (i) { return i.value; }); return s.length ? s : E.TOPICS.slice(); }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function begin(topics, isChal) {
    score = 0; streak = 0; done = 0; missed = []; chal = isChal; oneArt = !isChal && topics.length === 1;
    /* Practicar: ponderado (palabras que se confunden fácilmente ×3). Desafío: todos pesan igual */
    picker = E.makePicker(E.pool(B.items, topics, isChal), null, null, !isChal);
    $('sc').textContent = 0; $('st').textContent = 0; show('play'); stopTimer();
    $('bHelp').classList.toggle('hid', isChal);
    if (chal) {
      left = 60; $('tm').classList.remove('hid'); $('tm').textContent = '⏱️ 60';
      timer = setInterval(function () { left--; $('tm').textContent = '⏱️ ' + left; if (left <= 0) finish(); }, 1000);
    } else $('tm').classList.add('hid');
    next();
  }
  function artOf(o) { return o.split(' ')[0]; }
  function next() {
    stopSpeak();
    cur = repeatQ.length ? repeatQ.shift() : picker();
    answered = false;
    $('tg').textContent = TYPE[cur.type];
    $('qt').textContent = cur.q;
    $('pic').textContent = cur.pic || ''; $('pic').classList.toggle('hid', !cur.pic);
    $('senTx').textContent = cur.de || ''; $('sen').classList.toggle('hid', !cur.de);
    $('listen').classList.toggle('hid', !cur.listen);
    $('cnt').textContent = 'Preguntas: ' + done;
    $('opts').innerHTML = ''; $('opts').className = ''; $('sortBox').innerHTML = ''; $('sortBox').classList.add('hid');
    $('msg').textContent = oneArt ? ONE_ART : ''; $('exp').classList.add('hid'); $('nx').classList.add('hid'); $('pAct').classList.remove('stick');
    $('pHelp').classList.add('hid'); $('pHelp').textContent = '🆘 ' + (cur.help || '');
    $('bHelp').textContent = '🆘 Ayuda';
    if (cur.kind === 'sort') return drawSort();
    if (cur.type === 'art') $('opts').className = 'three';
    E.shuffle(cur.o).forEach(function (o) {
      var b = document.createElement('button'); b.className = 'btn opt ' + artOf(o); b.textContent = o; b.lang = 'de'; b.dataset.v = o;
      b.onclick = function () { answer(o, b); }; $('opts').appendChild(b);
    });
    if (cur.listen) speak(cur.say);
  }
  /* Cajas: toca una palabra y luego la caja DER / DIE / DAS (como en la hoja). Al colocar las 6 se revisa. */
  function drawSort() {
    var box = $('sortBox'); box.classList.remove('hid');
    var placed = {}, armed = null;
    var words = E.shuffle(cur.words);
    box.innerHTML = '<div class="chips" id="chips"></div><div class="boxes">' + D.ART.map(function (a) {
      return '<div class="box ' + a + '" role="button" tabindex="0" data-a="' + a + '" aria-label="Caja ' + a + '"><div class="bh" lang="de">' + a.toUpperCase() + '</div></div>';
    }).join('') + '</div><button class="btn gray" id="sortReset">↩️ Borrar</button>';
    var chips = $('chips');
    words.forEach(function (n) {
      var p = D.place(n), c = document.createElement('button');
      c.className = 'chip'; c.lang = 'de'; c.dataset.n = n; c.innerHTML = '<span aria-hidden="true">' + p.i + '</span> ' + esc(n);
      c.onclick = function () { if (answered) return; armed = armed === n ? null : n; refresh(); };
      chips.appendChild(c);
    });
    function refresh() {
      chips.classList.toggle('hid', Object.keys(placed).length === cur.words.length);
      [].forEach.call(chips.children, function (c) { c.classList.toggle('sel', c.dataset.n === armed); c.classList.toggle('hid', c.dataset.n in placed); });
      box.querySelectorAll('.box').forEach(function (b) { b.classList.toggle('armed', !!armed); });
    }
    box.querySelectorAll('.box').forEach(function (b) {
      var drop = function () {
        if (answered || !armed) return;
        placed[armed] = b.dataset.a;
        var d = document.createElement('div'); d.className = 'placed'; d.lang = 'de'; d.dataset.n = armed; d.innerHTML = hy(armed); b.appendChild(d);
        armed = null; refresh();
        if (Object.keys(placed).length === cur.words.length) answer(cur.words.map(function (n) { return placed[n]; }), null);
      };
      b.onclick = drop;
      b.onkeydown = function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); drop(); } };
    });
    $('sortReset').onclick = function () { if (answered) return; placed = {}; armed = null; box.querySelectorAll('.placed').forEach(function (x) { x.remove(); }); refresh(); };
  }
  var GOOD = ['¡Muy bien! 🎉', '¡Excelente! ⭐', '¡Correcto! 👏', '¡Lo hiciste genial! 🚀', '¡Súper! 💪', 'Sehr gut! 🇩🇪'];
  function answer(given, el) {
    if (answered) return; answered = true; done++;
    var ok = E.isRight(cur, given), right = E.rightOf(cur);
    if (cur.kind === 'sort') {
      $('sortBox').querySelectorAll('.placed').forEach(function (x) {
        var p = D.place(x.dataset.n), good = x.parentNode.dataset.a === p.a;
        x.classList.add(good ? 'ok' : 'bad');
        if (!good) { var f = document.createElement('div'); f.className = 'placed ok'; f.lang = 'de'; f.innerHTML = hy(p.n); $('sortBox').querySelector('.box.' + p.a).appendChild(f); }
      });
      $('sortReset').classList.add('hid');
    } else {
      [].forEach.call($('opts').children, function (x) { x.disabled = true; if (x.dataset.v === right) x.classList.add('ok'); else if (x !== el) x.classList.add('dim'); });
    }
    if (ok) { score++; streak++; $('msg').textContent = rnd(GOOD) + (streak >= 3 ? ' ¡Racha de ' + streak + '! 🔥' : ''); }
    else { if (el) el.classList.add('bad'); streak = 0; missed.push(cur); $('msg').textContent = '¡Casi! Mira la respuesta correcta 💡'; }
    $('sc').textContent = score; $('st').textContent = streak; $('cnt').textContent = 'Preguntas: ' + done;
    if (chal) { setTimeout(function () { if (chal && left > 0) next(); }, ok ? 600 : 1800); return; }
    $('exp').innerHTML = 'ℹ️ ' + (cur.kind === 'sort' ? colorize(cur.e) : cur.e) + (cur.say ? ' <button class="say" id="expSay" aria-label="Escuchar">🔊 Escuchar</button>' : '');
    if ($('expSay')) $('expSay').onclick = function () { speak(cur.say); };
    $('exp').classList.remove('hid'); $('nx').classList.remove('hid'); $('pAct').classList.add('stick');
    revealAbove($('exp'), $('pAct'));
  }
  var lock = 0;
  $('nx').onclick = function () { if (Date.now() - lock < 400) return; lock = Date.now(); next(); };
  $('bHelp').onclick = function () { var h = $('pHelp'); h.classList.toggle('hid'); $('bHelp').textContent = h.classList.contains('hid') ? '🆘 Ayuda' : '🙈 Ocultar ayuda'; revealAbove(h, $('pAct')); };
  $('listen').onclick = function () { if (cur) speak(cur.say); };
  function rightText(q) { return q.kind === 'sort' ? colorize(q.e) : '<span lang="de">' + q.a + (q.type === 'art' ? ' ' + q.noun : '') + '</span>'; }
  function finish() {
    stopTimer(); stopSpeak(); var wasChal = chal; chal = false; var t = '¡Buen trabajo, ' + window.NM() + '! 🌟';
    if (wasChal) {
      var res = E.applyChallenge(ST, chalT, score, done);
      if (res.record) t = '🏆 ¡Nuevo récord: ' + score + '!';
      if (res.granted) { drawCk(); t = '✅ ¡Marca verde! ' + score + ' sin errores. ¡Bravo, ' + window.NM() + '!'; }
    }
    $('sumT').textContent = t; $('sumP').textContent = 'Respondiste bien ' + score + ' de ' + done + ' preguntas.' + (wasChal && !(score >= 13 && done === score) ? ' Para la marca verde: 13 o más y sin errores.' : '');
    $('sumL').innerHTML = missed.length ? '<h3>Para repasar:</h3><ul>' + missed.map(function (q) { return '<li><b>' + q.q + '</b> ' + (q.de ? '<span lang="de">' + q.de + '</span>' : '') + '<br>✔️ ' + rightText(q) + '</li>'; }).join('') + '</ul>' : '<p>¡No tuviste errores! 🎉</p>';
    $('rep').classList.toggle('hid', !missed.length); show('sum');
  }
  $('bFinish').onclick = finish;
  $('bPractice').onclick = function () { repeatQ = []; begin(sel(), false); };
  $('bChal').onclick = function () { repeatQ = []; chalT = E.TOPICS.slice(); begin(chalT, true); };
  $('rep').onclick = function () { repeatQ = missed.slice(); begin(E.TOPICS.slice(), false); };
  /* «Repasar errores» usa los tres artículos: no muestra el aviso de un solo artículo */

  /* ---------------- INICIO ---------------- */
  drawCk(); oneHint(); $('best').textContent = ST.getItem(E.BK) || 0;
  window.__TEST__ = function () {
    return { cur: cur, score: score, done: done, chal: chal, missed: missed, finish: finish, CK: E.CK, BK: E.BK, getCk: function () { return E.getChecks(ST); },
      setScore: function (s, d) { score = s; done = d; $('sc').textContent = s; $('cnt').textContent = 'Preguntas: ' + d; },
      forceChal: function (t) { chal = true; chalT = t || E.TOPICS.slice(); }, items: B.items,
      force: function (id) { var it = B.items.filter(function (x) { return x.id === id; })[0]; if (it) { repeatQ = [it]; next(); } return !!it; } };
  };
})();
