'use client'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function HelpPanel({ isOpen, onClose }: Props) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,18,8,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: 'var(--parchment)',
          border: '2px solid var(--gold)',
          borderRadius: 12,
          padding: '28px 32px',
          maxWidth: 540,
          width: '90%',
          boxShadow: '0 8px 40px rgba(42,26,14,0.35)',
          position: 'relative',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 10,
            right: 14,
            background: 'none',
            border: 'none',
            fontSize: 22,
            color: 'var(--ink-faint)',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 4,
          }}
        >
          ×
        </button>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            color: 'var(--burgundy)',
            marginBottom: 18,
            fontStyle: 'italic',
            borderBottom: '1px solid rgba(201,151,58,0.4)',
            paddingBottom: 10,
          }}
        >
          Keyboard Shortcuts
        </h2>

        <HelpSection title="Talam Beat Markers">
          <HelpRow shortcut="X" desc="Thattu — clap (start of anga)" />
          <HelpRow shortcut="V" desc="Veechu — wave/flip" />
          <HelpRow shortcut="1 2 3" desc="Finger counts within a laghu" />
        </HelpSection>

        <HelpSection title="Special Characters (Swara fields only)">
          <HelpRow shortcut="," desc="Karvai — elongation mark (ɔ)" />
        </HelpSection>

        <HelpSection title="Dot Below — Mandra Sthayee (lower octave)">
          <HelpRow shortcut="m ;" desc="ṃ (ma)" />
          <HelpRow shortcut="p ;" desc="p̣ (pa)" />
          <HelpRow shortcut="d ;" desc="ḍ (da)" />
          <HelpRow shortcut="n ;" desc="ṇ (ni)" />
          <HelpRow shortcut="s ;" desc="ṣ (sa)" />
        </HelpSection>

        <HelpSection title="Dot Above — Tara Sthayee (upper octave)">
          <HelpRow shortcut="s '" desc="ṡ (sa)" />
          <HelpRow shortcut="r '" desc="ṙ (ri)" />
          <HelpRow shortcut="g '" desc="ġ (ga)" />
          <HelpRow shortcut="m '" desc="ṁ (ma)" />
          <HelpRow shortcut="p '" desc="ṗ (pa)" />
        </HelpSection>

        <HelpSection title="Navigation">
          <HelpRow shortcut="← →" desc="Move between cells" />
          <HelpRow shortcut="↑ ↓" desc="Move down the column into the next/previous avartanam" />
          <HelpRow shortcut="Tab / Shift+Tab" desc="Forward / backward" />
          <HelpRow shortcut="Enter in swara" desc="Jump to sahitya" />
          <HelpRow shortcut="Enter in sahitya" desc="Jump to next cell's swara" />
          <HelpRow shortcut="Delete" desc="Clear the current swara cell, then move left" />
          <HelpRow shortcut="?" desc="Toggle this panel" />
        </HelpSection>
      </div>
    </div>
  )
}

function HelpSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h3
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function HelpRow({ shortcut, desc }: { shortcut: string; desc: string }) {
  return (
    <tr>
      <td
        style={{
          padding: '4px 8px',
          borderBottom: '1px solid rgba(201,151,58,0.12)',
          verticalAlign: 'middle',
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          color: 'var(--burgundy)',
          whiteSpace: 'nowrap',
          paddingRight: 14,
        }}
      >
        {shortcut.split(' ').map((k, i) => (
          <span key={i}>
            {i > 0 && ' '}
            <kbd>{k}</kbd>
          </span>
        ))}
      </td>
      <td
        style={{
          padding: '4px 8px',
          borderBottom: '1px solid rgba(201,151,58,0.12)',
          verticalAlign: 'middle',
        }}
      >
        {desc}
      </td>
    </tr>
  )
}
