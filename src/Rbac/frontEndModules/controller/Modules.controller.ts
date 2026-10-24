import { injectable, inject } from 'tsyringe'
import { ModuleServiceMethods } from '../service/Module.serviceInterface'
import { Request, Response } from 'express'
import { DataSanitize } from '../../../utils/DataSanitize'
import { ModuleDTO } from './Module.DTO'
import { UpdateModuleDTO } from './UpdateModule.DTO'
import { sendError, sendSuccess } from '../../../utils/Response'
import { ERORR_MESSAGES } from '../../../constant/Error.message'
import { SUCCESS_MESSAGES } from '../../../constant/Success.message'
import { getPagination } from '../../../utils/pagination'
import { Status } from '../../../constant/Result.types'

@injectable()
export class ModuleController {
    constructor(
        @inject('ModuleService') private moduleService: ModuleServiceMethods
    ) {}

    addModule = async (req: Request, res: Response) => {
        try {
            let { name, createdBy } = req.body

            const missingFields = ['name', 'createdBy'].filter(
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
                ;({ name, createdBy } = DataSanitize({ name, createdBy }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
                return
            }

            const module = new ModuleDTO(name, createdBy)

            const result = await this.moduleService.addModules(module)
            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    `Module ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
            }

            return sendSuccess(
                res,
                SUCCESS_MESSAGES.CREATED,
                result.module,
                201
            )
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    updateModule = async (req: Request, res: Response) => {
        try {
            let { id, updatedBy, name } = req.body

            const missingFields = ['id', 'updatedBy', 'name'].filter(
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
                ;({ id, updatedBy, name } = DataSanitize({
                    id,
                    updatedBy,
                    name,
                }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)

                return
            }

            const updateModule = new UpdateModuleDTO(id, updatedBy, name)

            const result = await this.moduleService.updateModules(updateModule)
            if (result.status === Status.NAME_NOT_EXIST) {
                return sendError(res, `Module ${Status.NAME_NOT_EXIST}`, 404)
            }
            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    `Module ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
            }
            return sendSuccess(res, SUCCESS_MESSAGES.UPDATED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    getModules = async (req: Request, res: Response) => {
        try {
            const pagination = getPagination(req.query)

            const Modules = await this.moduleService.getModules(pagination)
            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, Modules)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
