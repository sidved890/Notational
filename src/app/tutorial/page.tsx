'use client'

import { useEffect, useState } from 'react'

export default function TutorialPage() {
  const [darkMode, setDarkMode] = useState(false)
  useEffect(() => { setDarkMode(localStorage.getItem('notational_dark') === 'true') }, [])
  useEffect(() => { document.body.classList.toggle('dark', darkMode) }, [darkMode])

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
          <a href="/about" style={{ color: 'var(--ink-faint)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-ui)', fontStyle: 'italic' }}>About</a>
          <button
            onClick={() => { const d = !darkMode; setDarkMode(d); localStorage.setItem('notational_dark', String(d)) }}
            style={{ background: 'none', border: '1.5px solid rgba(107,30,46,0.25)', borderRadius: 4, color: 'var(--burgundy)', cursor: 'pointer', padding: '6px 10px', fontSize: 15 }}
          >{darkMode ? '☀' : '☽'}</button>
        </div>
      </header>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '56px 24px 96px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.4 }} />
          <span style={{ color: 'var(--gold)', fontSize: 18 }}>◆</span>
          <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.4 }} />
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--burgundy)', fontStyle: 'italic', marginBottom: 6, lineHeight: 1.2 }}>
          Tutorial
        </h1>
        <p style={{ color: 'var(--gold)', fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', marginBottom: 40 }}>
          From blank page to finished notation
        </p>

        <Step n={1} title="Create a composition">
          <p>
            From the <strong>Dashboard</strong>, click <Pill>+ New Composition</Pill>. You can begin
            notating right away — signing in is only needed when you want to save to the cloud.
          </p>
        </Step>

        <Step n={2} title="Fill in the composition details">
          <p>
            At the top of the editor, set the <strong>Song Name</strong>, <strong>Ragam</strong>, and
            <strong> Composer</strong>. These also appear at the top of your printed manuscript.
          </p>
          <p>
            Expand <Pill>▸ Raga Overview</Pill> to record the melakarta, arohanam (ascending), and
            avarohanam (descending) — and mark the raga as a janya if it derives from a parent raga.
          </p>
        </Step>

        <Step n={3} title="Choose the talam">
          <p>
            Pick a <strong>talam</strong> from the presets (Adi, Rupaka, Misra Chapu…) or build any of
            the 35 talas by choosing a base tala and a jathi. Then set:
          </p>
          <ul style={ulStyle}>
            <li><strong>Kalai</strong> — 1× (normal) or 2× (double) speed; 2× doubles every beat slot.</li>
            <li><strong>Gathi</strong> — the number of maatras (sub-beats) packed into each beat.</li>
          </ul>
          <p>The grid automatically lays out the correct beat markers (X, V, finger counts) for the talam you chose.</p>
        </Step>

        <Step n={4} title="Enter swaras and lyrics">
          <p>
            Each cell has two rows: the <strong>swara</strong> (note) on top and the <strong>sahitya</strong>
            {' '}(lyric) below. Type a swara, then move on — the grid is built for fast keyboard entry:
          </p>
          <ul style={ulStyle}>
            <li><Kbd>← →</Kbd> move between cells, <Kbd>↑ ↓</Kbd> move down the column into the next or previous avartanam.</li>
            <li><Kbd>Enter</Kbd> in a swara jumps to its lyric; <Kbd>Enter</Kbd> in a lyric jumps to the next cell.</li>
            <li><Kbd>Tab</Kbd> / <Kbd>Shift+Tab</Kbd> move forward and backward.</li>
            <li><Kbd>Delete</Kbd> clears the current swara cell and moves one cell to the left — handy for fixing a run of notes.</li>
          </ul>
        </Step>

        <Step n={5} title="Mark octaves and elongation">
          <p>In any swara field, special characters are entered with simple key combos:</p>
          <ul style={ulStyle}>
            <li><Kbd>,</Kbd> → <code>ɔ</code> &nbsp; karvai (elongation).</li>
            <li>Letter then <Kbd>;</Kbd> → lower octave (mandra), e.g. <Kbd>s</Kbd> <Kbd>;</Kbd> → <code>ṣ</code>.</li>
            <li>Letter then <Kbd>{`'`}</Kbd> → upper octave (tara), e.g. <Kbd>s</Kbd> <Kbd>{`'`}</Kbd> → <code>ṡ</code>.</li>
          </ul>
          <p>Press <Kbd>?</Kbd> anywhere in the editor to see the full shortcut reference.</p>
        </Step>

        <Step n={6} title="Structure with sections and sangathis">
          <p>
            Use <Pill>§ Add Section Heading</Pill> (or the insert strip that appears between rows) to label
            sections like <em>Pallavi</em>, <em>Anupallavi</em>, and <em>Charanam</em>. Hover an avartanam and
            use the <Pill>S#</Pill> control to tag it as a <strong>sangathi</strong> variation, and the ▲ ▼
            buttons to reorder rows.
          </p>
        </Step>

        <Step n={7} title="Save, organize, and share">
          <p>
            <Pill>☁ Save to Cloud</Pill> stores the composition to your account so it shows up on the
            Dashboard. From the Dashboard you can group compositions into <strong>folders</strong> and move
            them between folders. Use <Pill>↗ Share</Pill> to generate a public read-only link, and
            {' '}<Pill>⬇ Save JSON</Pill> / <Pill>⬆ Load JSON</Pill> to back up or transfer a file directly.
          </p>
        </Step>

        <Step n={8} title="Print a clean manuscript">
          <p>
            <Pill>⎙ Print</Pill> produces a printer-friendly page: the song name, ragam, talam, composer,
            and raga overview appear at the top, followed by the notation grid — editing controls are hidden.
          </p>
        </Step>

        <div style={{ borderTop: '1px solid rgba(201,151,58,0.3)', margin: '44px 0 28px' }} />
        <div style={{ textAlign: 'center' }}>
          <a href="/compose/new" className="btn btn-primary" style={{ marginRight: 12 }}>Start Notating</a>
          <a href="/" className="btn btn-secondary">Back to Dashboard</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 48 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.4 }} />
          <span style={{ color: 'var(--gold)', fontSize: 18 }}>◆</span>
          <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.4 }} />
        </div>
      </main>
    </div>
  )
}

const ulStyle: React.CSSProperties = {
  margin: '10px 0 4px', paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 7,
  fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--ink)', lineHeight: 1.7,
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', gap: 18, marginBottom: 30 }}>
      <div style={{
        flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--burgundy), var(--burgundy-light))',
        color: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: 18, fontStyle: 'italic', fontWeight: 700,
        boxShadow: '0 2px 8px var(--shadow)',
      }}>{n}</div>
      <div style={{ flex: 1, paddingTop: 2 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 21, color: 'var(--burgundy)', fontStyle: 'italic', marginBottom: 8 }}>
          {title}
        </h2>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--ink)', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {children}
        </div>
      </div>
    </section>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block', background: 'var(--parchment-dark)',
      border: '1.5px solid rgba(201,151,58,0.4)', borderRadius: 6,
      padding: '1px 8px', fontFamily: 'var(--font-ui)', fontSize: 13,
      fontWeight: 600, color: 'var(--burgundy)', whiteSpace: 'nowrap',
    }}>{children}</span>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd>{children}</kbd>
}
