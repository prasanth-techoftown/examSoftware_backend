import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'
import { sendError, sendSuccess } from '../../../utils/Response'
import { ERORR_MESSAGES } from '../../../constant/Error.message'
import { getPagination } from '../../../utils/pagination'
import { SUCCESS_MESSAGES } from '../../../constant/Success.message'
import { DataSanitize } from '../../../utils/DataSanitize'
import { Status } from '../../../constant/Result.types'
import { SchedulingDTO } from './Scheduling.DTO'
import { SchedulingServiceMethods } from '../service/Scheduling.serviceInterface'
import { SelectedStudent } from '../types/Scheduling.types'

@injectable()
export class SchedulingController {
    constructor(
        @inject('SchedulingService')
        private schedulingService: SchedulingServiceMethods
    ) {}

    addScheduling = async (req: Request, res: Response) => {
        try {
            let { examDate, selected, createdBy } = req.body

            if (
                !examDate ||
                !createdBy ||
                !Array.isArray(selected) ||
                selected.length === 0
            ) {
                return sendError(res, 'Missing required fields', 400)
            }
            let sanitizedSelected: SelectedStudent[] = selected.map((item) => ({
                studentId: item.studentId,
                examRequestId: item.examRequestId,
            }))
            try {
                ;({ examDate, sanitizedSelected, createdBy } = DataSanitize({
                    examDate,
                    sanitizedSelected,
                    createdBy,
                }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)

                return
            }

            const data = new SchedulingDTO(
                examDate,
                sanitizedSelected,
                createdBy
            )

            const result = await this.schedulingService.addScheduling(data)

            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    `Scheduling ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
            }
            if (result.status !== Status.SUCCESS) {
                return sendError(res, ERORR_MESSAGES.SERVER, 400)
            }

            return sendSuccess(res, SUCCESS_MESSAGES.CREATED)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    getAllScheduling = async (req: Request, res: Response) => {
        try {
            const pagination = getPagination(req.query)

            const search =
                typeof req.query.search === 'string'
                    ? req.query.search
                    : undefined
            const status =
                typeof req.query.status === 'string'
                    ? req.query.status
                    : undefined
            const result = await this.schedulingService.getAllScheduling(
                {
                    ...pagination,
                    search,
                },
                status!
            )
            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
