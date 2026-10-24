import { Request } from 'express'
import { ClientInfo } from './IpFounder.Interface'
import { UAParser } from 'ua-parser-js'

export class ClientInfoFetcher {
    private req: Request

    constructor(req: Request) {
        this.req = req
    }

    public getInfo(): ClientInfo {
        // Extract client IP safely
        const forwarded = this.req.headers['x-forwarded-for']
        const ip = Array.isArray(forwarded)
            ? forwarded[0]
            : forwarded || this.req.ip || 'Unknown'

        // Parse device info from user-agent
        const parser = new UAParser(this.req.headers['user-agent'])
        const uaResult = parser.getResult()

        const deviceInfo = {
            browser: uaResult.browser.name || 'Unknown',
            browserVersion: uaResult.browser.version || 'Unknown',
            os: uaResult.os.name || 'Unknown',
            osVersion: uaResult.os.version || 'Unknown',
            device: uaResult.device.model || 'Unknown',
            deviceType: uaResult.device.type || 'Desktop',
            cpu: uaResult.cpu.architecture || 'Unknown',
        }

        return { ip, device: deviceInfo }
    }
}
