import { Request, Response } from 'express'
import { accessToken, verifyToken } from '../Jwt'
import { TOKENTYPE } from '../Enums'

export function refreshTokenController(req: Request, res: Response): Response {
    const authHeader = req.headers.authorization

    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null

    if (!token) {
        return res.status(401).json({ error: 'Token missing' })
    }

    const decoded = verifyToken(token)

    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }

    if (decoded.mod !== TOKENTYPE.REFRESHTOKEN) {
        return res.status(403).json({ error: 'Access token not allowed' })
    }

    const newAccessToken = accessToken(
        decoded.role,
        decoded.branchId,
        decoded.sessionId
    )

    return res.status(200).json(newAccessToken)
}
