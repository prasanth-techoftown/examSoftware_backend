import { Request, Response } from 'express'
import { sendError, sendSuccess } from '../../../../utils/Response'
import { ERORR_MESSAGES } from '../../../../constant/Error.message'
import { inject, injectable } from 'tsyringe'
import { ExamAnswerLogServiceMethods } from '../service/ExamAnswerLogs.serviceInterface'
import { ExamAnswerLogDTO } from './ExamAnswerLogs.DTO'
import { ROLE } from '../../../../constant/enum/Role.enum'

@injectable()
export class ExamAnswerLogController {
    constructor(
        @inject('ExamAnswerLogService')
        private examSessionService: ExamAnswerLogServiceMethods
    ) {}

    addAnswerLog = async (req: Request, res: Response) => {
        try {
            const createdBy =
                req.session.user?.userType === ROLE.STUDENT
                    ? req.session.user?.userId
                    : null
            const { answeredAt, questionId, optionId, examSessionId } = req.body
            const missingFields = [
                'answeredAt',
                'questionId',
                'optionId',
                'examSessionId',
            ].filter((field) => !req.body[field])

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${missingFields.join(', ')}`,
                    400
                )
            }

            const examAnswerDTO = new ExamAnswerLogDTO(
                answeredAt,
                questionId,
                optionId,
                examSessionId,
                createdBy!
            )

            const examAnswerResult =
                await this.examSessionService.addAnswerLog(examAnswerDTO)

            return sendSuccess(res, 'Exam started', examAnswerResult, 201)
        } catch (err) {
            console.log(err)

            return sendError(res, `${ERORR_MESSAGES.SERVER}`, 500)
        }
    }
    getSavedAnswers = async (req: Request, res: Response) => {
        try {
            const sessionId = Number(req.params.sessionId)

            if (!sessionId || isNaN(sessionId)) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: sessionId`,
                    400
                )
            }
            const answers =
                await this.examSessionService.getSavedAnswers(sessionId)
            return sendSuccess(res, 'Saved answers fetched', answers, 200)
        } catch (err) {
            console.log(err)
            return sendError(res, `${ERORR_MESSAGES.SERVER}`, 500)
        }
    }
}
