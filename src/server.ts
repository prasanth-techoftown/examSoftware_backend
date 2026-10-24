import 'reflect-metadata'
import { AppDataSource } from './config/data-source'
import dotenv from 'dotenv'
import app from './app'
import { connectRedis } from './redis/RedisClient'
import http from 'http'
import { createRateLimiter } from './middleware/rateLimiter'
import { initSocketServer } from './socketServer'
import { connectSubscriber } from './redis/redisSubscriber'

dotenv.config({ debug: false })
const PORT = Number(process.env.PORT)
// const IP = process.env.IP
const startServer = async () => {
    try {
        await connectRedis()
        await AppDataSource.initialize()
        console.log('MySQL connected')
        await connectSubscriber()
        const limiter = createRateLimiter()
        app.use(limiter)
        const server = http.createServer(app)
        initSocketServer(server)

        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`)
        })
    } catch (error) {
        console.error('Startup Error:', error)
        process.exit(1)
    }
}

startServer().catch((err) => {
    console.error('Unhandled startup error:', err)
})
