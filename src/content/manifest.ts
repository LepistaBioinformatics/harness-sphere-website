import type { Locale } from '../i18n'
import { FALLBACK_LOCALE } from '../i18n'

export type DocCategory = 'basics' | 'configuration' | 'integration' | 'reference'

export interface DocEntry {
  slug: string
  category: DocCategory
  order: number
  title: Record<Locale, string>
  /** Locales for which a markdown file actually exists. */
  locales: Locale[]
}

export interface Manifest {
  docs: DocEntry[]
}

const base = import.meta.env.BASE_URL

let manifestPromise: Promise<Manifest> | null = null

/** Fetched once and cached. The manifest is the source of truth for which
 *  docs exist and in which locales. */
export function loadManifest(): Promise<Manifest> {
  if (!manifestPromise) {
    manifestPromise = fetch(`${base}content/manifest.json`).then((res) => {
      if (!res.ok) throw new Error(`Failed to load manifest (${res.status})`)
      return res.json() as Promise<Manifest>
    })
  }
  return manifestPromise
}

/** Pick the locale to load: the requested one if available, else the fallback. */
export function resolveDocLocale(entry: DocEntry, locale: Locale): Locale {
  return entry.locales.includes(locale) ? locale : FALLBACK_LOCALE
}

/** Public, static URL of a raw markdown file — also the download/bot URL. */
export function docMarkdownUrl(slug: string, locale: Locale): string {
  return `${base}content/${locale}/${slug}.md`
}

export function sortedByOrder(docs: DocEntry[]): DocEntry[] {
  return [...docs].sort((a, b) => a.order - b.order)
}
