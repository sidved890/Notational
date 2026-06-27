'use client'

import { useRef, useCallback, useState } from 'react'
import { useComposition } from '@/context/CompositionContext'
import { getTalaPattern, getCellCount, TalaBase, Jathi } from '@/lib/tala'
import NotationCell from './NotationCell'
import SectionHeading from './SectionHeading'

const SECTION_PRESETS = ['Pallavi', 'Anupallavi', 'Charanam', 'Chittaswaram', 'Madhyamakala Sahityam', 'Swarajati']

type Props = {
  zoom: number
  playbackCell: { rowIndex: number; cellIndex: number } | null
}

export default function NotationGrid({ zoom, playbackCell }: Props) {
  const { state, dispatch } = useComposition()
  const { rows, meta } = state
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [hoveredInsert, setHoveredInsert] = useState<number | null>(null)

  const talaBase = meta.talaBase as TalaBase
  const jathi = meta.jathi as Jathi
  const pattern = getTalaPattern(talaBase, jathi, meta.kalai)
  const cellCount = getCellCount(talaBase, jathi, meta.kalai, meta.maatras)

  const notationRowIndices = rows.map((r, i) => (r.type === 'notation' ? i : -1)).filter((i) => i >= 0)

  function focusCell(rowIndex: number, cellIndex: number, type: 'swara' | 'sahitya') {
    const el = document.querySelector<HTMLInputElement>(`[data-row-index="${rowIndex}"][data-cell="${cellIndex}"][data-type="${type}"]`)
    if (el) { el.focus(); if (type === 'swara') el.setSelectionRange(el.value.length, el.value.length) }
  }

  const handleNavigate = useCallback((rowIndex: number, cellIndex: number, direction: 'left' | 'right' | 'up' | 'down' | 'swara' | 'sahitya' | 'prevSwara') => {
    const curNotPos = notationRowIndices.indexOf(rowIndex)
    switch (direction) {
      case 'sahitya': focusCell(rowIndex, cellIndex, 'sahitya'); break
      case 'swara': focusCell(rowIndex, cellIndex, 'swara'); break
      case 'right': {
        let nc = cellIndex + 1, nr = rowIndex
        if (nc >= cellCount) {
          const np = curNotPos + 1
          if (np >= notationRowIndices.length) return
          nr = notationRowIndices[np]; nc = 0
        }
        focusCell(nr, nc, 'swara'); break
      }
      case 'left': {
        let nc = cellIndex - 1, nr = rowIndex
        if (nc < 0) {
          const np = curNotPos - 1
          if (np < 0) return
          nr = notationRowIndices[np]; nc = cellCount - 1
        }
        focusCell(nr, nc, 'swara'); break
      }
      case 'prevSwara': {
        let nc = cellIndex - 1, nr = rowIndex
        if (nc < 0) {
          const np = curNotPos - 1
          if (np < 0) return
          nr = notationRowIndices[np]; nc = cellCount - 1
        }
        focusCell(nr, nc, 'sahitya'); break
      }
      case 'down': {
        const np = curNotPos + 1
        if (np >= notationRowIndices.length) return
        focusCell(notationRowIndices[np], Math.min(cellIndex, cellCount - 1), 'swara'); break
      }
      case 'up': {
        const np = curNotPos - 1
        if (np < 0) return
        focusCell(notationRowIndices[np], Math.min(cellIndex, cellCount - 1), 'swara'); break
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notationRowIndices, cellCount])

  function addRow() {
    dispatch({ type: 'ADD_ROW' })
    setTimeout(() => {
      const containers = document.querySelectorAll('.avartanam-container')
      containers[containers.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  function addHeading() {
    dispatch({ type: 'ADD_HEADING' })
    setTimeout(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>('.heading-label-input')
      inputs[inputs.length - 1]?.focus()
    }, 50)
  }

  function insertWithPreset(rowIndex: number, label: string) {
    dispatch({ type: 'INSERT_HEADING_BEFORE', rowIndex })
    if (label) {
      // Update heading label after insert — heading will be at rowIndex
      setTimeout(() => dispatch({ type: 'UPDATE_HEADING', rowIndex, label }), 10)
    }
    setHoveredInsert(null)
  }

  let notNum = 0

  return (
    <div ref={wrapperRef} className="grid-wrapper" style={{
      background: 'var(--parchment-dark)', border: '1.5px solid rgba(201,151,58,0.4)',
      borderRadius: 8, boxShadow: '0 2px 12px var(--shadow)', overflow: 'hidden',
    }}>
      <div className="grid-zoom-inner" style={{
        transform: `scale(${zoom})`, transformOrigin: 'top left',
        transition: 'transform 0.2s ease', width: zoom < 1 ? `${100 / zoom}%` : '100%',
      }}>
        {rows.map((row, rowIndex) => {
          if (row.type === 'heading') {
            return (
              <SectionHeading key={`h-${rowIndex}`} rowIndex={rowIndex} label={row.label} />
            )
          }

          notNum++
          const avNum = notNum
          const sangathiNum = row.sangathiNumber
          const isFirst = rowIndex === 0 || rows[rowIndex - 1]?.type === 'heading'

          return (
            <div key={`n-${rowIndex}`} className="avartanam-container" data-row-index={rowIndex} style={{ borderBottom: '1.5px solid rgba(201,151,58,0.25)', position: 'relative' }}>

              {/* Insert-between strip (hover target above this row) */}
              <div
                style={{ height: 4, cursor: 'pointer', position: 'relative', zIndex: 10 }}
                onMouseEnter={() => setHoveredInsert(rowIndex)}
                onMouseLeave={() => setHoveredInsert(null)}
              >
                {hoveredInsert === rowIndex && (
                  <div style={{
                    position: 'absolute', top: -2, left: 0, right: 0, zIndex: 20,
                    background: 'var(--parchment)', border: '1.5px solid var(--gold)',
                    borderRadius: 6, padding: '4px 8px',
                    display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',
                    boxShadow: '0 2px 8px var(--shadow)',
                  }}>
                    <span style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.06em', marginRight: 4 }}>INSERT</span>
                    {SECTION_PRESETS.map((p) => (
                      <button key={p} onClick={() => insertWithPreset(rowIndex, p)} style={{
                        padding: '2px 8px', borderRadius: 12, border: '1.5px solid rgba(107,30,46,0.25)',
                        background: 'transparent', color: 'var(--burgundy)', fontSize: 11,
                        fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)',
                      }}>{p}</button>
                    ))}
                    <button onClick={() => insertWithPreset(rowIndex, '')} style={{
                      padding: '2px 8px', borderRadius: 12, border: '1.5px solid rgba(201,151,58,0.4)',
                      background: 'transparent', color: 'var(--gold)', fontSize: 11,
                      fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)',
                    }}>Custom…</button>
                    <button onClick={() => { dispatch({ type: 'INSERT_ROW_AFTER', rowIndex: rowIndex - 1 }); setHoveredInsert(null) }} style={{
                      padding: '2px 8px', borderRadius: 12, border: '1.5px solid rgba(107,30,46,0.25)',
                      background: 'transparent', color: 'var(--ink-light)', fontSize: 11,
                      fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)',
                    }}>+ Avartanam</button>
                  </div>
                )}
              </div>

              {/* Beat header */}
              <div style={{ display: 'flex', alignItems: 'stretch', background: 'linear-gradient(to bottom, rgba(107,30,46,0.07), transparent)', borderBottom: '1px solid rgba(107,30,46,0.12)' }}>
                <div style={{ width: 60, minWidth: 60, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '2px solid var(--anga-divider)', gap: 2, flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--burgundy)', opacity: 0.55, letterSpacing: '0.05em' }}>AV {avNum}</span>
                  {sangathiNum && sangathiNum > 0 && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.05em', background: 'rgba(201,151,58,0.15)', borderRadius: 8, padding: '0 4px' }}>
                      S{sangathiNum}
                    </span>
                  )}
                </div>
                {pattern.map((slot, bi) => (
                  <div key={bi} style={{ flex: 1, display: 'flex', flexDirection: 'column', borderLeft: slot.isAngaStart ? (bi === 0 ? 'none' : '2.5px solid var(--anga-divider)') : '1px solid var(--beat-divider)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3px 2px' }}>
                      <span className={`beat-sym beat-sym-${slot.symbolClass}`} style={{ fontSize: 10, lineHeight: 1, fontFamily: 'var(--font-serif)', fontWeight: 800 }}>{slot.symbol}</span>
                    </div>
                    <div style={{ height: 0 }} />
                  </div>
                ))}

                {/* Row actions */}
                <div className="row-actions" style={{ display: 'none', alignItems: 'center', gap: 2, padding: '0 4px', flexShrink: 0 }}>
                  <button onClick={() => dispatch({ type: 'MOVE_ROW', rowIndex, direction: 'up' })} disabled={rowIndex === 0} title="Move up" style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer', fontSize: 12, padding: '2px', lineHeight: 1 }}>▲</button>
                  <button onClick={() => dispatch({ type: 'MOVE_ROW', rowIndex, direction: 'down' })} disabled={rowIndex === rows.length - 1} title="Move down" style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer', fontSize: 12, padding: '2px', lineHeight: 1 }}>▼</button>
                  <SangathiPicker rowIndex={rowIndex} current={sangathiNum} />
                  <button onClick={() => { if (rows.filter(r => r.type === 'notation').length > 1 && confirm('Delete this avartanam?')) dispatch({ type: 'DELETE_ROW', rowIndex }) }} title="Delete" style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer', fontSize: 14, padding: '2px', lineHeight: 1 }}>×</button>
                </div>
              </div>

              {/* Notation row */}
              <div style={{ display: 'flex', alignItems: 'stretch', background: sangathiNum && sangathiNum > 1 ? 'rgba(201,151,58,0.04)' : undefined }}>
                <div style={{ width: 60, minWidth: 60, flexShrink: 0, borderRight: '2px solid var(--anga-divider)', borderLeft: sangathiNum && sangathiNum > 1 ? '3px solid rgba(201,151,58,0.4)' : '3px solid transparent' }} />
                {pattern.map((slot, bi) => (
                  <div key={bi} className={bi % 2 === 1 ? 'beat-group-alt' : ''} style={{
                    flex: 1, display: 'flex',
                    borderLeft: slot.isAngaStart ? (bi === 0 ? 'none' : '2.5px solid var(--anga-divider)') : '1px solid var(--beat-divider)',
                  }}>
                    {Array.from({ length: meta.maatras }, (_, m) => {
                      const cellIndex = bi * meta.maatras + m
                      const cellData = row.cells[cellIndex] || { swara: '', sahitya: '' }
                      return (
                        <NotationCell
                          key={cellIndex}
                          rowIndex={rowIndex}
                          cellIndex={cellIndex}
                          swara={cellData.swara}
                          sahitya={cellData.sahitya}
                          sangati={cellData.sangati}
                          isPlaybackHl={playbackCell?.rowIndex === rowIndex && playbackCell?.cellIndex === cellIndex}
                          onNavigate={handleNavigate}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Bottom add buttons */}
        <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, borderTop: '1px dashed rgba(201,151,58,0.35)', flexWrap: 'wrap' }}>
          <button onClick={addRow} className="btn-add-row">+ Add Avartanam</button>
          <span style={{ color: 'var(--ink-faint)', fontSize: 12 }}>·</span>
          <button onClick={addHeading} className="btn-add-row">§ Add Section Heading</button>
        </div>
      </div>

      <style>{`
        .avartanam-container:hover .row-actions { display: flex !important; }
        .avartanam-container:last-of-type { border-bottom: none !important; }
        .btn-add-row { background: transparent; border: none; color: var(--gold); font-family: var(--font-ui); font-size: 13px; font-weight: 600; cursor: pointer; padding: 5px 16px; border-radius: 4px; transition: background 0.15s; letter-spacing: 0.04em; }
        .btn-add-row:hover { background: var(--gold-faint); }
      `}</style>
    </div>
  )
}

function SangathiPicker({ rowIndex, current }: { rowIndex: number; current?: number }) {
  const { dispatch } = useComposition()
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)} title="Set Sangathi number" style={{
        background: current ? 'rgba(201,151,58,0.2)' : 'none', border: current ? '1px solid var(--gold)' : 'none',
        color: current ? 'var(--gold)' : 'var(--ink-faint)', cursor: 'pointer',
        fontSize: 10, padding: '1px 4px', borderRadius: 3, lineHeight: 1.4, fontWeight: 700,
      }}>
        {current ? `S${current}` : 'S#'}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 50,
          background: 'var(--parchment)', border: '1.5px solid var(--gold)',
          borderRadius: 6, padding: 6, boxShadow: '0 4px 12px var(--shadow)',
          display: 'flex', flexDirection: 'column', gap: 2, minWidth: 80,
        }}>
          <div style={{ fontSize: 9, color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Sangathi</div>
          {[undefined, 1, 2, 3, 4, 5].map((n) => (
            <button key={n ?? 'none'} onClick={() => { dispatch({ type: 'SET_SANGATHI', rowIndex, sangathiNumber: n }); setOpen(false) }} style={{
              padding: '3px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
              background: current === n ? 'var(--burgundy)' : 'transparent',
              color: current === n ? 'var(--parchment)' : 'var(--ink)', fontSize: 12,
              fontWeight: 600, textAlign: 'left', fontFamily: 'var(--font-ui)',
            }}>
              {n === undefined ? 'None' : `Sangathi ${n}`}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
