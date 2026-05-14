import { redisClient } from '../redis/redis.client';

export class CacheService {
  private static get client() {
    return redisClient.getClient();
  }

  /**
   * Get cached data
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache Get Error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cache with expiration (default 1 hour)
   */
  static async set(key: string, value: any, expireInSeconds: number = 3600): Promise<void> {
    try {
      // Use modern set with options for compatibility in node-redis v4/v5
      await this.client.set(key, JSON.stringify(value || {}), {
        EX: expireInSeconds
      });
    } catch (error) {
      console.error(`Cache Set Error for key ${key}:`, error);
    }
  }

  /**
   * Delete specific cache key
   */
  static async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Cache Delete Error for key ${key}:`, error);
    }
  }

  /**
   * Invalidate multiple keys by pattern
   * Example: invalidatePattern('products:shopId:*')
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Redis SCAN cursor MUST be a string in most RESP implementations to avoid type errors
      let cursor: string = '0';
      do {
        // SCAN returns { cursor: number | string, keys: string[] }
        const result: any = await this.client.scan(cursor, {
          MATCH: pattern,
          COUNT: 100
        });
        
        // Ensure next cursor is a string
        cursor = result.cursor.toString();
        const keys = result.keys;
        
        if (keys && keys.length > 0) {
          await this.client.del(keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      console.error(`Cache Invalidate Pattern Error for ${pattern}:`, error);
    }
  }
}
