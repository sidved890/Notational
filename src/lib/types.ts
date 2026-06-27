export type NotationCell = {
  swara: string
  sahitya: string
  sangati?: boolean
}

export type NotationRow = {
  type: 'notation'
  cells: NotationCell[]
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
}

export type CompositionState = {
  meta: CompositionMeta
  rows: CompositionRow[]
  cloudId: string | null
}

export type CloudComposition = {
  id: string
  name: string
  ragam?: string
  composer?: string
  talaBase?: string
  jathi?: string
  kalai?: number
  maatras?: number
  avartanamCount?: number
  rows?: CompositionRow[]
  updatedAt?: { toDate?: () => Date } | null
}

export type BeatMarker = {
  symbol: string
  symbolClass: 'X' | 'V' | 'num'
  isAngaStart: boolean
}
