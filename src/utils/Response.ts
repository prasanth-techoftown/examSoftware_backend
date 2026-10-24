import { Response } from 'express'

export const sendSuccess = <T>(
    res: Response,
    message: string,
    data: T = {} as T,
    statusCode: number = 200
): Response => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    })
}

export const sendError = <T = null>(
    res: Response,
    message: string,
    statusCode: number = 500,
    error: T = null as T
): Response => {
    return res.status(statusCode).json({
        success: false,
        message,
        error,
    })
}
