import { useEffect, useState } from 'react'
import type { Locale } from '../i18n'
import { FALLBACK_LOCALE } from '../i18n'
import {
  type DocEntry,
  docMarkdownUrl,
  loadManifest,
  resolveDocLocale,
} from './manifest'

interface MarkdownState {
  status: 'loading' | 'ready' | 'error'
  text: string
  entry: DocEntry | null
  /** The locale actually rendered (may differ from requested → fallback). */
  resolvedLocale: Locale
  usedFallback: boolean
  /** Static URL of the raw .md, for the download button. */
  downloadUrl: string
}

const initial: MarkdownState = {
  status: 'loading',
  text: '',
  entry: null,
  resolvedLocale: FALLBACK_LOCALE,
  usedFallback: false,
  downloadUrl: '',
}

/**
 * Loads a manual on demand: resolves the entry from the manifest, fetches the
 * raw markdown for the active locale, and transparently falls back to en-US
 * when the localized file is missing (R4). Nothing is bundled — each doc is a
 * static asset fetched at runtime (R2), which is also what makes the raw `.md`
 * downloadable by bots (R5).
 */
export function useMarkdown(slug: string, locale: Locale): MarkdownState {
  const [state, setState] = useState<MarkdownState>(initial)

  useEffect(() => {
    let cancelled = false
    setState(initial)

    async function run() {
      const { docs } = await loadManifest()
      const entry = docs.find((d) => d.slug === slug)
      if (!entry) throw new Error(`Unknown doc: ${slug}`)

      const requested = resolveDocLocale(entry, locale)
      let resolved = requested
      let res = await fetch(docMarkdownUrl(slug, requested))

      // Defensive double-fallback: even if the manifest claims the locale,
      // honour en-US if the file is actually missing.
      if (!res.ok && requested !== FALLBACK_LOCALE) {
        resolved = FALLBACK_LOCALE
        res = await fetch(docMarkdownUrl(slug, FALLBACK_LOCALE))
      }
      if (!res.ok) throw new Error(`Failed to load ${slug} (${res.status})`)

      const text = await res.text()
      if (cancelled) return
      setState({
        status: 'ready',
        text,
        entry,
        resolvedLocale: resolved,
        usedFallback: resolved !== locale,
        downloadUrl: docMarkdownUrl(slug, resolved),
      })
    }

    run().catch(() => {
      if (!cancelled) setState((s) => ({ ...s, status: 'error' }))
    })

    return () => {
      cancelled = true
    }
  }, [slug, locale])

  return state
}
