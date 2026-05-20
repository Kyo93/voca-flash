import { Link, Outlet, useLocation } from 'react-router-dom'
import { Suspense, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import PageLoader from '../PageLoader'

interface MobileNavItem {
  path: string
  match: (pathname: string) => boolean
  labelKey: string
  icon: string
  badge?: number
}

const FOCUS_ROUTE_PREFIXES = ['/study', '/review', '/free-study'] as const

function isFocusRoute(pathname: string) {
  return FOCUS_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

function getMobileTitle(pathname: string, t: (key: string) => string) {
  if (pathname === '/dashboard') return t('mobileNav.today')
  if (pathname === '/library' || pathname.startsWith('/library/')) return t('mobileNav.learn')
  if (pathname.startsWith('/progress')) return t('nav.progress')
  if (pathname.startsWith('/achievements')) return t('nav.achievements')
  if (pathname.startsWith('/characters')) return t('nav.characters')
  if (pathname.startsWith('/settings')) return t('nav.settings')
  if (pathname.startsWith('/methodology')) return t('nav.methodology')
  if (pathname.startsWith('/mastery')) return t('mobileNav.notebook')
  return t('app.name')
}

export default function MobileAppLayout() {
  const { t } = useTranslation()
  const { user, initialData, activeRoadmapSlug } = useAuth()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const focusRoute = isFocusRoute(location.pathname)

  const navItems = useMemo<MobileNavItem[]>(() => {
    const reviewCount = initialData?.global_review_count ?? 0
    const learnPath = activeRoadmapSlug ? `/library/${activeRoadmapSlug}` : '/library'

    return [
      {
        path: '/dashboard',
        match: pathname => pathname === '/dashboard',
        labelKey: 'mobileNav.today',
        icon: 'home',
      },
      {
        path: learnPath,
        match: pathname => pathname === '/library' || pathname.startsWith('/library/'),
        labelKey: 'mobileNav.learn',
        icon: 'auto_stories',
      },
      {
        path: '/review',
        match: pathname => pathname.startsWith('/review'),
        labelKey: 'mobileNav.review',
        icon: 'bolt',
        badge: reviewCount > 0 ? reviewCount : undefined,
      },
      {
        path: '/mastery',
        match: pathname => pathname.startsWith('/mastery'),
        labelKey: 'mobileNav.notebook',
        icon: 'inventory_2',
      },
      {
        path: '/progress',
        match: pathname => (
          pathname.startsWith('/progress')
          || pathname.startsWith('/achievements')
          || pathname.startsWith('/characters')
          || pathname.startsWith('/settings')
          || pathname.startsWith('/methodology')
        ),
        labelKey: 'mobileNav.profile',
        icon: 'person',
      },
    ]
  }, [activeRoadmapSlug, initialData?.global_review_count])

  const title = getMobileTitle(location.pathname, t)
  const avatarLetter = (user?.email ?? 'A')[0].toUpperCase()

  return (
    <div
      className="min-h-dvh bg-surface text-on-surface"
      data-mobile-app-shell="true"
    >
      {!focusRoute && (
        <header className="sticky top-0 z-40 border-b border-outline-variant/40 bg-surface/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
          <div className="flex min-h-14 items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                {t('app.name')}
              </p>
              <h1 className="truncate text-lg font-bold tracking-tight text-on-surface">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/review"
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors active:scale-95"
                aria-label={t('mobileNav.review')}
                title={t('mobileNav.review')}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
                {(initialData?.global_review_count ?? 0) > 0 && (
                  <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold leading-none text-on-secondary">
                    {initialData?.global_review_count}
                  </span>
                )}
              </Link>

              <Link
                to="/settings"
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-surface-container-low text-sm font-bold text-primary transition-colors active:scale-95"
                aria-label={t('mobileNav.profile')}
                title={t('mobileNav.profile')}
              >
                {avatarLetter}
              </Link>
            </div>
          </div>
        </header>
      )}

      <main className={focusRoute ? 'min-h-dvh' : 'pb-[calc(5.75rem+env(safe-area-inset-bottom))]'}>
        <Suspense fallback={<PageLoader />}>
          <Outlet context={{ searchQuery, setSearchQuery }} />
        </Suspense>
      </main>

      {!focusRoute && (
        <nav
          aria-label={t('mobileNav.label')}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant/50 bg-surface-container-lowest/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_40px_rgba(86,67,55,0.12)] backdrop-blur-xl"
          data-mobile-bottom-nav="true"
        >
          <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
            {navItems.map(item => {
              const active = item.match(location.pathname)

              return (
                <Link
                  key={item.labelKey}
                  to={item.path}
                  aria-label={t(item.labelKey)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-bold transition-all active:scale-95 ${
                    active
                      ? 'bg-primary-container text-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-[22px] leading-none"
                    style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className="max-w-full truncate leading-none">
                    {t(item.labelKey)}
                  </span>
                  {item.badge && (
                    <span className="absolute right-2 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold leading-none text-on-secondary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
