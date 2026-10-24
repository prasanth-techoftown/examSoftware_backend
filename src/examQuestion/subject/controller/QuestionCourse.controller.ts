import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'
import { sendError, sendSuccess } from '../../../utils/Response'
import { ERORR_MESSAGES } from '../../../constant/Error.message'
import { getPagination } from '../../../utils/pagination'
import { SUCCESS_MESSAGES } from '../../../constant/Success.message'
import { QuestionCourseServiceMethods } from '../service/QuestionCourse.serviceInterface'
import { DataSanitize } from '../../../utils/DataSanitize'
import { QuestionCourseDTO } from './QuestionCourse.DTO'
import { Status } from '../../../constant/Result.types'
import { UpdateQuestionCourseDTO } from './QuestionStudentCourse.DTO'

@injectable()
export class QuestionCourseController {
    constructor(
        @inject('QuestionCourseService')
        private courseService: QuestionCourseServiceMethods
    ) {}

    addCourse = async (req: Request, res: Response) => {
        try {
            let {
                name,

                createdBy,
            } = req.body
            const missingFields = ['name', 'createdBy'].filter(
                (field) =>
                    req.body[field] === null || req.body[field] === undefined
            )

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing fields: ${missingFields.join(', ')}`,
                })
            }

            try {
                ;({
                    name,

                    createdBy,
                } = DataSanitize({
                    name,

                    createdBy,
                }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)

                return
            }

            const data = new QuestionCourseDTO(
                name,

                createdBy
            )

            const result = await this.courseService.addCourse(data)

            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    `Course Name ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
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

    getAllCourse = async (req: Request, res: Response) => {
        try {
            const pagination = getPagination(req.query)

            const search =
                typeof req.query.search === 'string'
                    ? req.query.search
                    : undefined

            const result = await this.courseService.getAllCourse({
                ...pagination,
                search,
            })

            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    updateCourse = async (req: Request, res: Response) => {
        try {
            let {
                id,
                name,

                updatedBy,
            } = req.body

            const missingFields = ['id', 'updatedBy'].filter(
                (field) =>
                    req.body[field] === undefined ||
                    req.body[field] === null ||
                    req.body[field] === ''
            )

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD} ${missingFields.join(', ')}`,
                    400
                )
            }

            const data = new UpdateQuestionCourseDTO(
                id,

                name,

                updatedBy
            )
            const result = await this.courseService.updateCourse(data)

            if (result.status === Status.NAME_NOT_EXIST) {
                return sendError(res, `Course ${Status.NAME_NOT_EXIST}`, 404)
            }

            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    `Course Name ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
            }

            return sendSuccess(res, SUCCESS_MESSAGES.UPDATED, {
                course: result,
            })
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
