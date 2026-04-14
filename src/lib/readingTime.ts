/**
 * Locale-aware reading time estimator.
 *
 * Words-per-minute baselines:
 *   de  — 200 wpm (German readers average slightly slower than EN/ES)
 *   en  — 225 wpm
 *   es  — 225 wpm
 *
 * Returns the ceiling of (word count / wpm), minimum 1 minute.
 */

/**
 * Estimate reading time in minutes for a Portable Text body.
 *
 * @param body   - The portable text array from a Sanity post's body field.
 * @param locale - Locale code ('de' | 'en' | 'es') — determines words-per-minute.
 * @returns Estimated reading time in whole minutes (min. 1).
 */
export function readingTime(body: unknown[], locale: 'de' | 'en' | 'es'): number {
  const wpm = locale === 'de' ? 200 : 225
  const text =
    body
      ?.filter((b: any) => b._type === 'block')
      .flatMap((b: any) => b.children?.map((s: any) => s.text ?? '') ?? [])
      .join(' ') ?? ''
  return Math.max(1, Math.ceil(text.split(/\s+/).length / wpm))
}
