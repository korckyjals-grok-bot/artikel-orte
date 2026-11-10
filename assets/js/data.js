/* der · die · das: Orte in der Stadt — contenido. v1.0.1
   Fuente de las 27 palabras y sus artículos: hoja de trabajo de la clase (DER / DIE / DAS).
   Cada artículo se verificó en Duden (ver README). Solo Nominativ. */
(function (g) {
  'use strict';
  /* n = sustantivo, a = artículo (Nominativ), i = emoji, es = significado,
     tip = truco verdadero (español), hard = palabra que se confunde fácilmente */
  var PLACES = [
    { n: 'Zahnarzt', a: 'der', i: '🦷', es: 'el dentista (el consultorio del dentista)', tip: 'Palabra compuesta: Zahn + der Arzt. Manda la última parte → der.' },
    { n: 'Park', a: 'der', i: '🌳', es: 'el parque', tip: 'Apréndela con su artículo: der Park.' },
    { n: 'Spielplatz', a: 'der', i: '🎠', es: 'el área de juegos', tip: 'Palabra compuesta: Spiel + der Platz. Manda la última parte → der.' },
    { n: 'Zoo', a: 'der', i: '🦁', es: 'el zoológico', tip: 'Apréndela con su artículo: der Zoo.' },
    { n: 'Kindergarten', a: 'der', i: '🧸', es: 'el kínder', tip: 'Palabra compuesta: Kinder + der Garten. Manda la última parte → der.' },
    { n: 'Kiosk', a: 'der', i: '📰', es: 'el quiosco', tip: 'Apréndela con su artículo: der Kiosk.' },
    { n: 'Bahnhof', a: 'der', i: '🚉', es: 'la estación de tren', tip: 'Palabra compuesta: Bahn + der Hof. Manda la última parte → der.' },
    { n: 'Supermarkt', a: 'der', i: '🛒', es: 'el supermercado', tip: 'Super + der Markt → der Supermarkt, igual que der Markt.' },
    { n: 'Markt', a: 'der', i: '🧺', es: 'el mercado', tip: 'der Markt y der Supermarkt: los dos son der.' },
    { n: 'Friseur', a: 'der', i: '💇', es: 'el peluquero (la peluquería)', tip: 'Friseur es la persona que corta el pelo: der Friseur. Las personas con -eur son der.', hard: true },
    { n: 'Bäckerei', a: 'die', i: '🥨', es: 'la panadería', tip: 'Termina en -ei → die. Igual que die Metzgerei y die Polizei.', hard: true },
    { n: 'Feuerwehr', a: 'die', i: '🚒', es: 'los bomberos (la estación de bomberos)', tip: 'Palabra compuesta: Feuer + die Wehr. Manda la última parte → die.' },
    { n: 'Apotheke', a: 'die', i: '💊', es: 'la farmacia', tip: 'Termina en -e. Muchas palabras con -e son die: die Apotheke, die Schule, die Eisdiele.' },
    { n: 'Eisdiele', a: 'die', i: '🍦', es: 'la heladería', tip: 'Palabra compuesta: Eis + die Diele. Además termina en -e → die.' },
    { n: 'Post', a: 'die', i: '📮', es: 'el correo (la oficina de correos)', tip: 'Apréndela con su artículo: die Post.' },
    { n: 'Schule', a: 'die', i: '🏫', es: 'la escuela', tip: 'Termina en -e. Muchas palabras con -e son die.' },
    { n: 'Bank', a: 'die', i: '🏦', es: 'el banco (de dinero)', tip: '¡Ojo! En español es «el banco», pero en alemán es die Bank. Aquí el español no ayuda con el artículo.', hard: true },
    { n: 'Metzgerei', a: 'die', i: '🥩', es: 'la carnicería', tip: 'Termina en -ei → die. Igual que die Bäckerei y die Polizei.' },
    { n: 'Polizei', a: 'die', i: '🚓', es: 'la policía', tip: 'Termina en -ei → die. Igual que die Bäckerei y die Metzgerei.' },
    { n: 'Hotel', a: 'das', i: '🏨', es: 'el hotel', tip: 'Apréndela con su artículo: das Hotel.' },
    { n: 'Kino', a: 'das', i: '🎬', es: 'el cine', tip: 'Apréndela con su artículo: das Kino.' },
    { n: 'Theater', a: 'das', i: '🎭', es: 'el teatro', tip: 'Apréndela con su artículo: das Theater.' },
    { n: 'Einkaufszentrum', a: 'das', i: '🛍️', es: 'el centro comercial', tip: 'Palabra compuesta: Einkauf + das Zentrum. Manda la última parte → das, igual que das Museum.' },
    { n: 'Museum', a: 'das', i: '🖼️', es: 'el museo', tip: 'Termina en -um, igual que Zentrum → das.' },
    { n: 'Krankenhaus', a: 'das', i: '🏥', es: 'el hospital', tip: 'Palabra compuesta: krank + das Haus. Manda la última parte → das.' },
    { n: 'Restaurant', a: 'das', i: '🍽️', es: 'el restaurante', tip: 'Apréndela con su artículo: das Restaurant.' },
    { n: 'Rathaus', a: 'das', i: '🏛️', es: 'la alcaldía', tip: 'Palabra compuesta: Rat + das Haus. Manda la última parte → das, igual que das Krankenhaus.', hard: true }
  ];
  var ART = ['der', 'die', 'das'];
  var COLOR = { der: 'azul', die: 'rojo', das: 'verde' };
  /* Trucos (todos verdaderos para estas palabras) */
  var TIPS = [
    { t: 'Palabras compuestas', de: 'der Zahn<b>arzt</b> · der Spiel<b>platz</b> · der Kinder<b>garten</b> · der Bahn<b>hof</b> · der Super<b>markt</b> · die Feuer<b>wehr</b> · die Eis<b>diele</b> · das Einkaufs<b>zentrum</b> · das Kranken<b>haus</b> · das Rat<b>haus</b>', es: 'En una palabra compuesta manda la <b>última</b> parte: das Haus → das Krankenhaus, das Rathaus.', say: 'der Zahnarzt, der Spielplatz, der Kindergarten, der Bahnhof, der Supermarkt, die Feuerwehr, die Eisdiele, das Einkaufszentrum, das Krankenhaus, das Rathaus' },
    { t: '-ei → die', de: 'die Bäcker<b>ei</b> · die Metzger<b>ei</b> · die Poliz<b>ei</b>', es: 'Los lugares con la terminación <b>-ei</b> (Bäckerei, Metzgerei, Polizei) son <b>die</b>. ¡Ojo: das Ei (el huevo) es diferente!', say: 'die Bäckerei, die Metzgerei, die Polizei' },
    { t: '-e → muchas veces die', de: 'die Apothek<b>e</b> · die Schul<b>e</b> · die Eisdiel<b>e</b>', es: 'Muchas palabras que terminan en <b>-e</b> son <b>die</b> (no todas, pero estas tres sí).', say: 'die Apotheke, die Schule, die Eisdiele' },
    { t: '-um (Museum, Zentrum) → das', de: 'das Muse<b>um</b> · das Einkaufszentr<b>um</b>', es: 'Museum y Zentrum terminan en <b>-um</b> y son <b>das</b>. ¡Ojo: der Baum y der Raum no!', say: 'das Museum, das Einkaufszentrum' },
    { t: '-eur → der', de: 'der Fris<b>eur</b>', es: 'Friseur es la persona que corta el pelo. Las personas con <b>-eur</b> son <b>der</b>.', say: 'der Friseur' },
    { t: 'El español no siempre ayuda', de: 'die Bank · die Post · der Bahnhof · das Hotel', es: 'En español es «el banco», «el correo» y «la estación», pero en alemán es <b>die</b> Bank, <b>die</b> Post y <b>der</b> Bahnhof. Y el español no tiene <b>das</b>. Aprende cada palabra <b>con</b> su artículo.', say: 'die Bank, die Post, der Bahnhof, das Hotel' },
    { t: 'Grupo das', de: 'das Hotel · das Kino · das Theater · das Restaurant', es: 'Estas no tienen truco: apréndelas juntas como un grupo de <b>das</b>.', say: 'das Hotel, das Kino, das Theater, das Restaurant' }
  ];
  function place(n) { for (var i = 0; i < PLACES.length; i++) if (PLACES[i].n === n) return PLACES[i]; return null; }
  g.ARTIKEL_DATA = { VERSION: '1.0.1', PLACES: PLACES, ART: ART, COLOR: COLOR, TIPS: TIPS, place: place };
})(typeof window !== 'undefined' ? window : globalThis);
