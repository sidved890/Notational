/** Reverse a space-separated swara scale (arohanam → avarohanam for melakarta ragas). */
export function reverseScale(scale: string): string {
  return scale.trim().split(/\s+/).filter(Boolean).reverse().join(' ')
}
