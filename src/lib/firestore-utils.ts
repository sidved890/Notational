// Only recurse into "plain" objects ({...} / Object.create(null)). Class
// instances such as Firestore FieldValue sentinels (serverTimestamp()),
// Timestamp, and Date must be passed through untouched — recursing into them
// strips their prototype and corrupts the value Firestore receives.
function isPlainObject(val: unknown): val is Record<string, unknown> {
  if (val === null || typeof val !== 'object' || Array.isArray(val)) return false
  const proto = Object.getPrototypeOf(val)
  return proto === Object.prototype || proto === null
}

// Strip undefined values from an object recursively before sending to Firestore.
// Firestore rejects undefined; use null or omit the key instead.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    if (val === undefined) continue
    if (Array.isArray(val)) {
      result[key] = val.map((item) => (isPlainObject(item) ? stripUndefined(item) : item))
    } else if (isPlainObject(val)) {
      result[key] = stripUndefined(val)
    } else {
      result[key] = val
    }
  }
  return result as T
}
