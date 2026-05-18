document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Lenis smooth scroll (skip for reduced-motion)
  let lenisInstance = null;
  if (typeof Lenis !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lenisInstance = new Lenis({
      duration: 1.0,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      autoRaf: false, // we drive raf via GSAP ticker — avoid double-update jitter
    });
    lenisInstance.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenisInstance.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Page loader ───────────────────────────────────────────────────────────
  let playHeroEntrance = () => {};

  const loaderOverlay = document.getElementById('page-loader');
  const loaderWrap    = document.getElementById('loader-logo-wrap');
  const loaderText    = document.getElementById('loader-text');
  const loaderDot     = document.getElementById('loader-dot');
  const siteNav       = document.getElementById('site-nav');
  const navLogo       = document.getElementById('nav-logo');
  const navCta        = document.getElementById('nav-cta');

  const hasLoader = loaderOverlay && loaderWrap && loaderText && siteNav && navLogo;

  if (hasLoader) {
    document.documentElement.style.overflow = 'hidden';
    if (lenisInstance) lenisInstance.stop();
    gsap.set(siteNav, { autoAlpha: 0 });

    // Wait for Caveat to load so getBoundingClientRect is accurate
    const afterFonts = (cb) => {
      const fallback = setTimeout(() => requestAnimationFrame(cb), 500);
      document.fonts.ready.then(() => { clearTimeout(fallback); requestAnimationFrame(cb); });
    };

    afterFonts(() => {
      // Measure nav targets once fonts are settled
      const navLogoRect = navLogo.getBoundingClientRect();
      const navCenterY  = (siteNav.offsetHeight || 64) / 2;
      const ctaRect     = navCta && window.innerWidth >= 768 ? navCta.getBoundingClientRect() : null;
      const dotX        = ctaRect ? ctaRect.left + ctaRect.width / 2 : window.innerWidth - 60;
      const dotR        = 26;

      // ── Phase 1: place both elements at viewport centre ──────────────────
      gsap.set(loaderWrap, {
        left:      Math.max(24, window.innerWidth * 0.08),
        top:       window.innerHeight * 0.5,
        yPercent:  -50,
        autoAlpha: 1,
      });
      gsap.set(loaderText, { fontSize: '4.5rem' });

      if (loaderDot) {
        gsap.set(loaderDot, {
          left:      window.innerWidth - 60 - dotR,
          top:       window.innerHeight * 0.5 - dotR,
          autoAlpha: 1,
        });
      }

      // ── Phase 4 helper: dot expands into navbar ───────────────────────────
      function revealNav() {
        document.documentElement.style.overflow = '';
        if (lenisInstance) lenisInstance.start();
        // Pin spacers + section offsets were measured behind overflow:hidden — recompute now
        requestAnimationFrame(() => ScrollTrigger.refresh());

        const navLinks   = document.getElementById('nav-links');
        const navActions = document.getElementById('nav-actions');

        // Nav visible but children hidden — clip starts at dot position
        gsap.set(siteNav, {
          autoAlpha: 1,
          clipPath:  `circle(${dotR}px at ${dotX}px ${navCenterY}px)`,
        });
        if (navLinks)   gsap.set(navLinks,   { autoAlpha: 0 });
        if (navActions) gsap.set(navActions, { autoAlpha: 0 });

        // Clip sweeps left across full nav (dot position → full width)
        gsap.to(siteNav, {
          clipPath:  `circle(3000px at ${dotX}px ${navCenterY}px)`,
          duration:  1.0,
          ease:      'power2.inOut',
          onComplete: () => gsap.set(siteNav, { clipPath: 'none' }),
        });

        // Dot morphs into the Schedule Demo button shape, then fades as button appears
        if (loaderDot && ctaRect) {
          const btnRadius = getComputedStyle(navCta).borderRadius || '9999px';
          gsap.to(loaderDot, {
            left:         ctaRect.left,
            top:          ctaRect.top,
            width:        ctaRect.width,
            height:       ctaRect.height,
            borderRadius: btnRadius,
            duration:     0.45,
            ease:         'power2.inOut',
            onComplete: () => gsap.to(loaderDot, { autoAlpha: 0, duration: 0.2 }),
          });
        } else if (loaderDot) {
          gsap.to(loaderDot, { autoAlpha: 0, duration: 0.35 });
        }

        // CTA + Sign In appear as dot completes its morph
        if (navActions) gsap.to(navActions, { autoAlpha: 1, duration: 0.4, delay: 0.4 });

        // Nav links (Product, Channels, etc.) appear simultaneously, slightly after CTA
        if (navLinks) gsap.to(navLinks, { autoAlpha: 1, duration: 0.4, delay: 0.35 });

        // Loader logo out, real nav logo in
        gsap.to(loaderWrap, { autoAlpha: 0, duration: 0.3,  delay: 0.25 });
        gsap.to(navLogo,    { autoAlpha: 1, duration: 0.35, delay: 0.4  });

        gsap.to(loaderOverlay, {
          autoAlpha: 0, duration: 0.7, delay: 0.3,
          onComplete: () => {
            loaderOverlay.remove();
            loaderWrap.remove();
            loaderDot && loaderDot.remove();
          },
        });

        gsap.delayedCall(0.75, () => playHeroEntrance());
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        revealNav();
        return;
      }

      // ── Phase 2: type "Stella" at centre-left ────────────────────────────
      const word     = 'Stella';
      const typeDone = (word.length - 1) * 0.13; // ~0.65 s

      word.split('').forEach((char, i) => {
        gsap.delayedCall(i * 0.13, () => { loaderText.textContent += char; });
      });

      // ── Phase 3: slide up to navbar positions (0.55 s pause after typing) ─
      gsap.delayedCall(typeDone + 0.55, () => {
        const moveTl = gsap.timeline({ onComplete: revealNav });

        moveTl.to(loaderWrap, {
          left:     navLogoRect.left,
          top:      navLogoRect.top + navLogoRect.height / 2,
          duration: 0.75,
          ease:     'power3.inOut',
        }, 0);

        moveTl.to(loaderText, {
          fontSize: '2.25rem',
          duration: 0.75,
          ease:     'power3.inOut',
        }, 0);

        if (loaderDot) {
          moveTl.to(loaderDot, {
            left:     dotX - dotR,
            top:      navCenterY - dotR,
            duration: 0.75,
            ease:     'power3.inOut',
          }, 0);
        }
      });
    });

  } else {
    gsap.delayedCall(0.1, () => playHeroEntrance());
  }
  // ─────────────────────────────────────────────────────────────────────────

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {

    // Splash entrance — triggered after loader exits
    // Elements are visible by default; gsap.from() adds the slide-in on top
    playHeroEntrance = () => {
      gsap.from('#splash-word', { opacity: 0, y: 30, duration: 1.0, ease: 'power3.out' });
      gsap.from('#splash-tag',  { opacity: 0, y: 15, duration: 0.7, ease: 'power2.out', delay: 0.3 });
      gsap.from('#splash-cue',  { opacity: 0,         duration: 0.5, ease: 'power2.out', delay: 0.6 });
    };

    // Hero entrance on scroll
    const headlineSplit = new SplitText('#hero-headline', { type: 'lines' });
    const subheadSplit  = new SplitText('#hero-subhead',  { type: 'lines' });

    headlineSplit.lines.forEach(line => {
      const mask = document.createElement('div');
      mask.style.cssText = 'overflow:hidden;display:block';
      line.parentNode.insertBefore(mask, line);
      mask.appendChild(line);
    });

    const heroScrollTl = gsap.timeline({ paused: true })
      .from(headlineSplit.lines, { y: '105%', duration: 0.85, ease: 'power3.out', stagger: 0.1 })
      .from(subheadSplit.lines,  { y: 28, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08 }, '-=0.35')
      .from('#hero-ctas',        { y: 20, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2');

    ScrollTrigger.create({
      trigger: '#hero', start: 'top 78%', once: true,
      onEnter: () => heroScrollTl.play()
    });

    // Subtle blob drift
    gsap.to('#hero-blob-1', { x: 60, y: 40, duration: 18, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    // Hero button effects
    initHeroButtonEffects();

    // Section reveals — buttery cascade
    gsap.utils.toArray('.section-reveal').forEach(section => {
      const headline = section.querySelector('[data-reveal="headline"]');
      const subhead  = section.querySelector('[data-reveal="subhead"]');
      const cta      = section.querySelector('[data-reveal="cta"]');
      const cards    = section.querySelectorAll('.card-reveal');
      const hasAnnotations = headline || subhead || cta || cards.length;

      const tl = gsap.timeline({ paused: true });

      if (headline) {
        const split = new SplitText(headline, { type: 'lines' });
        split.lines.forEach(line => {
          const mask = document.createElement('div');
          mask.style.cssText = 'overflow:hidden;display:block';
          line.parentNode.insertBefore(mask, line);
          mask.appendChild(line);
        });
        tl.from(split.lines, { y: '105%', duration: 0.85, stagger: 0.1, ease: 'power3.out' }, 0);
      }
      if (subhead) {
        tl.from(subhead, { y: 28, opacity: 0, duration: 1.0, ease: 'power2.out' }, headline ? 0.25 : 0);
      }
      if (cards.length) {
        tl.from(cards, { y: 28, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, headline || subhead ? 0.35 : 0);
      }
      if (cta) {
        tl.from(cta, { y: 16, opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.55);
      }
      if (!hasAnnotations) {
        tl.from(section, { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0);
      }

      ScrollTrigger.create({
        trigger: section, start: 'top 78%', once: true,
        onEnter: () => tl.play()
      });
    });

    // Metrics counter animation
    gsap.utils.toArray('[data-count]').forEach(el => {
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      ScrollTrigger.create({
        trigger: el, start: 'top 80%', once: true,
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target, duration: 1.8, ease: 'power2.out',
            onUpdate() { el.textContent = prefix + Math.round(this.targets()[0].val) + suffix; }
          });
        }
      });
    });

    // Bento grid entrance — fires once on scroll, never hides cells before trigger
    if (document.getElementById('bento-grid')) {
      const bentoCells = gsap.utils.toArray('#bento-grid .bento-cell');
      ScrollTrigger.create({
        trigger: '#bento-grid', start: 'top 82%', once: true,
        onEnter: () => {
          gsap.fromTo(bentoCells,
            { y: 28, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: 'power3.out' }
          );
        }
      });
    }

    // Bento cell — running green border arc on hover
    (function () {
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        @property --bento-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        .bento-glow-spin {
          animation: bento-border-spin 2.4s linear infinite;
        }
        @keyframes bento-border-spin {
          to { --bento-angle: 360deg; }
        }
      `;
      document.head.appendChild(styleEl);

      document.querySelectorAll('#bento-grid .bento-cell').forEach(cell => {
        const glow = document.createElement('span');
        glow.setAttribute('aria-hidden', 'true');
        Object.assign(glow.style, {
          position:            'absolute',
          inset:               '0',
          borderRadius:        'inherit',
          padding:             '2px',
          background:          'conic-gradient(from var(--bento-angle) at 50% 50%, transparent 0%, rgba(134,239,172,0.5) 8%, rgba(134,239,172,1) 15%, #10B981 18%, rgba(134,239,172,1) 21%, rgba(134,239,172,0.5) 28%, transparent 36%, transparent 100%) border-box',
          webkitMask:          'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          webkitMaskComposite: 'xor',
          maskComposite:       'exclude',
          pointerEvents:       'none',
          zIndex:              '10',
          opacity:             '0'
        });
        cell.style.position = 'relative';
        cell.appendChild(glow);

        cell.addEventListener('mouseenter', () => {
          glow.classList.add('bento-glow-spin');
          gsap.to(glow, { opacity: 1, duration: 0.25, ease: 'power2.out', overwrite: true });
        });

        cell.addEventListener('mouseleave', () => {
          gsap.to(glow, {
            opacity: 0, duration: 0.5, ease: 'power2.out', overwrite: true,
            onComplete: () => glow.classList.remove('bento-glow-spin')
          });
        });
      });
    }());

    // Competitive landscape — cross draws in, then competitors two at a time (spread apart)
    if (document.getElementById('landscape-chart')) {
      const dots = gsap.utils.toArray('.landscape-dot');
      // dots order: 0=Gorgias(BL) 1=SwapCommerce(TL) 2=AlhenaAI(TL) 3=TidioLyro(BR) 4=ManifestAI(BR) 5=RepAI(MR) 6=ZipchatAI(BR) 7=Stella
      const competitors = dots.slice(0, 7);
      const stella = dots[7];

      gsap.set([...competitors, stella], { scale: 0, opacity: 0, transformOrigin: 'center center' });
      gsap.set('#landscape-vline', { scaleY: 0, transformOrigin: 'center center' });
      gsap.set('#landscape-hline', { scaleX: 0, transformOrigin: 'center center' });

      // Each pair is spatially spread: TL+BR, BL+right, TL+BR
      const pairs = [
        [1, 3],  // Swap Commerce (top-left) + Tidio Lyro (bottom-right)
        [0, 6],  // Gorgias (bottom-left) + Zipchat AI (right)
        [2, 4],  // Alhena AI (top-left) + Manifest AI (bottom-right)
      ];

      ScrollTrigger.create({
        trigger: '#landscape-chart', start: 'top 75%', once: true,
        onEnter: () => {
          const tl = gsap.timeline();

          // 1. Axes wrapper fades in (labels appear), then lines draw themselves
          tl.to('#landscape-axes', { opacity: 1, duration: 0.4, ease: 'power2.out' });
          tl.to('#landscape-vline', { scaleY: 1, duration: 1.0, ease: 'power2.inOut' }, '+=0.1');
          tl.to('#landscape-hline', { scaleX: 1, duration: 1.0, ease: 'power2.inOut' }, '<+0.2');

          // 2. Cycle pairs — only 2 visible at a time, each pair spread across the chart
          let activeDots = [];
          pairs.forEach((pair) => {
            const incoming = pair.map(idx => competitors[idx]);
            if (activeDots.length) {
              tl.to(activeDots, { opacity: 0, scale: 0.5, duration: 0.35, ease: 'power2.in' }, '+=0.35');
            }
            tl.to(incoming, {
              scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.5)', stagger: 0.2,
            }, activeDots.length ? '-=0.1' : '+=0.45');
            tl.to({}, { duration: 1.6 });
            activeDots = incoming;
          });

          // 3. Fade out last pair, reveal all competitors together
          tl.to(activeDots, { opacity: 0, scale: 0.5, duration: 0.3, ease: 'power2.in' }, '+=0.35');
          tl.to(competitors, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.5)', stagger: 0.07 }, '+=0.15');

          // 4. Stella pops in last
          tl.to(stella, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(3)' }, '+=0.25');
        }
      });
    }

    // Channel bar width animation
    gsap.utils.toArray('.channel-bar').forEach(el => {
      const targetWidth = el.dataset.width || '0%';
      gsap.fromTo(el, { width: '0%' }, {
        width: targetWidth, duration: 1.2, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });

    // How It Works — pinned scroll, scrub-driven cross-fade between panels
    if (document.getElementById('hiw-panel-wrap')) {
      const tabEls   = Array.from(document.querySelectorAll('.hiw-tab'));
      const descEls  = Array.from(document.querySelectorAll('.hiw-desc'));
      const indicator = document.getElementById('hiw-indicator');
      let tabPos      = [];

      function measureTabs() {
        tabPos = tabEls.map(t => ({ x: t.offsetLeft, w: t.offsetWidth }));
        if (indicator && tabPos[0]) gsap.set(indicator, { x: tabPos[0].x, width: tabPos[0].w });
      }

      requestAnimationFrame(measureTabs);

      // Entrance
      ScrollTrigger.create({
        trigger: '#hiw-header', start: 'top 82%', once: true,
        onEnter: () => {
          gsap.from('#hiw-header',     { y: 28, opacity: 0, duration: 0.7, ease: 'power3.out' });
          gsap.from('#hiw-tabs',       { y: 20, opacity: 0, duration: 0.6, delay: 0.15, ease: 'power3.out' });
          gsap.from('#hiw-panel-wrap', { y: 24, opacity: 0, duration: 0.7, delay: 0.25, ease: 'power3.out',
            onComplete: measureTabs });
        }
      });

      // Desktop — pure scrub timeline, no threshold callbacks
      if (window.innerWidth >= 1024) {
        measureTabs(); // sync measure so tabPos is ready for timeline init

        const panelsInner = document.getElementById('hiw-panels-inner');
        const panelWrap   = document.getElementById('hiw-panel-wrap');
        const CARD_GAP    = 24;
        const slideX      = (n) => -(panelWrap.offsetWidth + CARD_GAP) * n;

        gsap.set(tabEls[0],  { opacity: 1 });
        gsap.set([tabEls[1], tabEls[2]], { opacity: 0.35 });
        gsap.set(tabEls[0].querySelector('.tab-name'), { color: '#166534' });
        gsap.set(descEls[0], { opacity: 1 });
        gsap.set([descEls[1], descEls[2]], { opacity: 0 });

        const hiwTl = gsap.timeline({ defaults: { ease: 'none' } });

        // t=0 ── anchor indicator to tab 0
        hiwTl.set(indicator, {
          x: () => tabPos[0]?.x ?? 0,
          width: () => tabPos[0]?.w ?? 0,
        }, 0);

        // t 0→1.0 ── hold on step 0 (Connect)
        hiwTl.to({}, { duration: 1.0 });

        // t 0.6→1.5 ── indicator glides to tab 1 (leads card by 0.4 units)
        hiwTl.to(indicator, {
          x: () => tabPos[1]?.x ?? 0,
          width: () => tabPos[1]?.w ?? 0,
          ease: 'sine.inOut', duration: 0.9,
        }, 0.6);

        // t 1.0→1.8 ── whole card row slides slowly left (card 1 out, card 2 in)
        hiwTl
          .to(panelsInner, { x: () => slideX(1), duration: 0.8, ease: 'power2.inOut' }, 1.0)
          .to(descEls[0],  { opacity: 0, duration: 0.5 }, 1.0)
          .to(descEls[1],  { opacity: 1, duration: 0.5 }, 1.2)
          .to(tabEls[0],   { opacity: 0.35, duration: 0.6 }, 1.0)
          .to(tabEls[1],   { opacity: 1,    duration: 0.6 }, 1.0)
          .to(tabEls[0].querySelector('.tab-name'), { color: '#000000', duration: 0.6 }, 1.0)
          .to(tabEls[1].querySelector('.tab-name'), { color: '#166534', duration: 0.6 }, 1.0);

        // t 1.8→2.8 ── hold on step 1 (Configure)
        hiwTl.to({}, { duration: 1.0 });

        // t 2.4→3.3 ── indicator glides to tab 2
        hiwTl.to(indicator, {
          x: () => tabPos[2]?.x ?? 0,
          width: () => tabPos[2]?.w ?? 0,
          ease: 'sine.inOut', duration: 0.9,
        }, 2.4);

        // t 2.8→3.6 ── card row slides slowly left again (card 2 out, card 3 in)
        hiwTl
          .to(panelsInner, { x: () => slideX(2), duration: 0.8, ease: 'power2.inOut' }, 2.8)
          .to(descEls[1],  { opacity: 0, duration: 0.5 }, 2.8)
          .to(descEls[2],  { opacity: 1, duration: 0.5 }, 3.0)
          .to(tabEls[1],   { opacity: 0.35, duration: 0.6 }, 2.8)
          .to(tabEls[2],   { opacity: 1,    duration: 0.6 }, 2.8)
          .to(tabEls[1].querySelector('.tab-name'), { color: '#000000', duration: 0.6 }, 2.8)
          .to(tabEls[2].querySelector('.tab-name'), { color: '#166534', duration: 0.6 }, 2.8);

        // t 3.6→4.3 ── hold on step 2 (Sell)
        hiwTl.to({}, { duration: 0.7 });

        ScrollTrigger.create({
          trigger: '#hiw-section',
          pin: true, pinSpacing: true,
          start: 'top top+=64', end: '+=300%',
          scrub: 0.6,
          animation: hiwTl,
        });
      }

      // Mobile
      document.querySelectorAll('.hiw-mobile-step').forEach(el => {
        gsap.from(el, {
          y: 22, opacity: 0, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true }
        });
      });

      const cursor = document.getElementById('hiw-cursor');
      if (cursor) gsap.to(cursor, { opacity: 0, repeat: -1, yoyo: true, duration: 0.5, ease: 'none' });
    }

    // Five moments — visible staircase; scrub-driven scroll pulls each card into row
    const fmSection = document.getElementById('five-moments');
    const fmCards = gsap.utils.toArray('#five-moments .fm-card-row');
    if (fmSection && fmCards.length) {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 768px)', () => {
        const STEP_Y = 240; // vertical gap between staircase cards

        // Card 1 stays in row; cards 2-4 form the visible descending staircase
        gsap.set(fmCards[0], { clearProps: 'all' });
        fmCards.slice(1).forEach((card, idx) => {
          gsap.set(card, {
            y: (idx + 1) * STEP_Y,
            opacity: 0.72,
            scale: 1 - (idx + 1) * 0.025
          });
        });

        // All cards move simultaneously at the same px/unit speed — closer cards arrive first
        const tl = gsap.timeline();
        fmCards.slice(1).forEach((card, idx) => {
          tl.to(card, { y: 0, opacity: 1, scale: 1, ease: 'power1.inOut', duration: idx + 1 }, 0);
        });

        const st = ScrollTrigger.create({
          trigger: fmSection,
          start: 'top 64px',
          end: `+=${(fmCards.length - 1) * 400}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          animation: tl
        });

        return () => st.kill();
      });

      mm.add('(max-width: 767px)', () => {
        gsap.set(fmCards, { clearProps: 'all' });
        gsap.set(fmCards, { opacity: 0, scale: 0.92 });
        ScrollTrigger.create({
          trigger: fmSection,
          start: 'top 80%',
          once: true,
          onEnter() {
            gsap.to(fmCards, {
              opacity: 1, scale: 1,
              duration: 0.55, ease: 'power2.out',
              stagger: 0.15
            });
          }
        });
      });

      // Read-more cursor — fine pointer (mouse) only
      if (window.matchMedia('(pointer: fine)').matches) {
        const cur = document.createElement('div');
        cur.id = 'fm-read-cursor';
        cur.textContent = 'Read more →';
        document.body.appendChild(cur);

        gsap.set(cur, { xPercent: 0, yPercent: -50, opacity: 0, scale: 0.85, visibility: 'hidden' });
        const setX = gsap.quickSetter(cur, 'x', 'px');
        const setY = gsap.quickSetter(cur, 'y', 'px');

        fmSection.addEventListener('mousemove', e => {
          gsap.set(cur, { visibility: 'visible' });
          setX(e.clientX + 18);
          setY(e.clientY);
        });

        fmCards.forEach(card => {
          card.addEventListener('mouseenter', () =>
            gsap.to(cur, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.4)', overwrite: true })
          );
          card.addEventListener('mouseleave', () =>
            gsap.to(cur, { opacity: 0, scale: 0.8, duration: 0.25, ease: 'power2.in', overwrite: true })
          );
        });

        fmSection.addEventListener('mouseleave', () => {
          gsap.to(cur, { opacity: 0, scale: 0.85, duration: 0.15, overwrite: true });
          gsap.set(cur, { visibility: 'hidden', delay: 0.15 });
        });
      }
    }

    // Testimonials — scroll-driven horizontal card marquee
    if (document.getElementById('testimonials-track')) {
      const track = document.getElementById('testimonials-track');
      const getSlide = () => -(track.scrollWidth - track.parentElement.clientWidth);

      ScrollTrigger.create({
        trigger: '#testimonials-section',
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 0.6,
        onUpdate: self => {
          gsap.set(track, { x: getSlide() * self.progress });
        }
      });
    }

    // Stella Universe — "The Aperture": clip-path expand → hold → collapse
    const universeSection = document.getElementById('stella-universe-section');
    if (universeSection) {
      const frame       = document.getElementById('stella-window-frame');
      const outside     = document.getElementById('stella-outside');
      const ring        = document.getElementById('universe-ring');
      const preview     = document.getElementById('window-preview');
      const previewCard = document.getElementById('window-preview-card');
      const univ        = document.getElementById('window-universe');
      const vignette    = document.getElementById('universe-vignette');

      const W    = universeSection.offsetWidth;
      const H    = universeSection.offsetHeight;
      const winW = Math.min(640, W - 80);
      const winH = Math.min(460, H - 120);

      const cx = Math.round((W - winW) / 2);
      const cy = Math.round((H - winH) / 2);

      if (ring)        gsap.set(ring,        { width: winW, height: winH });
      if (previewCard) gsap.set(previewCard,  { width: winW, height: winH });
      if (univ)        gsap.set(univ,         { scale: 0.97 });

      // Iris fully retracts at full expansion — the "aperture" detail
      const clipSmall = `inset(${cy}px ${cx}px round 20px)`;
      const clipFull  = 'inset(0px 0px round 0px)';

      gsap.set(frame, { clipPath: clipSmall });

      const universeTl = gsap.timeline();
      universeTl
        // ── Phase 1: EXPAND ─────────────────────────────────────────────
        // Aperture opens immediately
        .to(frame,           { clipPath: clipFull, ease: 'power3.inOut', duration: 1.2 }, 0)
        // Outside world defocuses and recedes (tiny delay so nothing starts at exactly t=0)
        .to(outside,         { opacity: 0, filter: 'blur(10px)', duration: 0.35, ease: 'power1.in' }, 0.05)
        // Ring blooms outward — the boundary dissolves
        .to(ring,            { scale: 1.4, opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.1)
        // Preview card recedes into the viewfinder
        .to(previewCard,     { opacity: 0, scale: 0.94, duration: 0.3, ease: 'power2.in' }, 0.1)
        // Cinematic vignette blooms then clears
        .to(vignette,        { opacity: 0.75, duration: 0.5, ease: 'power1.inOut' }, 0.1)
        .to(vignette,        { opacity: 0, duration: 0.3, ease: 'power1.out' }, 0.6)
        // Universe crystallizes: zooms slightly in and fades up
        .to(univ,            { opacity: 1, scale: 1.0, duration: 0.35, ease: 'power2.out' }, 0.4)
        // Universe content assembles with stagger
        .from('.universe-stagger', { y: 8, opacity: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, 0.4)

        // ── Phase 2: HOLD open (implicit ~0.8s gap before collapse) ─────
        .to('#universe-exit-cue', { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0.85)
        .to('#universe-exit-cue', { opacity: 0, duration: 0.2, ease: 'power1.in' }, 2.05)

        // ── Phase 3: COLLAPSE ────────────────────────────────────────────
        // Universe zooms out as camera pulls back
        .to(univ,            { opacity: 0, scale: 1.03, duration: 0.2, ease: 'power1.in' }, 2.15)
        // Brief vignette flash reinforces the transition
        .to(vignette,        { opacity: 0.5, duration: 0.3, ease: 'power1.in' }, 2.2)
        // Aperture closes, radius returns to 20px
        .to(frame,           { clipPath: clipSmall, ease: 'power3.inOut', duration: 1.2 }, 2.25)
        .to(vignette,        { opacity: 0, duration: 0.3, ease: 'power1.out' }, 2.55)
        // Preview snaps back — back.out overshoots from 0.94 → above 1 → settles at 1
        .to(previewCard,     { scale: 1.0, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' }, 2.75)
        // Outside world refocuses
        .to(outside,         { opacity: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power2.out' }, 2.8)
        // Ring crystallizes back
        .to(ring,            { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.5)' }, 2.8);

      ScrollTrigger.create({
        trigger: universeSection,
        pin: true, pinSpacing: true,
        start: 'top top',
        end: '+=2400',
        scrub: 0.6,
        animation: universeTl,
        onEnter:     () => gsap.set(siteNav, { opacity: 0, pointerEvents: 'none' }),
        onLeave:     () => { gsap.set(siteNav, { y: -4 }); gsap.to(siteNav, { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.4, ease: 'power2.out' }); },
        onEnterBack: () => gsap.set(siteNav, { opacity: 0, pointerEvents: 'none' }),
        onLeaveBack: () => { gsap.set(siteNav, { y: -4 }); gsap.to(siteNav, { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.4, ease: 'power2.out' }); },
      });
    }

    // World curtain — unfolds from below as footer scrolls away
    const worldEl = document.getElementById('stella-world');
    if (worldEl) {
      gsap.from(worldEl, {
        scaleY: 0.88,
        transformOrigin: 'bottom center',
        ease: 'none',
        scrollTrigger: {
          trigger: worldEl,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
        }
      });
    }

    // World scene — ScrollTrigger entrance + hover interactions
    if (document.getElementById('stella-world')) {
      ScrollTrigger.create({
        trigger: '#stella-world', start: 'top 90%', once: true,
        onEnter: () => {
          gsap.from(['#shop-left', '#building-right'], { y: 60, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.15 });
          gsap.from(['#tree-left', '#tree-right', '#lamp-group'], { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.3, stagger: 0.1 });
          gsap.from('#world-walker',  { opacity: 0, duration: 0.6, delay: 0.6 });
          gsap.from('#world-cyclist', { opacity: 0, duration: 0.6, delay: 0.8 });
        }
      });

      const shopLeft = document.getElementById('shop-left');
      if (shopLeft) {
        shopLeft.addEventListener('mouseenter', () => gsap.to('#shop-chat-bubble', { opacity: 1, y: -6, duration: 0.4, ease: 'power2.out' }));
        shopLeft.addEventListener('mouseleave', () => gsap.to('#shop-chat-bubble', { opacity: 0, y: 0,  duration: 0.3 }));
      }

      const buildingRight = document.getElementById('building-right');
      if (buildingRight) {
        buildingRight.addEventListener('mouseenter', () => gsap.to('#building-agent', { opacity: 1, scale: 1.1, duration: 0.4, ease: 'back.out(2)' }));
        buildingRight.addEventListener('mouseleave', () => gsap.to('#building-agent', { opacity: 0, scale: 1,   duration: 0.3 }));
      }
    }

  });

});

function initHeroButtonEffects() {
  // Schedule Demo — cursor-tracking white glow
  const demoBtn = document.getElementById('hero-btn-demo');
  if (demoBtn) {
    const glow = demoBtn.querySelector('.btn-glow-layer');
    demoBtn.addEventListener('mousemove', e => {
      const rect = demoBtn.getBoundingClientRect();
      glow.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
      glow.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
      gsap.to(glow, { opacity: 1, duration: 0.1, ease: 'none', overwrite: 'auto' });
    });
    demoBtn.addEventListener('mouseleave', () => {
      gsap.to(glow, { opacity: 0, duration: 0.4, ease: 'power2.out' });
    });
  }

  // Contact Sales — direction-aware drag fill
  const salesBtn = document.getElementById('hero-btn-sales');
  if (salesBtn) {
    const fill = salesBtn.querySelector('.btn-fill-layer');
    let fromRight = false;

    salesBtn.addEventListener('mouseenter', e => {
      const rect = salesBtn.getBoundingClientRect();
      fromRight = (e.clientX - rect.left) > rect.width / 2;
      fill.style.transformOrigin = fromRight ? 'right center' : 'left center';
      gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 0.9, duration: 0.45, ease: 'expo.out', overwrite: 'auto' });
    });

    salesBtn.addEventListener('mousemove', e => {
      const rect = salesBtn.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const rawProgress = fromRight
        ? (rect.width - mouseX) / rect.width
        : mouseX / rect.width;
      const target = 0.9 + (rawProgress * 0.1);
      gsap.to(fill, { scaleX: Math.min(1, target), duration: 0.4, ease: 'power2.out', overwrite: false });
    });

    salesBtn.addEventListener('mouseleave', e => {
      const rect = salesBtn.getBoundingClientRect();
      const exitRight = (e.clientX - rect.left) > rect.width / 2;
      fill.style.transformOrigin = exitRight ? 'right center' : 'left center';
      gsap.to(fill, { scaleX: 0, duration: 0.4, ease: 'expo.in', overwrite: 'auto' });
    });
  }
}

// ── Stella Demo — Alpine component ──────────────────────────────────────────
function stellaDemo() {
  return {
    products: [
      { id: 1, name: 'Trail Runner X',  price: 3200, category: 'shoes',   emoji: '👟', tag: 'Bestseller' },
      { id: 2, name: 'Street Pace Pro', price: 4500, category: 'shoes',   emoji: '👠', tag: 'New' },
      { id: 3, name: 'CloudWalk Lite',  price: 2800, category: 'shoes',   emoji: '🥿', tag: 'Sale' },
      { id: 4, name: 'Dry-Fit Tee',     price: 1200, category: 'apparel', emoji: '👕', tag: null },
      { id: 5, name: 'Track Shorts',    price: 1800, category: 'apparel', emoji: '🩳', tag: null },
      { id: 6, name: 'Sports Cap',      price:  800, category: 'apparel', emoji: '🧢', tag: null },
    ],

    messages: [
      { role: 'bot', text: "Hi! I'm Stella. What are you looking for today?" }
    ],
    userInput: '',
    messageCount: 0,

    visibleProductIds: [1, 2, 3],

    cart: [],

    view: 'shop',
    toast: null,
    _toastTimer: null,
    cursorX: 0,
    cursorY: 0,
    cursorVisible: false,

    _openingScript: [
      { reply: "Found 3 great options! Pulled them up on the right →", ids: [1, 2, 3] },
      { reply: "You can click 'Add to cart' or just ask me to. What else can I help with?", ids: [1, 2, 3] },
    ],

    get visibleProducts() {
      return this.products.filter(p => this.visibleProductIds.includes(p.id));
    },

    get cartCount() {
      return this.cart.reduce((sum, item) => sum + item.qty, 0);
    },

    get cartTotal() {
      return this.cart.reduce((sum, item) => {
        const p = this.products.find(p => p.id === item.id);
        return sum + (p ? p.price * item.qty : 0);
      }, 0);
    },

    get cartItems() {
      return this.cart.map(item => {
        const p = this.products.find(p => p.id === item.id);
        return { id: item.id, qty: item.qty, name: p.name, price: p.price, subtotal: p.price * item.qty };
      });
    },

    send() {
      const text = this.userInput.trim();
      if (!text) return;
      this.messages.push({ role: 'user', text });
      this.userInput = '';

      setTimeout(() => {
        if (this.messageCount < this._openingScript.length) {
          const script = this._openingScript[this.messageCount];
          this.visibleProductIds = script.ids;
          this.messages.push({ role: 'bot', text: script.reply });
        } else {
          const lower = text.toLowerCase();
          if (/shoe|run|sneak|trail|pace|cloud/.test(lower)) {
            this.visibleProductIds = [1, 2, 3];
            this.messages.push({ role: 'bot', text: "Here are some great running picks →" });
          } else if (/shirt|tee|apparel|top|wear/.test(lower)) {
            this.visibleProductIds = [4, 5, 6];
            this.messages.push({ role: 'bot', text: "Here's our apparel collection →" });
          } else if (/cap|hat/.test(lower)) {
            this.visibleProductIds = [6];
            this.messages.push({ role: 'bot', text: "Found this for you →" });
          } else if (/cheap|budget|under|low|afford/.test(lower)) {
            const sorted = [...this.visibleProductIds].sort((a, b) => {
              return this.products.find(p => p.id === a).price - this.products.find(p => p.id === b).price;
            });
            this.visibleProductIds = sorted;
            this.messages.push({ role: 'bot', text: "Sorted by price — lowest first →" });
          } else if (/add|want|take|get/.test(lower)) {
            const first = this.visibleProducts[0];
            if (first) {
              this.addToCart(first.id);
              this.messages.push({ role: 'bot', text: "Added " + first.name + " to your cart ✓" });
            } else {
              this.messages.push({ role: 'bot', text: "Nothing selected yet — try asking for shoes or apparel first!" });
            }
          } else if (/checkout|pay|order|purchase|done/.test(lower)) {
            if (this.cartCount > 0) {
              this.view = 'checkout';
              this.messages.push({ role: 'bot', text: "Taking you to checkout →" });
            } else {
              this.messages.push({ role: 'bot', text: "Your cart is empty — add something first!" });
            }
          } else {
            this.visibleProductIds = [1, 2, 3];
            this.messages.push({ role: 'bot', text: "Let me pull up some options for you →" });
          }
        }

        this.messageCount++;
        setTimeout(() => {
          const chat = document.querySelector('[data-chat-scroll]');
          if (chat) chat.scrollTop = chat.scrollHeight;
        }, 0);
      }, 500);
    },

    addToCart(id) {
      const existing = this.cart.find(item => item.id === id);
      if (existing) {
        existing.qty++;
      } else {
        this.cart.push({ id, qty: 1 });
      }
      const p = this.products.find(p => p.id === id);
      if (p) {
        this.toast = p.emoji + ' ' + p.name + ' added to cart';
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => { this.toast = null; }, 2000);
      }
    },

    removeFromCart(id) {
      this.cart = this.cart.filter(item => item.id !== id);
    },

    placeOrder() {
      this.view = 'success';
      this.messages.push({ role: 'bot', text: "Your order is confirmed! 🎉 Thanks for trying Stella." });
    },

    shopAgain() {
      this.cart = [];
      this.view = 'shop';
      this.visibleProductIds = [1, 2, 3];
    },

    formatPrice(p) {
      return 'Rs ' + p.toLocaleString('en-IN');
    },
  };
}

document.addEventListener('alpine:init', () => {
  Alpine.data('stellaDemo', stellaDemo);
});
