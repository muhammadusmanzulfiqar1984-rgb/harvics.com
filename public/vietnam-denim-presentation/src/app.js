import Alpine from 'alpinejs';
import { translations, chatKnowledge, lookupTranslation } from './i18n.js';

const LOCALE_KEY = 'genviet-locale';
const DOORS_KEY = 'genviet-doors-open';

function readQueryLocale() {
  if (typeof window === 'undefined') return null;
  const lang = new URLSearchParams(window.location.search).get('lang');
  return lang === 'en' || lang === 'vi' ? lang : null;
}

function persistLocaleInUrl(lang) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.history.replaceState({}, '', url);
}

function readEnteredFromUrl() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('entered') === '1';
}

const savedLocale =
  readQueryLocale() ||
  (typeof localStorage !== 'undefined' && localStorage.getItem(LOCALE_KEY)) ||
  'vi';

const skipDoors =
  readEnteredFromUrl() ||
  (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(DOORS_KEY) === '1');

if (skipDoors && typeof sessionStorage !== 'undefined') {
  sessionStorage.setItem(DOORS_KEY, '1');
}

function resolveTranslation(key, locale) {
  const val = lookupTranslation(locale, key);
  if (val != null) return val;
  const fallback = lookupTranslation('vi', key);
  return fallback != null ? fallback : key;
}

function applyDocumentLocale(locale) {
  document.documentElement.lang = locale;
  document.title = resolveTranslation('meta.title', locale);
}

function readLocaleStore() {
  return Alpine.store('locale');
}

applyDocumentLocale(savedLocale);
if (readQueryLocale()) {
  persistLocaleInUrl(savedLocale);
}

document.addEventListener('alpine:init', () => {
  Alpine.store('locale', {
    current: savedLocale,
    tick: 0,

    t(key) {
      return resolveTranslation(key, this.current);
    },

    set(lang) {
      if (!translations[lang]) return;
      if (this.current === lang) return;
      this.current = lang;
      this.tick += 1;
      localStorage.setItem(LOCALE_KEY, lang);
      persistLocaleInUrl(lang);
      applyDocumentLocale(lang);
      window.dispatchEvent(new CustomEvent('genviet:locale', { detail: lang }));
    },

    toggle() {
      this.set(this.current === 'vi' ? 'en' : 'vi');
    },
  });

  Alpine.magic('t', () => (key) => readLocaleStore().t(key));

  Alpine.store('app', {
    doorsOpened: skipDoors,

    markDoorsOpened() {
      this.doorsOpened = true;
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(DOORS_KEY, '1');
      }
    },
  });
});

/* ─── Backdrop video autoplay ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const v = document.getElementById('cinema-video');
  if (!v) return;
  v.muted = true;
  const play = () => v.play().catch(() => {});
  v.addEventListener('canplay', play, { once: true });
  play();
});

/* ─── Ambient Audio Store ─────────────────────────────────────────────────── */
Alpine.store('ambient', {
  active: false,
  muted: false,
});

/* ─── Atelier Doors ───────────────────────────────────────────────────────── */
Alpine.data('doors', () => ({
  opening: false,

  init() {
    if (Alpine.store('app').doorsOpened) {
      this.startAmbient();
    }
  },

  enter() {
    if (this.opening) return;
    this.opening = true;
    const lang = readLocaleStore().current;
    localStorage.setItem(LOCALE_KEY, lang);
    sessionStorage.setItem(DOORS_KEY, '1');
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    url.searchParams.set('entered', '1');
    window.location.assign(url.toString());
  },

  startAmbient() {
    const audio = document.getElementById('ambient-audio');
    if (!audio) return;
    audio.volume = 0.3;
    audio.muted = false;
    audio.play().catch(() => {});
    Alpine.store('ambient').active = true;
  },
}));

/* ─── Ambient Mute Toggle ─────────────────────────────────────────────────── */
Alpine.data('audioToggle', () => ({
  get visible() {
    return Alpine.store('ambient').active;
  },

  get muted() {
    return Alpine.store('ambient').muted;
  },

  get ariaLabel() {
    void readLocaleStore().tick;
    const key = this.muted ? 'audio.unmute' : 'audio.mute';
    return readLocaleStore().t(key);
  },

  toggle() {
    const store = Alpine.store('ambient');
    store.muted = !store.muted;
    const audio = document.getElementById('ambient-audio');
    if (audio) audio.muted = store.muted;
  },
}));

/* ─── Scroll Reveal Observer ──────────────────────────────────────────────── */
Alpine.data('reveal', () => ({
  init() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.12 }
    );
    this.$el.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
  },
}));

/* ─── Animated Counter ────────────────────────────────────────────────────── */
Alpine.data('counter', () => ({
  value: '0',
  animated: false,

  init() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || this.animated) return;
          this.animated = true;
          const target = parseInt(this.$el.dataset.target, 10);
          const suffix = this.$el.dataset.suffix || '';
          let current = 0;
          const step = Math.max(1, Math.ceil(target / 40));
          const interval = setInterval(() => {
            current = Math.min(current + step, target);
            this.value = current + suffix;
            if (current >= target) clearInterval(interval);
          }, 35);
          observer.unobserve(this.$el);
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(this.$el);
  },
}));

/* ─── Progress Bar ────────────────────────────────────────────────────────── */
Alpine.data('progressBar', () => ({
  width: '0%',

  init() {
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      this.width = `${(window.scrollY / h) * 100}%`;
    });
  },
}));

/* ─── Nav Clock ───────────────────────────────────────────────────────────── */
Alpine.data('clock', () => ({
  timer: null,

  init() {
    const update = () => {
      const { hh, mh, sh } = this.$refs;
      if (!hh || !mh || !sh) return;
      const now = new Date();
      const s = now.getSeconds();
      const m = now.getMinutes();
      const h = now.getHours() % 12;
      sh.setAttribute('transform', `rotate(${s * 6} 50 50)`);
      mh.setAttribute('transform', `rotate(${m * 6 + s * 0.1} 50 50)`);
      hh.setAttribute('transform', `rotate(${h * 30 + m * 0.5} 50 50)`);
    };
    update();
    this.timer = setInterval(update, 1000);
    this.$el.addEventListener('destroy', () => {
      if (this.timer) clearInterval(this.timer);
    }, { once: true });
  },
}));

/* ─── RTM Map — pulse + click detail ─────────────────────────────────────── */
Alpine.data('rtmMap', () => ({
  live: 1,
  selected: null,

  init() {
    setInterval(() => {
      this.live = (this.live % 6) + 1;
    }, 1200);
  },

  select(n) {
    this.selected = this.selected === n ? null : n;
  },

  get detail() {
    void readLocaleStore().tick;
    if (!this.selected) return null;
    const details = readLocaleStore().t('rtm.details') || [];
    return details[this.selected - 1] || null;
  },
}));

/* ─── Margin Simulator (#mafi) ────────────────────────────────────────────── */
Alpine.data('marginSimulator', () => ({
  fobPrice: 12,
  retailPrice: 58,
  scenario: 'base',

  get brokerLeakagePerUnit() {
    return this.retailPrice - this.fobPrice - 18;
  },

  get totalRecoverable() {
    return Math.max(0, this.brokerLeakagePerUnit * 2000000 * 0.15);
  },

  get marginPercent() {
    if (!this.retailPrice) return 0;
    return ((this.retailPrice - this.fobPrice) / this.retailPrice) * 100;
  },

  setScenario(key) {
    this.scenario = key;
    const presets = readLocaleStore().t('mafi.scenarioPresets') || {};
    const p = presets[key];
    if (p) {
      this.fobPrice = p.fob;
      this.retailPrice = p.retail;
    }
  },

  formatEuro(n) {
    return `€${Math.round(n).toLocaleString()}`;
  },
}));

/* ─── Bluezone countdown + path toggle ────────────────────────────────────── */
Alpine.data('bluezoneModule', () => ({
  path: null,
  days: 0,

  init() {
    this.tick();
    setInterval(() => this.tick(), 60000);
  },

  tick() {
    const target = new Date('2026-07-21T00:00:00');
    const diff = target.getTime() - Date.now();
    this.days = Math.max(0, Math.ceil(diff / 86400000));
  },

  setPath(p) {
    this.path = p;
  },
}));

/* ─── Process step expander ───────────────────────────────────────────────── */
Alpine.data('processExplorer', () => ({
  active: null,

  toggle(n) {
    this.active = this.active === n ? null : n;
  },

  isOpen(n) {
    return this.active === n;
  },
}));

/* ─── Shelf product modal ───────────────────────────────────────────────────── */
Alpine.data('shelfExplorer', () => ({
  open: false,
  key: null,

  show(key) {
    this.key = key;
    this.open = true;
  },

  close() {
    this.open = false;
  },

  get product() {
    void readLocaleStore().tick;
    if (!this.key) return null;
    const products = readLocaleStore().t('shelf.products') || {};
    return products[this.key] || null;
  },
}));

/* ─── Competitor matrix row highlight ─────────────────────────────────────── */
Alpine.data('competitorMatrix', () => ({
  row: 'genviet',

  select(r) {
    this.row = r;
  },
}));

/* ─── Board decision → contact prefill ──────────────────────────────────────── */
Alpine.data('boardDecision', () => ({
  choose(which) {
    const map = readLocaleStore().t('decision.map') || {};
    const val = map[which] || which;
    sessionStorage.setItem('genviet-interest', val);
    window.dispatchEvent(new CustomEvent('genviet:interest', { detail: val }));
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  },
}));

/* ─── Contact Form ──────────────────────────────────────────────────────────── */
Alpine.data('contactForm', () => ({
  name: '',
  company: '',
  email: '',
  phone: '',
  interest: '',
  message: '',
  submitted: false,

  init() {
    const preset = sessionStorage.getItem('genviet-interest');
    if (preset) this.interest = preset;
    window.addEventListener('genviet:interest', (e) => {
      this.interest = e.detail;
    });
  },

  submit() {
    if (!this.name || !this.company || !this.email) return;
    this.submitted = true;
  },
}));

/* ─── FAQ Accordion ─────────────────────────────────────────────────────────── */
Alpine.data('faqAccordion', () => ({
  open: null,

  get items() {
    void readLocaleStore().tick;
    return readLocaleStore().t('faq.items') || [];
  },

  init() {
    window.addEventListener('genviet:locale', () => {
      this.open = null;
    });
  },
}));

/* ─── Chatbot ───────────────────────────────────────────────────────────────── */
Alpine.data('chatbot', () => ({
  open: false,
  messages: [],
  userInput: '',

  get knowledgeBase() {
    const loc = readLocaleStore().current;
    void readLocaleStore().tick;
    return chatKnowledge[loc] || chatKnowledge.vi;
  },

  init() {
    window.addEventListener('genviet:locale', () => {
      this.messages = [];
      if (this.open) {
        this.messages.push({
          from: 'bot',
          text: readLocaleStore().t('chatbot.welcome'),
        });
      }
    });
  },

  toggle() {
    this.open = !this.open;
    if (this.open && this.messages.length === 0) {
      this.messages.push({
        from: 'bot',
        text: readLocaleStore().t('chatbot.welcome'),
      });
    }
  },

  send() {
    const text = this.userInput.trim();
    if (!text) return;
    this.messages.push({ from: 'user', text });
    this.userInput = '';

    const match = this.knowledgeBase.find((k) => k.q.test(text));
    setTimeout(() => {
      this.messages.push({
        from: 'bot',
        text: match
          ? match.a
          : readLocaleStore().t('chatbot.fallback'),
      });
      this.$nextTick(() => {
        const container = this.$refs.msgs;
        if (container) container.scrollTop = container.scrollHeight;
      });
    }, 350);
  },
}));

/* ─── Hero Ticker ───────────────────────────────────────────────────────────── */
Alpine.data('heroTicker', () => ({
  get items() {
    void readLocaleStore().tick;
    return readLocaleStore().t('ticker') || [];
  },
}));

Alpine.data('brandRibbon', () => ({
  featured: null,

  get row1() {
    void readLocaleStore().tick;
    return readLocaleStore().t('brands.row1') || [];
  },

  get row2() {
    void readLocaleStore().tick;
    return readLocaleStore().t('brands.row2') || [];
  },

  spotlight(name) {
    this.featured = this.featured === name ? null : name;
  },
}));

Alpine.start();
