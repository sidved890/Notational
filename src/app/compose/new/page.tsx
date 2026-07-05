'use client'

import { useState } from 'react'
import { CompositionProvider, DEFAULT_META } from '@/context/CompositionContext'
import Editor from '@/components/Editor'
import { getCellCount, TalaBase, Jathi } from '@/lib/tala'
import { CompositionState } from '@/lib/types'
import { useTheme } from '@/hooks/useTheme'
import ThemePicker from '@/components/ThemePicker'

function makeInitialState(isPublic: boolean): CompositionState {
  const meta = { ...DEFAULT_META }
  const cellCount = getCellCount(
    meta.talaBase as TalaBase,
    meta.jathi as Jathi,
    meta.kalai,
    meta.maatras
  )
  return {
    meta,
    rows: [{ type: 'notation', cells: Array.from({ length: cellCount }, () => ({ swara: '', sahitya: '' })) }],
    cloudId: null,
    isPublic,
  }
}

export default function NewCompositionPage() {
  const [isPublic, setIsPublic] = useState<boolean | null>(null)

  if (isPublic === null) {
    return <VisibilityPicker onPick={setIsPublic} />
  }

  return (
    <CompositionProvider initialData={makeInitialState(isPublic)}>
      <Editor cloudId={null} isTutorial />
    </CompositionProvider>
  )
}

function VisibilityPicker({ onPick }: { onPick: (isPublic: boolean) => void }) {
  const { theme, setTheme } = useTheme()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--parchment)', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', borderBottom: '2px solid var(--gold)',
        background: 'linear-gradient(to bottom, var(--parchment-dark), var(--parchment))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="/" style={{ color: 'var(--gold)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-ui)' }}>← Dashboard</a>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-devanagari)', fontSize: 28, color: 'var(--burgundy)', lineHeight: 1 }}>न</span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--burgundy)', fontStyle: 'italic' }}>Notational</div>
              <div style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)' }}>
                Carnatic Music Notation
              </div>
            </div>
          </a>
        </div>
        <ThemePicker theme={theme} onThemeChange={setTheme} compact />
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 520, width: '100%' }}>
          {/* Decorative rule */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.35 }} />
            <span style={{ color: 'var(--gold)', fontSize: 14 }}>◆</span>
            <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.35 }} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--burgundy)',
            fontStyle: 'italic', textAlign: 'center', marginBottom: 8,
          }}>
            New Composition
          </h1>
          <p style={{ color: 'var(--ink-faint)', fontSize: 14, fontStyle: 'italic', textAlign: 'center', marginBottom: 36 }}>
            Who can see this notation?
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <VisibilityCard
              title="Private"
              icon="🔒"
              description="Only visible to you. You can share a link manually at any time."
              onClick={() => onPick(false)}
            />
            <VisibilityCard
              title="Public"
              icon="🌐"
              description="Listed in the community library and viewable by anyone with the link."
              onClick={() => onPick(true)}
              accent
            />
          </div>

          <p style={{ color: 'var(--ink-faint)', fontSize: 12, textAlign: 'center', marginTop: 20, fontStyle: 'italic', fontFamily: 'var(--font-ui)' }}>
            You can change this at any time using the Share button in the editor.
          </p>
        </div>
      </div>
    </div>
  )
}

function VisibilityCard({
  title, icon, description, onClick, accent,
}: {
  title: string
  icon: string
  description: string
  onClick: () => void
  accent?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && accent
          ? 'linear-gradient(135deg, var(--burgundy), var(--burgundy-light))'
          : hovered
          ? 'var(--gold-faint)'
          : 'var(--parchment-dark)',
        border: accent ? '2px solid var(--gold)' : '1.5px solid rgba(201,151,58,0.35)',
        borderRadius: 12, padding: '28px 20px',
        cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.15s', width: '100%',
        boxShadow: hovered ? '0 4px 16px var(--shadow)' : 'none',
      }}
    >
      <div style={{ fontSize: 30, marginBottom: 14 }}>{icon}</div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 20,
        color: hovered && accent ? 'var(--parchment)' : 'var(--burgundy)',
        fontStyle: 'italic', marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{
        color: hovered && accent ? 'rgba(255,255,255,0.8)' : 'var(--ink-faint)',
        fontSize: 13, lineHeight: 1.55, fontFamily: 'var(--font-ui)',
      }}>
        {description}
      </div>
    </button>
  )
}
