import express from 'express'
import { refreshTokenController } from './refreshToken'

const router = express.Router()

router.get('/getRefreshToken', (req, res) => refreshTokenController(req, res))

export default router
