export type NotationCell = {
  swara: string
  sahitya: string
  sangati?: boolean
}

export type NotationRow = {
  type: 'notation'
  cells: NotationCell[]
  sangathiNumber?: number // 1 = first version, 2+ = variations
}

export type HeadingRow = {
  type: 'heading'
  label: string
}

export type CompositionRow = NotationRow | HeadingRow

export type CompositionMeta = {
  name: string
  ragam: string
  composer: string
  talaBase: string
  jathi: string
  kalai: 1 | 2
  maatras: number
  // Raga overview
  melakarta?: string
  arohanam?: string
  avarohanam?: string
  isJanya?: boolean
  janyaParent?: string
}

export type CompositionState = {
  meta: CompositionMeta
  rows: CompositionRow[]
  cloudId: string | null
  isPublic?: boolean
  shareId?: string
}

export type CloudComposition = {
  id: string
  uid: string
  name: string
  ragam?: string
  composer?: string
  talaBase?: string
  jathi?: string
  kalai?: number
  maatras?: number
  avartanamCount?: number
  rows?: CompositionRow[]
  folder?: string | null
  isPublic?: boolean
  shareId?: string
  updatedAt?: { toDate?: () => Date } | null
  createdAt?: { toDate?: () => Date } | null
}

export type BeatMarker = {
  symbol: string
  symbolClass: 'X' | 'V' | 'num'
  isAngaStart: boolean
}
