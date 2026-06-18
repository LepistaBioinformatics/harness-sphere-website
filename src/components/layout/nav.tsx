import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GitHubIcon, Wordmark } from '../brand-mark'
import { LanguageSwitcher } from './language-switcher'
import { buttonVariants } from '../ui/button'
import { Container } from '../ui/container'
import { GITHUB_URL } from '../../lib/constants'
import { cn } from '../../lib/cn'

export function Nav() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors duration-300',
        scrolled && 'border-b border-white/10 bg-brand-975/80 backdrop-blur-xl',
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="HarnessSphere home">
          <Wordmark />
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-3">
          <NavLink
            to="/docs"
            className={({ isActive }) =>
              cn(
                'hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:block',
                isActive ? 'text-white' : 'text-brand-200/80 hover:text-white',
              )
            }
          >
            {t('nav.docs')}
          </NavLink>

          <LanguageSwitcher />

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
          >
            <GitHubIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t('nav.github')}</span>
          </a>
        </nav>
      </Container>
    </header>
  )
}
