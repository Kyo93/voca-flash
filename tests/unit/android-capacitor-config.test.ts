import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function readJson(path: string) {
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, any>
}

describe('Android Capacitor packaging', () => {
  it('defines Capacitor config for the VocaFlash Android app', () => {
    expect(existsSync('capacitor.config.ts')).toBe(true)

    const source = readFileSync('capacitor.config.ts', 'utf8')

    expect(source).toContain("appId: 'com.vocaflash.app'")
    expect(source).toContain("appName: 'VocaFlash'")
    expect(source).toContain("webDir: 'dist'")
    expect(source).toContain('StatusBar')
    expect(source).toContain('SplashScreen')
    expect(source).toContain('LocalNotifications')
  })

  it('has Android build scripts and native Capacitor dependencies', () => {
    const pkg = readJson('package.json')

    expect(pkg.scripts['android:sync']).toBe('npm run build && npx cap sync android')
    expect(pkg.scripts['android:open']).toBe('npx cap open android')
    expect(pkg.scripts['android:run']).toBe('npm run build && npx cap run android')
    expect(pkg.dependencies['@capacitor/android']).toBeTruthy()
    expect(pkg.dependencies['@capacitor/app']).toBeTruthy()
    expect(pkg.dependencies['@capacitor/core']).toBeTruthy()
    expect(pkg.dependencies['@capacitor/haptics']).toBeTruthy()
    expect(pkg.dependencies['@capacitor/local-notifications']).toBeTruthy()
    expect(pkg.dependencies['@capacitor/splash-screen']).toBeTruthy()
    expect(pkg.dependencies['@capacitor/status-bar']).toBeTruthy()
    expect(pkg.devDependencies['@capacitor/cli']).toBeTruthy()
  })

  it('creates Android native project foundations with notification permission and branded assets', () => {
    expect(existsSync('android/app/src/main/AndroidManifest.xml')).toBe(true)
    expect(existsSync('resources/icon.svg')).toBe(true)
    expect(existsSync('resources/splash.svg')).toBe(true)
    expect(existsSync('android/app/src/main/res/mipmap-hdpi/ic_launcher.png')).toBe(true)
    expect(existsSync('android/app/src/main/res/drawable/splash.png')).toBe(true)

    const manifest = readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8')

    expect(manifest).toContain('android.permission.INTERNET')
    expect(manifest).toContain('android.permission.POST_NOTIFICATIONS')
  })

  it('wires Android-native interaction bridges for back handling and TTS', () => {
    expect(existsSync('android/app/src/main/java/com/vocaflash/app/NativeTtsPlugin.java')).toBe(true)
    expect(existsSync('src/components/mobile/AndroidBackHandler.tsx')).toBe(true)

    const mainActivity = readFileSync('android/app/src/main/java/com/vocaflash/app/MainActivity.java', 'utf8')
    const ttsSource = readFileSync('src/lib/tts.ts', 'utf8')
    const backHandler = readFileSync('src/components/mobile/AndroidBackHandler.tsx', 'utf8')

    expect(mainActivity).toContain('registerPlugin(NativeTtsPlugin.class)')
    expect(ttsSource).toContain("registerPlugin<NativeTtsPlugin>('NativeTts')")
    expect(ttsSource).toContain("Capacitor.getPlatform() === 'android'")
    expect(backHandler).toContain("App.addListener('backButton'")
    expect(backHandler).toContain('navigate(-1)')
    expect(backHandler).toContain('App.exitApp()')
  })
})
