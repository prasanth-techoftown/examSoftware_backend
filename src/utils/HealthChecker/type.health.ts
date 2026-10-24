export interface HealthResponse {
    status: 'ok' | 'fail'
    success: boolean
    statusCode: number
    message: string
    timestamp: string
}

export interface HealthServiceMethods {
    getHealth(): Promise<HealthResponse>
}
