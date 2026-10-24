import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'
import { StudentServiceMethods } from '../service/Student.serviceInterface'
import { getPagination } from '../../../utils/pagination'
import { SUCCESS_MESSAGES } from '../../../constant/Success.message'
import { ERORR_MESSAGES } from '../../../constant/Error.message'
import { sendError, sendSuccess } from '../../../utils/Response'

const DEFAULT_BRANCH_PAGE_SIZE = Number(process.env.BRANCH_PAGE_SIZE) || 10

@injectable()
export class StudentControllerForDesigner {
    constructor(
        @inject('StudentServiceForDesigner')
        private studentService: StudentServiceMethods
    ) {}

    getStudentForDesigner = async (req: Request, res: Response) => {
        try {
            const pagination = getPagination(req.query)

            const perBranchLimit =
                typeof req.query.perBranchLimit === 'string' &&
                !isNaN(Number(req.query.perBranchLimit))
                    ? Number(req.query.perBranchLimit)
                    : DEFAULT_BRANCH_PAGE_SIZE

            const search =
                typeof req.query.search === 'string'
                    ? req.query.search
                    : undefined

            const result = await this.studentService.getStudentForDesigner(
                {
                    ...pagination,
                    search,
                },
                perBranchLimit
            )
            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
    getStudentsForBranch = async (req: Request, res: Response) => {
        try {
            const branchId = req.params.branchId
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 2
            const offset = (page - 1) * limit
            const search =
                typeof req.query.search === 'string'
                    ? req.query.search
                    : undefined

            const result = await this.studentService.getStudentsForBranch(
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
