import { inject, injectable, container } from 'tsyringe'
import { redisClient } from '../redis/RedisClient'

/* ===== Interface ===== */
export interface ICacheClient {
    get<T>(key: string): Promise<T | null>
    set<T>(key: string, value: T, ttl: number): Promise<void>
    del(...keys: string[]): Promise<void>
}

/* ===== Redis implementation ===== */
@injectable()
class RedisCacheClient implements ICacheClient {
    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redisClient.get(key)
            return data ? JSON.parse(data) : null
        } catch (err) {
            console.log(err)

            return null
        }
    }

    async set<T>(key: string, value: T, ttl: number): Promise<void> {
        await redisClient.setEx(key, ttl, JSON.stringify(value))
    }
    async del(...keys: string[]): Promise<void> {
        try {
            if (keys.length > 0) {
                await redisClient.del(keys as any)
            }
        } catch (err) {
            console.warn('Redis DEL failed', err)
        }
    }
}

/* ===== Register ===== */
container.register<ICacheClient>('CacheClient', {
    useClass: RedisCacheClient,
})

/* ===== Service ===== */
@injectable()
export class CacheService {
    constructor(
        @inject('CacheClient') private readonly cacheClient: ICacheClient
    ) {}

    async get<T>(key: string) {
        return await this.cacheClient.get<T>(key)
    }

    async set<T>(key: string, value: T, ttl: number) {
        await this.cacheClient.set(key, value, ttl)
    }

    async del(...keys: string[]): Promise<void> {
        if (!keys.length) return
        await Promise.all(keys.map((k) => redisClient.del(k)))
    }

    async delByPattern(pattern: string) {
        const searchPattern = `${pattern}*`
        let cursor = '0'

        do {
            const { cursor: nextCursor, keys } = await redisClient.scan(
                cursor,
                {
                    MATCH: searchPattern,
                    COUNT: 100,
                }
            )

            cursor = nextCursor

            if (keys.length) {
                await Promise.all(keys.map((k) => redisClient.del(k)))
                console.log(
                    `Deleted ${keys.length} keys for pattern ${pattern}`
                )
            }
        } while (cursor !== '0')
    }
}
