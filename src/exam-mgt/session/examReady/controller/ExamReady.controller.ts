import { injectable, inject } from 'tsyringe'
import { Request, Response } from 'express'
import { sendError, sendSuccess } from '../../../../utils/Response'
import { ERORR_MESSAGES } from '../../../../constant/Error.message'
import { SUCCESS_MESSAGES } from '../../../../constant/Success.message'
import { ExamReadyServiceMethods } from '../service/ExamReady.serviceInterface'

@injectable()
export class ExamReadyController {
    constructor(
        @inject('ExamReadyService')
        private examReadyService: ExamReadyServiceMethods
    ) {}

    getExamReadyDetails = async (req: Request, res: Response) => {
        try {
            const userId = req.session.user?.userId
            if (!userId) return sendError(res, 'Unauthorized', 401)

            const result = await this.examReadyService.getExamReadyDetails(
                Number(userId)
            )

            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result.data)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
