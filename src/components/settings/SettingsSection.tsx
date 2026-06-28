import { ReactNode } from 'react'

interface SettingsSectionProps {
  icon: string
  title: string
  description?: string
  children: ReactNode
  colorClass?: string
  bgClass?: string
}

/**
 * Standardized section wrapper for Settings Page.
 * Implements "Halo Modern" design with glassmorphism and semantic radius.
 */
export default function SettingsSection({ 
  icon, 
  title, 
  description, 
  children, 
  colorClass = 'text-primary',
  bgClass = 'bg-primary/5'
}: SettingsSectionProps) {
  return (
    <section className="bg-white p-8 rounded-4xl border border-stone-100 shadow-sm space-y-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-4 mb-2 border-b border-stone-50 pb-5">
        <div className={`w-12 h-12 rounded-2xl ${bgClass} ${colorClass} flex items-center justify-center shadow-inner`}>
          <span className="material-symbols-outlined font-variation-fill text-2xl">{icon}</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-secondary leading-tight">{title}</h2>
          {description && <p className="text-sm text-stone-400 font-medium mt-0.5">{description}</p>}
        </div>
      </div>
      
      <div className="pt-2">
        {children}
      </div>
    </section>
  )
}
