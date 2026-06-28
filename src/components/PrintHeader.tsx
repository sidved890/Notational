'use client'

import { useComposition } from '@/context/CompositionContext'

/**
 * Hidden on screen, shown only when printing. Rendered OUTSIDE the
 * `no-print` metadata panel so it survives the print stylesheet, which
 * removes any `no-print` subtree entirely.
 */
export default function PrintHeader() {
  const { meta } = useComposition().state

  const subtitle = [meta.ragam, getTalaDisplay(meta), meta.composer].filter(Boolean).join('  ·  ')
  const hasRagaInfo = !!(meta.melakarta || (meta.isJanya && meta.janyaParent) || meta.arohanam || meta.avarohanam)

  return (
    <div className="print-header" style={{ display: 'none' }}>
      <div className="print-title">{meta.name || 'Untitled'}</div>
      {subtitle && <div className="print-subtitle">{subtitle}</div>}
      {hasRagaInfo && (
        <div className="print-raga-info">
          {meta.melakarta && <span><em>Melakarta:</em> {meta.melakarta} · </span>}
          {meta.isJanya && meta.janyaParent && <span><em>Janya of:</em> {meta.janyaParent} · </span>}
          {meta.arohanam && <span><em>Ā:</em> {meta.arohanam} · </span>}
          {meta.avarohanam && <span><em>Av:</em> {meta.avarohanam}</span>}
        </div>
      )}
    </div>
  )
}

function getTalaDisplay(meta: { talaBase?: string; jathi?: string; kalai?: number }) {
  const { talaBase = '', jathi = '', kalai = 1 } = meta
  if (!talaBase) return ''
  const names: Record<string, string> = {
    triputa: 'Triputa', rupaka: 'Rupaka', dhruva: 'Dhruva',
    matya: 'Matya', eka: 'Eka', jhampa: 'Jhampa', ata: 'Ata',
    misra_chapu: 'Misra Chapu', khanda_chapu: 'Khanda Chapu', rupaka_traditional: 'Rupaka (Trad.)',
  }
  const jathiNames: Record<string, string> = {
    tisra: 'Tisra', chaturasra: 'Chatusra', khanda: 'Khanda', misra: 'Misra', sankeerna: 'Sankeerna',
  }
  const talaPart = ['misra_chapu', 'khanda_chapu', 'rupaka_traditional'].includes(talaBase)
    ? (names[talaBase] || talaBase)
    : `${jathiNames[jathi] || jathi} Jathi ${names[talaBase] || talaBase}`
  return kalai === 2 ? `${talaPart} (2 Kalai)` : talaPart
}
