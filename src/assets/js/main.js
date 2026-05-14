document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Lenis smooth scroll (skip for reduced-motion)
  if (typeof Lenis !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
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
    gsap.set(siteNav, { autoAlpha: 0 });

    // Wait for Pacifico to load so getBoundingClientRect is accurate
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
          fontSize: '1.875rem',
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

    // Hero entrance — paused, triggered after loader exits
    const headlineSplit = new SplitText('#hero-headline', { type: 'lines' });
    const subheadSplit  = new SplitText('#hero-subhead',  { type: 'lines' });

    const heroTl = gsap.timeline({ paused: true, delay: 0.1 })
      .from(headlineSplit.lines, { y: 40, opacity: 0, duration: 0.75, ease: 'power3.out', stagger: 0.1 })
      .from(subheadSplit.lines,  { y: 24, opacity: 0, duration: 0.6,  ease: 'power3.out', stagger: 0.08 }, '-=0.3')
      .from('#hero-ctas',        { y: 20, opacity: 0, duration: 0.5,  ease: 'power3.out' }, '-=0.2');

    playHeroEntrance = () => heroTl.play();

    // Subtle blob drift
    gsap.to('#hero-blob-1', { x: 60, y: 40, duration: 18, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    // Section reveals + per-card stagger
    gsap.utils.toArray('.section-reveal').forEach(section => {
      const cards = section.querySelectorAll('.card-reveal');
      if (cards.length) {
        gsap.from(cards, {
          y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 80%', once: true }
        });
      } else {
        gsap.from(section, {
          y: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 85%', once: true }
        });
      }
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

    // Competitive landscape — dots pop in one by one on scroll
    if (document.getElementById('landscape-chart')) {
      const dots = gsap.utils.toArray('.landscape-dot');
      gsap.set(dots, { scale: 0, opacity: 0, transformOrigin: 'center center' });

      ScrollTrigger.create({
        trigger: '#landscape-chart', start: 'top 75%', once: true,
        onEnter: () => {
          gsap.to('#landscape-axes', { opacity: 1, duration: 0.4, ease: 'power2.out' });
          gsap.to(dots.slice(0, 7), {
            scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.5)',
            stagger: 0.12, delay: 0.35
          });
          gsap.to(dots[7], {
            scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(3)',
            delay: 0.35 + 7 * 0.12 + 0.2
          });
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

    // How It Works — pinned scroll + swiping panels
    if (document.getElementById('hiw-panel-wrap')) {
      const tabEls    = Array.from(document.querySelectorAll('.hiw-tab'));
      const descEls   = Array.from(document.querySelectorAll('.hiw-desc'));
      const panelEls  = [1,2,3].map(n => document.getElementById('hiw-panel-' + n));
      const indicator = document.getElementById('hiw-indicator');
      let currentStep = 0;
      let tabPos      = [];

      function measureTabs() {
        tabPos = tabEls.map(t => ({ x: t.offsetLeft, w: t.offsetWidth }));
        if (indicator && tabPos[0]) gsap.set(indicator, { x: tabPos[0].x, width: tabPos[0].w });
      }

      // Indicator + tab opacity scrub — runs on every scroll tick
      function scrubIndicator(progress) {
        if (!indicator || tabPos.length < 3) return;
        const p    = Math.min(progress * 2, 1.9999);
        const idx  = Math.floor(p);
        const frac = p - idx;
        const a    = tabPos[idx];
        const b    = tabPos[Math.min(idx + 1, 2)];
        gsap.set(indicator, {
          x:     a.x + (b.x - a.x) * frac,
          width: a.w + (b.w - a.w) * frac
        });
        tabEls.forEach((tab, i) => {
          gsap.set(tab, { opacity: Math.max(0.35, 1 - Math.abs(p - i)) });
        });
      }

      // Panel swap + description — fires at step thresholds only
      function activateStep(i, dir) {
        if (i === currentStep) return;
        const prev = currentStep;
        currentStep = i;

        descEls.forEach((el, idx) => {
          gsap.to(el, { opacity: idx === i ? 1 : 0, duration: 0.3, ease: 'power2.out' });
        });

        const panelWrap = document.getElementById('hiw-panel-wrap');
        const exitX  = dir > 0 ? '-65%' : '100%';
        const enterX = dir > 0 ? '100%' : '-65%';
        if (panelWrap) {
          gsap.to(panelWrap, {
            x: exitX, opacity: 0, duration: 0.38, ease: 'power3.in',
            onComplete: () => {
              panelEls.forEach((el, idx) => { if (el) gsap.set(el, { opacity: idx === i ? 1 : 0 }); });
              gsap.fromTo(panelWrap,
                { x: enterX, opacity: 0 },
                { x: '0%',   opacity: 1, duration: 0.45, ease: 'power3.out' }
              );
            }
          });
        }
      }

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

      // Desktop pin
      if (window.innerWidth >= 1024) {
        ScrollTrigger.create({
          trigger: '#hiw-section',
          pin: true, pinSpacing: true,
          start: 'top top', end: '+=200%',
          onUpdate: self => {
            scrubIndicator(self.progress);
            const newStep = Math.min(Math.floor(self.progress * 3), 2);
            if (newStep !== currentStep) activateStep(newStep, newStep > currentStep ? 1 : -1);
          }
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
          scrub: 1.5,
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
        cur.innerHTML = '<svg width="11" height="13" viewBox="0 0 11 13" fill="none" style="display:inline-block;vertical-align:middle;margin-right:5px;flex-shrink:0"><path d="M1 1l9 5.5-4.2 1L8 12 6.2 12.6 4 7.1 1 9.8z" fill="white"/></svg>Read more →';
        document.body.appendChild(cur);

        gsap.set(cur, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.85, visibility: 'hidden' });
        const setX = gsap.quickSetter(cur, 'x', 'px');
        const setY = gsap.quickSetter(cur, 'y', 'px');

        fmSection.addEventListener('mousemove', e => {
          gsap.set(cur, { visibility: 'visible' });
          setX(e.clientX);
          setY(e.clientY);
        });

        fmCards.forEach(card => {
          card.addEventListener('mouseenter', () =>
            gsap.to(cur, { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out', overwrite: true })
          );
          card.addEventListener('mouseleave', () =>
            gsap.to(cur, { opacity: 0, scale: 0.85, duration: 0.2, overwrite: true })
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
        scrub: 1.5,
        onUpdate: self => {
          gsap.set(track, { x: getSlide() * self.progress });
        }
      });
    }

    // Stella Universe — clip-path expand → hold → collapse within pinned section
    const universeSection = document.getElementById('stella-universe-section');
    if (universeSection) {
      const frame       = document.getElementById('stella-window-frame');
      const outside     = document.getElementById('stella-outside');
      const ring        = document.getElementById('universe-ring');
      const preview     = document.getElementById('window-preview');
      const previewCard = document.getElementById('window-preview-card');
      const univ        = document.getElementById('window-universe');

      const W    = universeSection.offsetWidth;
      const H    = universeSection.offsetHeight;
      const winW = Math.min(640, W - 80);   // cap to viewport with margin
      const winH = Math.min(460, H - 120);  // cap to viewport with margin

      // Center the clip window, accounting for visible area below nav
      const cx = Math.round((W - winW) / 2);
      const cy = Math.round((H - winH) / 2);

      // Keep ring + preview card in sync with computed window size
      if (ring) {
        gsap.set(ring, { width: winW, height: winH });
      }
      if (previewCard) {
        gsap.set(previewCard, { width: winW, height: winH });
      }

      const clipSmall = `inset(${cy}px ${cx}px round 20px)`;
      const clipFull  = 'inset(0px 0px round 0px)';

      // Set clip before first paint to avoid flash
      gsap.set(frame, { clipPath: clipSmall });

      const universeTl = gsap.timeline();
      universeTl
        // ── Phase 1: EXPAND (0 → 1.0) ──────────────────────────────────
        .to(outside,         { opacity: 0, duration: 0.4, ease: 'power1.in' }, 0)
        .to(ring,            { opacity: 0, duration: 0.25, ease: 'power1.in' }, 0)
        .to(frame,           { clipPath: clipFull, ease: 'power2.inOut', duration: 1 }, 0)
        .to(preview,         { opacity: 0, duration: 0.2, ease: 'power1.in' }, 0.05)
        .to(univ,            { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.3)

        // ── Phase 2: HOLD open (1.0 → 1.8) ─────────────────────────────
        .to({}, { duration: 0.8 })

        // ── Phase 3: COLLAPSE back to window (1.8 → 3.0) ───────────────
        .to(univ,            { opacity: 0, duration: 0.2, ease: 'power1.in' }, 1.8)
        .to(frame,           { clipPath: clipSmall, ease: 'power2.inOut', duration: 1 }, 1.9)
        .to(preview,         { opacity: 1, duration: 0.25, ease: 'power2.out' }, 2.65)
        .to([outside, ring], { opacity: 1, duration: 0.3,  ease: 'power2.out' }, 2.7);

      ScrollTrigger.create({
        trigger: universeSection,
        pin: true, pinSpacing: true,
        start: 'top top',
        end: '+=2400',
        scrub: 1.5,
        animation: universeTl
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
