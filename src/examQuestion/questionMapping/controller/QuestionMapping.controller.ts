import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'
import { sendError, sendSuccess } from '../../../utils/Response'
import { ERORR_MESSAGES } from '../../../constant/Error.message'
import { SUCCESS_MESSAGES } from '../../../constant/Success.message'
import { QuestionMappingServiceMethods } from '../service/QuestionMapping.serviceInterface'
import { DataSanitize } from '../../../utils/DataSanitize'
import { QuestionMappingDTO } from './QuestionMapping.DTO'
import { Status } from '../../../constant/Result.types'
import { getPagination } from '../../../utils/pagination'
import { UpdateQuestionMappingDTO } from './UpdateQuestionMapping.DTO'
import { SubjectInput } from '../types/QuestionMapping.types'

@injectable()
export class QuestionMappingController {
    constructor(
        @inject('QuestionMappingService')
        private courseService: QuestionMappingServiceMethods
    ) {}

    addQuestionMapping = async (req: Request, res: Response) => {
        try {
            const {
                crmCourseId,
                subject,
                courseTotalQuestion,
                createdBy,
                time,
            } = req.body

            const missingFields = [
                'crmCourseId',
                'subject',
                'createdBy',
                'courseTotalQuestion',
                'time',
            ].filter((field) => !req.body[field])

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD} ${missingFields.join(', ')}`,
                    400
                )
            }

            let sanitizedData
            try {
                sanitizedData = DataSanitize({
                    crmCourseId,
                    subject,
                    courseTotalQuestion,
                    createdBy,
                    time,
                })
            } catch (sanitizeError) {
                console.log(sanitizeError, 'sanitizeError')
                return sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
            }

            const totalSubjectQuestions = sanitizedData.subject.reduce(
                (sum: number, item: SubjectInput) =>
                    sum + (item.subjectTotalQuestion || 0),
                0
            )

            if (totalSubjectQuestions !== sanitizedData.courseTotalQuestion) {
                return sendError(
                    res,
                    `The total of subject questions (${totalSubjectQuestions}) does not match total of course questions (${sanitizedData.courseTotalQuestion})`,
                    400
                )
            }

            const dto = new QuestionMappingDTO(
                sanitizedData.crmCourseId,
                sanitizedData.subject,
                sanitizedData.courseTotalQuestion,
                sanitizedData.createdBy,
                sanitizedData.time
            )

            const result = await this.courseService.addQuestionMapping(dto)

            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(res, `Course    already exist`, 400)
            }
            if (result.status !== Status.SUCCESS) {
                return sendError(res, ERORR_MESSAGES.SERVER, 400)
            }

            return sendSuccess(res, SUCCESS_MESSAGES.CREATED)
        } catch (error) {
            console.log(error, 'error')
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    getQuestionMapping = async (req: Request, res: Response) => {
        try {
            const pagination = getPagination(req.query)

            const search =
                typeof req.query.search === 'string'
                    ? req.query.search
                    : undefined

            const result = await this.courseService.getQuestionMapping({
                ...pagination,
                search,
            })

            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    getExistingCrmCourse = async (req: Request, res: Response) => {
        try {
            const result = await this.courseService.getExistingCrmCourse()

            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    updateQuestionMapping = async (req: Request, res: Response) => {
        try {
            const {
                id,
                crmCourseId,
                subject,
                courseTotalQuestion,
                updatedBy,
                time,
            } = req.body

            const missingFields = [
                'crmCourseId',
                'subject',
                'updatedBy',
            ].filter((field) => !req.body[field])
            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD} ${missingFields.join(', ')}`,
                    400
                )
            }

            let sanitizedData
            try {
                sanitizedData = DataSanitize({
                    id,
                    crmCourseId,
                    subject,
                    courseTotalQuestion,
                    updatedBy,
                    time,
                })
            } catch (err) {
                console.log(err)
                return sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
            }
            const totalSubjectQuestions = sanitizedData.subject.reduce(
                (sum: number, item: SubjectInput) =>
                    sum + (item.subjectTotalQuestion || 0),
                0
            )
            if (totalSubjectQuestions !== sanitizedData.courseTotalQuestion) {
                return sendError(
                    res,
                    `The total of subject questions (${totalSubjectQuestions}) does not match total of course questions (${sanitizedData.courseTotalQuestion})`,
                    400
                )
            }

            const dto = new UpdateQuestionMappingDTO(
                sanitizedData.id,
                sanitizedData.crmCourseId,
                sanitizedData.subject,
                sanitizedData.courseTotalQuestion,
                sanitizedData.updatedBy,
                sanitizedData.time
            )

            await this.courseService.updateQuestionMapping(dto)

            return sendSuccess(res, SUCCESS_MESSAGES.UPDATED)
        } catch (error) {
            console.log(error)
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
