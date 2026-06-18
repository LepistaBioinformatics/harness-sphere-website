import { useEffect, useState } from 'react'
import { type DocEntry, loadManifest, sortedByOrder } from './manifest'

export function useManifest() {
  const [docs, setDocs] = useState<DocEntry[] | null>(null)

  useEffect(() => {
    let cancelled = false
    loadManifest()
      .then((m) => {
        if (!cancelled) setDocs(sortedByOrder(m.docs))
      })
      .catch(() => {
        if (!cancelled) setDocs([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return docs
}
