import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { RouterManagerImpl } from '../src/client/router-manager.js'

// Mock window.history and window.location
const mockHistory = {
  pushState: vi.fn(),
  replaceState: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  go: vi.fn()
}

const mockLocation = {
  pathname: '/',
  search: '',
  href: 'http://localhost/'
}

describe('RouterManager', () => {
  let router: RouterManagerImpl

  beforeEach(() => {
    // Setup window mocks
    Object.defineProperty(global, 'window', {
      value: {
        history: mockHistory,
        location: mockLocation,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      },
      writable: true
    })

    router = new RouterManagerImpl()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('current path', () => {
    it('should return current path', () => {
      mockLocation.pathname = '/about'
      const path = router.getCurrentPath()
      expect(path).toBe('/about')
    })

    it('should return root path by default', () => {
      mockLocation.pathname = '/'
      const path = router.getCurrentPath()
      expect(path).toBe('/')
    })
  })

  describe('query parameters', () => {
    it('should return URLSearchParams for query string', () => {
      const query = router.getQuery()
      expect(query instanceof URLSearchParams).toBe(true)
    })

    it('should parse query parameters', () => {
      mockLocation.search = '?tab=profile&sort=name'
      const query = router.getQuery()

      expect(query.get('tab')).toBe('profile')
      expect(query.get('sort')).toBe('name')
    })

    it('should handle empty query string', () => {
      mockLocation.search = ''
      const query = router.getQuery()
      expect(query.toString()).toBe('')
    })
  })

  describe('navigation methods', () => {
    it('should call history.pushState on push', () => {
      mockLocation.pathname = '/about'
      router.push('/about')
      expect(mockHistory.pushState).toHaveBeenCalled()
    })

    it('should call history.replaceState on replace', () => {
      router.replace('/about')
      expect(mockHistory.replaceState).toHaveBeenCalled()
    })

    it('should support navigation state in push', () => {
      const state = { data: 'test' }
      router.push('/page', state)
      expect(mockHistory.pushState).toHaveBeenCalledWith(state, '', '/page')
    })

    it('should call history.back', () => {
      router.back()
      expect(mockHistory.back).toHaveBeenCalled()
    })

    it('should call history.forward', () => {
      router.forward()
      expect(mockHistory.forward).toHaveBeenCalled()
    })

    it('should call history.go with delta', () => {
      router.go(-2)
      expect(mockHistory.go).toHaveBeenCalledWith(-2)
    })
  })

  describe('route pattern matching', () => {
    it('should register route patterns', () => {
      router.registerRoute('/users/:id')
      expect(router.matchRoute('/users/123')).toEqual({ id: '123' })
    })

    it('should extract dynamic parameters', () => {
      const params = router.extractParams('/users/:id', '/users/123')
      expect(params).toEqual({ id: '123' })
    })

    it('should extract multiple parameters', () => {
      const params = router.extractParams('/users/:id/posts/:postId', '/users/123/posts/456')
      expect(params).toEqual({ id: '123', postId: '456' })
    })

    it('should handle catch-all routes', () => {
      const params = router.extractParams('/blog/*slug', '/blog/2024/november/my-post')
      expect(params).toEqual({ slug: '2024/november/my-post' })
    })

    it('should handle optional catch-all routes', () => {
      const params = router.extractParams('/docs/**slug', '/docs/guide/intro')
      expect(params).toEqual({ slug: 'guide/intro' })
    })

    it('should handle optional catch-all with empty path', () => {
      const params = router.extractParams('/docs/**slug', '/docs')
      expect(params).toEqual({})
    })

    it('should not match non-matching paths', () => {
      router.registerRoute('/users/:id')
      const params = router.matchRoute('/posts/123')
      expect(params).toBeNull()
    })

    it('should match exact paths without parameters', () => {
      const params = router.extractParams('/about', '/about')
      expect(params).toEqual({})
    })

    it('should support multiple route patterns', () => {
      router.registerRoute('/users/:id')
      router.registerRoute('/posts/:postId')
      router.registerRoute('/blog/*slug')

      expect(router.matchRoute('/users/123')).toEqual({ id: '123' })
      expect(router.matchRoute('/posts/456')).toEqual({ postId: '456' })
      expect(router.matchRoute('/blog/2024/post')).toEqual({ slug: '2024/post' })
    })

    it('should not match wrong number of segments', () => {
      const params = router.extractParams('/users/:id', '/users/123/posts')
      expect(params).toBeNull()
    })
  })

  describe('route parameters', () => {
    it('should return empty object when no parameters', () => {
      const params = router.getParams()
      expect(params).toEqual({})
    })

    it('should return new object for getParams to prevent mutations', () => {
      router.registerRoute('/users/:id')
      mockLocation.pathname = '/users/123'

      const params1 = router.getParams()
      const params2 = router.getParams()

      expect(params1).toEqual(params2)
      expect(params1).not.toBe(params2) // Different objects
    })
  })

  describe('active route detection', () => {
    it('should detect active route with exact match', () => {
      mockLocation.pathname = '/about'
      expect(router.isActive('/about')).toBe(true)
      expect(router.isActive('/home')).toBe(false)
    })

    it('should support partial matching', () => {
      mockLocation.pathname = '/users/123'
      expect(router.isActive('/users', false)).toBe(true)
      expect(router.isActive('/users/123', true)).toBe(true)
      expect(router.isActive('/posts', false)).toBe(false)
    })

    it('should handle root path', () => {
      mockLocation.pathname = '/'
      expect(router.isActive('/')).toBe(true)
    })

    it('should default to exact match', () => {
      mockLocation.pathname = '/users/123'
      expect(router.isActive('/users')).toBe(false)
    })
  })

  describe('navigation listeners', () => {
    it('should call listener on navigation', () => {
      const callback = vi.fn()
      mockLocation.pathname = '/about'

      router.onNavigate(callback)
      router.push('/about')

      expect(callback).toHaveBeenCalledWith('/about')
    })

    it('should support multiple listeners', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      mockLocation.pathname = '/page'

      router.onNavigate(callback1)
      router.onNavigate(callback2)

      router.push('/page')

      expect(callback1).toHaveBeenCalledWith('/page')
      expect(callback2).toHaveBeenCalledWith('/page')
    })

    it('should allow unsubscribing from navigation events', () => {
      const callback = vi.fn()
      mockLocation.pathname = '/page1'

      const unsubscribe = router.onNavigate(callback)

      router.push('/page1')
      expect(callback).toHaveBeenCalledTimes(1)

      unsubscribe()
      mockLocation.pathname = '/page2'
      router.push('/page2')

      expect(callback).toHaveBeenCalledTimes(1) // No additional calls
    })

    it('should handle listener errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error')
      })
      const normalCallback = vi.fn()
      mockLocation.pathname = '/page'

      router.onNavigate(errorCallback)
      router.onNavigate(normalCallback)

      // Should not throw
      expect(() => {
        router.push('/page')
      }).not.toThrow()

      expect(normalCallback).toHaveBeenCalled()
    })

    it('should return unsubscribe function', () => {
      const callback = vi.fn()
      const unsubscribe = router.onNavigate(callback)
      expect(typeof unsubscribe).toBe('function')
    })
  })

  describe('complex routing scenarios', () => {
    it('should handle nested routes with multiple parameters', () => {
      const params = router.extractParams(
        '/users/:userId/posts/:postId/comments/:commentId',
        '/users/john/posts/123/comments/456'
      )
      expect(params).toEqual({
        userId: 'john',
        postId: '123',
        commentId: '456'
      })
    })

    it('should handle hyphens and underscores in path segments', () => {
      const params = router.extractParams(
        '/my-special-route/:user_id',
        '/my-special-route/user_123'
      )
      expect(params).toEqual({ user_id: 'user_123' })
    })

    it('should handle numeric parameter values', () => {
      const params = router.extractParams(
        '/api/:version/users/:id',
        '/api/v1/users/123'
      )
      expect(params).toEqual({ version: 'v1', id: '123' })
    })

    it('should handle single-segment catch-all', () => {
      const params = router.extractParams('/downloads/*file', '/downloads/document.pdf')
      expect(params).toEqual({ file: 'document.pdf' })
    })

    it('should handle multi-segment catch-all', () => {
      const params = router.extractParams(
        '/files/*filepath',
        '/files/documents/2024/report.pdf'
      )
      expect(params).toEqual({ filepath: 'documents/2024/report.pdf' })
    })
  })

  describe('edge cases', () => {
    it('should handle empty path', () => {
      const params = router.extractParams('/', '/')
      expect(params).toEqual({})
    })

    it('should return null for non-matching pattern', () => {
      const params = router.extractParams('/users/:id', '/posts/123')
      expect(params).toBeNull()
    })

    it('should handle path with special characters', () => {
      const params = router.extractParams('/search/:query', '/search/hello-world')
      expect(params).toEqual({ query: 'hello-world' })
    })

    it('should not match partial segments', () => {
      const params = router.extractParams('/users/:id', '/users/12345/extra')
      expect(params).toBeNull()
    })

    it('should handle UUID-like parameters', () => {
      const params = router.extractParams(
        '/users/:id',
        '/users/550e8400-e29b-41d4-a716-446655440000'
      )
      expect(params).toEqual({ id: '550e8400-e29b-41d4-a716-446655440000' })
    })
  })
})

