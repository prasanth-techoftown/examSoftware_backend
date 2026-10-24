import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'
import { sendError, sendSuccess } from '../../../../utils/Response'
import { ERORR_MESSAGES } from '../../../../constant/Error.message'
import { SUCCESS_MESSAGES } from '../../../../constant/Success.message'
import { ExamSessionQuestionServiceMethods } from '../service/ExamSessionQuestion.serviceInterface'
@injectable()
export class ExamSessionQuestionController {
    constructor(
        @inject('ExamSessionQuestionService')
        private examSessionQuestionService: ExamSessionQuestionServiceMethods
    ) {}

    getExamQuestionBySessionId = async (req: Request, res: Response) => {
        try {
            if (!req.query.sessionId) {
                return sendError(res, 'sessionId required')
            }
            const sessionId = req.query.sessionId
                ? Number(req.query.sessionId)
                : undefined

            const result =
                await this.examSessionQuestionService.getExamQuestionBySessionId(
                    sessionId!
                )

            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
