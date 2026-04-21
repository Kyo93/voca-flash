import React from 'react'

export default function PageLoader() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
      <span className="material-symbols-outlined text-4xl text-primary animate-spin">
        progress_activity
      </span>
    </div>
  )
}
