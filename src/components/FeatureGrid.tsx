const FEATURES = [
  { icon: '♩', label: '35 Talam System', desc: '7 base talams × 5 jathis, plus Misra/Khanda Chapu' },
  { icon: '◆', label: 'Section Headings', desc: 'Pallavi, Anupallavi, Charanam and custom labels' },
  { icon: '☁', label: 'Cloud Storage', desc: 'Save and access your compositions anywhere' },
  { icon: '↗', label: 'Share', desc: 'Generate a public link for any composition' },
  { icon: '⎙', label: 'Print Ready', desc: 'Clean print output with raga info header' },
  { icon: 'S#', label: 'Sangathi', desc: 'Mark multiple variations of the same avarthanam' },
  { icon: 'ɔ', label: 'Gap Fill', desc: 'Fill empty swara or sahitya cells per avarthanam' },
  { icon: '◐', label: 'Themes', desc: 'Six color themes — Parchment, Midnight, Forest, and more' },
]

export default function FeatureGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
      {FEATURES.map((f) => (
        <div key={f.label} style={{ padding: '14px 16px', background: 'var(--parchment-dark)', borderRadius: 8, border: '1px solid rgba(201,151,58,0.2)' }}>
          <div style={{ fontSize: 18, color: 'var(--gold)', marginBottom: 6, fontFamily: 'var(--font-serif)' }}>{f.icon}</div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--burgundy)', marginBottom: 3, fontFamily: 'var(--font-ui)' }}>{f.label}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-faint)', lineHeight: 1.5 }}>{f.desc}</div>
        </div>
      ))}
    </div>
  )
}
