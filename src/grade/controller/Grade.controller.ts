import { injectable, inject } from 'tsyringe'
import { GradeServiceMethods } from '../service/Grade.serviceInterface'
import { Request, Response } from 'express'
import { DataSanitize } from '../../utils/DataSanitize'
import { GradeDTO } from './Grade.DTO'
import { UpdateGradeDTO } from './UpdateGrade.DTO'
import { sendError, sendSuccess } from '../../utils/Response'
import { ERORR_MESSAGES } from '../../constant/Error.message'
import { SUCCESS_MESSAGES } from '../../constant/Success.message'
import { getPagination } from '../../utils/pagination'
import { Status } from '../../constant/Result.types'
import { GradeStatus } from '../types/Grade.types'

@injectable()
export class GradeController {
    constructor(
        @inject('GradeService') private moduleService: GradeServiceMethods
    ) {}

    addGrade = async (req: Request, res: Response) => {
        try {
            let { grade, minRange, maxRange, createdBy } = req.body

            const missingFields = [
                'grade',
                'minRange',
                'maxRange',
                'createdBy',
            ].filter((field) => !req.body[field])

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${missingFields.join(', ')}`,
                    400
                )
            }
            try {
                ;({ grade, minRange, maxRange, createdBy } = DataSanitize({
                    grade,
                    minRange,
                    maxRange,
                    createdBy,
                }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
                return
            }

            const module = new GradeDTO(grade, minRange, maxRange, createdBy)

            const result = await this.moduleService.addGrade(module)
            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    `Grade ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
            }

            if (result.status === GradeStatus.INVALID_RANGE) {
                return sendError(res, GradeStatus.INVALID_RANGE, 400)
            }

            if (result.status === GradeStatus.RANGE_ALREADY_EXIST) {
                return sendError(
                    res,
                    `Range ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
            }

            return sendSuccess(res, SUCCESS_MESSAGES.CREATED, result, 201)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    updateGrade = async (req: Request, res: Response) => {
        try {
            let { id, grade, minRange, maxRange, updatedBy } = req.body

            const missingFields = ['id', 'updatedBy'].filter(
                (field) => !req.body[field]
            )

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${missingFields.join(', ')}`,
                    400
                )
            }

            try {
                ;({ id, grade, minRange, maxRange, updatedBy } = DataSanitize({
                    id,
                    grade,
                    minRange,
                    maxRange,
                    updatedBy,
                }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)

                return
            }

            const updateGrade = new UpdateGradeDTO(
                id,
                grade,
                minRange,
                maxRange,
                updatedBy
            )

            const result = await this.moduleService.updateGrade(updateGrade)
            if (result.status === Status.NAME_NOT_EXIST) {
                return sendError(res, `Grade ${Status.NAME_NOT_EXIST}`, 404)
            }
            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    `Grade ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
            }

            if (result.status === GradeStatus.INVALID_RANGE) {
                return sendError(res, GradeStatus.INVALID_RANGE, 400)
            }

            if (result.status === GradeStatus.RANGE_ALREADY_EXIST) {
                return sendError(
                    res,
                    `Range ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
            }

            return sendSuccess(res, SUCCESS_MESSAGES.UPDATED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    getGrades = async (req: Request, res: Response) => {
        try {
            const pagination = getPagination(req.query)

            const Grades = await this.moduleService.getGrade(pagination)
            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, Grades)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
