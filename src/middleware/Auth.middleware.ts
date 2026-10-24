import { Response, NextFunction } from 'express'
import { SessionAuthRequest } from './middleware.types'

export const authenticate = (
    req: SessionAuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const requestId = (req.headers['x-request-id'] as string)?.trim()
        if (!requestId) {
            return res.status(400).json({ message: 'Missing Header' })
        }
        console.log(req.session.user)
        if (!req.session?.user) {
            return res.status(401).json({ message: 'Session expired' })
        }

        req.user = req.session.user
        next()
    } catch (err) {
        console.log(err, 'Auth Middleware')

        return res.status(500).json({ message: 'Internal server error' })
    }
}

export { SessionAuthRequest }
