import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { useLocation, useNavigate } from 'react-router-dom'

const ROOT_PATHS = new Set(['/', '/dashboard', '/login'])
const EXIT_CONFIRM_MS = 1800

function fallbackRoute(pathname: string) {
  if (pathname.startsWith('/library/')) return '/library'
  if (pathname === '/study' || pathname === '/review' || pathname === '/free-study') return '/dashboard'
  if (pathname === '/settings' || pathname === '/progress' || pathname === '/achievements' || pathname === '/characters' || pathname === '/mastery') {
    return '/dashboard'
  }
  return '/dashboard'
}

export default function AndroidBackHandler() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const lastBackAt = useRef(0)
  const locationRef = useRef(location)
  const [showExitHint, setShowExitHint] = useState(false)

  useEffect(() => {
    locationRef.current = location
    setShowExitHint(false)
  }, [location])

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return

    let timeoutId: number | undefined
    let isActive = true

    const removeListener = CapacitorApp.addListener('backButton', async () => {
      const pathname = locationRef.current.pathname
      await Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined)

      if (!ROOT_PATHS.has(pathname)) {
        if (window.history.length > 1) {
          navigate(-1)
        } else {
          navigate(fallbackRoute(pathname), { replace: true })
        }
        return
      }

      const now = Date.now()
      if (now - lastBackAt.current < EXIT_CONFIRM_MS) {
        await CapacitorApp.exitApp()
        return
      }

      lastBackAt.current = now
      setShowExitHint(true)
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        if (isActive) setShowExitHint(false)
      }, EXIT_CONFIRM_MS)
    })

    return () => {
      isActive = false
      window.clearTimeout(timeoutId)
      removeListener.then((handle) => handle.remove())
    }
  }, [navigate])

  if (!showExitHint) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[10000] flex justify-center px-6">
      <div className="rounded-full border border-outline-variant/20 bg-on-surface px-4 py-2 text-xs font-medium text-surface shadow-lg">
        {t('android.backPressAgainToExit')}
      </div>
    </div>
  )
}
