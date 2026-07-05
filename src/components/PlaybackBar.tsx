'use client'

import { useState, useRef } from 'react'
import { useComposition } from '@/context/CompositionContext'
import { getCellCount, TalaBase, Jathi } from '@/lib/tala'

type Props = {
  onPlaybackCell: (cell: { rowIndex: number; cellIndex: number } | null) => void
}

export default function PlaybackBar({ onPlaybackCell }: Props) {
  const { state } = useComposition()
  const [bpm, setBpm] = useState(60)
  const [isPlaying, setIsPlaying] = useState(false)
  const [status, setStatus] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const posRef = useRef({ notPos: 0, c: 0 })

  function getNotationRowIndices() {
    return state.rows.map((r, i) => (r.type === 'notation' ? i : -1)).filter((i) => i >= 0)
  }

  function getCells() {
    const { talaBase, jathi, kalai, maatras } = state.meta
    return getCellCount(talaBase as TalaBase, jathi as Jathi, kalai, maatras)
  }

  function stopPlayback() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    onPlaybackCell(null)
    setIsPlaying(false)
    setStatus('')
    posRef.current = { notPos: 0, c: 0 }
  }

  function togglePlay() {
    if (isPlaying) {
      // Pause
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      onPlaybackCell(null)
      setIsPlaying(false)
      setStatus('')
      return
    }

    // Start playing
    const ms = (60000 / bpm) / state.meta.maatras
    posRef.current = { notPos: 0, c: 0 }
    setIsPlaying(true)

    intervalRef.current = setInterval(() => {
      const notRi = getNotationRowIndices()
      const cells = getCells()
      if (!notRi.length) return

      const rowIndex = notRi[posRef.current.notPos % notRi.length]
      const cellIndex = posRef.current.c

      onPlaybackCell({ rowIndex, cellIndex })
      setStatus(`Av ${posRef.current.notPos + 1}, cell ${posRef.current.c + 1}`)

      // Scroll cell into view
      const selector = `[data-row-index="${rowIndex}"][data-cell="${cellIndex}"][data-type="swara"]`
      document.querySelector(selector)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })

      posRef.current.c++
      if (posRef.current.c >= cells) {
        posRef.current.c = 0
        posRef.current.notPos = (posRef.current.notPos + 1) % notRi.length
      }
    }, ms)
  }

  return (
    <div
      className="no-print"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 18px',
        background: 'linear-gradient(135deg, var(--parchment-dark), var(--parchment))',
        border: '1.5px solid rgba(201,151,58,0.3)',
        borderRadius: 8,
        marginBottom: 18,
        flexWrap: 'wrap',
      }}
    >
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--burgundy)',
        }}
      >
        BPM
      </label>
      <input
        type="number"
        min={20}
        max={300}
        value={bpm}
        onChange={(e) => setBpm(parseInt(e.target.value) || 60)}
        style={{
          width: 64,
          padding: '4px 8px',
          background: 'var(--parchment)',
          border: '1.5px solid rgba(107,30,46,0.25)',
          borderRadius: 4,
          fontFamily: 'var(--font-serif)',
          fontSize: 14,
          color: 'var(--ink)',
          textAlign: 'center',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--gold)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(107,30,46,0.25)'
        }}
      />
      <button
        onClick={togglePlay}
        style={{
          padding: '5px 16px',
          borderRadius: 4,
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          border: '1.5px solid',
          letterSpacing: '0.04em',
          transition: 'all 0.15s',
          background: 'var(--burgundy)',
          borderColor: 'var(--burgundy)',
          color: 'var(--parchment)',
        }}
      >
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>
      <button
        onClick={stopPlayback}
        style={{
          padding: '5px 16px',
          borderRadius: 4,
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          border: '1.5px solid var(--gold)',
          color: 'var(--gold)',
          background: 'transparent',
          letterSpacing: '0.04em',
          transition: 'all 0.15s',
        }}
      >
        ■ Stop
      </button>
      {status && (
        <span
          style={{
            fontSize: 12,
            color: 'var(--ink-faint)',
            fontStyle: 'italic',
          }}
        >
          {status}
        </span>
      )}
    </div>
  )
}
