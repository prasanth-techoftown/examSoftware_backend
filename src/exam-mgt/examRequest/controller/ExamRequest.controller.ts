import { injectable, inject } from 'tsyringe'
import { ExamRequestServiceMethods } from '../service/ExamRequest.serviceInterface'
import { Request, Response } from 'express'
import { sendError, sendSuccess } from '../../../utils/Response'
import { ERORR_MESSAGES } from '../../../constant/Error.message'
import { DataSanitize } from '../../../utils/DataSanitize'
import { ExamRequestDTO } from './ExamRequest.DTO'
import { Status } from '../../../constant/Result.types'
import { SUCCESS_MESSAGES } from '../../../constant/Success.message'
import { getPagination } from '../../../utils/pagination'
import { UpdateExamRequestDTO } from './UpdateExamRequest.DTO'
import { AppError } from '../../../constant/App.error'

@injectable()
export class ExamRequestController {
    constructor(
        @inject('ExamRequestService')
        private examRequestService: ExamRequestServiceMethods
    ) {}

    addExamRequest = async (req: Request, res: Response) => {
        try {
            console.log(req.body,"req");
            
            let { studentId, examDate, date, time, createdBy } = req.body

            const missingFields = [
                'studentId',
                'examDate',
                'date',
                'time',
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
                ;({ studentId, examDate, date, time, createdBy } =
                    DataSanitize({
                        studentId,
                        examDate,
                        date,
                        time,
                        createdBy,
                    }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitize error')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
                return
            }

            const examData = studentId.map(
                (id: number) =>
                    new ExamRequestDTO(id, examDate, date, time, createdBy)
            )

            const result =
                await this.examRequestService.addExamRequest(examData)
            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    `This student is already requested to exam`,
                    400
                )
            }

            return sendSuccess(res, SUCCESS_MESSAGES.CREATED, result.exam, 201)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
    updateExamRequest = async (req: Request, res: Response) => {
        try {
            let {
                id,
                studentId,
                status,
                updatedBy,
                date,
                time,
                reason,
                examDate,
            } = req.body

            const missingFields = [
                'id',
                'studentId',
                'date',
                'time',
                'status',
                'examDate',
                'updatedBy',
            ].filter((field) => !req.body[field])

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${missingFields.join(', ')}`,
                    400
                )
            }

            if (reason && reason.length > 255) {
                return sendError(res, `Reason must be 255 characters`, 400)
            }
            try {
                ;({ id, studentId, status, reason, updatedBy } = DataSanitize(
                    { id, studentId, status, reason, updatedBy }
                ))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitize error')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
                return
            }

            const examData = new UpdateExamRequestDTO(
                id,
                studentId,
                status,
                updatedBy,
                date,
                time,
                examDate,
                reason
            )

            const result =
                await this.examRequestService.updateExamRequest(examData)
            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    `ExamRequest ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
            }

            return sendSuccess(res, SUCCESS_MESSAGES.UPDATED, result.exam, 201)
        } catch (error) {
            console.log(error, 'error')

            if (error instanceof AppError) {
                return sendError(res, error.message)
            }

            return sendError(res, ERORR_MESSAGES.SERVER, 500)
        }
    }

    getExamRequests = async (req: Request, res: Response) => {
        try {
            const pagination = getPagination(req.query)
            const search =
                typeof req.query.search === 'string'
                    ? req.query.search
                    : undefined
            const ExamRequests = await this.examRequestService.getExamRequests({
                ...pagination,
                search,
            })

            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, ExamRequests)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    getStudentByStatus = async (req: Request, res: Response) => {
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
            const getStudent = await this.examRequestService.getStudentByStatus(
                { ...pagination, search },
                status!
            )

            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, getStudent)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    getStudentByStatusForBranch = async (req: Request, res: Response) => {
        try {
            const branchId = req.params.branchId
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 2
            const offset = (page - 1) * limit
            const search =
                typeof req.query.search === 'string'
                    ? req.query.search
                    : undefined
            const status =
                typeof req.query.status === 'string'
                    ? req.query.status
                    : undefined
            const result =
                await this.examRequestService.getStudentByStatusForBranch(
                    String(branchId),
                    {
                        limit,
                        offset,
                        search,
                    },
                    status!
                )

            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    getExamRequestStudentsForBranch = async (req: Request, res: Response) => {
        try {
            const branchId = req.params.branchId
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 2
            const offset = (page - 1) * limit
            const search =
                typeof req.query.search === 'string'
                    ? req.query.search
                    : undefined

            const result =
                await this.examRequestService.getExamRequestStudentsForBranch(
                    String(branchId),
                    {
                        limit,
                        offset,
                        search,
                    }
                )

            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
