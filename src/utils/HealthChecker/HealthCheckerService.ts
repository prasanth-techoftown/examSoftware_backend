import { injectable } from 'tsyringe'

import { HealthResponse, HealthServiceMethods } from './type.health'

@injectable()
export class HealthService implements HealthServiceMethods {
    public async getHealth(): Promise<HealthResponse> {
        return {
            status: 'ok',
            success: true,
            statusCode: 200,
            message: 'Server is running',
            timestamp: new Date().toISOString(),
        }
    }
}
