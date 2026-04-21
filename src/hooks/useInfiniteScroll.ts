import { useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
}

export function useInfiniteScroll({ loading, hasMore, onLoadMore }: UseInfiniteScrollOptions) {
  const observer = useRef<IntersectionObserver | null>(null)

  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore()
      }
    })
    
    if (node) observer.current.observe(node)
  }, [loading, hasMore, onLoadMore])

  return { lastElementRef }
}
