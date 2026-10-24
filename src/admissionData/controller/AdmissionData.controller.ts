import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'
import { AdmissionDataServiceMethods } from '../service/AdmissionData.serviceInterface'
import { sendSuccess } from '../../utils/Response'
import { SUCCESS_MESSAGES } from '../../constant/Success.message'

@injectable()
export class AdmissionDataController {
    constructor(
        @inject('AdmissionDataService')
        private service: AdmissionDataServiceMethods
    ) {}

    getAdmissionData = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const admissionNumber = String(req.query.search)

            const result = await this.service.getAdmissionData(admissionNumber)

            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (err) {
            next(err)
        }
    }
}
