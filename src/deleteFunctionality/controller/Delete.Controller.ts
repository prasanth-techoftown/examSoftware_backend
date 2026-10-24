// import { inject, injectable } from 'tsyringe'
// import { ERORR_MESSAGES } from '../../constant/Error.message'
// import { SUCCESS_MESSAGES } from '../../constant/Success.message'
// import { DataSanitize } from '../../utils/DataSanitize'
// import { sendError, sendSuccess } from '../../utils/Response'
// import { Status } from '../types/Delete.types'
// import { TABLES } from '../enums/Table.enums'
// import { Request, Response } from 'express'
// import { DeleteServiceMethods } from '../service/Delete.serviceInterface'

// @injectable()
// export class DeleteController {
//     constructor(
//         @inject('DeleteService')
//         private deleteService: DeleteServiceMethods
//     ) {}

//     async deleteRecord(
//         req: Request,
//         res: Response,
//         tableName: TABLES
//     ): Promise<Response | void> {
//         try {
//             let { id, deletedBy } = req.body

//             const missingFields = ['id', 'deletedBy'].filter(
//                 (field) => !req.body[field]
//             )
//             if (missingFields.length > 0) {
//                 return sendError(
//                     res,
//                     `${ERORR_MESSAGES.MISSING_FIELD} ${missingFields.join(', ')}`,
//                     400
//                 )
//             }

//             try {
//                 ;({ id, deletedBy } = DataSanitize({ id, deletedBy }))
//             } catch {
//                 return sendError(res, Status.INVALID_INPUT, 400)
//             }

//             const result = await this.deleteService.deleteRecord(
//                 tableName,
//                 id,
//                 deletedBy
//             )

//             if (result.status === Status.NAME_NOT_EXIST) {
//                 return sendSuccess(res, Status.NAME_NOT_EXIST)
//             }

//             return sendSuccess(res, SUCCESS_MESSAGES.DELETED)
//         } catch (error) {
//             return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
//         }
//     }
// }
