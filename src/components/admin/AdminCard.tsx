import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AdminCardProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  actions?: ReactNode
}

/**
 * AdminCard - A premium container for admin dashboard content.
 * Uses glassmorphism and subtle shadows to align with the "Tactile Scholar" theme.
 */
export default function AdminCard({ children, className = '', title, description, actions }: AdminCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/80 backdrop-blur-md rounded-3xl border border-white/40 shadow-[0px_12px_44px_rgba(74,71,65,0.04)] overflow-hidden ${className}`}
    >
      {(title || actions) && (
        <div className="px-8 py-6 border-b border-stone-100/50 flex items-center justify-between bg-stone-50/30">
          <div>
            {title && <h3 className="text-lg font-semibold text-secondary leading-tight">{title}</h3>}
            {description && <p className="text-sm text-stone-400 mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-0">
        {children}
      </div>
    </motion.div>
  )
}
