import React from 'react'
import { getSrsLevelConfig } from '../../lib/srs'

interface SrsLevelBadgeProps {
  stability: number
  showStrength?: boolean
  size?: 'sm' | 'md'
}

/**
 * SrsLevelBadge - Standardized badge for word mastery level.
 * Used in Mastery tables and Word Detail panels.
 */
export const SrsLevelBadge: React.FC<SrsLevelBadgeProps> = ({ 
  stability, 
  showStrength = false,
  size = 'sm' 
}) => {
  const level = getSrsLevelConfig(stability)
  const strengthPercent = Math.min(100, (stability / 21) * 100)

  return (
    <div className="flex items-center gap-3">
      <span className={`px-2.5 py-1 rounded-md font-black uppercase tracking-widest ${level.bg} ${level.text} ${level.glow} leading-none ${size === 'sm' ? 'text-[9px]' : 'text-[10px]'}`}>
        {level.label}
      </span>

      {showStrength && (
        <div className="flex items-center gap-2">
          <div className={`${size === 'sm' ? 'w-24' : 'w-32'} h-1.5 bg-surface-container rounded-full overflow-hidden`}>
            <div
              className={`h-full ${level.color} transition-all duration-1000 ${level.glow ? 'animate-pulse' : ''}`}
              style={{ width: `${strengthPercent}%` }}
            />
          </div>
          <p className="text-[10px] font-black text-on-surface-variant/40 uppercase leading-none tracking-tighter">
            {stability.toFixed(1)}d
          </p>
        </div>
      )}
    </div>
  )
}
