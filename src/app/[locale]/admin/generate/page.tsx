'use client'

import { useState } from 'react'

type EngineType = 'FLUX' | 'SDXL'

interface GenerateResponse {
  success: boolean
  engineUsed: EngineType
  model: string
  url: string
  promptUsed: string
  key: string
  error?: string
}

const VERTICALS = [
  'fmcg',
  'apparels',
  'sports',
  'automotive',
  'industrial',
  'medical',
  'construction',
  'agriculture',
  'energy',
  'logistics',
]

export default function GenerateImagePage() {
  const [vertical, setVertical] = useState('fmcg')
  const [category, setCategory] = useState('')
  const [rawPrompt, setRawPrompt] = useState('')
  const [engineType, setEngineType] = useState<EngineType>('SDXL')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vertical, category, rawPrompt, engineType }),
      })
      const data = (await res.json()) as GenerateResponse
      if (!res.ok || !data.success) {
        setError(data.error || 'Generation failed')
      } else {
        setResult(data)
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0e0e0e] pt-20 text-white">
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-harvics-gold">
          Admin · Auto-Generation Pipeline
        </p>
        <h1 className="mb-2 text-3xl font-semibold md:text-4xl">Generate Image</h1>
        <p className="mb-10 max-w-2xl text-sm text-white/70">
          Groq expands the raw prompt into a cinematic brief, then HuggingFace renders it via
          FLUX (hero quality) or SDXL (fast batch). Result uploads to Cloudflare R2 as WebP.
        </p>

        <form onSubmit={submit} className="grid gap-5 rounded border border-white/10 bg-[#141414] p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-white/80">Vertical</span>
              <select
                value={vertical}
                onChange={(e) => setVertical(e.target.value)}
                className="rounded border border-white/15 bg-[#0e0e0e] px-3 py-2 text-white"
              >
                {VERTICALS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-white/80">Category</span>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                placeholder="e.g. snacks, bakery, dairy"
                className="rounded border border-white/15 bg-[#0e0e0e] px-3 py-2 text-white placeholder:text-white/30"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-white/80">Raw prompt / keywords</span>
            <textarea
              value={rawPrompt}
              onChange={(e) => setRawPrompt(e.target.value)}
              required
              rows={4}
              placeholder="e.g. premium chocolate bar product hero, gold foil wrapper, studio lighting"
              className="rounded border border-white/15 bg-[#0e0e0e] px-3 py-2 text-white placeholder:text-white/30"
            />
          </label>

          <fieldset className="grid gap-2 text-sm">
            <legend className="mb-1 font-medium text-white/80">Engine</legend>
            <div className="flex gap-3">
              <label className="flex flex-1 cursor-pointer items-start gap-2 rounded border border-white/15 bg-[#0e0e0e] p-3">
                <input
                  type="radio"
                  name="engine"
                  value="SDXL"
                  checked={engineType === 'SDXL'}
                  onChange={() => setEngineType('SDXL')}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold">SDXL</span>
                  <span className="block text-xs text-white/60">
                    Fast batch — product cards, thumbnails, grid items
                  </span>
                </span>
              </label>
              <label className="flex flex-1 cursor-pointer items-start gap-2 rounded border border-white/15 bg-[#0e0e0e] p-3">
                <input
                  type="radio"
                  name="engine"
                  value="FLUX"
                  checked={engineType === 'FLUX'}
                  onChange={() => setEngineType('FLUX')}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold">FLUX (Schnell)</span>
                  <span className="block text-xs text-white/60">
                    Hero quality — banners, leadership, brand showcases
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 self-start rounded bg-harvics-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#0e0e0e] disabled:opacity-50"
          >
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
            <strong className="block font-semibold">Error</strong>
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 rounded border border-white/10 bg-[#141414] p-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-harvics-gold">
              {result.engineUsed} · {result.model}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.url}
              alt={result.promptUsed}
              className="mb-4 w-full max-w-2xl rounded border border-white/10"
            />
            <dl className="grid gap-2 text-xs text-white/70">
              <div>
                <dt className="inline font-semibold text-white/90">Storage key: </dt>
                <dd className="inline break-all">{result.key}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-white/90">URL: </dt>
                <dd className="inline break-all">
                  <a href={result.url} target="_blank" rel="noreferrer" className="text-harvics-gold underline">
                    {result.url}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="block font-semibold text-white/90">Optimized prompt:</dt>
                <dd className="mt-1 whitespace-pre-wrap rounded bg-black/30 p-3 text-white/80">
                  {result.promptUsed}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </section>
    </main>
  )
}
