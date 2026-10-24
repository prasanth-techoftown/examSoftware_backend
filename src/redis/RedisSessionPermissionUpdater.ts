import { redisClient } from './RedisClient'

export const updatePermissionsForRole = async (
    roleName: string, // e.g. "SUPERADMIN", "STUDENT"
    newFormattedPermissions: Record<string, string[]>
) => {
    try {
        const keys = await redisClient.keys('sess:*')
        if (!keys.length) return

        for (const key of keys) {
            const raw = await redisClient.get(key)
            if (!raw) continue

            let session
            try {
                session = JSON.parse(raw)
            } catch {
                continue
            }

            if (session?.user?.role !== roleName) continue

            session.permissions = newFormattedPermissions

            const ttl = await redisClient.ttl(key)
            await redisClient.set(key, JSON.stringify(session), {
                EX: ttl > 0 ? ttl : Number(process.env.SESSION_TIMEOUT),
            })
        }
    } catch (err) {
        console.log('Failed to update session permissions:', err)
    }
}
