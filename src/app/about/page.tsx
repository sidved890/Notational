'use client'

import ThemePicker from '@/components/ThemePicker'
import { useTheme } from '@/hooks/useTheme'

export default function AboutPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--parchment)' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', borderBottom: '2px solid var(--gold)',
        background: 'linear-gradient(to bottom, var(--parchment-dark), var(--parchment))',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--burgundy)', fontStyle: 'italic' }}>Notational</div>
          <div style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)' }}>Carnatic Music Notation System</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/" style={{ color: 'var(--gold)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>← Dashboard</a>
          <a href="/tutorial" style={{ color: 'var(--ink-faint)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-ui)', fontStyle: 'italic' }}>Tutorial</a>
          <ThemePicker theme={theme} onThemeChange={setTheme} compact />
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 80px' }}>
        {/* Decorative rule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.4 }} />
          <span style={{ color: 'var(--gold)', fontSize: 18 }}>◆</span>
          <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.4 }} />
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--burgundy)', fontStyle: 'italic', marginBottom: 6, lineHeight: 1.2 }}>
          About Notational
        </h1>
        <p style={{ color: 'var(--gold)', fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', marginBottom: 36 }}>
          A tool built for musicians, by a musician
        </p>

        <section style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--ink)', lineHeight: 1.8, marginBottom: 18 }}>
            Notational is a digital manuscript system for Carnatic music notation — built to feel
            like the paper manuscripts musicians have relied on for generations, but with the
            convenience of a modern tool.
          </p>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--ink)', lineHeight: 1.8 }}>
            It supports the full 35-tala system (7 base talas × 5 jathis), section headings for
            composition structure (Pallavi, Anupallavi, Charanam…), raga overview with arohanam
            and avarohanam, and cloud storage so your work is always safe.
          </p>
        </section>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(201,151,58,0.3)', margin: '40px 0' }} />

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--burgundy)', fontStyle: 'italic', marginBottom: 20 }}>
          About the Creator
        </h2>

        <div style={{
          background: 'linear-gradient(135deg, var(--parchment-dark), var(--parchment))',
          border: '1.5px solid rgba(201,151,58,0.4)', borderRadius: 12,
          padding: '28px 32px', marginBottom: 32,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', fontStyle: 'italic', marginBottom: 4 }}>
                Siddharth Vedam
              </div>
              <div style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', marginBottom: 16 }}>
                Budding Vocalist · Mridangist · Developer
              </div>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--ink)', lineHeight: 1.75, marginBottom: 14 }}>
                Sid is a senior at Dougherty Valley High School with a deep passion for Carnatic music —
                as both a vocalist and a mridangist — and an enthusiasm for web development
                and data science.
              </p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--ink)', lineHeight: 1.75 }}>
                Notational was built out of a personal need: a notation tool that respects the
                nuance of the Carnatic system — its tala structures, its octave markers, its
                lyric alignment — without the limitations of paper or generic spreadsheets.
              </p>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { icon: '♩', label: '35 Tala System', desc: '7 base talas × 5 jathis, plus Misra/Khanda Chapu' },
            { icon: '◆', label: 'Section Headings', desc: 'Pallavi, Anupallavi, Charanam and custom labels' },
            { icon: '☁', label: 'Cloud Storage', desc: 'Save and access your compositions anywhere' },
            { icon: '↗', label: 'Share', desc: 'Generate a public link for any composition' },
            { icon: '⎙', label: 'Print Ready', desc: 'Clean print output with raga info header' },
            { icon: 'S#', label: 'Sangathi', desc: 'Mark multiple variations of the same avartanam' },
            { icon: 'ɔ', label: 'Gap Fill', desc: 'Fill empty swara or sahitya cells per avartanam' },
            { icon: '◐', label: 'Themes', desc: 'Six color themes — Parchment, Midnight, Forest, and more' },
          ].map((f) => (
            <div key={f.label} style={{ padding: '14px 16px', background: 'var(--parchment-dark)', borderRadius: 8, border: '1px solid rgba(201,151,58,0.2)' }}>
              <div style={{ fontSize: 18, color: 'var(--gold)', marginBottom: 6, fontFamily: 'var(--font-serif)' }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--burgundy)', marginBottom: 3, fontFamily: 'var(--font-ui)' }}>{f.label}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(201,151,58,0.3)', margin: '40px 0' }} />

        <div style={{ textAlign: 'center' }}>
          <a href="/compose/new" className="btn btn-primary" style={{ marginRight: 12 }}>Start Notating</a>
          <a href="/" className="btn btn-secondary">View Dashboard</a>
          <p style={{ marginTop: 20, color: 'var(--ink-faint)', fontSize: 12, fontStyle: 'italic' }}>
            Built with Next.js, React, TypeScript, and Firebase
          </p>
        </div>

        {/* Closing decoration */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 48 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.4 }} />
          <span style={{ color: 'var(--gold)', fontSize: 18 }}>◆</span>
          <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.4 }} />
        </div>
      </main>
    </div>
  )
}
