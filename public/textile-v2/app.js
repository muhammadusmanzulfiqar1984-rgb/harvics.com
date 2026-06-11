(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.site-nav a')];
  const revealEls = [...document.querySelectorAll('.reveal, .reveal-left, .reveal-right')];
  const statNums = [...document.querySelectorAll('.stat-num[data-target]')];
  const lazyMedia = [...document.querySelectorAll('[loading="lazy"]')];
  const cards = [...document.querySelectorAll('.card')];
  const orbitalGlobe = document.querySelector('.orbital-globe');
  const cinematicTitles = [...document.querySelectorAll('.display-title, .section-title')];

  cinematicTitles.forEach((title) => title.classList.add('cinematic-title'));

  // ── Camera Flash element ──
  const cameraFlash = document.createElement('div');
  cameraFlash.className = 'camera-flash';
  cameraFlash.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cameraFlash);

  // ── Editorial Chapter Background Numbers ──
  const chapterMap = {
    'who-we-are': 'I',
    'principles':  'II',
    'reach':       'III',
    'supply-chain':'IV',
    'portfolio':   'V',
    'network':     'VI',
    'contact':     'VII',
  };

  // Fashion-week editorial caption per chapter
  const fwCaptionEl = document.querySelector('[data-fw-caption]');
  const fwCaptions = {
    'hero':         'LOOK 01 · Built For The Intelligence Of Global Trade · SS 2026',
    'who-we-are':   'LOOK 02 · Engineered For The Complexity Of Global Trade · SS 2026',
    'principles':   'LOOK 03 · Principles That Lead The Chain · SS 2026',
    'reach':        'LOOK 04 · From Source To Shore · SS 2026',
    'supply-chain': 'LOOK 05 · End-To-End Supply Chain Command · SS 2026',
    'architecture': 'LOOK 06 · No Gaps. No Exit. · SS 2026',
    'future':       'LOOK 07 · The Future Of Trade Is Intelligent · SS 2026',
    'speed':        'LOOK 08 · Speed As A Competence · SS 2026',
    'digital':      'LOOK 09 · Intelligence At The Core · SS 2026',
    'sustainability':'LOOK 10 · Responsible Trade At Scale · SS 2026',
    'services':     'LOOK 11 · Service Coverage Across The Value Chain · SS 2026',
    'portfolio':    'LOOK 12 · Product Portfolio · SS 2026',
    'network':      'LOOK 13 · A Global Network Of Trust · SS 2026',
    'hidden-cost':  'LOOK 14 · The Cost Of Disconnection · SS 2026',
    'contact':      'FINALE · Let\u2019s Talk Commercial · SS 2026',
  };
  function setFwCaption(id) {
    if (!fwCaptionEl) return;
    const next = fwCaptions[id];
    if (!next || fwCaptionEl.textContent === next) return;
    fwCaptionEl.classList.add('is-changing');
    setTimeout(() => {
      fwCaptionEl.textContent = next;
      fwCaptionEl.classList.remove('is-changing');
    }, 320);
  }
  sections.forEach((section) => {
    const num = chapterMap[section.id];
    if (num && section.classList.contains('scene')) {
      const bg = document.createElement('span');
      bg.className = 'chapter-bg-num';
      bg.textContent = num;
      bg.setAttribute('aria-hidden', 'true');
      section.appendChild(bg);
    }
  });

  if (!reduceMotion && !document.querySelector('.grain-overlay')) {
    const grain = document.createElement('div');
    grain.className = 'grain-overlay';
    grain.setAttribute('aria-hidden', 'true');
    document.body.appendChild(grain);
  }

  function markActiveNav(id) {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });
  }

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('scene-active', entry.isIntersecting);
      if (entry.isIntersecting) {
        markActiveNav(entry.target.id);
        setFwCaption(entry.target.id);
        if (!reduceMotion) {
          const sceneTitles = entry.target.querySelectorAll('.cinematic-title');
          sceneTitles.forEach((title) => {
            title.classList.remove('title-fired');
            void title.offsetWidth;
            title.classList.add('title-fired');
          });
          // Camera flash on section entry
          cameraFlash.classList.remove('flash-active');
          void cameraFlash.offsetWidth;
          cameraFlash.classList.add('flash-active');
        }
      }
    });
  }, {
    threshold: 0,
    rootMargin: '-35% 0px -45% 0px',
  });

  sections.forEach((section) => {
    if (!section.querySelector('.scene-wipe')) {
      const wipe = document.createElement('span');
      wipe.className = 'scene-wipe';
      wipe.setAttribute('aria-hidden', 'true');
      section.appendChild(wipe);
    }
    sectionObserver.observe(section);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -10% 0px' });

  revealEls.forEach((el) => {
    if (!el.classList.contains('visible-on-load')) {
      revealObserver.observe(el);
    }
  });

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = parseInt(el.dataset.target || '0', 10);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = Math.ceil(target / 40);

      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = `${current}${suffix}`;
        if (current >= target) {
          clearInterval(timer);
        }
      }, 35);

      counterObserver.unobserve(el);
    });
  }, { threshold: 0.35 });

  statNums.forEach((el) => counterObserver.observe(el));

  const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      if (el.tagName === 'IMG') {
        el.decoding = 'async';
      }

      lazyObserver.unobserve(el);
    });
  }, { rootMargin: '300px 0px', threshold: 0.01 });

  lazyMedia.forEach((el) => lazyObserver.observe(el));

  const visibleCardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('card-visible', entry.isIntersecting);
    });
  }, { threshold: 0.12 });

  cards.forEach((card) => {
    if (card.querySelector('.section-video')) {
      return;
    }

    if (!card.querySelector('.shimmer-layer')) {
      const shimmer = document.createElement('div');
      shimmer.className = 'shimmer-layer';
      card.appendChild(shimmer);
    }
    visibleCardObserver.observe(card);
  });

  // 3D tilt intentionally removed (kept cinematic without perspective distortion)

  // ── Section video scroll-play controller ────────────────────────────────
  const sectionVideos = [...document.querySelectorAll('video[data-section-id]')];

  function ensureVideoSource(video) {
    const source = video.querySelector('source[data-src]');
    if (!source || source.src) return false;

    source.src = source.dataset.src;
    video.preload = 'metadata';
    video.load();
    return true;
  }

  if (sectionVideos.length && !reduceMotion) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          ensureVideoSource(video);

          if (entry.intersectionRatio < 0.35) {
            return;
          }

          sectionVideos.forEach((v) => { if (v !== video) v.pause(); });
          video.muted = true;
          video.loop = true;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: [0.01, 0.35], rootMargin: '280px 0px' });

    sectionVideos.forEach((video) => {
      video.muted = true;
      video.loop = true;
      videoObserver.observe(video);
    });
  }

  if (orbitalGlobe && !reduceMotion) {
    let rotation = 0;
    let lastTs = 0;

    function rotateGlobe(ts) {
      if (!lastTs) lastTs = ts;
      const delta = ts - lastTs;
      lastTs = ts;
      rotation = (rotation + delta * 0.008) % 360;
      orbitalGlobe.style.transform = `rotate(${rotation.toFixed(2)}deg)`;
      window.requestAnimationFrame(rotateGlobe);
    }

    window.requestAnimationFrame(rotateGlobe);
  }

  // Gentle parallax for media blocks on desktop
  if (!reduceMotion && !isTouch && window.matchMedia('(min-width: 1100px)').matches) {
    const mediaBlocks = [...document.querySelectorAll('.section-media')];
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    let rafId = 0;

    const updateParallax = () => {
      rafId = 0;
      mediaBlocks.forEach((block) => {
        const rect = block.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        if (rect.bottom < 0 || rect.top > vh) {
          block.style.setProperty('--media-shift', '0px');
          return;
        }
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        const y = clamp(progress * -16, -16, 16);
        block.style.setProperty('--media-shift', `${y.toFixed(2)}px`);
      });
    };

    const onScroll = () => {
      if (!rafId) rafId = window.requestAnimationFrame(updateParallax);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  // Live analog clock (header)
  function updateClock() {
    const now = new Date();
    const s = now.getSeconds();
    const m = now.getMinutes();
    const h = now.getHours() % 12;
    const sDeg = s * 6;
    const mDeg = m * 6 + s * 0.1;
    const hDeg = h * 30 + m * 0.5;
    const sh = document.getElementById('second-hand');
    const mh = document.getElementById('minute-hand');
    const hh = document.getElementById('hour-hand');
    if (sh) sh.setAttribute('transform', `rotate(${sDeg} 50 50)`);
    if (mh) mh.setAttribute('transform', `rotate(${mDeg} 50 50)`);
    if (hh) hh.setAttribute('transform', `rotate(${hDeg} 50 50)`);
  }
  updateClock();
  setInterval(updateClock, 1000);

  // City clocks (London / Milan / NYC)
  function updateCityClocks() {
    document.querySelectorAll('.cc-time[data-tz]').forEach((el) => {
      try {
        el.textContent = new Intl.DateTimeFormat('en-GB', {
          timeZone: el.dataset.tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date());
      } catch (e) { /* ignore unsupported tz */ }
    });
  }
  updateCityClocks();
  setInterval(updateCityClocks, 30000);

  // i18n: 7 languages, JSON-driven
  const I18N_LANGS = {
    en: { label: 'EN', dir: 'ltr' },
    zh: { label: '中文', dir: 'ltr' },
    es: { label: 'ES', dir: 'ltr' },
    fr: { label: 'FR', dir: 'ltr' },
    de: { label: 'DE', dir: 'ltr' },
    it: { label: 'IT', dir: 'ltr' },
    ar: { label: 'AR', dir: 'rtl' },
  };
  const i18nCache = {};

  async function loadLang(lang) {
    if (!I18N_LANGS[lang]) lang = 'en';
    if (!i18nCache[lang]) {
      try {
        const res = await fetch(`assets/i18n/${lang}.json`);
        i18nCache[lang] = await res.json();
      } catch (e) { return; }
    }
    const dict = i18nCache[lang];
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', I18N_LANGS[lang].dir);
    const cur = document.querySelector('.lang-current-label');
    if (cur) cur.textContent = I18N_LANGS[lang].label;
    document.querySelectorAll('.lang-menu li').forEach((li) => {
      li.classList.toggle('active', li.dataset.lang === lang);
    });
    try { localStorage.setItem('hv_lang', lang); } catch (e) {}
  }

  const langSwitch = document.querySelector('.lang-switch');
  const langCurrent = document.querySelector('.lang-current');
  if (langSwitch && langCurrent) {
    langCurrent.addEventListener('click', () => {
      const open = langSwitch.classList.toggle('open');
      langCurrent.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.lang-menu li').forEach((li) => {
      li.addEventListener('click', () => {
        loadLang(li.dataset.lang);
        langSwitch.classList.remove('open');
        langCurrent.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', (e) => {
      if (!langSwitch.contains(e.target)) {
        langSwitch.classList.remove('open');
        langCurrent.setAttribute('aria-expanded', 'false');
      }
    });
  }

  let savedLang = 'en';
  try { savedLang = localStorage.getItem('hv_lang') || 'en'; } catch (e) {}
  if (!I18N_LANGS[savedLang]) savedLang = 'en';
  if (savedLang !== 'en') loadLang(savedLang);
  else loadLang('en');

  // ── Multi-step Contact Form ──────────────────────────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const panels      = [...contactForm.querySelectorAll('.cf-step-panel')];
    const stepLabels  = [...contactForm.querySelectorAll('.cf-step')];
    const successEl   = contactForm.querySelector('.form-success');
    const submitBtn   = contactForm.querySelector('#cf-submit-btn');

    function setStep(to) {
      panels.forEach((p) => { p.hidden = parseInt(p.dataset.panel) !== to; });
      stepLabels.forEach((s) => {
        const n = parseInt(s.dataset.step);
        s.classList.toggle('active', n === to);
        s.classList.toggle('done', n < to);
      });
    }

    function validatePanel(panelNum) {
      const panel = contactForm.querySelector('[data-panel="' + panelNum + '"]');
      let ok = true;
      panel.querySelectorAll('[required]').forEach((field) => {
        const empty = !field.value.trim();
        const badEmail = field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        if (empty || badEmail) { field.classList.add('error'); ok = false; }
        else field.classList.remove('error');
      });
      if (panelNum === 2) {
        const grid = panel.querySelector('.cf-checkbox-grid');
        const checked = panel.querySelectorAll('input[type="checkbox"][name="category"]:checked');
        if (!checked.length) { if (grid) grid.style.outline = '1px solid #e87060'; ok = false; }
        else if (grid) grid.style.outline = '';
      }
      return ok;
    }

    function buildReview() {
      const g = (id) => contactForm.querySelector(id);
      const data = [
        ['Name',       g('#cf-name') ?.value || '—'],
        ['Company',    g('#cf-company')?.value || '—'],
        ['Email',      g('#cf-email')?.value || '—'],
        ['Phone',      g('#cf-phone')?.value || '—'],
        ['Role',       g('#cf-role')?.value || '—'],
        ['Categories', [...contactForm.querySelectorAll('input[name="category"]:checked')].map((c) => c.value).join(', ') || '—'],
        ['MOQ',        g('#cf-moq')?.value || '—'],
        ['Timeline',   g('#cf-timeline')?.value || '—'],
        ['Brief',      g('#cf-message')?.value || '—'],
      ];
      const block = document.getElementById('cf-review-block');
      if (block) block.innerHTML = data.map(([k, v]) =>
        '<div class="cf-review-row"><span class="cf-review-label">' + k + '</span><span class="cf-review-val">' + v + '</span></div>'
      ).join('');
    }

    contactForm.querySelectorAll('.cf-next').forEach((btn) => {
      btn.addEventListener('click', () => {
        const from = parseInt(btn.dataset.from);
        if (!validatePanel(from)) return;
        if (from === 2) buildReview();
        setStep(from + 1);
        contactForm.closest('.contact-form-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    contactForm.querySelectorAll('.cf-prev').forEach((btn) => {
      btn.addEventListener('click', () => setStep(parseInt(btn.dataset.from) - 1));
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validatePanel(3)) return;
      if (submitBtn) {
        submitBtn.disabled = true;
        const lbl = submitBtn.querySelector('.cf-btn-label');
        const spn = submitBtn.querySelector('.cf-btn-spinner');
        if (lbl) lbl.hidden = true;
        if (spn) spn.hidden = false;
      }
      // Replace setTimeout with a real fetch/Formspree call in production
      setTimeout(() => {
        panels.forEach((p) => { p.hidden = true; });
        const stepsBar = contactForm.querySelector('.cf-steps');
        if (stepsBar) stepsBar.hidden = true;
        if (successEl) successEl.hidden = false;
      }, 900);
    });

    contactForm.querySelectorAll('input, textarea, select').forEach((f) => {
      f.addEventListener('input', () => f.classList.remove('error'));
    });
  }

  // ── Chatbot ────────────────────────────────────────────────────────────────────
  const CHAT_KB = [
    { q: /\bwhat.*do.*you.*do\b|who.*are.*you|about.*harvics/i,
      a: 'Harvics Global Ventures is an AI-powered global sourcing and supply chain execution platform. We connect retailers and brands to 120+ verified factory partners across 40+ countries — managing sourcing, QA, logistics, and compliance from a single layer.' },
    { q: /\bproduct(s)?\b|\bsourc(e|ing)\b|\bcategor(y|ies)\b/i,
      a: 'We source across 8 product verticals: Leather & Knit, Sportswear, Denim, Chino, Workwear, Footwear, and Home Textile. Each category has dedicated sourcing corridors and factory partnerships.' },
    { q: /\bmoq\b|minimum.*order|order.*quantity/i,
      a: 'MOQs vary by category: Leather & Knit from 500 units/style · Denim & Workwear from 1,000 units · Footwear from 300 pairs · Home Textile from 500 units. Contact us for tailored brief-matching.' },
    { q: /\blead.*time|how.*long|timeline|days|weeks/i,
      a: 'Our 48-hour sourcing response model delivers a qualified supplier shortlist within 2 business days. Production lead times: 45–60 days (apparel/knit), 60–75 days (denim/workwear), 90–120 days (footwear/home textile).' },
    { q: /\bpric(e|ing)|cost|rate|fee/i,
      a: 'Pricing depends on category, volume, compliance tier, and logistics scope. We work on a B2B sourcing fee model. Contact us with your brief for a tailored proposal — use the form or email info@harvics.com.' },
    { q: /\bcertif(ication|ied|y)|\biso\b|\bsa.?8000\b|\bsedex\b|\boeko.?tex\b|\bzdhc\b|\bbluesign\b/i,
      a: 'Our factory network holds ISO 9001, SA 8000, SEDEX SMETA, OEKO-TEX, ZDHC, and bluesign® certifications across verticals. We match your compliance requirements to the appropriate certified facility.' },
    { q: /\bmarket(s)?|\bcountry|\bcountries|\bwhere\b/i,
      a: 'We operate in 40+ countries with 5 Continental HQs (London, Milan, New York, Karachi, Hong Kong). Primary manufacturing hubs: Pakistan, Bangladesh, Vietnam, Turkey, China, and India.' },
    { q: /\blogistic(s)?|\bfreight|\bship(ping)?|\bdelivery|\bdc\b/i,
      a: 'Yes — Harvics provides end-to-end logistics: DC management, freight forwarding, hubbing, consolidation, and eLogistics with real-time multi-node visibility. We handle the chain from factory floor to destination.' },
    { q: /\bquality|\bqa\b|\binspect(ion)?|\baudit/i,
      a: 'Quality is embedded at every stage: inline production checks, pre-shipment audits, lab testing, and final sign-off. We achieve a 99% on-time delivery rate with zero-compromise QA across all hubs.' },
    { q: /\bteam|\bpeople|\bstaff|\bleadership/i,
      a: 'Our team spans 18+ years of global trade expertise — led by professionals with deep roots in Pakistan\'s manufacturing corridors, European retail networks, and Asian supply chains.' },
    { q: /\bstart|\bbegin|\bhow.*work|\bprocess|\bnext.*step/i,
      a: 'Getting started is simple: fill out the sourcing brief form on this page (3 quick steps), or email info@harvics.com. A trade specialist will respond within 24 hours with a qualified factory shortlist.' },
    { q: /\bsustainab|\bresponsib|\bgreen|\bcarbon|\bethical/i,
      a: 'Responsible trade is core to our model. We source via OEKO-TEX and ZDHC compliant facilities, prioritise carbon-conscious logistics, and embed environmental stewardship at every link of the chain.' },
    { q: /\bai\b|\bartificial.*intel|\bdigital|\btechnology|\bplatform/i,
      a: 'Harvics uses AI sourcing engines, risk scoring, procurement automation, and digital command tools embedded in every layer of operations — enabling real-time intelligence and faster commercial decisions.' },
    { q: /\bfactory|\bvisit|\btour|\bsupplier/i,
      a: 'We coordinate factory visits, virtual facility tours, and supplier audits for qualified partners. Reach out and our regional office teams will arrange access.' },
  ];

  const DEFAULT_REPLY = 'Great question. For a detailed answer, please fill in the sourcing brief form above or email us directly at info@harvics.com — a trade specialist will respond within 24 hours.';

  function chatAnswer(text) {
    const match = CHAT_KB.find((entry) => entry.q.test(text));
    return match ? match.a : DEFAULT_REPLY;
  }

  const chatMessages = document.getElementById('chatbot-messages');
  const chatForm     = document.getElementById('chatbot-form');
  const chatInput    = document.getElementById('chatbot-input');

  function appendMsg(text, type) {
    if (!chatMessages) return;
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg--' + type;
    const p = document.createElement('p');
    p.textContent = text;
    div.appendChild(p);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    if (!chatMessages) return null;
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg--typing';
    div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function handleQuery(query) {
    // Remove suggestion chips after first use
    const chips = document.getElementById('chat-suggestions');
    if (chips) chips.remove();

    appendMsg(query, 'user');
    if (chatInput) { chatInput.value = ''; chatInput.focus(); }

    const typingEl = showTyping();
    setTimeout(() => {
      if (typingEl) typingEl.remove();
      appendMsg(chatAnswer(query), 'bot');
    }, 700 + Math.random() * 400);
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = chatInput.value.trim();
      if (!q) return;
      handleQuery(q);
    });
  }

  document.querySelectorAll('.chat-suggestion-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleQuery(btn.dataset.query));
  });

  // ── Newsletter form ───────────────────────────────────────────────────────────
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('#nl-email');
      if (!emailInput || !emailInput.value.trim() ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        if (emailInput) emailInput.style.borderColor = '#e87060';
        return;
      }
      // In production: POST to your newsletter service
      const success = newsletterForm.querySelector('.newsletter-success');
      const row = newsletterForm.querySelector('.newsletter-input-row');
      if (success) success.hidden = false;
      if (row) row.style.display = 'none';
    });
  }

  // ── Portfolio modals ──────────────────────────────────────────────────────────
  const MODAL_DATA = {
    lks: {
      title: 'Leather, Knit & Sportswear',
      body: 'Specialized sourcing corridors across Asia for premium apparel and performance-led categories. Full product development support from CAD to final approval.',
      specs: [
        { label: 'MOQ',          value: '500 units per style' },
        { label: 'Lead Time',    value: '45–60 days' },
        { label: 'Key Markets',  value: 'Bangladesh, Vietnam, Turkey' },
        { label: 'Certifications', value: 'OEKO-TEX, bluesign®, SA 8000' },
      ],
      categories: ['Premium leather goods', 'Performance knitwear', 'Activewear', 'Technical outerwear'],
    },
    dcw: {
      title: 'Denim, Chino & Work Wear',
      body: 'Retail-grade denim, precision-fit chinos, and performance workwear built for scale. Direct factory relationships in Karachi and Dhaka corridors.',
      specs: [
        { label: 'MOQ',          value: '1,000 units per style' },
        { label: 'Lead Time',    value: '60–75 days' },
        { label: 'Key Markets',  value: 'Pakistan, Bangladesh, Turkey' },
        { label: 'Certifications', value: 'ISO 9001, SEDEX SMETA, ZDHC' },
      ],
      categories: ['Retail denim', 'Precision chinos', 'Hi-vis workwear', 'Corporate uniforms'],
    },
    fht: {
      title: 'Footwear & Home Textile',
      body: 'Footwear and home collections for hospitality, lifestyle, and global retail programs. Sustainable material options available across all categories.',
      specs: [
        { label: 'MOQ',          value: '300 pairs / 500 units' },
        { label: 'Lead Time',    value: '90–120 days' },
        { label: 'Key Markets',  value: 'China, Vietnam, India' },
        { label: 'Certifications', value: 'OEKO-TEX, ISO 9001' },
      ],
      categories: ['Lifestyle footwear', 'Hospitality textiles', 'Bedding & bath', 'Home décor'],
    },
    overview: {
      title: 'Full Portfolio Overview',
      body: 'The complete Harvics product ecosystem — precision-sourced across the world\'s finest manufacturing corridors with full compliance, QA, and logistics integration.',
      specs: [
        { label: 'Product Verticals', value: '8 categories' },
        { label: 'Factory Partners',  value: '120+ verified' },
        { label: 'Active Markets',    value: '40+ countries' },
        { label: 'On-Time Rate',      value: '99%' },
      ],
      categories: ['Leather goods', 'Knitwear', 'Sportswear', 'Denim', 'Chino', 'Workwear', 'Footwear', 'Home Textile'],
    },
  };

  const modalOverlay = document.getElementById('modal-overlay');
  const modalContent = document.getElementById('modal-content');

  function openModal(key) {
    const data = MODAL_DATA[key];
    if (!data || !modalOverlay || !modalContent) return;

    const specsHtml = data.specs.map((s) =>
      `<div class="modal-spec"><span class="modal-spec-label">${s.label}</span><span class="modal-spec-value">${s.value}</span></div>`
    ).join('');

    const catsHtml = data.categories.map((c) => `<li>${c}</li>`).join('');

    modalContent.innerHTML = `
      <p class="eyebrow">Product Details</p>
      <h2 id="modal-title">${data.title}</h2>
      <p class="modal-body">${data.body}</p>
      <div class="modal-specs">${specsHtml}</div>
      <div class="modal-categories">
        <h4>Product Categories</h4>
        <ul class="modal-cat-list">${catsHtml}</ul>
      </div>
      <div class="modal-cta">
        <a class="button button--primary" href="#contact">Request Sourcing Brief</a>
        <a class="button button--ghost" href="mailto:info@harvics.com">Email Us</a>
      </div>`;

    modalOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    const closeBtn = modalOverlay.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.hidden = true;
    document.body.style.overflow = '';
  }

  if (modalOverlay) {
    modalOverlay.querySelector('.modal-close').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
    });
  }

  document.querySelectorAll('[data-modal]').forEach((card) => {
    const btn = card.querySelector('.portfolio-details-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(card.dataset.modal);
      });
    }
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.portfolio-details-btn')) return;
    });
  });

  // ── Hero Parallax Depth Effect ──────────────────────────────────
  if (!reduceMotion) {
    const heroCopy = document.querySelector('.hero__copy');
    const heroSide = document.querySelector('.hero__side');
    const hero = document.querySelector('.hero');
    
    if (heroCopy && heroSide && hero) {
      window.addEventListener('scroll', () => {
        const heroRect = hero.getBoundingClientRect();
        const scrollProgress = Math.max(0, 1 - heroRect.top / window.innerHeight);
        const offset = scrollProgress * 24;
        heroCopy.style.transform = `translateY(${offset * -1}px)`;
        heroSide.style.transform = `translateY(${offset * 0.5}px)`;
      });
    }
  }

  // ── Hidden Cost: disconnection → connection ─────────────────────
  (function initHiddenCost() {
    const canvas = document.querySelector('#hidden-cost .hidden-cost__canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const labels = (canvas.dataset.nodes || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!labels.length) return;

    const GOLD_RGB = '200, 169, 110'; // var(--gold)
    let dpr = Math.max(1, window.devicePixelRatio || 1);
    let w = 0, h = 0;
    let nodes = [];
    let connectStart = 0;     // ms timestamp when connect animation begins
    let connecting = false;
    let connected = false;
    let pulseStart = 0;
    let dashOffset = 0;
    let raf = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Re-seed scatter positions on resize if not yet connected
      if (!connecting && !connected) seedNodes();
    }

    function seedNodes() {
      const pad = 60;
      nodes = labels.map((label, i) => {
        const x = pad + Math.random() * Math.max(1, w - pad * 2);
        const y = pad + Math.random() * Math.max(1, h - pad * 2);
        const angle = (i / labels.length) * Math.PI * 2;
        const orbitR = Math.min(w, h) * 0.22;
        return {
          label,
          sx: x, sy: y,                 // scatter (start) position
          x, y,                         // current
          tx: w / 2 + Math.cos(angle) * orbitR,  // target (connected orbit)
          ty: h / 2 + Math.sin(angle) * orbitR,
          drift: { vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18 },
          phase: Math.random() * Math.PI * 2,
        };
      });
    }

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function draw(now) {
      if (!w || !h) { raf = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, w, h);

      let progress = 0;
      if (connecting) {
        progress = Math.min(1, (now - connectStart) / 2000);
        if (progress >= 1) { connecting = false; connected = true; pulseStart = now; }
      }
      const eased = easeOutCubic(progress);

      // Update positions
      nodes.forEach((n) => {
        if (connecting || connected) {
          n.x = n.sx + (n.tx - n.sx) * (connected ? 1 : eased);
          n.y = n.sy + (n.ty - n.sy) * (connected ? 1 : eased);
        } else {
          // gentle drift, bounce inside padded area
          const pad = 50;
          n.x += n.drift.vx;
          n.y += n.drift.vy;
          if (n.x < pad || n.x > w - pad) n.drift.vx *= -1;
          if (n.y < pad || n.y > h - pad) n.drift.vy *= -1;
          n.sx = n.x; n.sy = n.y;
        }
      });

      // Lines
      const lineAlpha = connected ? 0.85 : (connecting ? 0.18 + eased * 0.67 : 0.10 + Math.sin(now * 0.004) * 0.06);
      ctx.lineWidth = connected ? 1.1 : 0.8;
      if (!connected) {
        dashOffset = (dashOffset + 0.4) % 12;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -dashOffset;
      } else {
        ctx.setLineDash([]);
      }
      ctx.strokeStyle = `rgba(${GOLD_RGB}, ${lineAlpha.toFixed(3)})`;
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Pulse ring (one-shot)
      if (connected && now - pulseStart < 1600) {
        const p = (now - pulseStart) / 1600;
        const radius = 40 + p * Math.min(w, h) * 0.55;
        const alpha = (1 - p) * 0.55;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${GOLD_RGB}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // Nodes
      nodes.forEach((n) => {
        const baseR = 5;
        const glowR = connected ? 26 : 20;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        const coreA = connected ? 0.95 : 0.7;
        grad.addColorStop(0, `rgba(${GOLD_RGB}, ${coreA})`);
        grad.addColorStop(0.4, `rgba(${GOLD_RGB}, ${coreA * 0.35})`);
        grad.addColorStop(1, `rgba(${GOLD_RGB}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${GOLD_RGB}, ${connected ? 1 : 0.85})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, baseR, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = `rgba(232, 224, 208, ${connected ? 0.78 : 0.55})`;
        ctx.font = '500 9.5px Manrope, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        // simulate letter-spacing
        const text = n.label;
        const spaced = text.split('').join('\u2009');
        ctx.fillText(spaced, n.x, n.y + glowR - 4);
      });

      raf = requestAnimationFrame(draw);
    }

    function start() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    }

    // Resize observer
    const ro = new ResizeObserver(() => { resize(); });
    ro.observe(canvas.parentElement);
    resize();

    if (reduceMotion) {
      // jump straight to connected state, no animation loop needed beyond one paint
      connected = true;
      pulseStart = 0;
      // single paint
      requestAnimationFrame(draw);
      return;
    }

    start();

    const trigger = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !connecting && !connected) {
          connecting = true;
          connectStart = performance.now();
        }
      });
    }, { threshold: 0.35 });
    trigger.observe(canvas);
  })();

  // ── Architecture: two-row cinematic marquee ─────────────────────
  (function initArchitecture() {
    const rows = [...document.querySelectorAll('#architecture .arch-row')];
    if (!rows.length) return;

    // Clone each row's cards once for seamless -50% marquee loop
    if (!reduceMotion) {
      rows.forEach((row) => {
        const track = row.querySelector('.arch-row__track');
        if (!track) return;
        const originals = [...track.children];
        originals.forEach((card) => {
          const clone = card.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          clone.dataset.clone = '1';
          track.appendChild(clone);
        });
      });
    }

    // Per-card top-line stagger when section enters viewport
    const cards = [...document.querySelectorAll('#architecture .arch-card')];
    const lineObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          lineObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    cards.forEach((c) => lineObs.observe(c));
  })();

})();
