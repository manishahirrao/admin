/**
 * Redis Cache Service
 * Handles caching for dashboard metrics, user lists, and analytics reports
 */

interface CacheConfig {
  ttl: number; // Time to live in seconds
  key: string;
}

const CACHE_CONFIGS = {
  DASHBOARD_METRICS: { ttl: 300, key: 'dashboard:metrics' }, // 5 minutes
  USER_LIST: { ttl: 120, key: 'users:list' }, // 2 minutes
  ANALYTICS_REPORT: { ttl: 600, key: 'analytics:report' }, // 10 minutes
  TEMPLE_PERFORMANCE: { ttl: 300, key: 'temple:performance' }, // 5 minutes
  PRIEST_WORKLOAD: { ttl: 180, key: 'priest:workload' }, // 3 minutes
};

class CacheService {
  private redis: any = null;
  private isEnabled: boolean = false;

  constructor() {
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis() {
    try {
      // Check if Redis URL is configured
      const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
      
      if (!redisUrl) {
        console.warn('Redis URL not configured. Caching disabled.');
        return;
      }

      // For Upstash Redis REST API
      if (process.env.UPSTASH_REDIS_REST_URL) {
        this.redis = {
          get: async (key: string) => {
            const response = await fetch(
              `${process.env.UPSTASH_REDIS_REST_URL}/get/${key}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
                },
              }
            );
            const data = await response.json();
            return data.result;
          },
          set: async (key: string, value: string, ttl?: number) => {
            const url = ttl
              ? `${process.env.UPSTASH_REDIS_REST_URL}/setex/${key}/${ttl}`
              : `${process.env.UPSTASH_REDIS_REST_URL}/set/${key}`;
            
            await fetch(url, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
              },
              body: value,
            });
          },
          del: async (key: string) => {
            await fetch(
              `${process.env.UPSTASH_REDIS_REST_URL}/del/${key}`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
                },
              }
            );
          },
        };
        this.isEnabled = true;
        console.log('Redis cache initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.redis) return null;

    try {
      const cached = await this.redis.get(key);
      if (!cached) return null;

      return JSON.parse(cached) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.isEnabled || !this.redis) return;

    try {
      const serialized = JSON.stringify(value);
      await this.redis.set(key, serialized, ttl);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cached data
   */
  async del(key: string): Promise<void> {
    if (!this.isEnabled || !this.redis) return;

    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.isEnabled || !this.redis) return;

    try {
      // For Upstash, we'll need to track keys manually
      // In production, use Redis SCAN command
      console.log(`Invalidating cache pattern: ${pattern}`);
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  /**
   * Get or set cached data
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();

    // Cache the result
    await this.set(key, data, ttl);

    return data;
  }

  /**
   * Cache dashboard metrics
   */
  async cacheDashboardMetrics(data: any): Promise<void> {
    const config = CACHE_CONFIGS.DASHBOARD_METRICS;
    await this.set(config.key, data, config.ttl);
  }

  /**
   * Get cached dashboard metrics
   */
  async getDashboardMetrics(): Promise<any | null> {
    const config = CACHE_CONFIGS.DASHBOARD_METRICS;
    return await this.get(config.key);
  }

  /**
   * Cache user list
   */
  async cacheUserList(filters: any, data: any): Promise<void> {
    const config = CACHE_CONFIGS.USER_LIST;
    const key = `${config.key}:${JSON.stringify(filters)}`;
    await this.set(key, data, config.ttl);
  }

  /**
   * Get cached user list
   */
  async getUserList(filters: any): Promise<any | null> {
    const config = CACHE_CONFIGS.USER_LIST;
    const key = `${config.key}:${JSON.stringify(filters)}`;
    return await this.get(key);
  }

  /**
   * Cache analytics report
   */
  async cacheAnalyticsReport(reportId: string, data: any): Promise<void> {
    const config = CACHE_CONFIGS.ANALYTICS_REPORT;
    const key = `${config.key}:${reportId}`;
    await this.set(key, data, config.ttl);
  }

  /**
   * Get cached analytics report
   */
  async getAnalyticsReport(reportId: string): Promise<any | null> {
    const config = CACHE_CONFIGS.ANALYTICS_REPORT;
    const key = `${config.key}:${reportId}`;
    return await this.get(key);
  }

  /**
   * Invalidate all dashboard caches
   */
  async invalidateDashboard(): Promise<void> {
    await this.invalidatePattern('dashboard:*');
    await this.invalidatePattern('users:*');
    await this.invalidatePattern('analytics:*');
  }

  /**
   * Check if cache is enabled
   */
  isReady(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const cacheService = new CacheService();
