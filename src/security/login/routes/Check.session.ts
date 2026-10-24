import { Router, Response } from 'express'
import { SessionAuthRequest } from '../../../middleware/Auth.middleware'

const router = Router()

router.get('/me', (req: SessionAuthRequest, res: Response) => {
    try {
        if (req.session && req.session.user) {
            return res.status(200).json({
                user: req.session.user,
                permission: req.session.permissions,
            })
        } else {
            return res.status(401).json({ user: null })
        }
    } catch (err) {
        console.error('Error checking session', err)
        return res
            .status(500)
            .json({ user: null, error: 'Internal server error' })
    }
})
router.post('/logout', (req: SessionAuthRequest, res: Response) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Logout failed',
                })
            }

            res.clearCookie('sem.sid')
            res.clearCookie('userId')

            return res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            })
        })
    } catch (error) {
        console.log(error)

        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
        })
    }
})
export default router
