import { Request, Response } from 'express'
import { ExamSessionServiceMethods } from '../service/ExamSession.serviceInterface'
import { sendError, sendSuccess } from '../../../../utils/Response'
import { ERORR_MESSAGES } from '../../../../constant/Error.message'
import { SubmitExamSessionDTO } from './SubmitExamSession.DTO'
import {
    ExamSessionQuestionStatus,
    ExamSessionStatus,
} from '../types/ExamSession.types'
import { inject, injectable } from 'tsyringe'
import { ExamSessionDTO } from './ExamSession.DTO'
import { ROLE } from '../../../../constant/enum/Role.enum'
import { Status } from '../../../../constant/Result.types'
import { SUCCESS_MESSAGES } from '../../../../constant/Success.message'
import { getPagination } from '../../../../utils/pagination'

@injectable()
export class ExamSessionController {
    constructor(
        @inject('ExamSessionService')
        private examSessionService: ExamSessionServiceMethods
    ) {}

    startExamForStudent = async (req: Request, res: Response) => {
        try {
            const {
                studentId,
                examSchedulingId,
                createdBy,
                totalQuestions,
                startedAt,
            } = req.body
            const missingFields = [
                'studentId',
                'examSchedulingId',
                'createdBy',
                'totalQuestions',
                'startedAt',
            ].filter((field) => !req.body[field])

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${missingFields.join(', ')}`,
                    400
                )
            }

            const examSessionDTO = new ExamSessionDTO(
                ExamSessionStatus.IN_PROGRESS,
                studentId,
                examSchedulingId,
                totalQuestions,
                createdBy,
                startedAt
            )
            const examSessionResult =
                await this.examSessionService.startExamForStudent(
                    examSessionDTO
                )
            if (
                examSessionResult.status ===
                ExamSessionQuestionStatus.ALREADY_IN_PROGRESS
            ) {
                return sendSuccess(
                    res,
                    'Already In Progress',
                    examSessionResult,
                    200
                )
            }

            if (examSessionResult.status !== Status.SUCCESS) {
                return sendError(res, `${ERORR_MESSAGES.SERVER}`, 500)
            }
            return sendSuccess(res, 'Exam started', examSessionResult, 201)
        } catch (err) {
            console.log(err, 'error')

            return sendError(res, `${ERORR_MESSAGES.SERVER}`, 500)
        }
    }
    getStudentByExamStatus = async (req: Request, res: Response) => {
        try {
            const pagination = getPagination(req.query)

            const search =
                typeof req.query.search === 'string'
                    ? req.query.search
                    : undefined

            const date =
                typeof req.query.date === 'string' ? req.query.date : undefined
            const result = await this.examSessionService.getStudentByExamStatus(
                {
                    ...pagination,
                    search,
                    date,
                }
            )
            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    submitExamSession = async (req: Request, res: Response) => {
        try {
            const updatedBy =
                req.session.user?.userType === ROLE.STUDENT
                    ? req.session.user?.userId
                    : null
            const { examSessionId, submittedAt } = req.body
            const missingFields = ['examSessionId', 'submittedAt'].filter(
                (field) => !req.body[field]
            )

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${missingFields.join(', ')}`,
                    400
                )
            }

            const submitExamSessionDTO = new SubmitExamSessionDTO(
                examSessionId,
                submittedAt,
                updatedBy!
            )
            const result =
                await this.examSessionService.submitExamSession(
                    submitExamSessionDTO
                )

            return sendSuccess(res, SUCCESS_MESSAGES.CREATED, result, 200)
        } catch (err) {
            console.log(err)

            return sendError(res, `${ERORR_MESSAGES.SERVER}`, 500)
        }
    }

    getScore = async (req: Request, res: Response) => {
        try {
            const sessionId = Number(req.query.sessionId)

            if (!sessionId || isNaN(sessionId)) {
                return sendError(res, 'Invalid sessionId', 400)
            }
            const result = await this.examSessionService.getScore(
                Number(sessionId)
            )

            return sendSuccess(res, `${SUCCESS_MESSAGES.FETCHED}`, result, 200)
        } catch (err) {
            console.log(err)

            return sendError(res, `${ERORR_MESSAGES.SERVER}`, 500)
        }
    }
    checkStudentEligibility = async (req: Request, res: Response) => {
        try {
            const studentId = Number(req.params.studentId)

            if (!studentId || isNaN(studentId)) {
                return sendError(res, 'studentId is required', 400)
            }

            const result =
                await this.examSessionService.checkStudentEligibility(studentId)
            return sendSuccess(res, result.message, result, 200)
        } catch (err) {
            console.log(err)
            return sendError(res, `${ERORR_MESSAGES.SERVER}`, 500)
        }
    }

    getSuspendedStudents = async (req: Request, res: Response) => {
        try {
            const pagination = getPagination(req.query)
            const search =
                typeof req.query.search === 'string'
                    ? req.query.search
                    : undefined

            const result = await this.examSessionService.getSuspendedStudents({
                ...pagination,
                search,
            })
            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result, 200)
        } catch (err) {
            console.log(err)
            return sendError(res, ERORR_MESSAGES.SERVER, 500)
        }
    }
    allowReAttempt = async (req: Request, res: Response) => {
        try {
            const sessionId = Number(req.params.sessionId)

            if (!sessionId || isNaN(sessionId)) {
                return sendError(res, 'sessionId is required', 400)
            }

            const result =
                await this.examSessionService.allowReAttempt(sessionId)

            if (!result.success) {
                return sendError(res, result.message, 404)
            }

            return sendSuccess(res, result.message, result, 200)
        } catch (err) {
            console.log(err)
            return sendError(res, ERORR_MESSAGES.SERVER, 500)
        }
    }
    allowResetSession = async (req: Request, res: Response) => {
        try {
            const sessionId = Number(req.params.sessionId)

            if (!sessionId || isNaN(sessionId)) {
                return sendError(res, 'sessionId is required', 400)
            }

            const result =
                await this.examSessionService.allowResetSession(sessionId)

            if (!result.success) {
                return sendError(res, result.message, 404)
            }

            return sendSuccess(res, result.message, result, 200)
        } catch (err) {
            console.log(err)
            return sendError(res, ERORR_MESSAGES.SERVER, 500)
        }
    }
}
