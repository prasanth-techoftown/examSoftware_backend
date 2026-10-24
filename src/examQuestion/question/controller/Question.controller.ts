import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'
import { sendError, sendSuccess } from '../../../utils/Response'
import { ERORR_MESSAGES } from '../../../constant/Error.message'
import { DataSanitize } from '../../../utils/DataSanitize'
import { SUCCESS_MESSAGES } from '../../../constant/Success.message'
import { QuestionServiceMethods } from '../service/Question.serviceInterface'
import { QuestionDTO } from './Question.DTO'
import { UpdateQuestionDTO } from './UpdateQuestion.DTO'
import { getPagination } from '../../../utils/pagination'
import { Status } from '../../../constant/Result.types'
@injectable()
export class QuestionController {
    constructor(
        @inject('QuestionService')
        private QuestionService: QuestionServiceMethods
    ) {}

    addQuestion = async (req: Request, res: Response) => {
        try {
            let { courseId, inputMode, questions, createdBy } = req.body
            const missingFields = [
                'courseId',
                'inputMode',
                'questions',
                'createdBy',
            ].filter((field) => !req.body[field])

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD} ${missingFields.join(', ')}`,
                    400
                )
            }
            try {
                ;({ courseId, inputMode, questions } = DataSanitize({
                    courseId,
                    inputMode,
                    questions,
                }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)

                return
            }

            const questionDTO = new QuestionDTO(
                courseId,
                inputMode,
                questions,
                createdBy
            )
            const result = await this.QuestionService.addQuestion(
                questionDTO
                // courseDTO
            )

            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    `This question ${result.question} ${ERORR_MESSAGES.DUPLICATE_ENTRY} `,
                    400,
                    { duplicates: result.question }
                )
            }
            if (result.status !== Status.SUCCESS) {
                return sendError(res, ERORR_MESSAGES.SERVER, 400)
            }
            return sendSuccess(res, SUCCESS_MESSAGES.CREATED, {
                Question: result,
            })
        } catch (error: any) {
            if (error.details) {
                return sendError(
                    res,
                    error.message,
                    error.statusCode || 400,
                    error.details
                )
            }
            return sendError(res, error.message || ERORR_MESSAGES.SERVER, 500)
        }
    }

    getAllQuestion = async (req: Request, res: Response) => {
        try {
            const pagination = getPagination(req.query)

            const courseId = req.query.courseId
                ? Number(req.query.courseId)
                : undefined

            const result = await this.QuestionService.getAllQuestion(
                {
                    ...pagination,
                },
                courseId as number
            )

            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    updateQuestion = async (req: Request, res: Response) => {
        try {
            let { id, options, courseId, question, updatedBy } = req.body

            const missingFields = ['id', 'updatedBy'].filter(
                (field) => !req.body[field]
            )

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD} ${missingFields.join(', ')}`,
                    400
                )
            }
            try {
                ;({ id, question, updatedBy } = DataSanitize({
                    id,
                    question,
                    updatedBy,
                }))
            } catch (error) {
                console.log(error, 'sanitize error')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)

                return
            }
            const updateQuestionDTO = new UpdateQuestionDTO(
                id,
                updatedBy,
                question,
                options,
                courseId
            )
            const result =
                await this.QuestionService.updateQuestion(updateQuestionDTO)

            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    `This question ${result.question} ${ERORR_MESSAGES.DUPLICATE_ENTRY} `,
                    400
                )
            }
            if (result.status !== Status.SUCCESS) {
                return sendError(res, ERORR_MESSAGES.SERVER, 400)
            }
            return sendSuccess(res, SUCCESS_MESSAGES.UPDATED, {
                Question: result,
            })
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    deleteQuestion = async (req: Request, res: Response) => {
        try {
            let { id, deletedBy } = req.body

            const missingFields = ['id', 'deletedBy'].filter(
                (field) => !req.body[field]
            )

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD} ${missingFields.join(', ')}`,
                    400
                )
            }
            const result = await this.QuestionService.deleteQuestion(
                id,
                deletedBy
            )

            return sendSuccess(res, SUCCESS_MESSAGES.DELETED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
