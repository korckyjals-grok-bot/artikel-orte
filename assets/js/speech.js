/**
 * Optional German speechSynthesis. User gesture required. Cancel on navigation/next.
 * Copiado de In der Stadt unterwegs 1.0.2 (sin reconocimiento de voz). Solo voces alemanas; sin voz alemana no habla y avisa (onNoVoice) después de esperar a que carguen las voces. v1.0.0
 */
(function (global) {
  'use strict';

  let voice = null;
  let ready = false;
  let unsupported = false;
  let listeners = [];

  function isGermanVoice(v) {
    if (!v) return false;
    const lang = String(v.lang || '');
    const name = String(v.name || '');
    // Never accept English (or other) voices for German read-aloud
    if (/^en([-_]|$)/i.test(lang)) return false;
    return /^de([-_]|$)/i.test(lang) || /german|deutsch/i.test(name);
  }

  function pickGermanVoice() {
    if (!global.speechSynthesis) {
      unsupported = true;
      voice = null;
      ready = true;
      return null;
    }
    unsupported = false;
    const voices = speechSynthesis.getVoices() || [];
    const de = voices.filter(isGermanVoice);
    // Prefer de-DE local if marked
    de.sort((a, b) => {
      const al = (a.localService ? 0 : 1) - (b.localService ? 0 : 1);
      if (al) return al;
      return (b.lang || '').localeCompare(a.lang || '');
    });
    voice = de[0] || null;
    ready = true;
    listeners.forEach((fn) => {
      try {
        fn(voice);
      } catch (e) {}
    });
    return voice;
  }

  function init() {
    if (!global.speechSynthesis) {
      unsupported = true;
      ready = true;
      return;
    }
    pickGermanVoice();
    if (typeof speechSynthesis.addEventListener === 'function') {
      speechSynthesis.addEventListener('voiceschanged', pickGermanVoice);
    } else {
      speechSynthesis.onvoiceschanged = pickGermanVoice;
    }
    // Delayed re-check for browsers that populate voices late
    setTimeout(pickGermanVoice, 250);
    setTimeout(pickGermanVoice, 1000);
  }

  function onReady(fn) {
    listeners.push(fn);
    if (ready) fn(voice);
  }

  function hasGermanVoice() {
    return !!voice;
  }

  function status() {
    return {
      unsupported: unsupported,
      ready: ready,
      hasGerman: !!voice,
      voiceName: voice ? voice.name : null,
      voiceLang: voice ? voice.lang : null
    };
  }

  function cancel() {
    try {
      if (global.speechSynthesis) speechSynthesis.cancel();
    } catch (e) {}
  }

  /* Espera a que el navegador cargue sus voces (Chrome las entrega tarde y de forma asíncrona).
     Solo después de esperar se concluye que no hay voz alemana. */
  let waited = false;
  let waiters = [];
  const VOICE_WAIT_MS = 1500;
  function voicesLoaded() {
    try { return (speechSynthesis.getVoices() || []).length > 0; } catch (e) { return false; }
  }
  function whenVoicesReady(cb) {
    if (voice || waited || voicesLoaded()) { cb(); return; }
    waiters.push(cb);
    if (waiters.length > 1) return; // ya hay una espera en curso
    let done = false;
    const finish = function () {
      if (done) return;
      done = true;
      waited = true;
      try { speechSynthesis.removeEventListener && speechSynthesis.removeEventListener('voiceschanged', onChange); } catch (e) {}
      clearInterval(poll);
      pickGermanVoice();
      const list = waiters; waiters = [];
      list.forEach(function (fn) { try { fn(); } catch (e) {} });
    };
    const onChange = function () { if (voicesLoaded()) finish(); };
    try { speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', onChange); } catch (e) {}
    const poll = setInterval(function () { if (voicesLoaded()) finish(); }, 100);
    setTimeout(finish, VOICE_WAIT_MS);
  }

  function utter(text, opts) {
    cancel();
    try {
      const u = new SpeechSynthesisUtterance(String(text || ''));
      u.voice = voice;
      u.lang = voice.lang || 'de-DE';
      // Force German language tag — never inherit page/en default
      if (!/^de/i.test(u.lang)) u.lang = 'de-DE';
      u.rate = opts.rate || 0.92;
      u.pitch = 1;
      let started = false;
      u.onstart = function () { started = true; };
      if (opts.onEnd) u.onend = opts.onEnd;
      u.onerror = function (ev) { started = true; if (opts.onError) opts.onError(ev); };
      speechSynthesis.speak(u);
      // Si la voz nunca arranca (voz remota caída, motor bloqueado), avisa en vez de quedar en silencio
      setTimeout(function () {
        try {
          if (!started && !speechSynthesis.speaking && !speechSynthesis.pending && opts.onError) opts.onError({ error: 'no-start' });
        } catch (e) {}
      }, opts.startTimeout || 4000);
      return true;
    } catch (e) {
      if (opts.onError) opts.onError(e);
      return false;
    }
  }

  /* Devuelve true si habla o va a hablar en cuanto carguen las voces; false si ya se sabe que no hay voz alemana.
     opts.onNoVoice se llama (una vez) cuando, tras esperar las voces, no hay voz alemana. Nunca usa una voz inglesa. */
  function speak(text, opts) {
    opts = opts || {};
    const noVoice = function (why) {
      if (opts.onNoVoice) opts.onNoVoice(why);
      else if (opts.onError) opts.onError(new Error(why));
    };
    if (!global.speechSynthesis) {
      noVoice('no speechSynthesis');
      return false;
    }
    if (!voice) pickGermanVoice();
    if (voice && isGermanVoice(voice)) return utter(text, opts);
    voice = null;
    if (waited || voicesLoaded()) {
      noVoice('no German voice');
      return false;
    }
    whenVoicesReady(function () {
      if (voice && isGermanVoice(voice)) utter(text, opts);
      else { voice = null; noVoice('no German voice'); }
    });
    return true;
  }

  function resetForTests() {
    voice = null;
    ready = false;
    unsupported = false;
    listeners = [];
    waited = false;
    waiters = [];
  }

  init();

  global.ArtikelSpeech = {
    init: init,
    onReady: onReady,
    hasGermanVoice: hasGermanVoice,
    status: status,
    speak: speak,
    cancel: cancel,
    pickGermanVoice: pickGermanVoice,
    isGermanVoice: isGermanVoice,
    resetForTests: resetForTests
  };
})(typeof window !== 'undefined' ? window : globalThis);
