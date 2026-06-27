'use client'

import { useRef, useCallback, useState } from 'react'
import { useComposition } from '@/context/CompositionContext'
import { getTalaPattern, getBeatCount, getCellCount, TalaBase, Jathi } from '@/lib/tala'
import NotationCell from './NotationCell'
import SectionHeading from './SectionHeading'

type Props = {
  zoom: number
  playbackCell: { rowIndex: number; cellIndex: number } | null
}

export default function NotationGrid({ zoom, playbackCell }: Props) {
  const { state, dispatch } = useComposition()
  const { rows, meta } = state
  const wrapperRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const talaBase = meta.talaBase as TalaBase
  const jathi = meta.jathi as Jathi
  const kalai = meta.kalai
  const maatras = meta.maatras

  const pattern = getTalaPattern(talaBase, jathi, kalai)
  const beatCount = pattern.length
  const cellCount = beatCount * maatras

  // Get indices of notation rows only (for navigation)
  const notationRowIndices = rows
    .map((r, i) => (r.type === 'notation' ? i : -1))
    .filter((i) => i >= 0)

  // Focus helper
  function focusCell(rowIndex: number, cellIndex: number, type: 'swara' | 'sahitya') {
    const selector = `[data-row-index="${rowIndex}"][data-cell="${cellIndex}"][data-type="${type}"]`
    const el = document.querySelector<HTMLInputElement>(selector)
    if (el) {
      el.focus()
      if (type === 'swara') el.setSelectionRange(el.value.length, el.value.length)
    }
  }

  const handleNavigate = useCallback(
    (
      rowIndex: number,
      cellIndex: number,
      direction: 'left' | 'right' | 'up' | 'down' | 'swara' | 'sahitya' | 'prevSwara'
    ) => {
      const curNotPos = notationRowIndices.indexOf(rowIndex)

      switch (direction) {
        case 'sahitya':
          focusCell(rowIndex, cellIndex, 'sahitya')
          break
        case 'swara':
          focusCell(rowIndex, cellIndex, 'swara')
          break
        case 'right': {
          let nextCell = cellIndex + 1
          let nextRow = rowIndex
          if (nextCell >= cellCount) {
            const nextNotPos = curNotPos + 1
            if (nextNotPos >= notationRowIndices.length) return
            nextRow = notationRowIndices[nextNotPos]
            nextCell = 0
          }
          focusCell(nextRow, nextCell, 'swara')
          break
        }
        case 'left': {
          let prevCell = cellIndex - 1
          let prevRow = rowIndex
          if (prevCell < 0) {
            const prevNotPos = curNotPos - 1
            if (prevNotPos < 0) return
            prevRow = notationRowIndices[prevNotPos]
            prevCell = cellCount - 1
          }
          focusCell(prevRow, prevCell, 'swara')
          break
        }
        case 'prevSwara': {
          // Shift+Tab from swara: go to previous sahitya
          let prevCell = cellIndex - 1
          let prevRow = rowIndex
          if (prevCell < 0) {
            const prevNotPos = curNotPos - 1
            if (prevNotPos < 0) return
            prevRow = notationRowIndices[prevNotPos]
            prevCell = cellCount - 1
          }
          focusCell(prevRow, prevCell, 'sahitya')
          break
        }
        case 'down': {
          const nextNotPos = curNotPos + 1
          if (nextNotPos >= notationRowIndices.length) return
          const targetRow = notationRowIndices[nextNotPos]
          const c = Math.min(cellIndex, cellCount - 1)
          focusCell(targetRow, c, 'swara')
          break
        }
        case 'up': {
          const prevNotPos = curNotPos - 1
          if (prevNotPos < 0) return
          const targetRow = notationRowIndices[prevNotPos]
          const c = Math.min(cellIndex, cellCount - 1)
          focusCell(targetRow, c, 'swara')
          break
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notationRowIndices, cellCount]
  )

  function addAvartanam() {
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

  function insertHeadingBefore(rowIndex: number) {
    dispatch({ type: 'INSERT_HEADING_BEFORE', rowIndex })
    setTimeout(() => {
      const selector = `[data-row-index="${rowIndex}"] .heading-label-input`
      const input = document.querySelector<HTMLInputElement>(selector)
      input?.focus()
    }, 50)
  }

  let notNum = 0

  return (
    <div
      ref={wrapperRef}
      style={{
        background: 'var(--parchment-dark)',
        border: '1.5px solid rgba(201,151,58,0.4)',
        borderRadius: 8,
        boxShadow: '0 2px 12px var(--shadow)',
        overflow: 'hidden',
        position: 'relative',
      }}
      className="grid-wrapper"
    >
      <div
        ref={innerRef}
        className="grid-zoom-inner"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          transition: 'transform 0.2s ease',
          width: zoom < 1 ? `${100 / zoom}%` : '100%',
        }}
      >
        {rows.map((row, rowIndex) => {
          if (row.type === 'heading') {
            return (
              <SectionHeading
                key={`heading-${rowIndex}`}
                rowIndex={rowIndex}
                label={row.label}
              />
            )
          }

          notNum++
          const avNum = notNum

          return (
            <div
              key={`notation-${rowIndex}`}
              className="avartanam-container"
              data-row-index={rowIndex}
              style={{
                borderBottom: '1.5px solid rgba(201,151,58,0.25)',
              }}
            >
              {/* Beat header row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  background: 'linear-gradient(to bottom, rgba(107,30,46,0.07), transparent)',
                  borderBottom: '1px solid rgba(107,30,46,0.12)',
                }}
              >
                {/* AV label cell */}
                <div
                  style={{
                    width: 52,
                    minWidth: 52,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--burgundy)',
                    opacity: 0.55,
                    borderRight: '2px solid var(--anga-divider)',
                    position: 'relative',
                  }}
                >
                  <button
                    title="Insert section heading before this avartanam"
                    onClick={() => insertHeadingBefore(rowIndex)}
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--gold)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 3,
                      fontSize: 9,
                      padding: '1px 5px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      zIndex: 5,
                      lineHeight: 1.6,
                      display: 'none',
                    }}
                    className="av-insert-btn"
                  >
                    § heading
                  </button>
                  AV {avNum}
                </div>

                {/* Beat slots header */}
                {pattern.map((slot, beatIdx) => (
                  <div
                    key={beatIdx}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      borderLeft: slot.isAngaStart
                        ? beatIdx === 0
                          ? 'none'
                          : '2.5px solid var(--anga-divider)'
                        : '1px solid var(--beat-divider)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '3px 2px',
                        gap: 3,
                      }}
                    >
                      <span
                        className={`beat-sym beat-sym-${slot.symbolClass}`}
                        style={{
                          fontSize: 10,
                          letterSpacing: '0.04em',
                          lineHeight: 1,
                          fontFamily: 'var(--font-serif)',
                        }}
                      >
                        {slot.symbol}
                      </span>
                    </div>
                    {/* Spacer to match maatra row height */}
                    <div style={{ height: 0 }} />
                  </div>
                ))}
              </div>

              {/* Notation row */}
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                {/* AV label */}
                <div
                  style={{
                    width: 52,
                    minWidth: 52,
                    flexShrink: 0,
                    borderRight: '2px solid var(--anga-divider)',
                  }}
                />

                {/* Beat slots with cells */}
                {pattern.map((slot, beatIdx) => (
                  <div
                    key={beatIdx}
                    style={{
                      flex: 1,
                      display: 'flex',
                      borderLeft: slot.isAngaStart
                        ? beatIdx === 0
                          ? 'none'
                          : '2.5px solid var(--anga-divider)'
                        : '1px solid var(--beat-divider)',
                      background: beatIdx % 2 === 1 ? undefined : 'transparent',
                    }}
                    className={beatIdx % 2 === 1 ? 'beat-group-alt' : ''}
                  >
                    <div style={{ display: 'flex', flex: 1 }}>
                      {Array.from({ length: maatras }, (_, m) => {
                        const cellIndex = beatIdx * maatras + m
                        const cellData = row.cells[cellIndex] || { swara: '', sahitya: '' }
                        const isHl =
                          playbackCell?.rowIndex === rowIndex &&
                          playbackCell?.cellIndex === cellIndex

                        return (
                          <NotationCell
                            key={cellIndex}
                            rowIndex={rowIndex}
                            cellIndex={cellIndex}
                            swara={cellData.swara}
                            sahitya={cellData.sahitya}
                            sangati={cellData.sangati}
                            isPlaybackHl={isHl}
                            onNavigate={handleNavigate}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Add row buttons */}
        <div
          style={{
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            borderTop: '1px dashed rgba(201,151,58,0.35)',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={addAvartanam}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--gold)',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '5px 16px',
              borderRadius: 4,
              transition: 'background 0.15s',
              letterSpacing: '0.04em',
            }}
          >
            + Add Avartanam
          </button>
          <span style={{ color: 'var(--ink-faint)', fontSize: 12 }}>·</span>
          <button
            onClick={addHeading}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--gold)',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '5px 16px',
              borderRadius: 4,
              transition: 'background 0.15s',
              letterSpacing: '0.04em',
            }}
          >
            § Add Section Heading
          </button>
        </div>
      </div>

      <style>{`
        .avartanam-container:hover .av-insert-btn { display: block !important; }
        .avartanam-container:last-of-type { border-bottom: none; }
        .notation-cell:first-child { border-left: none; }
      `}</style>
    </div>
  )
}
