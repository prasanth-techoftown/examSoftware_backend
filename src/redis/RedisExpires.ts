import { getIO } from '../socketServer'
import { redisClient } from './RedisClient'

export const handleSessionExpiry = async (key: string) => {
    try {
        if (!key.startsWith('sess:')) return

        const sessionId = key.replace('sess:', '')
        const io = getIO()

        const room = io.sockets.adapter.rooms.get(sessionId)

        console.log('Session expired:', sessionId)

        if (room && room.size > 0) {
            io.to(sessionId).emit('logout', {
                reason: 'Session expired',
            })
        } else {
            await redisClient.set(`logout:${sessionId}`, '1', {
                EX: 120,
            })
        }
    } catch (err) {
        console.error('handleSessionExpiry error:', err)
    }
}
