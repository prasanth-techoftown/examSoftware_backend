import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { ERORR_MESSAGES } from '../../../constant/Error.message'
import { sendError, sendSuccess } from '../../../utils/Response'
import { SUCCESS_MESSAGES } from '../../../constant/Success.message'

import { Status } from '../../../constant/Result.types'
import { CertificateServiceMethods } from '../service/Certificate.serviceInterface'
import { getPagination } from '../../../utils/pagination'

@injectable()
export class CertificateController {
    constructor(
        @inject('CertificateService')
        private certificateService: CertificateServiceMethods
    ) {}

    getAllStudent = async (req: Request, res: Response) => {
        try {
            const pagination = getPagination(req.query)
            const search = req.query.search
                ? String(req.query.search)
                : undefined
            const result = await this.certificateService.getAllStudent({
                ...pagination,
                search,
            })

            if (result.status === Status.NO_NAME_FOUND) {
                sendSuccess(res, 'Students Not Found', { data: [], total: 0 })
                return
            }

            sendSuccess(res, SUCCESS_MESSAGES.FETCHED, {
                data: result.data,
                total: result.total,
            })
            return
        } catch (error) {
            sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
