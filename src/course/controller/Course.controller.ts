import { inject, injectable } from 'tsyringe'
import { Request, Response } from 'express'

import { CourseServiceMethods } from '../service/Course.serviceInterface'
import { CourseResult, CourseStatus } from '../types/Course.types'
import { CourseDTO } from './Course.DTO'
import { UpdateCourseDTO } from './UpdateCourse.DTO'
import { ERORR_MESSAGES } from '../../constant/Error.message'
import { Status } from '../../constant/Result.types'
import { SUCCESS_MESSAGES } from '../../constant/Success.message'
import { DataSanitize } from '../../utils/DataSanitize'
import { getPagination } from '../../utils/pagination'
import { sendError, sendSuccess } from '../../utils/Response'

const REQUIRED = [
    'name',
    'courseCode',
    'durationInMonths',
    'durationInHrs',
    'courseCategoryId',
]
const isBlank = (v: unknown) =>
    v === undefined || v === null || String(v).trim() === ''

// Description is free text and goes through parameterised SQL, so it is not run
// through DataSanitize (that would reject normal words like "update"/"select").
const cleanDescription = (v: unknown): string | null => {
    if (typeof v !== 'string') return null
    const text = v.replace(/<[^>]*>/g, '').trim().slice(0, 5000)
    return text === '' ? null : text
}

const positiveInt = (v: unknown): number | null => {
    const n = Number(v)
    return Number.isInteger(n) && n > 0 ? n : null
}

@injectable()
export class CourseController {
    constructor(
        @inject('CourseService') private service: CourseServiceMethods
    ) {}

    // returns an error message, or the parsed common fields
    private parseBody(body: Record<string, unknown>, userKey: string) {
        const miss = [...REQUIRED, userKey].filter((f) => isBlank(body[f]))
        if (miss.length) {
            return {
                error: `${ERORR_MESSAGES.MISSING_FIELD}: ${miss.join(', ')}`,
            }
        }
        let clean
        try {
            clean = DataSanitize({
                name: body.name,
                courseCode: body.courseCode,
                user: body[userKey],
            })
        } catch {
            return { error: ERORR_MESSAGES.INVALID_INPUT }
        }
        const durationInMonths = positiveInt(body.durationInMonths)
        const durationInHrs = positiveInt(body.durationInHrs)
        const courseCategoryId = positiveInt(body.courseCategoryId)
        if (!durationInMonths || !durationInHrs || !courseCategoryId) {
            return { error: ERORR_MESSAGES.INVALID_INPUT }
        }
        return {
            fields: {
                name: clean.name as string,
                courseCode: clean.courseCode as string,
                user: clean.user as string,
                description: cleanDescription(body.description),
                durationInMonths,
                durationInHrs,
                courseCategoryId,
                isActive:
                    body.isActive === undefined
                        ? 1
                        : Number(body.isActive) === 0
                          ? 0
                          : 1,
            },
        }
    }

    private replyWriteError(res: Response, result: CourseResult) {
        switch (result.status) {
            case Status.NAME_ALREADY_EXIST:
                return sendError(
                    res,
                    `Course name ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
            case CourseStatus.CODE_ALREADY_EXIST:
                return sendError(
                    res,
                    `Course code ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
            case CourseStatus.CATEGORY_NOT_EXIST:
                return sendError(res, 'Selected course category not found', 400)
            case Status.NAME_NOT_EXIST:
                return sendError(res, `Course ${ERORR_MESSAGES.NOT_FOUND}`, 404)
            default:
                return null
        }
    }

    addCourse = async (req: Request, res: Response) => {
        try {
            const parsed = this.parseBody(req.body, 'createdBy')
            if (!parsed.fields) return sendError(res, parsed.error!, 400)
            const f = parsed.fields

            const result = await this.service.addCourse(
                new CourseDTO(
                    f.name,
                    f.courseCode,
                    f.description,
                    f.durationInMonths,
                    f.durationInHrs,
                    f.courseCategoryId,
                    f.isActive,
                    f.user
                )
            )
            const err = this.replyWriteError(res, result)
            if (err) return err
            return sendSuccess(res, SUCCESS_MESSAGES.CREATED, result, 201)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    updateCourse = async (req: Request, res: Response) => {
        try {
            const id = positiveInt(req.body.id)
            if (!id) return sendError(res, `${ERORR_MESSAGES.MISSING_FIELD}: id`, 400)
            const parsed = this.parseBody(req.body, 'updatedBy')
            if (!parsed.fields) return sendError(res, parsed.error!, 400)
            const f = parsed.fields

            const result = await this.service.updateCourse(
                new UpdateCourseDTO(
                    id,
                    f.name,
                    f.courseCode,
                    f.description,
                    f.durationInMonths,
                    f.durationInHrs,
                    f.courseCategoryId,
                    f.isActive,
                    f.user
                )
            )
            const err = this.replyWriteError(res, result)
            if (err) return err
            return sendSuccess(res, SUCCESS_MESSAGES.UPDATED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    getCourse = async (req: Request, res: Response) => {
        try {
            const search =
                typeof req.query.search === 'string'
                    ? req.query.search.trim().slice(0, 100)
                    : undefined
            const courseCategoryId =
                positiveInt(req.query.courseCategoryId) ?? undefined

            const result = await this.service.getCourse({
                ...getPagination(req.query),
                search: search || undefined,
                courseCategoryId,
            })
            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    deleteCourse = async (req: Request, res: Response) => {
        try {
            const id = positiveInt(req.body.id)
            if (!id || isBlank(req.body.deletedBy)) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: id, deletedBy`,
                    400
                )
            }
            let deletedBy: string
            try {
                ;({ deletedBy } = DataSanitize({
                    deletedBy: req.body.deletedBy,
                }))
            } catch {
                return sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
            }

            const result = await this.service.deleteCourse(id, deletedBy)
            const err = this.replyWriteError(res, result)
            if (err) return err
            return sendSuccess(res, SUCCESS_MESSAGES.DELETED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
