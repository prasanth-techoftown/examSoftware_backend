import { createClient } from 'redis'
import { handleSessionExpiry } from './RedisExpires'

export const redisSubscriber = createClient({
    url: process.env.REDIS_URL,
})

redisSubscriber.on('error', (err) => {
    console.error('Redis Subscriber Error:', err)
})

export const connectSubscriber = async () => {
    if (!redisSubscriber.isOpen) {
        await redisSubscriber.connect()
        console.log('Redis subscriber connected')
    }

    await redisSubscriber.subscribe(
        '__keyevent@0__:expired',
        async (key: string) => {
            await handleSessionExpiry(key)
        }
    )
}
