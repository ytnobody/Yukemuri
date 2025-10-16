import type { RouterManager } from '../types.js'

export class RouterManagerImpl implements RouterManager {
  
  push(path: string, state?: any): void {
    if (typeof window === 'undefined') return
    
    window.history.pushState(state, '', path)
    this.triggerNavigationEvent(path)
  }

  replace(path: string, state?: any): void {
    if (typeof window === 'undefined') return
    
    window.history.replaceState(state, '', path)
    this.triggerNavigationEvent(path)
  }

  back(): void {
    if (typeof window === 'undefined') return
    
    window.history.back()
  }

  forward(): void {
    if (typeof window === 'undefined') return
    
    window.history.forward()
  }

  go(delta: number): void {
    if (typeof window === 'undefined') return
    
    window.history.go(delta)
  }

  getCurrentPath(): string {
    if (typeof window === 'undefined') return '/'
    
    return window.location.pathname
  }

  getParams(): Record<string, string> {
    // URL parameters extraction - stub for now
    // This should integrate with the file-based routing system
    return {}
  }

  getQuery(): URLSearchParams {
    if (typeof window === 'undefined') return new URLSearchParams()
    
    return new URLSearchParams(window.location.search)
  }

  isActive(path: string): boolean {
    return this.getCurrentPath() === path
  }

  onNavigate(callback: (path: string) => void): () => void {
    if (typeof window === 'undefined') return () => {}

    const handlePopState = () => {
      callback(this.getCurrentPath())
    }

    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }

  private triggerNavigationEvent(path: string): void {
    // Trigger custom navigation event for components
    const event = new CustomEvent('yukemuri:navigate', { detail: { path } })
    window.dispatchEvent(event)
  }
}