import { Link, Outlet, useLocation } from 'react-router-dom'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import PageLoader from '../PageLoader'

interface MobileHeaderMeta {
  title: string
  subtitle?: string
}

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

function isSearchRoute(pathname: string) {
  return pathname === '/library'
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
  const { user, profile, initialData, activeRoadmapSlug } = useAuth()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileHeaderMeta, setMobileHeaderMeta] = useState<MobileHeaderMeta | null>(null)
  const [avatarError, setAvatarError] = useState(false)
  const focusRoute = isFocusRoute(location.pathname)
  const searchRoute = isSearchRoute(location.pathname)

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
  const displayName = profile?.display_name?.trim() || user?.email || 'A'
  const avatarLetter = displayName[0].toUpperCase()
  const avatarUrl = profile?.avatar_url?.trim()
  const reviewCount = initialData?.global_review_count ?? 0
  const isDashboard = location.pathname === '/dashboard'
  const headerTitle = mobileHeaderMeta?.title ?? title
  const headerSubtitle = mobileHeaderMeta?.subtitle ?? (
    isDashboard && reviewCount > 0 ? t('home.wordsDue', { count: reviewCount }) : t('app.name')
  )

  useEffect(() => {
    setAvatarError(false)
  }, [avatarUrl])

  return (
    <div
      className="mobile-shell-minimal min-h-dvh text-on-surface"
      data-mobile-app-shell="true"
    >
      {!focusRoute && (
        <header className="mobile-topbar-minimal sticky top-0 z-40 px-4 pb-1 pt-[max(0.35rem,env(safe-area-inset-top))]">
          <div className="flex min-h-10 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-[19px] font-semibold leading-tight text-on-surface">
                  {headerTitle}
                </h1>
                <p className="truncate text-[10px] font-medium text-on-surface-variant/70">
                  {headerSubtitle}
                </p>
              </div>
            </div>

            <div className="flex h-9 items-center gap-1.5 text-on-surface-variant">
              <Link
                to="/review"
                className="flex h-9 items-center justify-center gap-1 rounded-md px-1.5 text-primary transition-colors active:scale-95"
                aria-label={t('mobileNav.review')}
                title={t('mobileNav.review')}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
                {reviewCount > 0 && (
                  <span className="text-xs font-semibold leading-none">
                    {reviewCount}
                  </span>
                )}
              </Link>

              <Link
                to="/settings"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors active:scale-95"
                aria-label={t('mobileNav.profile')}
                title={t('mobileNav.profile')}
              >
                {avatarUrl && !avatarError ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-sm font-semibold text-secondary">
                    {avatarLetter}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {searchRoute && (
            <div className="relative mt-3">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/45" aria-hidden="true">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="mobile-input w-full pl-12 pr-4 text-sm font-medium outline-hidden transition"
              />
            </div>
          )}
        </header>
      )}

      <main className={focusRoute ? 'min-h-dvh' : 'pb-[calc(5.75rem+env(safe-area-inset-bottom))]'}>
        <Suspense fallback={<PageLoader />}>
          <Outlet context={{ searchQuery, setSearchQuery, setMobileHeaderMeta }} />
        </Suspense>
      </main>

      {!focusRoute && (
        <nav
          aria-label={t('mobileNav.label')}
          className="mobile-bottom-nav-minimal fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
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
                  className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-all active:scale-95 ${
                    active
                      ? 'bg-primary-container text-primary'
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
                    <span className="absolute right-2 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-medium leading-none text-on-secondary">
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
