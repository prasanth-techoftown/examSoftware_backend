import multer from 'multer'
import { sendError } from '../../utils/Response'
import { ERORR_MESSAGES } from '../../constant/Error.message'
import { NextFunction, Request, RequestHandler, Response } from 'express'

export const multerErrorHandler =
    (upload: RequestHandler) =>
    (req: Request, res: Response, next: NextFunction) => {
        upload(req, res, (err: unknown) => {
            if (!err) {
                return next()
            }

            // Multer built-in errors
            if (err instanceof multer.MulterError) {
                console.log(err)
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return sendError(res, ERORR_MESSAGES.FILE_TOO_LARGE, 400)
                }

                return sendError(res, ERORR_MESSAGES.FILE_UPLOAD_FAILED, 400)
            }

            // Custom fileFilter errors
            return sendError(res, ERORR_MESSAGES.INVALID_FILE_TYPE, 400)
        })
    }
