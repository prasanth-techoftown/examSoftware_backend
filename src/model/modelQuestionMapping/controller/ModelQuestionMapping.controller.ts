import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'
import { sendError, sendSuccess } from '../../../utils/Response'
import { ERORR_MESSAGES } from '../../../constant/Error.message'
import { SUCCESS_MESSAGES } from '../../../constant/Success.message'

import { DataSanitize } from '../../../utils/DataSanitize'

import { Status } from '../../../constant/Result.types'
import { getPagination } from '../../../utils/pagination'
import { ModelQuestionMappingServiceMethods } from '../service/ModelQuestionMapping.serviceInterface'
import { SubjectInput } from '../types/ModelQuestionMapping.types'
import { ModelQuestionMappingDTO } from './ModelQuestionMapping.DTO'
import { UpdateModelQuestionMappingDTO } from './UpdateModelQuestionMapping.DTO'

@injectable()
export class ModelQuestionMappingController {
    constructor(
        @inject('ModelQuestionMappingService')
        private courseService: ModelQuestionMappingServiceMethods
    ) {}

    addModelQuestionMapping = async (req: Request, res: Response) => {
        try {
            const { titleId, subject, courseTotalQuestion, createdBy, time } =
                req.body

            const missingFields = [
                'titleId',
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
                    titleId,
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

            const dto = new ModelQuestionMappingDTO(
                sanitizedData.titleId,
                sanitizedData.subject,
                sanitizedData.courseTotalQuestion,
                sanitizedData.createdBy,
                sanitizedData.time
            )

            const result = await this.courseService.addModelQuestionMapping(dto)

            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(res, `Course already exist`, 400)
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

    getModelQuestionMapping = async (req: Request, res: Response) => {
        try {
            const pagination = getPagination(req.query)

            const search =
                typeof req.query.search === 'string'
                    ? req.query.search
                    : undefined

            const result = await this.courseService.getModelQuestionMapping({
                ...pagination,
                search,
            })

            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    updateModelQuestionMapping = async (req: Request, res: Response) => {
        try {
            const {
                id,
                titleId,
                subject,
                courseTotalQuestion,
                updatedBy,
                time,
            } = req.body

            const missingFields = ['titleId', 'subject', 'updatedBy'].filter(
                (field) => !req.body[field]
            )
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
                    titleId,
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

            const dto = new UpdateModelQuestionMappingDTO(
                sanitizedData.id,
                sanitizedData.titleId,
                sanitizedData.subject,
                sanitizedData.courseTotalQuestion,
                sanitizedData.updatedBy,
                sanitizedData.time
            )

            await this.courseService.updateModelQuestionMapping(dto)

            return sendSuccess(res, SUCCESS_MESSAGES.UPDATED)
        } catch (error) {
            console.log(error)
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
