// Strip undefined values from an object recursively before sending to Firestore.
// Firestore rejects undefined; use null or omit the key instead.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    if (val === undefined) continue
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && typeof (val as Record<string, unknown>).toMillis !== 'function') {
      result[key] = stripUndefined(val as Record<string, unknown>)
    } else if (Array.isArray(val)) {
      result[key] = val.map((item) =>
        item !== null && typeof item === 'object' ? stripUndefined(item) : item
      )
    } else {
      result[key] = val
    }
  }
  return result as T
}
