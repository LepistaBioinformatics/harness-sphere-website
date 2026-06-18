import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { buttonVariants } from '../ui/button'
import { cn } from '../../lib/cn'

/**
 * Links straight to the raw `.md` static asset with a `download` attribute —
 * no rendering, so it doubles as the bot/automation entry point (R5).
 */
export function DownloadButton({ url, filename }: { url: string; filename: string }) {
  const { t } = useTranslation()
  return (
    <a
      href={url}
      download={filename}
      className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
      title={t('docs.downloadHint')}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {t('docs.download')}
    </a>
  )
}
