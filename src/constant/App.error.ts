export class AppError extends Error {
    statuscode: number
    constructor(message: string, statusCode = 500) {
        super(message)
        this.statuscode = statusCode
    }
}
