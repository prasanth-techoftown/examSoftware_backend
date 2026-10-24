import session from 'express-session'
import { redisStoreInstance } from '../redis/RedisClient'
import dotenv from 'dotenv'

dotenv.config()
const dev = process.env.DEVELOPMENT === 'true' ? false : true
export const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET!,
    store: redisStoreInstance,
    resave: false,
    saveUninitialized: false,
    name: 'sem.sid',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: dev,
        sameSite: 'lax',
    },
})
