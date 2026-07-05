/**
 * Full 35-Tala System (Suladi Sapta Talas)
 *
 * 7 base talas × 5 jathis = 35 talas
 * Plus special talas: Misra Chapu, Khanda Chapu, Traditional Rupaka
 *
 * Anga types:
 *   Laghu (L):        [X, 1, 2, ..., n-1]  where n = jathi count
 *   Dhrutham (D):     [X, V]
 *   Anudhrutham (U):  [X]
 *
 * Kalai 2 doubles every beat position.
 *
 * Firestore security rules needed:
 * allow read, write: if request.auth != null && request.auth.uid == resource.data.uid
 */

export type Jathi = 'tisra' | 'chaturasra' | 'khanda' | 'misra' | 'sankeerna'
export type TalaBase =
  | 'dhruva'
  | 'matya'
  | 'triputa'
  | 'rupaka'
  | 'eka'
  | 'jhampa'
  | 'ata'
  | 'misra_chapu'
  | 'khanda_chapu'
  | 'rupaka_traditional'

export const JATHI_COUNTS: Record<Jathi, number> = {
  tisra: 3,
  chaturasra: 4,
  khanda: 5,
  misra: 7,
  sankeerna: 9,
}

export const JATHI_LABELS: Record<Jathi, string> = {
  tisra: 'Tisra (3)',
  chaturasra: 'Chaturasra (4)',
  khanda: 'Khanda (5)',
  misra: 'Misra (7)',
  sankeerna: 'Sankeerna (9)',
}

// Anga type
type Anga = 'L' | 'D' | 'U'

const TALA_ANGAS: Record<string, Anga[]> = {
  dhruva: ['L', 'D', 'L', 'L'],
  matya: ['L', 'D', 'L'],
  triputa: ['L', 'D', 'D'],
  rupaka: ['D', 'L'],
  eka: ['L'],
  jhampa: ['L', 'U', 'D'],
  ata: ['L', 'L', 'D', 'D'],
}

export const TALA_BASE_LABELS: Record<TalaBase, string> = {
  dhruva: 'Dhruva',
  matya: 'Matya',
  triputa: 'Triputa',
  rupaka: 'Rupaka',
  eka: 'Eka',
  jhampa: 'Jhampa',
  ata: 'Ata',
  misra_chapu: 'Misra Chapu',
  khanda_chapu: 'Khanda Chapu',
  rupaka_traditional: 'Rupaka (Traditional)',
}

// Whether a tala base uses jathi or has fixed structure
export const IS_SPECIAL_TALA: Record<TalaBase, boolean> = {
  dhruva: false,
  matya: false,
  triputa: false,
  rupaka: false,
  eka: false,
  jhampa: false,
  ata: false,
  misra_chapu: true,
  khanda_chapu: true,
  rupaka_traditional: true,
}

// Generate anga symbol sequence for a Laghu of given jathi
function laghuBeats(n: number): string[] {
  if (n === 1) return ['X']
  return ['X', ...Array.from({ length: n - 1 }, (_, i) => String(i + 1))]
}

// Generate anga symbol sequence for Dhrutham
const dhruthamBeats: string[] = ['X', 'V']

// Generate anga symbol sequence for Anudhrutham
const anudhruthamBeats: string[] = ['X']

// Build the full pattern for one avartanam (without kalai doubling)
// Returns array of { symbol, isAngaStart }
export type BeatSlot = {
  symbol: string
  symbolClass: 'X' | 'V' | 'num'
  isAngaStart: boolean
}

function symbolClass(s: string): 'X' | 'V' | 'num' {
  if (s === 'X') return 'X'
  if (s === 'V') return 'V'
  return 'num'
}

function buildAngaSlots(angas: Anga[], jathiCount: number): BeatSlot[] {
  const slots: BeatSlot[] = []
  for (const anga of angas) {
    let beats: string[]
    if (anga === 'L') beats = laghuBeats(jathiCount)
    else if (anga === 'D') beats = dhruthamBeats
    else beats = anudhruthamBeats

    beats.forEach((sym, idx) => {
      slots.push({
        symbol: sym,
        symbolClass: symbolClass(sym),
        isAngaStart: idx === 0,
      })
    })
  }
  return slots
}

// Special tala patterns (fixed, not jathi-dependent)
const SPECIAL_PATTERNS: Record<string, BeatSlot[]> = {
  misra_chapu: [
    { symbol: 'X', symbolClass: 'X', isAngaStart: true },
    { symbol: '1', symbolClass: 'num', isAngaStart: false },
    { symbol: '2', symbolClass: 'num', isAngaStart: false },
    { symbol: 'X', symbolClass: 'X', isAngaStart: true },
    { symbol: 'V', symbolClass: 'V', isAngaStart: false },
    { symbol: 'X', symbolClass: 'X', isAngaStart: true },
    { symbol: 'V', symbolClass: 'V', isAngaStart: false },
  ],
  khanda_chapu: [
    { symbol: 'X', symbolClass: 'X', isAngaStart: true },
    { symbol: 'V', symbolClass: 'V', isAngaStart: false },
    { symbol: 'X', symbolClass: 'X', isAngaStart: true },
    { symbol: '1', symbolClass: 'num', isAngaStart: false },
    { symbol: '2', symbolClass: 'num', isAngaStart: false },
  ],
  rupaka_traditional: [
    { symbol: 'X', symbolClass: 'X', isAngaStart: true },
    { symbol: 'X', symbolClass: 'X', isAngaStart: true },
    { symbol: 'V', symbolClass: 'V', isAngaStart: false },
  ],
}

/**
 * Get the full beat pattern for an avartanam.
 * For kalai=2, each slot is doubled.
 */
export function getTalaPattern(
  talaBase: TalaBase,
  jathi: Jathi,
  kalai: 1 | 2
): BeatSlot[] {
  let baseSlots: BeatSlot[]

  if (IS_SPECIAL_TALA[talaBase]) {
    baseSlots = SPECIAL_PATTERNS[talaBase] || []
  } else {
    const angas = TALA_ANGAS[talaBase] || ['L']
    const jathiCount = JATHI_COUNTS[jathi]
    baseSlots = buildAngaSlots(angas, jathiCount)
  }

  if (kalai === 1) return baseSlots

  // Kalai 2: each beat position appears twice
  return baseSlots.flatMap((slot, i) => [
    slot,
    {
      symbol: slot.symbol,
      symbolClass: slot.symbolClass,
      isAngaStart: false, // second occurrence is not an anga start
    },
  ])
}

/**
 * Total number of beat slots per avartanam
 */
export function getBeatCount(talaBase: TalaBase, jathi: Jathi, kalai: 1 | 2): number {
  return getTalaPattern(talaBase, jathi, kalai).length
}

/**
 * Total number of notation cells per avartanam
 */
export function getCellCount(
  talaBase: TalaBase,
  jathi: Jathi,
  kalai: 1 | 2,
  maatras: number
): number {
  return getBeatCount(talaBase, jathi, kalai) * maatras
}

/**
 * Human-readable tala name
 */
export function getTalaName(talaBase: TalaBase, jathi: Jathi): string {
  if (IS_SPECIAL_TALA[talaBase]) {
    return TALA_BASE_LABELS[talaBase]
  }
  return `${JATHI_LABELS[jathi].split(' ')[0]} Jathi ${TALA_BASE_LABELS[talaBase]}`
}

/**
 * Common tala presets
 */
export type TalaPreset = {
  label: string
  talaBase: TalaBase
  jathi: Jathi
  beats: number
}

export const TALA_PRESETS: TalaPreset[] = [
  { label: 'Adi Tala (8)', talaBase: 'triputa', jathi: 'chaturasra', beats: 8 },
  { label: 'Rupaka (6)', talaBase: 'rupaka', jathi: 'chaturasra', beats: 6 },
  { label: 'Misra Chapu (7)', talaBase: 'misra_chapu', jathi: 'chaturasra', beats: 7 },
  { label: 'Khanda Chapu (5)', talaBase: 'khanda_chapu', jathi: 'chaturasra', beats: 5 },
  { label: 'Rupaka (Traditional, 3)', talaBase: 'rupaka_traditional', jathi: 'chaturasra', beats: 3 },
  { label: 'Tisra Eka (3)', talaBase: 'eka', jathi: 'tisra', beats: 3 },
  { label: 'Khanda Eka (5)', talaBase: 'eka', jathi: 'khanda', beats: 5 },
  { label: 'Misra Jhampa (10)', talaBase: 'jhampa', jathi: 'misra', beats: 10 },
]

export const BASE_TALAS: TalaBase[] = [
  'dhruva',
  'matya',
  'triputa',
  'rupaka',
  'eka',
  'jhampa',
  'ata',
  'misra_chapu',
  'khanda_chapu',
  'rupaka_traditional',
]

export const JATHIS: Jathi[] = ['tisra', 'chaturasra', 'khanda', 'misra', 'sankeerna']

export const SECTION_PRESETS = [
  'Pallavi',
  'Anupallavi',
  'Charanam',
  'Chittaswaram',
  'Madhyamakala Sahityam',
  'Swarajati',
  'Varnam',
  'Thillana',
]
