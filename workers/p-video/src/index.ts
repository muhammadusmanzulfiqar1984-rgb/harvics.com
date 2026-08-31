import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from './types'

function replicateKey(env: Env): string {
  return (env.REPLICATE_API_KEY || env.REPLICATE_API_TOKEN || '').trim()
}

function prunaKey(env: Env): string {
  return (env.PRUNA_API_KEY || '').trim()
}

const DEFAULT_IMAGE_MODEL = '@cf/black-forest-labs/flux-2-dev'
const DEFAULT_VIDEO_MODEL = 'pruna/p-video'

const FLUX2_MODELS = new Set([
  '@cf/black-forest-labs/flux-2-dev',
  '@cf/black-forest-labs/flux-2-klein-9b',
])

const IMAGE_MODELS = new Set([
  ...FLUX2_MODELS,
  '@cf/black-forest-labs/flux-1-schnell',
  '@cf/stabilityai/stable-diffusion-xl-base-1.0',
  '@cf/bytedance/stable-diffusion-xl-lightning',
])

const VIDEO_MODELS = new Set(['pruna/p-video'])

const ASPECT = new Set(['16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '1:1'])
const RES = new Set(['720p', '1080p'])

type ImageBody = {
  model?: string
  prompt?: string
  steps?: number
}

type VideoBody = {
  model?: string
  prompt?: string
  duration?: number
  resolution?: string
  aspect_ratio?: string
  draft?: boolean
}

function pickVideoUrl(result: unknown): string | null {
  if (!result || typeof result !== 'object') return null
  const r = result as Record<string, unknown>
  // Pruna returns generation_url
  if (typeof r.generation_url === 'string' && /^https?:\/\//i.test(r.generation_url)) {
    return r.generation_url
  }
  // Replicate often returns output as a string URL or array of URLs
  const out = r.output
  if (typeof out === 'string' && /^https?:\/\//i.test(out)) return out
  if (Array.isArray(out)) {
    for (const item of out) {
      if (typeof item === 'string' && /^https?:\/\//i.test(item)) return item
    }
  }
  for (const key of ['video_url', 'url', 'uri', 'video']) {
    const v = r[key]
    if (typeof v === 'string' && /^https?:\/\//i.test(v)) return v
  }
  for (const nest of ['result', 'output', 'data']) {
    const found = pickVideoUrl(r[nest])
    if (found) return found
  }
  return null
}

const ACCOUNT_DEFAULT = 'c606ef34847cc91452c3e27a2a7a91e6'
const GATEWAY_DEFAULT = 'default'
const PRUNA_PREDICT = 'https://api.pruna.ai/v1/predictions'

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return { raw: text.slice(0, 500) }
  }
}

function errFromBody(json: unknown, textFallback: string, status: number): string {
  if (json && typeof json === 'object') {
    const o = json as Record<string, unknown>
    for (const k of ['error', 'detail', 'message']) {
      if (o[k] != null && String(o[k]).trim()) return String(o[k])
    }
  }
  return textFallback || `HTTP ${status}`
}

/**
 * Native Pruna API (dashboard.pruna.ai key).
 * curl -H "apikey: …" -H "Model: p-video" https://api.pruna.ai/v1/predictions
 */
async function runPrunaNative(
  env: Env,
  model: 'p-video' | 'p-image',
  input: Record<string, unknown>,
  opts?: { trySync?: boolean },
): Promise<{ result: unknown; via: string }> {
  const apiKey = prunaKey(env)
  if (!apiKey) {
    throw new Error('Set Worker secret PRUNA_API_KEY from dashboard.pruna.ai → API Keys')
  }

  const trySync = opts?.trySync !== false
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: apiKey,
    Model: model,
  }
  if (trySync) headers['Try-Sync'] = 'true'

  const res = await fetch(PRUNA_PREDICT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ input }),
  })
  const json = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(errFromBody(json, '', res.status))
  }

  // Sync succeeded
  if (json && typeof json === 'object') {
    const o = json as Record<string, unknown>
    if (o.status === 'succeeded' || typeof o.generation_url === 'string') {
      return { result: json, via: `pruna.ai/${model}` }
    }
    // Async: poll status
    const statusUrl =
      (typeof o.get_url === 'string' && o.get_url) ||
      (typeof o.id === 'string' ? `https://api.pruna.ai/v1/predictions/status/${o.id}` : null)
    if (statusUrl) {
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000))
        const st = await fetch(statusUrl, { headers: { apikey: apiKey } })
        const body = await parseJsonResponse(st)
        if (!st.ok) throw new Error(errFromBody(body, '', st.status))
        if (body && typeof body === 'object') {
          const b = body as Record<string, unknown>
          if (b.status === 'succeeded' || typeof b.generation_url === 'string') {
            return { result: body, via: `pruna.ai/${model} (async)` }
          }
          if (b.status === 'failed') {
            throw new Error(String(b.error || b.message || 'Pruna prediction failed'))
          }
        }
      }
      throw new Error('Pruna prediction timed out while polling')
    }
  }

  return { result: json, via: `pruna.ai/${model}` }
}

/** Direct Replicate API — uses REPLICATE_API_KEY (no Cloudflare Gateway balance). */
async function runPVideoViaReplicate(
  env: Env,
  input: {
    prompt: string
    duration: number
    resolution: string
    aspect_ratio: string
    draft: boolean
  },
): Promise<{ result: unknown; via: string }> {
  const providerKey = replicateKey(env)
  if (!providerKey) {
    throw new Error('Set Worker secret REPLICATE_API_KEY from replicate.com/settings/api-tokens')
  }

  const createRes = await fetch('https://api.replicate.com/v1/models/prunaai/p-video/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${providerKey}`,
      Prefer: 'wait',
    },
    body: JSON.stringify({
      input: {
        prompt: input.prompt,
        duration: input.duration,
        resolution: input.resolution,
        aspect_ratio: input.aspect_ratio,
        draft: input.draft,
        fps: 24,
      },
    }),
  })

  let json = await parseJsonResponse(createRes)
  if (!createRes.ok) {
    throw new Error(errFromBody(json, '', createRes.status))
  }

  // Poll if Prefer: wait didn't finish
  if (json && typeof json === 'object') {
    const o = json as Record<string, unknown>
    const getUrl =
      (o.urls && typeof o.urls === 'object' && typeof (o.urls as { get?: string }).get === 'string'
        ? (o.urls as { get: string }).get
        : null) ||
      (typeof o.id === 'string' ? `https://api.replicate.com/v1/predictions/${o.id}` : null)

    let status = String(o.status || '')
    for (let i = 0; i < 90 && getUrl && status !== 'succeeded' && status !== 'failed' && status !== 'canceled'; i++) {
      if (status === 'succeeded') break
      await new Promise((r) => setTimeout(r, 2000))
      const st = await fetch(getUrl, {
        headers: { Authorization: `Bearer ${providerKey}` },
      })
      json = await parseJsonResponse(st)
      if (!st.ok) throw new Error(errFromBody(json, '', st.status))
      if (json && typeof json === 'object') {
        status = String((json as { status?: string }).status || '')
        if (status === 'failed') {
          throw new Error(String((json as { error?: string }).error || 'Replicate prediction failed'))
        }
      }
    }
  }

  return { result: json, via: 'replicate.com/prunaai/p-video' }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function pickImageBase64(result: unknown): string | null {
  if (!result) return null
  if (typeof result === 'string') {
    return result.startsWith('data:') ? result.split(',')[1] ?? result : result
  }
  if (result instanceof ArrayBuffer) {
    return bytesToBase64(new Uint8Array(result))
  }
  if (result instanceof Uint8Array) {
    return bytesToBase64(result)
  }
  if (typeof result === 'object') {
    const r = result as Record<string, unknown>
    for (const key of ['image', 'b64_json', 'base64']) {
      const v = r[key]
      if (typeof v === 'string' && v.length > 0) {
        return v.startsWith('data:') ? v.split(',')[1] ?? v : v
      }
      if (v instanceof ArrayBuffer) return bytesToBase64(new Uint8Array(v))
      if (v instanceof Uint8Array) return bytesToBase64(v)
    }
  }
  return null
}

/** FLUX.2 models require multipart/form-data (even for text-only prompts). */
async function runFlux2(
  ai: Ai,
  model: string,
  prompt: string,
  width = 1024,
  height = 1024,
  steps?: number,
): Promise<unknown> {
  const form = new FormData()
  form.append('prompt', prompt)
  form.append('width', String(width))
  form.append('height', String(height))
  if (typeof steps === 'number' && Number.isFinite(steps)) {
    form.append('steps', String(Math.round(steps)))
  }

  // FormData must be serialized via Request/Response to get the multipart boundary.
  const formRequest = new Request('http://dummy', { method: 'POST', body: form })
  const formStream = formRequest.body
  const formContentType = formRequest.headers.get('content-type') || 'multipart/form-data'

  return ai.run(model as Parameters<Ai['run']>[0], {
    multipart: {
      body: formStream,
      contentType: formContentType,
    },
  } as Parameters<Ai['run']>[1])
}

const UI_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Media Generator</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0c0e12;
      --panel: #151922;
      --fg: #eef1f6;
      --muted: #8b93a7;
      --line: #2a3142;
      --accent: #f6821f;
      --accent-ink: #1a0f05;
      --err: #ff6b7a;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: "SF Pro Text", ui-sans-serif, system-ui, sans-serif;
      color: var(--fg);
      background:
        radial-gradient(900px 420px at 12% -10%, rgba(246,130,31,0.18), transparent 55%),
        radial-gradient(700px 380px at 90% 0%, rgba(56,110,255,0.12), transparent 50%),
        var(--bg);
    }
    main { max-width: 720px; margin: 0 auto; padding: 2.25rem 1.15rem 3.5rem; }
    h1 { margin: 0; font-size: 1.55rem; letter-spacing: -0.03em; font-weight: 700; }
    .lead { margin: 0.4rem 0 1.4rem; color: var(--muted); line-height: 1.5; font-size: 0.95rem; }
    .tabs { display: flex; gap: 0.4rem; margin-bottom: 1rem; }
    .tab {
      border: 1px solid var(--line);
      background: transparent;
      color: var(--muted);
      border-radius: 999px;
      padding: 0.45rem 0.95rem;
      cursor: pointer;
      font: inherit;
      font-weight: 600;
      font-size: 0.88rem;
    }
    .tab.active { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
    .panel {
      background: color-mix(in srgb, var(--panel) 92%, black);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 1.1rem;
    }
    .panel.hidden { display: none; }
    label {
      display: block;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      margin: 0.85rem 0 0.35rem;
    }
    label:first-child { margin-top: 0; }
    textarea, input, select {
      width: 100%;
      border: 1px solid var(--line);
      background: #0f131b;
      color: var(--fg);
      border-radius: 10px;
      padding: 0.7rem 0.8rem;
      font: inherit;
    }
    textarea { min-height: 100px; resize: vertical; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .check {
      display: flex; align-items: center; gap: 0.5rem;
      margin-top: 0.9rem; color: var(--muted); font-size: 0.9rem;
    }
    .check input { width: auto; }
    button.go {
      margin-top: 1.1rem;
      width: 100%;
      border: 0;
      border-radius: 10px;
      background: var(--accent);
      color: var(--accent-ink);
      font-weight: 700;
      padding: 0.85rem 1rem;
      cursor: pointer;
    }
    button.go:disabled { opacity: 0.55; cursor: wait; }
    #status { margin-top: 1rem; color: var(--muted); font-size: 0.9rem; white-space: pre-wrap; }
    #status.error { color: var(--err); }
    #preview img, #preview video {
      width: 100%; margin-top: 1rem; border-radius: 12px; background: #000; display: none;
    }
    .meta { margin-top: 1.25rem; color: var(--muted); font-size: 0.82rem; }
    .meta a { color: var(--accent); }
    code { font-size: 0.85em; }
    @media (max-width: 560px) { .row { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <h1>AI Media Generator</h1>
    <p class="lead">Workers AI — image (Flux) and video (P-Video). No API token needed; uses the <code>AI</code> binding.</p>

    <div class="tabs" role="tablist">
      <button type="button" class="tab active" data-tab="image" role="tab" aria-selected="true">Image</button>
      <button type="button" class="tab" data-tab="video" role="tab" aria-selected="false">Video</button>
    </div>

    <section id="panel-image" class="panel" role="tabpanel">
      <form id="form-image">
        <label for="image-model">Model</label>
        <select id="image-model" name="model">
          <option value="@cf/black-forest-labs/flux-2-dev" selected>FLUX.2 Dev (best quality)</option>
          <option value="@cf/black-forest-labs/flux-2-klein-9b">FLUX.2 Klein 9B (fast)</option>
          <option value="@cf/black-forest-labs/flux-1-schnell">Flux 1 Schnell</option>
          <option value="@cf/stabilityai/stable-diffusion-xl-base-1.0">Stable Diffusion XL</option>
          <option value="@cf/bytedance/stable-diffusion-xl-lightning">SDXL Lightning</option>
        </select>
        <label for="image-prompt">Prompt</label>
        <textarea id="image-prompt" required placeholder="A cyberpunk lizard on a neon rooftop"></textarea>
        <label for="image-steps">Steps (optional; FLUX.2 Dev supports higher)</label>
        <input id="image-steps" type="number" min="1" max="50" value="25" />
        <button class="go" type="submit">Generate image</button>
      </form>
    </section>

    <section id="panel-video" class="panel hidden" role="tabpanel">
      <form id="form-video">
        <label for="video-model">Model</label>
        <select id="video-model" name="model">
          <option value="pruna/p-video" selected>P-Video (pruna/p-video)</option>
        </select>
        <label for="video-prompt">Prompt</label>
        <textarea id="video-prompt" required placeholder="A sports car drifting through a neon-lit city at night, cinematic aerial shot"></textarea>
        <div class="row">
          <div>
            <label for="duration">Duration (sec)</label>
            <input id="duration" type="number" min="1" max="20" value="5" />
          </div>
          <div>
            <label for="resolution">Resolution</label>
            <select id="resolution">
              <option value="720p" selected>720p</option>
              <option value="1080p">1080p</option>
            </select>
          </div>
        </div>
        <label for="aspect_ratio">Aspect ratio</label>
        <select id="aspect_ratio">
          <option value="16:9" selected>16:9</option>
          <option value="9:16">9:16</option>
          <option value="1:1">1:1</option>
          <option value="4:3">4:3</option>
          <option value="3:4">3:4</option>
        </select>
        <label class="check"><input id="draft" type="checkbox" checked /> Draft mode (cheaper Neurons)</label>
        <button class="go" type="submit">Generate video</button>
      </form>
    </section>

    <div id="status"></div>
    <div id="preview">
      <img id="img-out" alt="Generated image" />
      <video id="vid-out" controls playsinline></video>
    </div>

    <p class="meta">
      <a href="/health">/health</a> ·
      POST <code>/api/image</code> ·
      POST <code>/api/video</code>
    </p>
  </main>
  <script>
    const statusEl = document.getElementById('status');
    const imgOut = document.getElementById('img-out');
    const vidOut = document.getElementById('vid-out');

    function clearPreview() {
      imgOut.style.display = 'none';
      imgOut.removeAttribute('src');
      vidOut.style.display = 'none';
      vidOut.removeAttribute('src');
    }

    document.querySelectorAll('.tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab').forEach((b) => {
          const on = b.dataset.tab === tab;
          b.classList.toggle('active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        document.getElementById('panel-image').classList.toggle('hidden', tab !== 'image');
        document.getElementById('panel-video').classList.toggle('hidden', tab !== 'video');
        statusEl.className = '';
        statusEl.textContent = '';
        clearPreview();
      });
    });

    document.getElementById('form-image').addEventListener('submit', async (e) => {
      e.preventDefault();
      clearPreview();
      statusEl.className = '';
      statusEl.textContent = 'Generating image…';
      const btn = e.target.querySelector('button');
      btn.disabled = true;
      try {
        const res = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: document.getElementById('image-model').value,
            prompt: document.getElementById('image-prompt').value,
            steps: Number(document.getElementById('image-steps').value || 4),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
        const b64 = data.image || data.base64;
        if (!b64) throw new Error('No image in response');
        imgOut.src = b64.startsWith('data:') ? b64 : ('data:image/jpeg;base64,' + b64);
        imgOut.style.display = 'block';
        statusEl.textContent = 'Done.';
      } catch (err) {
        statusEl.className = 'error';
        statusEl.textContent = String(err.message || err);
      } finally {
        btn.disabled = false;
      }
    });

    document.getElementById('form-video').addEventListener('submit', async (e) => {
      e.preventDefault();
      clearPreview();
      statusEl.className = '';
      statusEl.textContent = 'Generating video… this can take up to a minute.';
      const btn = e.target.querySelector('button');
      btn.disabled = true;
      try {
        const res = await fetch('/api/video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: document.getElementById('video-model').value,
            prompt: document.getElementById('video-prompt').value,
            duration: Number(document.getElementById('duration').value || 5),
            resolution: document.getElementById('resolution').value,
            aspect_ratio: document.getElementById('aspect_ratio').value,
            draft: document.getElementById('draft').checked,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
        const url = data.videoUrl || data.url;
        if (!url) {
          statusEl.textContent = 'Done (no video URL).\\n' + JSON.stringify(data, null, 2);
          return;
        }
        vidOut.src = url;
        vidOut.style.display = 'block';
        statusEl.textContent = 'Done.';
      } catch (err) {
        statusEl.className = 'error';
        statusEl.textContent = String(err.message || err);
      } finally {
        btn.disabled = false;
      }
    });
  </script>
</body>
</html>`

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

app.get('/health', (c) =>
  c.json({
    ok: true,
    binding: 'AI',
    byok: {
      pruna: Boolean(prunaKey(c.env)),
      replicate: Boolean(replicateKey(c.env)),
      gateway: c.env.AI_GATEWAY_ID || GATEWAY_DEFAULT,
    },
    defaults: {
      image: DEFAULT_IMAGE_MODEL,
      video: DEFAULT_VIDEO_MODEL,
    },
    endpoints: ['GET /', 'POST /api/image', 'POST /api/video'],
  }),
)

app.get('/', (c) => c.html(UI_HTML))

app.post('/api/image', async (c) => {
  let body: ImageBody
  try {
    body = (await c.req.json()) as ImageBody
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const prompt = (body.prompt ?? '').trim()
  if (!prompt) return c.json({ error: 'prompt is required' }, 400)

  const model = (body.model ?? DEFAULT_IMAGE_MODEL).trim()
  if (!IMAGE_MODELS.has(model)) {
    return c.json(
      {
        error: `Unsupported image model. Allowed: ${[...IMAGE_MODELS].join(', ')}`,
      },
      400,
    )
  }

  const isFlux2 = model.includes('flux-2') || FLUX2_MODELS.has(model)
  const stepsRaw = body.steps
  const steps =
    stepsRaw === undefined || stepsRaw === null
      ? isFlux2
        ? undefined
        : 4
      : Number(stepsRaw)

  if (steps !== undefined && (!Number.isFinite(steps) || steps < 1 || steps > 50)) {
    return c.json({ error: 'steps must be between 1 and 50' }, 400)
  }

  try {
    let result: unknown

    if (isFlux2 || model.toLowerCase().includes('flux-2')) {
      // FLUX.2 requires multipart (width/height 1024 default).
      result = await runFlux2(
        c.env.AI,
        model,
        prompt,
        1024,
        1024,
        model.includes('klein') ? undefined : steps ?? 25,
      )
    } else {
      const input: Record<string, unknown> = { prompt }
      if (model.includes('flux-1-schnell') && steps !== undefined) {
        input.steps = Math.min(8, Math.round(steps))
      }
      result = await c.env.AI.run(model as Parameters<Ai['run']>[0], input)
    }

    // Binary (FLUX.2) or { image: base64 } (Flux 1 / SDXL)
    let image = pickImageBase64(result)
    if (!image && result && typeof (result as { arrayBuffer?: () => Promise<ArrayBuffer> }).arrayBuffer === 'function') {
      const buf = await (result as Response).arrayBuffer()
      image = bytesToBase64(new Uint8Array(buf))
    }
    if (!image) {
      return c.json({ ok: false, error: 'Model returned no image', resultType: typeof result }, 502)
    }

    return c.json({
      ok: true,
      model,
      prompt,
      image,
      mimeType: 'image/jpeg',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[api/image]', message)
    return c.json({ ok: false, error: message, model }, 502)
  }
})

app.post('/api/video', async (c) => {
  let body: VideoBody
  try {
    body = (await c.req.json()) as VideoBody
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const prompt = (body.prompt ?? '').trim()
  if (!prompt) return c.json({ error: 'prompt is required' }, 400)

  const model = (body.model ?? DEFAULT_VIDEO_MODEL).trim()
  if (!VIDEO_MODELS.has(model)) {
    return c.json(
      {
        error: `Unsupported video model. Allowed: ${[...VIDEO_MODELS].join(', ')}`,
      },
      400,
    )
  }

  const duration = Number(body.duration ?? 5)
  if (!Number.isFinite(duration) || duration < 1 || duration > 20) {
    return c.json({ error: 'duration must be a number between 1 and 20' }, 400)
  }

  const resolution = body.resolution ?? '720p'
  if (!RES.has(resolution)) {
    return c.json({ error: 'resolution must be "720p" or "1080p"' }, 400)
  }

  const aspect_ratio = body.aspect_ratio ?? '16:9'
  if (!ASPECT.has(aspect_ratio)) {
    return c.json({ error: 'invalid aspect_ratio' }, 400)
  }

  const draft = body.draft !== false

  const input = {
    prompt,
    duration: Math.round(duration),
    resolution,
    aspect_ratio,
    draft,
  }

  const hasPruna = Boolean(prunaKey(c.env))
  const hasReplicate = Boolean(replicateKey(c.env))

  try {
    // 1) Native Pruna API (apikey header) — preferred
    if (hasPruna) {
      const { result, via } = await runPrunaNative(
        c.env,
        'p-video',
        {
          prompt: input.prompt,
          duration: input.duration,
          resolution: input.resolution,
          aspect_ratio: input.aspect_ratio,
          draft: input.draft,
        },
        { trySync: true },
      )
      return c.json({
        ok: true,
        model,
        via,
        ...input,
        videoUrl: pickVideoUrl(result),
        result,
      })
    }

    // 2) Direct Replicate API — fall through to Workers AI on billing/auth failure
    if (hasReplicate) {
      try {
        const { result, via } = await runPVideoViaReplicate(c.env, input)
        return c.json({
          ok: true,
          model,
          via,
          ...input,
          videoUrl: pickVideoUrl(result),
          result,
        })
      } catch (replicateErr) {
        const msg = replicateErr instanceof Error ? replicateErr.message : String(replicateErr)
        const billing =
          /insufficient credit|billing|payment|quota|402|429/i.test(msg)
        if (!billing) throw replicateErr
        console.warn('[api/video] Replicate billing failed, falling back to env.AI.run:', msg)
      }
    }

    // 3) Workers AI binding (Cloudflare Neurons)
    const result = await c.env.AI.run(model as Parameters<Ai['run']>[0], input)
    const videoUrl = pickVideoUrl(result)

    return c.json({
      ok: true,
      model,
      via: 'env.AI.run',
      ...input,
      videoUrl,
      result,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[api/video]', message)
    return c.json(
      {
        ok: false,
        error: message,
        model,
        hint: hasPruna
          ? 'PRUNA_API_KEY set but call failed — check credits at dashboard.pruna.ai Billing'
          : hasReplicate
            ? 'REPLICATE_API_KEY failed — check Replicate billing'
            : 'Set secret PRUNA_API_KEY (dashboard.pruna.ai), or top up Cloudflare AI Gateway',
      },
      502,
    )
  }
})

// Back-compat aliases
app.post('/generate', (c) => {
  // rewrite path conceptually — forward to video handler by cloning request isn't easy;
  // keep a thin redirect-style note
  return c.json(
    {
      error: 'Use POST /api/video',
      example: { model: DEFAULT_VIDEO_MODEL, prompt: '...', duration: 5 },
    },
    410,
  )
})

app.notFound((c) => c.json({ error: 'Not found' }, 404))

app.onError((err, c) => {
  console.error('[ai-media] unhandled', err)
  return c.json({ error: err.message || 'Internal error' }, 500)
})

export default app
