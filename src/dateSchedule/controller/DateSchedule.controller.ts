import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'
import { sendError, sendSuccess } from '../../utils/Response'
import { ERORR_MESSAGES } from '../../constant/Error.message'
import { SUCCESS_MESSAGES } from '../../constant/Success.message'
import { DataSanitize } from '../../utils/DataSanitize'
import { Status } from '../../constant/Result.types'
import { DateScheduleServiceMethods } from '../service/DateSchedule.serviceInterface'
import { DateScheduleDTO } from './DateSchedule.DTO'
import {
    DateScheduleItem,
    DateScheduleRequestItem,
} from '../types/DateSchedule.types'

@injectable()
export class DateScheduleController {
    constructor(
        @inject('DateScheduleService')
        private DateScheduleService: DateScheduleServiceMethods
    ) {}

    addDateSchedule = async (req: Request, res: Response) => {
        try {
            let { DateSchedule, createdBy, toRemove } = req.body
            const missingFields = ['DateSchedule', 'createdBy'].filter(
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
                ;({ DateSchedule, createdBy, toRemove } = DataSanitize({
                    DateSchedule,
                    createdBy,
                    toRemove,
                }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)

                return
            }

            const normalized: DateScheduleItem[] = DateSchedule.map(
                (item: DateScheduleRequestItem) => ({
                    year: Number(item.year),
                    month: Number(item.month),
                    dates: item.dates.map((d: string) => Number(d)),
                })
            )
            const data = new DateScheduleDTO(normalized, createdBy, toRemove)

            const result = await this.DateScheduleService.addDateSchedule(data)

            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    ` Date ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
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

    getAllDateSchedule = async (req: Request, res: Response) => {
        try {
            const year =
                typeof req.query.year === 'string' ? req.query.year : undefined

            const result = await this.DateScheduleService.getAllDateSchedule(
                year!
            )

            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
