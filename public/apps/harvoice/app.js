const chatEl = document.getElementById('chat');
const micBtn = document.getElementById('micBtn');
const micLabel = document.getElementById('micLabel');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const statusEl = document.getElementById('status');
const textInput = document.getElementById('textInput');
const sendBtn = document.getElementById('sendBtn');
const leadSummaryText = document.getElementById('leadSummaryText');
const leadQueueEl = document.getElementById('leadQueue');
const outreachListEl = document.getElementById('outreachList');
const kpiTotalEl = document.getElementById('kpiTotal');
const kpiQualifiedEl = document.getElementById('kpiQualified');
const kpiFollowEl = document.getElementById('kpiFollow');
const actionButtons = document.querySelectorAll('.action-btn');
const loadSourcesBtn = document.getElementById('loadSourcesBtn');
const loadPVBtn = document.getElementById('loadPVBtn');
const loadEEBtn = document.getElementById('loadEEBtn');
const libraryViewerEl = document.getElementById('libraryViewer');
const librarySearchInput = document.getElementById('librarySearchInput');
const librarySearchBtn = document.getElementById('librarySearchBtn');
const libraryResultsEl = document.getElementById('libraryResults');

const history = []; // [{role, content}]
let recognizing = false;
let isWaitingReply = false;
let handsFreeMode = false;
let isSpeaking = false;
let interimCommitTimer = null;
let ttsPrimed = false;
let latestLead = null;
let manualMicStop = false;
let recognitionStartPending = false;
let micPermissionState = 'prompt';
let vapiClient = null;
let vapiEnabled = false;
let vapiSessionActive = false;

// ---- Speech Recognition (STT) ----
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SR) {
  statusEl.textContent = '⚠️ Your browser does not support speech recognition. Use Chrome or Edge.';
  micBtn.disabled = true;
}
const recognition = SR ? new SR() : null;
if (recognition) {
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    recognitionStartPending = false;
    recognizing = true;
    manualMicStop = false;
    micBtn.classList.add('listening');
    micLabel.textContent = 'Stop hands-free';
    statusEl.textContent = 'Hands-free listening...';
  };
  recognition.onerror = (e) => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      micPermissionState = 'denied';
      statusEl.textContent = 'Microphone blocked. Allow mic access in browser site settings.';
      handsFreeMode = false;
    } else if (e.error === 'audio-capture') {
      statusEl.textContent = 'No microphone detected. Check your input device.';
    } else {
      statusEl.textContent = `Mic error: ${e.error}`;
    }
    resetMic();
  };
  recognition.onend = () => {
    recognizing = false;
    resetMic();
    // Some browsers auto-stop recognition; restart if hands-free is still active.
    if (handsFreeMode && !manualMicStop && !isSpeaking && !isWaitingReply) {
      queueRecognitionStart(300);
    }
  };
  recognition.onresult = async (event) => {
    if (isWaitingReply || isSpeaking) return;
    let transcript = '';
    let interimText = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      if (event.results[i].isFinal) {
        transcript += event.results[i][0].transcript;
      } else {
        interimText += event.results[i][0].transcript;
      }
    }
    transcript = transcript.trim();
    interimText = interimText.trim();
    if (transcript) {
      if (interimCommitTimer) {
        clearTimeout(interimCommitTimer);
        interimCommitTimer = null;
      }
      addMsg('user', transcript);
      await askAI(transcript);
      return;
    }

    // Fallback: if browser keeps transcript as interim only, commit quickly.
    if (interimText && handsFreeMode) {
      if (interimCommitTimer) clearTimeout(interimCommitTimer);
      interimCommitTimer = setTimeout(async () => {
        if (isWaitingReply || isSpeaking || !handsFreeMode) return;
        addMsg('user', interimText);
        await askAI(interimText);
      }, 520);
    }
  };
}

initVoiceMode();

async function initVoiceMode() {
  try {
    const res = await fetch('/api/vapi-config');
    const cfg = await res.json();
    if (!cfg?.enabled || !cfg.publicKey || !cfg.assistantId) {
      statusEl.textContent = 'Voice mode: browser speech.';
      return;
    }

    if (typeof window.Vapi !== 'function') {
      statusEl.textContent = 'Vapi SDK not loaded, using browser speech.';
      return;
    }

    vapiClient = new window.Vapi(cfg.publicKey);
    vapiEnabled = true;

    vapiClient.on('call-start', () => {
      vapiSessionActive = true;
      handsFreeMode = true;
      micBtn.classList.add('listening');
      micLabel.textContent = 'Stop Vapi';
      statusEl.textContent = 'Vapi connected and listening...';
    });

    vapiClient.on('call-end', () => {
      vapiSessionActive = false;
      handsFreeMode = false;
      micBtn.classList.remove('listening');
      micLabel.textContent = 'Start hands-free';
      statusEl.textContent = 'Vapi call ended.';
    });

    vapiClient.on('message', (message) => {
      if (!message || typeof message !== 'object') return;
      if (message.type === 'transcript' && message.transcript) {
        const role = String(message.role || '').toLowerCase() === 'assistant' ? 'bot' : 'user';
        addMsg(role, String(message.transcript));
      }
    });

    vapiClient.on('error', (err) => {
      const msg = (err && err.message) ? err.message : 'Unknown Vapi error';
      statusEl.textContent = `Vapi error: ${msg}`;
      vapiSessionActive = false;
      handsFreeMode = false;
      micBtn.classList.remove('listening');
      micLabel.textContent = 'Start hands-free';
    });

    micBtn.dataset.vapiAssistantId = cfg.assistantId;
    statusEl.textContent = 'Vapi ready. Click Start hands-free.';
  } catch {
    statusEl.textContent = 'Voice mode: browser speech.';
  }
}

function resetMic() {
  recognizing = false;
  micBtn.classList.remove('listening');
  micLabel.textContent = handsFreeMode ? 'Stop hands-free' : 'Start hands-free';
}

function queueRecognitionStart(delayMs = 0) {
  if (!recognition || recognitionStartPending || recognizing) return;
  recognitionStartPending = true;
  setTimeout(() => {
    if (!handsFreeMode || recognizing) {
      recognitionStartPending = false;
      return;
    }
    try {
      recognition.start();
    } catch (e) {
      recognitionStartPending = false;
      statusEl.textContent = 'Mic start failed. Click Start hands-free again.';
      console.error(e);
    }
  }, delayMs);
}

async function ensureMicPermission() {
  if (!navigator.mediaDevices?.getUserMedia) return true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micPermissionState = 'granted';
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (err) {
    micPermissionState = 'denied';
    statusEl.textContent = 'Microphone permission is required for listening.';
    return false;
  }
}

micBtn.addEventListener('click', () => {
  if (vapiEnabled && vapiClient) {
    const assistantId = micBtn.dataset.vapiAssistantId;
    if (!assistantId) {
      statusEl.textContent = 'Missing Vapi assistant id.';
      return;
    }

    if (vapiSessionActive) {
      vapiClient.stop();
      return;
    }

    vapiClient.start(assistantId);
    return;
  }

  if (!recognition) return;
  primeTTS();
  if (handsFreeMode) {
    handsFreeMode = false;
    manualMicStop = true;
    recognitionStartPending = false;
    if (recognizing) {
      try { recognition.stop(); } catch (e) { console.error(e); }
    }
    statusEl.textContent = 'Hands-free stopped.';
    return;
  }

  handsFreeMode = true;
  speechSynthesis.cancel();
  isSpeaking = false;
  ensureMicPermission().then((ok) => {
    if (!ok) {
      handsFreeMode = false;
      resetMic();
      return;
    }
    queueRecognitionStart(0);
  });
});

stopBtn.addEventListener('click', () => {
  if (vapiEnabled && vapiClient && vapiSessionActive) {
    vapiClient.stop();
    return;
  }

  if (currentAudio) {
    try { currentAudio.pause(); } catch (e) {}
    currentAudio = null;
  }
  speechSynthesis.cancel();
  isSpeaking = false;
  statusEl.textContent = 'Stopped speaking.';
  if (handsFreeMode && !recognizing && !isWaitingReply && recognition) {
    queueRecognitionStart(180);
  }
});

clearBtn.addEventListener('click', () => {
  history.length = 0;
  chatEl.innerHTML = '';
  if (interimCommitTimer) {
    clearTimeout(interimCommitTimer);
    interimCommitTimer = null;
  }
  statusEl.textContent = 'Conversation cleared.';
  if (vapiEnabled && vapiClient && vapiSessionActive) {
    vapiClient.stop();
  }
});

sendBtn?.addEventListener('click', () => {
  const text = textInput.value.trim();
  if (!text) return;
  textInput.value = '';
  addMsg('user', text);
  askAI(text);
});

textInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendBtn.click();
  }
});

outreachListEl?.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if (!id || !action) return;

  try {
    if (action === 'approve') {
      await fetch(`/api/outreach/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
    }
    if (action === 'send') {
      await fetch(`/api/outreach/${id}/send`, { method: 'POST' });
    }
    await loadOutreachList();
  } catch (err) {
    statusEl.textContent = `Outreach action failed: ${err.message}`;
  }
});

actionButtons.forEach((btn) => {
  btn.addEventListener('click', async () => {
    const channel = String(btn.textContent || '').trim().toLowerCase();
    const target = latestLead?.name || latestLead?.contact || 'new contact';
    const message = `Prepared ${channel} draft for ${target}.`;
    try {
      await fetch('/api/outreach/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'outreach_send',
          channel,
          target,
          message
        })
      });
      await loadOutreachList();
    } catch (err) {
      statusEl.textContent = `Draft failed: ${err.message}`;
    }
  });
});

loadSourcesBtn?.addEventListener('click', async () => {
  if (!libraryViewerEl) return;
  libraryViewerEl.textContent = 'Loading sources...';
  try {
    const res = await fetch('/api/sources');
    const data = await res.json();
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const wired = sources.filter((s) => s.mode === 'wired').length;
    const active = sources.filter((s) => s.enabled).length;
    const names = sources.slice(0, 8).map((s) => s.name).join(', ');
    libraryViewerEl.textContent = `Sources: ${sources.length} total | ${active} enabled | ${wired} wired. Top: ${names}`;
    runLibrarySearch('source');
  } catch {
    libraryViewerEl.textContent = 'Unable to load sources library.';
  }
});

loadPVBtn?.addEventListener('click', async () => {
  if (!libraryViewerEl) return;
  libraryViewerEl.textContent = 'Loading Premier Vision library...';
  try {
    const res = await fetch('/api/events/premier-vision-paris');
    const data = await res.json();
    const lib = data.eventLibrary || {};
    const years = Array.isArray(lib.years) ? lib.years.length : 0;
    const editions = Array.isArray(lib.years)
      ? lib.years.reduce((acc, y) => acc + (Array.isArray(y.editions) ? y.editions.length : 0), 0)
      : 0;
    const intel = Array.isArray(lib.fairsIntel) ? lib.fairsIntel.length : 0;
    libraryViewerEl.textContent = `Premier Vision: ${years} years | ${editions} editions | ${intel} fairs-intel records.`;
    runLibrarySearch('premier vision');
  } catch {
    libraryViewerEl.textContent = 'Unable to load Premier Vision library.';
  }
});

loadEEBtn?.addEventListener('click', async () => {
  if (!libraryViewerEl) return;
  libraryViewerEl.textContent = 'Loading Eastern Europe fairs...';
  try {
    const res = await fetch('/api/events/eastern-europe');
    const data = await res.json();
    const fairs = Array.isArray(data.easternEuropeFairs) ? data.easternEuropeFairs : [];
    const names = fairs.slice(0, 5).map((f) => `${f.event} (${f.country || 'unknown'})`).join(', ');
    libraryViewerEl.textContent = `Eastern Europe fairs: ${fairs.length}. ${names}`;
    runLibrarySearch('eastern europe');
  } catch {
    libraryViewerEl.textContent = 'Unable to load Eastern Europe fairs library.';
  }
});

librarySearchBtn?.addEventListener('click', () => {
  runLibrarySearch(librarySearchInput?.value || '');
});

librarySearchInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    runLibrarySearch(librarySearchInput.value || '');
  }
});

async function runLibrarySearch(query) {
  if (!libraryResultsEl) return;
  const q = String(query || '').trim();
  libraryResultsEl.innerHTML = '<div class="library-result-item">Searching...</div>';
  try {
    const res = await fetch(`/api/library/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];

    if (!items.length) {
      libraryResultsEl.innerHTML = '<div class="library-result-item">No library matches found.</div>';
      return;
    }

    libraryResultsEl.innerHTML = items.slice(0, 25).map((item) => {
      const tags = Array.isArray(item.tags) ? item.tags.filter(Boolean).slice(0, 4).join(' | ') : '';
      const url = item.sourceUrl ? `<div><a href="${escapeHtml(String(item.sourceUrl))}" target="_blank" rel="noreferrer">source</a></div>` : '';
      return `<div class="library-result-item"><strong>${escapeHtml(item.title || 'item')}</strong><div>${escapeHtml(item.kind || '')} · ${escapeHtml(item.category || '')}</div><div>${escapeHtml(tags)}</div>${url}</div>`;
    }).join('');
  } catch {
    libraryResultsEl.innerHTML = '<div class="library-result-item">Unable to search library.</div>';
  }
}

loadPanels();

// ---- UI ----
function addMsg(role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = text;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
  return div;
}

// ---- Send to backend ----
async function askAI(userText) {
  if (isWaitingReply) return;
  isWaitingReply = true;
  if (interimCommitTimer) {
    clearTimeout(interimCommitTimer);
    interimCommitTimer = null;
  }
  if (recognition && recognizing) {
    try { recognition.stop(); } catch (e) { console.error(e); }
  }
  history.push({ role: 'user', content: userText });
  const thinking = addMsg('bot', '…thinking');
  thinking.classList.add('thinking');
  statusEl.textContent = 'Thinking…';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    });
    const data = await res.json();
    thinking.remove();

    if (!res.ok) {
      const errMsg = data.error || 'Something went wrong.';
      addMsg('bot', `⚠️ ${errMsg}`);
      statusEl.textContent = 'Error.';
      return;
    }

    const reply = data.reply || '(no reply)';
    history.push({ role: 'assistant', content: reply });
    addMsg('bot', reply);
    if (data.lead) {
      latestLead = data.lead;
      renderLeadSummary(data.lead);
    }
    if (data.action) {
      prependOutreachItem(data.action);
    }
    const latencyLabel = data.latencyMs ? ` (${data.latencyMs}ms)` : '';
    statusEl.textContent = `Speaking${latencyLabel}…`;
    document.body.classList.add('is-speaking');
    primeTTS();
    speak(reply, () => {
      document.body.classList.remove('is-speaking');
      statusEl.textContent = handsFreeMode ? 'Hands-free listening...' : 'Ready.';
      if (handsFreeMode && recognition && !isWaitingReply) {
        queueRecognitionStart(180);
      }
    });
  } catch (err) {
    thinking.remove();
    addMsg('bot', `⚠️ Network error: ${err.message}`);
    statusEl.textContent = 'Error.';
  } finally {
    isWaitingReply = false;
    loadPanels();
  }
}

function renderLeadSummary(lead) {
  if (!leadSummaryText) return;
  const name = lead.name || 'Unknown name';
  const contact = lead.contact || lead.email || lead.phone || 'No contact yet';
  const platform = lead.platform || 'Unknown platform';
  const service = lead.service || 'Unknown service';
  const status = lead.status || 'new';
  leadSummaryText.innerHTML = `Latest lead: <strong>${name}</strong> | ${platform} | ${service} | ${contact} | Status: ${status}`;
}

async function loadPanels() {
  await Promise.all([loadLeadQueue(), loadOutreachList()]);
}

async function loadLeadQueue() {
  if (!leadQueueEl) return;
  try {
    const res = await fetch('/api/leads');
    const data = await res.json();
    const leads = Array.isArray(data.leads) ? data.leads : [];
    const qualified = leads.filter((lead) => String(lead.status || '').toLowerCase() === 'qualified').length;
    const follow = leads.filter((lead) => !lead.timeline || (!lead.contact && !lead.email && !lead.phone)).length;

    if (kpiTotalEl) kpiTotalEl.textContent = String(leads.length);
    if (kpiQualifiedEl) kpiQualifiedEl.textContent = String(qualified);
    if (kpiFollowEl) kpiFollowEl.textContent = String(follow);
    const leadHeadMeta = document.getElementById('leadHeadMeta');
    if (leadHeadMeta) leadHeadMeta.textContent = `${leads.length} lead${leads.length===1?'':'s'}`;

    if (!leads.length) {
      leadQueueEl.innerHTML = '<div class="lead-card">No leads yet.</div>';
      return;
    }

    leadQueueEl.innerHTML = leads.slice(0, 8).map((lead) => {
      const tags = [lead.location, lead.platform, lead.status].filter(Boolean)
        .map((t) => `<span class="tag-chip">${escapeHtml(String(t))}</span>`).join('');
      return `<article class="lead-card">
        <div class="name">${escapeHtml(lead.name || 'Unknown Lead')}</div>
        <div>${escapeHtml(lead.service || lead.notes || 'Lead inquiry')}</div>
        <div class="tags">${tags}</div>
      </article>`;
    }).join('');
  } catch {
    leadQueueEl.innerHTML = '<div class="lead-card">Unable to load leads.</div>';
  }
}

async function loadOutreachList() {
  if (!outreachListEl) return;
  try {
    const res = await fetch('/api/outreach');
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    const outMeta = document.getElementById('outreachHeadMeta');
    if (outMeta) outMeta.textContent = `${items.length} draft${items.length===1?'':'s'}`;
    if (!items.length) {
      outreachListEl.innerHTML = '<div class="outreach-item">No drafts yet.</div>';
      return;
    }

    outreachListEl.innerHTML = items.slice(0, 8).map((item) => {
      const target = item.target ? ` to ${escapeHtml(String(item.target))}` : '';
      const img = item.imageUrl ? `<div><a href="${escapeHtml(String(item.imageUrl))}" target="_blank" rel="noreferrer">Open image</a></div>` : '';
      const groupedSummary = item.grouped
        ? `<div>${renderGroupedSummary(item.grouped)}</div>`
        : '';
      const status = escapeHtml(item.status || 'draft');
      const actions = status === 'sent'
        ? '<div class="outreach-actions"><span class="outreach-state sent">sent</span></div>'
        : `<div class="outreach-actions">
            <span class="outreach-state">${status}</span>
            <button data-action="approve" data-id="${escapeHtml(item.id)}">Approve</button>
            <button data-action="send" data-id="${escapeHtml(item.id)}">Send</button>
          </div>`;
      return `<div class="outreach-item"><strong>${escapeHtml(item.type || 'action')}</strong>${target}<div>${escapeHtml(item.message || '')}</div>${groupedSummary}${img}${actions}</div>`;
    }).join('');
  } catch {
    outreachListEl.innerHTML = '<div class="outreach-item">Unable to load outreach items.</div>';
  }
}

function prependOutreachItem(item) {
  if (!outreachListEl) return;
  loadOutreachList();
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderGroupedSummary(grouped) {
  const countries = Object.keys(grouped || {});
  if (!countries.length) return '';
  const parts = countries.slice(0, 3).map((country) => {
    const segments = Object.entries(grouped[country] || {})
      .map(([segment, count]) => `${segment}:${count}`)
      .join(', ');
    return `${country} [${segments}]`;
  });
  return `Country/Segment: ${escapeHtml(parts.join(' | '))}`;
}

// ---- Text-to-Speech ----
// ---- Text-to-Speech ----
let openaiTTSEnabled = false;
let openaiTTSVoice = 'nova';
let currentAudio = null;

fetch('/api/tts-config').then(r => r.json()).then(cfg => {
  openaiTTSEnabled = !!cfg.enabled;
  if (cfg.voice) openaiTTSVoice = cfg.voice;
}).catch(() => {});

async function speakOpenAI(text, onEnd) {
  try {
    if (currentAudio) { try { currentAudio.pause(); } catch (e) {} currentAudio = null; }
    isSpeaking = true;
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: openaiTTSVoice })
    });
    if (!res.ok) throw new Error('TTS request failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => {
      isSpeaking = false;
      URL.revokeObjectURL(url);
      currentAudio = null;
      onEnd?.();
    };
    audio.onerror = () => {
      isSpeaking = false;
      URL.revokeObjectURL(url);
      currentAudio = null;
      statusEl.textContent = 'Audio playback error.';
      onEnd?.();
    };
    await audio.play();
  } catch (e) {
    isSpeaking = false;
    console.error('OpenAI TTS failed, falling back:', e);
    speakBrowser(text, onEnd);
  }
}

function speak(text, onEnd) {
  if (openaiTTSEnabled) return speakOpenAI(text, onEnd);
  return speakBrowser(text, onEnd);
}

function speakBrowser(text, onEnd) {
  if (!('speechSynthesis' in window)) { onEnd?.(); return; }
  isSpeaking = true;
  const shortForVoice = (text || 'Okay.').toString().slice(0, 280);
  const u = new SpeechSynthesisUtterance(shortForVoice);
  u.lang = 'en-US';
  u.rate = 0.98;
  u.pitch = 1.02;

  // Prefer a richer, natural adult voice when available.
  const pickVoice = () => {
    const voices = speechSynthesis.getVoices();
    // 1. Premium / Enhanced macOS voices (best quality)
    const premium = voices.find(v => /\(Premium\)|\(Enhanced\)/i.test(v.name) && /en[-_]/i.test(v.lang));
    if (premium) return premium;
    // 2. Known natural-sounding voices
    return voices.find(v => /Ava|Evan|Zoe|Allison|Nathan|Joelle|Tom|Susan|Samantha|Karen|Daniel|Moira|Serena|Fiona/i.test(v.name) && /en[-_]/i.test(v.lang))
      || voices.find(v => /Google US English/i.test(v.name))
      || voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en-us'))
      || voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en'))
      || null;
  };

  const preferred = pickVoice();
  if (preferred) {
    u.voice = preferred;
  }

  u.onend = () => {
    isSpeaking = false;
    onEnd?.();
  };
  u.onerror = () => {
    isSpeaking = false;
    statusEl.textContent = 'Voice playback blocked. Click Start hands-free once to unlock audio.';
    onEnd?.();
  };

  speechSynthesis.resume();
  speechSynthesis.speak(u);

  // Some browsers silently drop first utterance; retry once.
  setTimeout(() => {
    if (!speechSynthesis.speaking && isSpeaking) {
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    }
  }, 220);
}

function primeTTS() {
  if (!('speechSynthesis' in window) || ttsPrimed) return;
  ttsPrimed = true;
  try {
    speechSynthesis.getVoices();
    speechSynthesis.resume();
  } catch (e) { /* noop */ }
}
// Chrome macOS bug: speech stops after ~15s. Keepalive ping.
if ('speechSynthesis' in window) {
  setInterval(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      speechSynthesis.resume();
    }
  }, 10000);
}
// Voices load async in some browsers
if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => {
    if (!ttsPrimed) primeTTS();
  };
}

document.addEventListener('click', () => {
  primeTTS();
}, { once: true });

// ---- Test voice diagnostic ----
document.getElementById('testVoiceBtn')?.addEventListener('click', () => {
  if (!('speechSynthesis' in window)) {
    statusEl.textContent = 'speechSynthesis NOT supported in this browser.';
    return;
  }
  const voices = speechSynthesis.getVoices();
  console.log('[voice-test] voices count:', voices.length, voices);
  if (!voices.length) {
    statusEl.textContent = 'No TTS voices loaded. Open chrome://settings/?search=voice and check.';
    return;
  }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance('Voice test. If you can hear this, audio is working.');
  u.lang = 'en-US';
  u.volume = 1;
  u.rate = 1;
  u.voice = voices.find(v => /Samantha|Google US English|Microsoft Aria|Daniel/i.test(v.name))
         || voices.find(v => (v.lang||'').toLowerCase().startsWith('en'))
         || voices[0];
  u.onstart = () => { statusEl.textContent = `Speaking with: ${u.voice?.name || 'default'}`; };
  u.onend = () => { statusEl.textContent = 'Test done.'; };
  u.onerror = (e) => { statusEl.textContent = `TTS error: ${e.error}`; };
  speechSynthesis.resume();
  speechSynthesis.speak(u);
});
