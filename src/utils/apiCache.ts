// src/utils/apiCache.ts

class ApiCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private ttl: number = 60000 // 1 minuto por padrão

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (ttl || this.ttl),
    })
  }

  get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() > cached.timestamp) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    this.cache.forEach((_v, key) => {
      if (key.includes(pattern)) this.cache.delete(key)
    })
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }
}

// Instância singleton
export const apiCache = new ApiCache()
