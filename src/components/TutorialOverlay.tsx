'use client'

import { useState, useEffect } from 'react'

const TUTORIAL_KEY = 'notational_tutorial_done'
const AUTOSAVE_KEY = 'notational_autosave'

const STEPS = [
  {
    target: 'metadata',
    title: 'Composition Details',
    body: 'Start by entering the song name, ragam, and composer. Then pick a talam — the notation grid adjusts automatically to fit the rhythm cycle.',
  },
  {
    target: 'toolbar',
    title: 'Toolbar',
    body: 'Save to the cloud, share your notation publicly, undo or redo changes, zoom in or out, and print a clean manuscript from here.',
  },
  {
    target: 'grid',
    title: 'Notation Grid',
    body: 'Type swaras (notes) in the top row and sahitya (lyrics) below each note. Use arrow keys to navigate between cells. Press ? anywhere to see all keyboard shortcuts.',
  },
]

export default function TutorialOverlay() {
  const [step, setStep] = useState<number | null>(null)

  useEffect(() => {
    try {
      if (localStorage.getItem(TUTORIAL_KEY)) return
      // Skip tutorial for existing users who already have saved data
      if (localStorage.getItem(AUTOSAVE_KEY)) {
        localStorage.setItem(TUTORIAL_KEY, '1')
        return
      }
      // Short delay so the editor has time to paint before we highlight anything
      const id = setTimeout(() => setStep(0), 500)
      return () => clearTimeout(id)
    } catch { /* ignore storage errors */ }
  }, [])

  // Apply / remove highlight as step changes
  useEffect(() => {
    if (step === null) return

    // Clear all existing highlights
    document.querySelectorAll<HTMLElement>('[data-tutorial]').forEach(el => {
      el.style.outline = ''
      el.style.outlineOffset = ''
      el.style.borderRadius = ''
      el.style.zIndex = ''
      el.style.position = ''
    })

    if (step >= STEPS.length) return

    const target = document.querySelector<HTMLElement>(`[data-tutorial="${STEPS[step].target}"]`)
    if (target) {
      target.style.outline = '2.5px solid rgba(201,151,58,0.9)'
      target.style.outlineOffset = '6px'
      target.style.borderRadius = '8px'
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [step])

  function dismiss() {
    document.querySelectorAll<HTMLElement>('[data-tutorial]').forEach(el => {
      el.style.outline = ''
      el.style.outlineOffset = ''
    })
    try { localStorage.setItem(TUTORIAL_KEY, '1') } catch { /* ignore */ }
    setStep(null)
  }

  function next() {
    if (step === null) return
    if (step + 1 >= STEPS.length) {
      dismiss()
    } else {
      setStep(step + 1)
    }
  }

  if (step === null || step >= STEPS.length) return null

  const current = STEPS[step]

  return (
    <>
      <style>{`
        @keyframes tutorial-glow {
          0%, 100% { outline-color: rgba(201,151,58,0.55); }
          50%       { outline-color: rgba(201,151,58,1); }
        }
        [data-tutorial][style*="outline"] {
          animation: tutorial-glow 1.6s ease-in-out infinite;
        }
      `}</style>

      {/* Fixed bottom bar */}
      <div
        className="no-print"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9000,
          background: 'var(--parchment-dark)',
          borderTop: '2px solid var(--gold)',
          boxShadow: '0 -4px 24px var(--shadow)',
          padding: '14px 24px',
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}
      >
        {/* Step dots */}
        <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: 7, height: 7, borderRadius: '50%',
                background: i <= step ? 'var(--gold)' : 'rgba(201,151,58,0.25)',
                transition: 'background 0.25s',
              }}
            />
          ))}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--burgundy)',
            fontStyle: 'italic', marginBottom: 2,
          }}>
            {current.title}
          </div>
          <div style={{
            color: 'var(--ink-light)', fontSize: 13,
            fontFamily: 'var(--font-ui)', lineHeight: 1.45,
          }}>
            {current.body}
          </div>
        </div>

        {/* Step counter + buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ color: 'var(--ink-faint)', fontSize: 12, fontFamily: 'var(--font-ui)' }}>
            {step + 1} / {STEPS.length}
          </span>
          <button
            onClick={dismiss}
            style={{
              background: 'none', border: 'none', color: 'var(--ink-faint)',
              cursor: 'pointer', fontSize: 13, padding: '6px 10px',
              fontFamily: 'var(--font-ui)', borderRadius: 6,
            }}
          >
            Skip
          </button>
          <button
            onClick={next}
            className="btn btn-gold"
            style={{ fontSize: 13, padding: '6px 18px' }}
          >
            {step + 1 < STEPS.length ? 'Next →' : 'Got it ✓'}
          </button>
        </div>
      </div>
    </>
  )
}
