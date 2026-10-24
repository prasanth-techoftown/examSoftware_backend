export interface ClientInfo {
    ip: string
    device: {
        browser: string
        browserVersion: string
        os: string
        osVersion: string
        device: string
        deviceType: string
        cpu: string
    }
}

export interface UserSessionPayload {
    sessionId: string
    userId: string
    ipAddress: string
    browser: string
    os: string
    deviceType: string
    socketId?: string | null
}
