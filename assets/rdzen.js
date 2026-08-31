/* ══════════════════════════════════════════════════════════════════════════════
   RDZEŃ — mechanika wspólna dla WSZYSTKICH stron docelowych.        WERSJA: 7
   ══════════════════════════════════════════════════════════════════════════════
   To NIE jest szablon. Tu siedzi wyłącznie zachowanie, którego nigdy nie
   projektujemy od nowa, bo jego „wersja autorska" zawsze wychodzi gorzej:
   bezpieczniki, dostępność, oszczędzanie transferu, zgoda na osadzenia.

   Wygląd zostaje w `app.css` każdej strony z osobna — dwie strony mają się
   RÓŻNIĆ. Rdzeń daje im tylko te same, sprawdzone tryby.

   ⛔ Nie edytuj kopii w repo klienta. Poprawka idzie TUTAJ, a potem
      `python3 ~/.claude/skills/strona-docelowa/rdzen.py wgraj <katalog>`.
      Inaczej pierwszy naprawiony błąd nie dojdzie do pozostałych stron.

   Każdy blok pochodzi z konkretnej wpadki — numery lekcji w komentarzach
   (`~/.claude/skills/lekcje/`).
   ══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var RDZEN_WERSJA = 10;  // 10: kaskada na animation (koniec opoznionego hovera); 9: rozwijane menu; 8: plakietka Google
  document.documentElement.setAttribute('data-rdzen', RDZEN_WERSJA);

  var q = function (s, k) { return (k || document).querySelector(s); };
  var qa = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var spokojnie = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. MENU NA TELEFONIE ─────────────────────────────────────────────── */
  var burger = q('.burger');
  var nav = q('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var otwarte = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', otwarte ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
    /* Escape zamyka — bez tego na telefonie z klawiaturą nie ma jak wyjść */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* ── 1b. ROZWIJANE POZYCJE MENU (`.nav-rozw` + `.podmenu`) ─────────────────
     Wprowadzone 16.08.2026 (PEC STAL, decyzja K.): cztery strony produktowe
     schowane w nagłówku pod jednym „Oferta".
     Samo CSS `:hover` tu NIE wystarcza i to nie jest drobiazg — pozycje pod
     rozwijanym menu to strony, na których klient decyduje o zapytaniu. Bez tego
     bloku nie dałoby się ich otworzyć ani Tabem, ani dotknięciem na tablecie
     (tam pierwsze dotknięcie udaje hover i gubi się przy drugim). */
  var rozwijane = qa('.nav-rozw');
  if (rozwijane.length) {
    var zamknijPodmenu = function (poza) {
      rozwijane.forEach(function (b) {
        if (b !== poza) b.setAttribute('aria-expanded', 'false');
      });
    };
    rozwijane.forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        var otwarte = b.getAttribute('aria-expanded') === 'true';
        zamknijPodmenu(b);
        b.setAttribute('aria-expanded', otwarte ? 'false' : 'true');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var otw = rozwijane.filter(function (b) { return b.getAttribute('aria-expanded') === 'true'; });
      if (!otw.length) return;
      zamknijPodmenu(null);
      otw[0].focus();
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.ma-podmenu')) return;
      zamknijPodmenu(null);
    });
    /* Wyjście fokusem poza grupę (Tab z ostatniej pozycji) też ma ją zamykać —
       inaczej panel zostaje otwarty nad treścią i zasłania pierwszą sekcję. */
    document.addEventListener('focusin', function (e) {
      if (e.target.closest && e.target.closest('.ma-podmenu')) return;
      zamknijPodmenu(null);
    });
  }

  /* ── 2. GÓRNY PASEK: chowa się w dół, wraca w górę ────────────────────────
     Lekcja 2026-08-06-010: pasek zasłaniał treść przy czytaniu na telefonie.
     Nie chowamy powyżej 260 px, bo przy górze strony migotał. */
  var top = q('.top');
  if (top) {
    var ostatniY = window.scrollY;
    var przewijanie = function () {
      var y = window.scrollY;
      top.classList.toggle('is-stuck', y > 8);
      if (nav && nav.classList.contains('is-open')) return;
      if (y > 260 && y > ostatniY + 6) top.classList.add('is-hidden');
      else if (y < ostatniY - 6 || y < 120) top.classList.remove('is-hidden');
      ostatniY = y;
    };
    przewijanie();
    window.addEventListener('scroll', przewijanie, { passive: true });
  }

  /* ── 3. HERO: przenikające kadry + podpis ─────────────────────────────────
     Kadr nowy wjeżdża NA WIERZCHU poprzedniego (lekcja z WK Premium):
     przy zwykłym przenikaniu przez moment prześwituje ciemne tło. */
  var scena = q('.hero-media');
  if (scena) {
    var kadry = qa('figure', scena);
    var podpis = q('.hero-cap');
    var i = 0;
    var pokaz = function (n) {
      kadry.forEach(function (f, k) {
        f.classList.toggle('is-on', k === n);
        f.style.zIndex = (k === n) ? 2 : 1;
      });
      if (podpis) podpis.textContent = kadry[n].getAttribute('data-cap') || '';
    };
    if (kadry.length) {
      pokaz(0);
      if (kadry.length > 1 && !spokojnie) {
        setInterval(function () { i = (i + 1) % kadry.length; pokaz(i); }, 6500);
      }
    }
  }

  /* ── 4. POJAWIANIE SIĘ SEKCJI — z trzema bezpiecznikami ───────────────────
     Lekcja 2026-08-06-011: w karcie otwartej w tle IntersectionObserver bywa
     uśpiony i strona zostawała PUSTA. Sam obserwator to za mało. */
  var rv = qa('.rv');
  if (rv.length) {
    var odsloc = function (el) { el.classList.add('is-in'); };
    var odslocWidoczne = function () {
      rv.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        if (el.getBoundingClientRect().top < window.innerHeight * 1.15) odsloc(el);
      });
    };
    if ('IntersectionObserver' in window && !spokojnie) {
      var io = new IntersectionObserver(function (wpisy) {
        wpisy.forEach(function (w) {
          if (w.isIntersecting) { odsloc(w.target); io.unobserve(w.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      rv.forEach(function (el) { io.observe(el); });
    } else {
      rv.forEach(odsloc);
    }
    window.addEventListener('scroll', odslocWidoczne, { passive: true });
    window.addEventListener('resize', odslocWidoczne, { passive: true });
    document.addEventListener('visibilitychange', odslocWidoczne);
    odslocWidoczne();
    setTimeout(odslocWidoczne, 900);
    setTimeout(function () { rv.forEach(odsloc); }, 3500);   /* twardy bezpiecznik */
  }

  /* ── 5. POWIĘKSZANIE ZDJĘĆ ───────────────────────────────────────────── */
  var lb = q('.lb');
  if (lb) {
    var lbImg = q('img', lb);
    var lbCap = q('.lb-cap', lb);
    var pozycje = [];
    var biezaca = 0;
    var zbierz = function () { pozycje = qa('[data-zoom]'); };
    var otworz = function (n) {
      biezaca = (n + pozycje.length) % pozycje.length;
      var el = pozycje[biezaca];
      lbImg.src = el.getAttribute('data-zoom');
      lbImg.alt = el.getAttribute('data-alt') || '';
      if (lbCap) lbCap.textContent = el.getAttribute('data-cap') || '';
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      q('.lb-x', lb).focus();
    };
    var zamknij = function () {
      lb.hidden = true;
      lbImg.removeAttribute('src');
      document.body.style.overflow = '';
    };
    zbierz();
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-zoom]') : null;
      if (t) { e.preventDefault(); zbierz(); otworz(pozycje.indexOf(t)); }
    });
    /* KLAWIATURA (audyt 15.08.2026). Kafle galerii mają `tabindex="0"`, więc da się
       na nie wejść Tabem — a podpięte było WYŁĄCZNIE kliknięcie myszą, czyli element
       dawał się zafokusować i nic nie robił. To gorzej niż brak `tabindex`, bo obiecuje
       interakcję, której nie ma. <figure> nie jest przyciskiem, więc Enter sam z siebie
       kliknięcia nie wygeneruje — trzeba go obsłużyć wprost (WCAG 2.1.1). */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      var t = e.target.closest ? e.target.closest('[data-zoom]') : null;
      if (!t) return;
      e.preventDefault(); zbierz(); otworz(pozycje.indexOf(t));
    });
    var przypnij = function (sel, fn) { var b = q(sel, lb); if (b) b.addEventListener('click', fn); };
    przypnij('.lb-x', zamknij);
    przypnij('.lb-p', function () { otworz(biezaca - 1); });
    przypnij('.lb-n', function () { otworz(biezaca + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) zamknij(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') zamknij();
      if (e.key === 'ArrowLeft') otworz(biezaca - 1);
      if (e.key === 'ArrowRight') otworz(biezaca + 1);
    });
  }

  /* ── 6. OSADZENIA ŁADOWANE PO KLIKNIĘCIU ─────────────────────────────────
     Decyzja K. 07.08.2026 (lekcja 2026-08-06-017): mapa Google i inne osadzenia
     łączą się z obcym serwerem DOPIERO gdy klient kliknie. Dzięki temu strona
     nie wysyła nic bez jego zgody i nie potrzebuje banera cookies — a mapa
     i tak jest prawdziwa. Link <a href> tego problemu nie ma, iframe ma.

     Znacznik:  <div data-po-kliknieciu data-src="…" data-tytul="…"> … <button class="pk-btn"> */
  qa('[data-po-kliknieciu]').forEach(function (zaslona) {
    var przycisk = q('.pk-btn', zaslona) || q('button', zaslona);
    if (!przycisk) return;
    przycisk.addEventListener('click', function () {
      var ramka = document.createElement('iframe');
      ramka.src = zaslona.getAttribute('data-src');
      ramka.title = zaslona.getAttribute('data-tytul') || 'Osadzona treść';
      ramka.loading = 'lazy';
      ramka.referrerPolicy = 'no-referrer-when-downgrade';
      ramka.allowFullscreen = true;
      ramka.style.border = '0';
      zaslona.parentNode.replaceChild(ramka, zaslona);
    });
  });

  /* ── 7. WIDEO: bez pobierania, dopóki nikt nie kliknie ────────────────────
     `preload="none"` oszczędza transfer klienta na telefonie, ale wtedy
     przeglądarka wymaga jawnego load() przed play(). */
  qa('.reel').forEach(function (fig) {
    var v = q('video', fig);
    var btn = q('.reel-btn', fig);
    if (!v || !btn) return;
    btn.addEventListener('click', function () {
      if (fig.classList.contains('gra') && !v.paused) { v.pause(); return; }
      qa('.reel.gra video').forEach(function (inne) {        /* nigdy dwa naraz */
        if (inne !== v) { inne.pause(); inne.closest('.reel').classList.remove('gra'); }
      });
      fig.classList.add('gra');
      if (v.readyState === 0) v.load();
      var p = v.play();
      if (p && p.catch) p.catch(function () { fig.classList.remove('gra'); });
    });
    v.addEventListener('ended', function () { fig.classList.remove('gra'); });
  });

  /* ── 8. FORMULARZ: telefon ALBO e-mail ───────────────────────────────────
     Wymaganie obu naraz wycina zgłoszenia od ludzi, którzy nie chcą podawać
     jednego z nich — a wystarczy nam jedna droga kontaktu. */
  var form = q('form[data-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      var tel = q('[name="telefon"]', form);
      var mail = q('[name="email"]', form);
      var msg = q('.form-error', form);
      if (tel && mail && !tel.value.trim() && !mail.value.trim()) {
        e.preventDefault();
        /* forma „ja" TYLKO dla potwierdzonej firmy jednoosobowej: strona ustawia
           data-osoba="ja" na <html> albo na formularzu; domyślnie bezosobowo */
        var ja = form.getAttribute('data-osoba') === 'ja' ||
                 document.documentElement.getAttribute('data-osoba') === 'ja';
        if (msg) msg.textContent = ja
          ? 'Podaj telefon albo adres e-mail, żebym mógł odpowiedzieć.'
          : 'Podaj telefon albo adres e-mail, żeby odpowiedzieć na wiadomość.';
        tel.focus();
      }
    });
  }

  /* ── 9. ROK W STOPCE ─────────────────────────────────────────────────────
     Żeby strona nie zestarzała się sama w styczniu. */
  var rok = q('[data-year]');
  if (rok) rok.textContent = new Date().getFullYear();

  /* ── 10. RUCH PRZY PRZEWIJANIU ────────────────────────────────────────────
     Powód (K. 12.08.2026): „w czasach TikToka ludzie nie potrafią skupić się
     dłużej niż 2 sekundy" — statyczna strona przewijana w dół nie daje oku
     żadnego powodu, żeby zostać. Ruch ma PROWADZIĆ WZROK, nie popisywać się:
     wszystko poniżej jest tanie obliczeniowo (transform/opacity, jedno rAF),
     bo klient ogląda to na telefonie w aucie między robotami.

     Bezpieczniki są te same co w bloku 4 — przy `prefers-reduced-motion`
     treść po prostu stoi na miejscu, a każdy efekt ma stan końcowy nawet gdy
     obserwator nie zadziała. Żaden z tych efektów nie może ukryć treści. */

  /* 10a. KASKADA — dzieci sekcji wchodzą po kolei, nie wszystkie naraz.
     Element z klasą `.kaskada` dostaje na dzieciach zmienną `--i`, a `app.css`
     przelicza ją na opóźnienie. Rytm > jednoczesność: oko wodzi po kolejnych
     pozycjach zamiast dostać całą planszę w jednej klatce. */
  qa('.kaskada').forEach(function (rodzic) {
    Array.prototype.slice.call(rodzic.children).forEach(function (dziecko, n) {
      dziecko.style.setProperty('--i', n);
    });
  });

  /* 10b. LICZNIKI — liczba dolicza się, gdy wjedzie w kadr.
     `<span data-licz="15">15</span>`; opcjonalnie data-licz-czas (ms).
     Tekst w HTML zostaje docelowy, więc bez JS i przy wyłączonym ruchu
     czytelnik i wyszukiwarka widzą prawdziwą wartość. */
  var liczniki = qa('[data-licz]');
  if (liczniki.length && !spokojnie && 'IntersectionObserver' in window) {
    var licz = function (el) {
      if (el.getAttribute('data-licz-gotowe')) return;
      el.setAttribute('data-licz-gotowe', '1');
      var cel = parseFloat(el.getAttribute('data-licz'));
      var wzor = el.textContent;                        /* np. „96%" albo „15 lat" */
      if (isNaN(cel)) return;

      /* ⚠️ Liczbę podmieniamy przez PREFIKS + SUFIKS wycięte raz na starcie, nigdy
         przez `wzor.replace(cel, v)`. Wpadka 12.08.2026 (PEC STAL): podmiana przez
         replace na „96%" przy wartości pośredniej 4 dawała „4%" — a gdy animacja się
         nie dokończyła, taka liczba ZOSTAWAŁA na stronie. Klient czytał „4% poleca
         nas". Liczba na stronie klienta nie ma prawa być chwilowo nieprawdziwa. */
      var m = wzor.match(/[\d.,]+/);
      if (!m) return;
      var przed = wzor.slice(0, m.index);
      var po = wzor.slice(m.index + m[0].length);
      var czas = parseInt(el.getAttribute('data-licz-czas'), 10) || 1100;
      var dziesietne = (String(cel).split('.')[1] || '').length;
      var start = null;
      var koniec = function () { el.textContent = wzor; };

      var krok = function (t) {
        if (start === null) start = t;
        var p = Math.min(1, (t - start) / czas);
        /* Wyhamowanie KWADRATOWE, nie sześcienne (uwaga K. 16.08.2026: „żeby było
           widać, jak liczy od 0"). Przy potędze 3 licznik po 1/4 czasu miał już 58%
           wartości, a przez resztę animacji ledwo pełzał — z boku wyglądało to jak
           skok do gotowej liczby, nie jak liczenie. Przy potędze 2 narastanie widać
           przez cały czas trwania. */
        var e = 1 - Math.pow(1 - p, 2);
        el.textContent = przed + (cel * e).toFixed(dziesietne) + po;
        if (p < 1) requestAnimationFrame(krok); else koniec();
      };
      requestAnimationFrame(krok);

      /* Drugi bezpiecznik: rAF zamiera w karcie otwartej w tle, więc licznik
         mógłby tam utknąć w połowie. setTimeout chodzi mimo to i po czasie
         animacji twardo ustawia wartość docelową. */
      setTimeout(koniec, czas + 400);
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') koniec();
      });
    };
    var ioL = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) { if (w.isIntersecting) { licz(w.target); ioL.unobserve(w.target); } });
    }, { threshold: 0.5 });
    liczniki.forEach(function (el) { ioL.observe(el); });
  }

  /* 10c. PARALAKSA — zdjęcie sunie wolniej niż strona, więc sekcja ma głębię.
     ⚠️ Tylko na dużym ekranie i tylko na elementach W KADRZE: na telefonie to
     kosztuje płynność, a płynność sprzedaje lepiej niż efekt.
     `<img data-paralaksa="14">` = maksymalne przesunięcie w pikselach. */
  var paral = qa('[data-paralaksa]');
  if (paral.length && !spokojnie && window.innerWidth > 900) {
    var czeka = false;
    var przelicz = function () {
      czeka = false;
      var h = window.innerHeight;
      paral.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > h + 200) return;
        var sila = parseFloat(el.getAttribute('data-paralaksa')) || 14;
        var srodek = (r.top + r.height / 2 - h / 2) / h;     /* -1 … 1 */
        el.style.transform = 'translate3d(0,' + (srodek * sila).toFixed(1) + 'px,0)';
      });
    };
    var pros = function () { if (!czeka) { czeka = true; requestAnimationFrame(przelicz); } };
    window.addEventListener('scroll', pros, { passive: true });
    window.addEventListener('resize', pros, { passive: true });
    przelicz();
  }

  /* 10d. STAN PRZEWINIĘCIA + PASEK POSTĘPU.
     `is-scrolled` na <html> pozwala CSS-owi zagęścić górny pasek po zjeździe
     z hero. `.postep` (jeśli strona go ma) pokazuje, ile zostało do końca —
     u fachowca z długą stroną to jedyna informacja „ile jeszcze". */
  var postep = q('.postep');
  var czekaS = false;
  var stan = function () {
    czekaS = false;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    document.documentElement.classList.toggle('is-scrolled', y > 60);
    if (postep) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      postep.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')';
    }
  };
  window.addEventListener('scroll', function () {
    if (!czekaS) { czekaS = true; requestAnimationFrame(stan); }
  }, { passive: true });
  window.addEventListener('resize', stan, { passive: true });
  stan();

  /* 10e. PRZEJŚCIE MIĘDZY PODSTRONAMI — zanik zamiast białego mrugnięcia.
     Wchodzące `.przejscie-wejscie` zdejmujemy od razu (CSS robi fade-in),
     a przy kliknięciu w link wewnętrzny dokładamy `.przejscie-wyjscie`.
     ⚠️ Twardy bezpiecznik 700 ms: gdyby nawigacja nie doszła do skutku (błąd
     sieci, cofnięcie), klasa schodzi sama i strona NIE zostaje wyblakła. */
  if (!spokojnie) {
    /* ⚠️ NIE przenikamy strony, gdy gra ekran powitalny (K. 12.08.2026: „dziwnie
       inaczej działa to wejście"). Zasłona leży W ŚRODKU <body>, więc fade całego
       body rozmywał samą kurtynę — dwa efekty jechały jeden przez drugi.
       Klasę `intro-on` dokłada skrypt wejścia z <head>, czyli PRZED tym blokiem. */
    if (!document.documentElement.classList.contains('intro-on')) {
      document.documentElement.classList.add('przejscie-wejscie');
      setTimeout(function () {
        document.documentElement.classList.remove('przejscie-wejscie');
      }, 700);
    }

    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a || e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download') || a.getAttribute('data-bez-przejscia') !== null) return;
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || /^(mailto|tel|javascript):/i.test(href)) return;
      if (a.host && a.host !== location.host) return;                 /* obcy adres */
      if (a.pathname === location.pathname && a.search === location.search) return;
      document.documentElement.classList.add('przejscie-wyjscie');
      setTimeout(function () {
        document.documentElement.classList.remove('przejscie-wyjscie');
      }, 700);
    }, true);

    /* powrót przyciskiem „wstecz" z pamięci podręcznej — bez tego strona
       wraca wyblakła, bo klasa wyjścia zostaje w zamrożonym dokumencie */
    window.addEventListener('pageshow', function () {
      document.documentElement.classList.remove('przejscie-wyjscie');
    });
  }

  /* ── 11. OŚ PROCESU — kroki zapalają się w miarę czytania ─────────────────
     Mechanika przeniesiona z silnika dem (`recipes/multipage/proces-os.js`,
     warsztat ruchu K. z 08.08.2026), gdzie sprawdziła się na kilkunastu demach.
     K. 12.08.2026 przy PEC STALu: „nie mieliśmy dać tego sposobu pokazania
     procesu, tego pionowego?".

     Sedno: RUCH NIESIE INFORMACJĘ, nie zdobi. Licznik i pasek mówią, ile kroków
     zostało, aktywny krok jest wyróżniony, nieprzeczytane są przygaszone — to
     jest różnica między „ładne" a „drogie".

     Znacznik:
       <section class="proces-os">
         <div class="proc-side">…<span class="pc-cur">01</span><span class="pc-all">/ 05</span>
             <div class="proc-bar"><i></i></div><p class="proc-now">…</p></div>
         <ol class="proces-line"><li><h3>Nazwa kroku</h3><p>…</p></li>…</ol>

     BEZPIECZNIK: klasę `os-on` (od której CSS przygasza kroki) dokłada WYŁĄCZNIE
     ten skrypt. Bez niego wszystkie kroki są normalnie widoczne. */
  qa('.proces-os').forEach(function (sekcja) {
    var kroki = qa('.proces-line > li', sekcja);
    if (kroki.length < 2) return;
    if (spokojnie) { kroki.forEach(function (li) { li.classList.add('os-seen'); }); return; }

    document.documentElement.classList.add('os-on');
    var licznik = q('.pc-cur', sekcja);
    var pasek = q('.proc-bar > i', sekcja);
    var teraz = q('.proc-now', sekcja);
    var nazwy = kroki.map(function (li) { var h = q('h3', li); return h ? h.textContent : ''; });
    var czeka = false;

    var przelicz = function () {
      czeka = false;
      var vh = window.innerHeight, srodek = vh * 0.52, wybrany = -1, najblizej = Infinity;
      kroki.forEach(function (li, i) {
        var r = li.getBoundingClientRect();
        if (r.top < vh * 0.92) li.classList.add('os-seen');   /* raz odsłonięty zostaje */
        var d = Math.abs((r.top + r.height / 2) - srodek);
        if (r.bottom > 0 && r.top < vh && d < najblizej) { najblizej = d; wybrany = i; }
      });
      kroki.forEach(function (li, i) {
        li.classList.toggle('os-live', i === wybrany);
        li.classList.toggle('os-done', wybrany > -1 && i < wybrany);
      });
      if (wybrany > -1) {
        var n = wybrany + 1;
        if (licznik) licznik.textContent = (n < 10 ? '0' : '') + n;
        if (teraz) teraz.textContent = nazwy[wybrany];

        /* POSTĘP LICZONY PŁYNNIE, nie skokami co krok (K. 12.08.2026: „to powinno
           być dłuższe, jak się przewija — już przechodziliśmy przez ten problem").
           Przy czterech krokach skok co 25% wygląda jak zacięcie; tu pasek i oś
           rosną razem z czytaniem, bo mierzymy ŚRODEK aktywnej kropki na osi
           (ten sam sposób co w silniku dem, `proces-os.js`). */
        var os = q('.proces-line', sekcja);
        var akt = kroki[wybrany];
        var pkt = null;
        if (os && akt) {
          var ro = os.getBoundingClientRect(), ra = akt.getBoundingClientRect();
          pkt = Math.max(0, Math.min(100,
            ((ra.top - ro.top) + Math.min(ra.height, 44) / 2 + 6) / ro.height * 100));
          os.style.setProperty('--os-fill', pkt.toFixed(1) + '%');
        }
        if (pasek) pasek.style.width = (pkt === null ? (n / kroki.length * 100) : pkt).toFixed(1) + '%';
      }
    };
    var pros = function () { if (!czeka) { czeka = true; requestAnimationFrame(przelicz); } };
    window.addEventListener('scroll', pros, { passive: true });
    window.addEventListener('resize', pros, { passive: true });
    przelicz();
    /* twardy bezpiecznik, jak w bloku 4: gdyby obserwacja zawiodła (karta w tle,
       błąd pomiaru), po 3,5 s wszystkie kroki i tak są widoczne */
    setTimeout(function () { kroki.forEach(function (li) { li.classList.add('os-seen'); }); }, 3500);
  });
})();
