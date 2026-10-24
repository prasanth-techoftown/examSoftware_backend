import { inject, injectable } from 'tsyringe'
import { Request, Response } from 'express'

import { CourseCategoryServiceMethods } from '../service/CourseCategory.serviceInterface'
import { CourseCategoryStatus } from '../types/CourseCategory.types'
import { CourseCategoryDTO } from './CourseCategory.DTO'
import { UpdateCourseCategoryDTO } from './UpdateCourseCategory.DTO'
import { ERORR_MESSAGES } from '../../constant/Error.message'
import { Status } from '../../constant/Result.types'
import { SUCCESS_MESSAGES } from '../../constant/Success.message'
import { DataSanitize } from '../../utils/DataSanitize'
import { getPagination } from '../../utils/pagination'
import { sendError, sendSuccess } from '../../utils/Response'

const missing = (body: Record<string, unknown>, fields: string[]) =>
    fields.filter((f) => !body[f])

@injectable()
export class CourseCategoryController {
    constructor(
        @inject('CourseCategoryService')
        private service: CourseCategoryServiceMethods
    ) {}

    addCourseCategory = async (req: Request, res: Response) => {
        try {
            const miss = missing(req.body, ['name', 'createdBy'])
            if (miss.length) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${miss.join(', ')}`,
                    400
                )
            }

            let { name, createdBy } = req.body
            try {
                ;({ name, createdBy } = DataSanitize({ name, createdBy }))
            } catch {
                return sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
            }

            const result = await this.service.addCourseCategory(
                new CourseCategoryDTO(name, createdBy)
            )
            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    `Course category ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
            }
            return sendSuccess(res, SUCCESS_MESSAGES.CREATED, result, 201)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    updateCourseCategory = async (req: Request, res: Response) => {
        try {
            const miss = missing(req.body, ['id', 'name', 'updatedBy'])
            if (miss.length) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${miss.join(', ')}`,
                    400
                )
            }

            let { id, name, updatedBy } = req.body
            try {
                ;({ id, name, updatedBy } = DataSanitize({
                    id,
                    name,
                    updatedBy,
                }))
            } catch {
                return sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
            }

            const result = await this.service.updateCourseCategory(
                new UpdateCourseCategoryDTO(Number(id), name, updatedBy)
            )
            if (result.status === Status.NAME_NOT_EXIST) {
                return sendError(res, `Course category ${ERORR_MESSAGES.NOT_FOUND}`, 404)
            }
            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    `Course category ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
            }
            return sendSuccess(res, SUCCESS_MESSAGES.UPDATED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    getCourseCategory = async (req: Request, res: Response) => {
        try {
            const result = await this.service.getCourseCategory(
                getPagination(req.query)
            )
            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    deleteCourseCategory = async (req: Request, res: Response) => {
        try {
            const miss = missing(req.body, ['id', 'deletedBy'])
            if (miss.length) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${miss.join(', ')}`,
                    400
                )
            }

            let { id, deletedBy } = req.body
            try {
                ;({ id, deletedBy } = DataSanitize({ id, deletedBy }))
            } catch {
                return sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
            }

            const result = await this.service.deleteCourseCategory(
                Number(id),
                deletedBy
            )
            if (result.status === Status.NAME_NOT_EXIST) {
                return sendError(res, `Course category ${ERORR_MESSAGES.NOT_FOUND}`, 404)
            }
            if (result.status === CourseCategoryStatus.IN_USE) {
                return sendError(
                    res,
                    'Courses are still using this category. Move them to another category first.',
                    400
                )
            }
            return sendSuccess(res, SUCCESS_MESSAGES.DELETED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
