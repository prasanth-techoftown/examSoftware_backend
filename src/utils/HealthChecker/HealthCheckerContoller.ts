import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { sendSuccess, sendError } from '../../utils/Response'

import { HealthResponse, HealthServiceMethods } from './type.health'

export interface HealthControllerMethods {
    getHealth(req: Request, res: Response): Promise<Response>
}

@injectable()
export class HealthController implements HealthControllerMethods {
    constructor(
        @inject('HealthService')
        private readonly healthService: HealthServiceMethods
    ) {}

    public getHealth = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const result: HealthResponse = await this.healthService.getHealth()

            return sendSuccess(res, 'Health check passed', result, 200)
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'Internal server error'

            return sendError(res, message, 500)
        }
    }
}
