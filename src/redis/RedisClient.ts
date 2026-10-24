import { createClient } from 'redis'
import { RedisStore } from 'connect-redis'
import dotenv from 'dotenv'
dotenv.config()
export const redisClient = createClient({
    url: process.env.REDIS_URL,
})

redisClient.on('error', (error) => {
    console.log('Redis error:', error)
})

export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect()
        await redisClient.configSet('notify-keyspace-events', 'KEg')
        await redisClient.configSet('notify-keyspace-events', 'Ex')
        console.log('Redis connected')
    }
}

export const redisStoreInstance = new RedisStore({
    client: redisClient,
    prefix: 'sess:',
    ttl: Number(process.env.SESSION_TIMEOUT),
})
