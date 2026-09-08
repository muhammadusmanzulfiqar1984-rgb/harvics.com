'use client'

export default function DeviceSelector({ cam, mic }: { cam: boolean; mic: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center text-xs">
      {[
        { ok: cam, label: 'Camera' },
        { ok: mic, label: 'Mic' },
        { ok: true, label: 'Speaker' },
      ].map((d) => (
        <div
          key={d.label}
          className={`rounded-lg border px-2 py-3 ${d.ok ? 'border-emerald-700/40 text-emerald-300' : 'border-white/10 text-white/40'}`}
        >
          {d.label}
          <div className="mt-1 font-semibold">{d.ok ? 'OK' : 'Check'}</div>
        </div>
      ))}
    </div>
  )
}
