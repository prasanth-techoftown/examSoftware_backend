import { Server, Socket } from 'socket.io'
import http from 'http'
import dotenv from 'dotenv'
import { redisClient } from './redis/RedisClient'
import { registerExamHandlers } from './exam-mgt/answer/answerHandler/answerHandler'

dotenv.config({ debug: false })

let io: Server

const parseCookies = (cookieHeader = ''): Record<string, string> =>
    cookieHeader.split(';').reduce(
        (acc, pair) => {
            const [key, ...rest] = pair.trim().split('=')
            if (!key) return acc
            acc[key] = decodeURIComponent(rest.join('=') || '')
            return acc
        },
        {} as Record<string, string>
    )

const allowedOrigins: string[] =
    process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) ?? []

export const initSocketServer = (server: http.Server): Server => {
    io = new Server(server, {
        cors: { origin: allowedOrigins, credentials: true },
    })

    io.on('connection', async (socket: Socket) => {
        const cookies = parseCookies(socket.request.headers.cookie || '')
        const raw = cookies['sem.sid']

        if (!raw) {
            socket.emit('logout', { reason: 'No session' })
            return socket.disconnect(true)
        }

        const sessionId = decodeURIComponent(raw)
            .replace('s:', '')
            .split('.')[0]

        const logoutFlag = await redisClient.get(`logout:${sessionId}`)
        if (logoutFlag) {
            socket.emit('logout', { reason: 'Session expired (reconnect)' })
            await redisClient.del(`logout:${sessionId}`)
            return socket.disconnect(true)
        }

        const sessionRaw = await redisClient.get(`sess:${sessionId}`)
        if (!sessionRaw) {
            await redisClient.set(`logout:${sessionId}`, '1', { EX: 120 })
            socket.emit('logout', { reason: 'Session expired' })
            return socket.disconnect(true)
        }

        let userType = 'UNKNOWN'
        let userId = 'UNKNOWN'
        try {
            const parsed = JSON.parse(sessionRaw)
            userType = parsed?.user?.userType ?? 'UNKNOWN'
            userId = parsed?.user?.userId ?? 'UNKNOWN'
        } catch {
            console.error('Failed to parse session data for socket')
            return socket.disconnect(true)
        }

        // ── join rooms ─────────────────────────────────────────────
        // sessionId room  → emit to a specific user:  getIO().to(sessionId).emit(...)
        // userType room   → broadcast to all admins:  getIO().to('SUPERADMIN').emit(...)
        //                 → broadcast to all students: getIO().to('STUDENT').emit(...)
        await socket.join(sessionId)
        await socket.join(userType)
        if (userType === 'STUDENT') {
            registerExamHandlers(socket, {
                sessionId,
                userId,
                userType,
            })
        }
        console.log(
            `Socket connected — userId: ${userId}, userType: ${userType}, room: ${sessionId}`
        )

        socket.on('disconnect', () => {
            console.log(
                `Socket disconnected — userId: ${userId}, userType: ${userType}`
            )
        })
    })

    return io
}

export const getIO = (): Server => {
    if (!io) throw new Error('Socket.io not initialized!')
    return io
}
