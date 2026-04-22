import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)

    const fn = isSignUp ? signUp : signIn
    const { error: authError } = await fn(email, password)

    if (authError) {
      setError(authError.message)
      setSubmitting(false)
    } else {
      if (isSignUp) {
        setSuccess(t('auth.signUpSuccess'))
        setSubmitting(false)
      } else {
        // Chờ 500ms để AuthContext kịp cập nhật session/user ngầm 
        // trước khi thực hiện chuyển trang, tránh race condition.
        setTimeout(() => {
          navigate('/dashboard')
          setSubmitting(false)
        }, 500)
      }
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-surface">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-orange-200/40 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl animate-blob [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="w-full flex-none bg-white/60 backdrop-blur-xl border-b border-orange-100 z-50 relative">
        <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-[1440px] mx-auto">
          <Link to="/" className="text-3xl font-black tracking-tighter text-primary flex items-center gap-2">
            <span className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-xl rotate-3">V</span>
            VocabMaster
          </Link>
        </nav>
      </header>

      {/* Login form */}
      <main className="grow flex items-center justify-center p-6 z-10 relative">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl border border-orange-50 p-8 md:p-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-black rotate-3 mx-auto mb-4">
                V
              </div>
              <h1 className="text-2xl font-black text-secondary">
                {isSignUp ? t('auth.signUpTitle') : t('auth.signInTitle')}
              </h1>
              <p className="text-sm text-on-surface-variant mt-2">
                {isSignUp
                  ? t('auth.signUpSubtitle')
                  : t('auth.signInSubtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-secondary mb-2" htmlFor="email">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary placeholder:text-on-surface-variant/50 font-medium outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-secondary mb-2" htmlFor="password">
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary placeholder:text-on-surface-variant/50 font-medium outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl text-sm text-green-600 font-medium animate-in fade-in slide-in-from-top-2">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting
                  ? t('auth.processing')
                  : isSignUp
                    ? t('auth.signUp')
                    : t('auth.signIn')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                  setSuccess(null)
                }}
                className="text-sm font-medium text-primary hover:text-primary-fixed-dim transition-colors"
              >
                {isSignUp
                  ? t('auth.hasAccount')
                  : t('auth.noAccount')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
