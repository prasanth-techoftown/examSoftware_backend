import rateLimit from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { redisClient } from '../redis/RedisClient'

export const createRateLimiter = () => {
    if (!redisClient.isOpen) {
        throw new Error('Redis must be connected before creating rate limiter')
    }
    return rateLimit({
        store: new RedisStore({
            sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        }),
        windowMs: 15 * 60 * 1000,
        max: 100,
    })
}
