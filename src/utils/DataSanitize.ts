export class SanitizeError extends Error {
    constructor(
        public field: string,
        message?: string
    ) {
        super(message || `Suspicious input detected in field: ${field}`)
        this.name = 'SanitizeError'
    }
}

export function DataSanitize<T extends Record<string, unknown>>(data: T): T {
    const sanitized = {} as T
    const suspiciousPattern =
        /(--|;|\/\*|\*\/|xp_|exec|select|insert|delete|drop|update|union|<|>)/i

    for (const key in data) {
        const value = data[key]
        if (typeof value === 'string') {
            const trimmed = value.trim()
            if (suspiciousPattern.test(trimmed)) {
                throw new SanitizeError(key)
            }
            sanitized[key] = trimmed.replace(/['"\\]/g, '') as T[typeof key]
        } else {
            sanitized[key] = value
        }
    }
    return sanitized
}
