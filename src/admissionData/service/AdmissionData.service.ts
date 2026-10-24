import { inject, injectable } from 'tsyringe'
import { CacheService } from '../../cache/ClearCache'
import { AdmissionDataRepositoryMethods } from '../repository/AdmissionData.repoInterface'
import { AdmissionDataResult } from '../types/AdmissionData.types'
import { Status } from '../../constant/Result.types'
import { CACHE_TTL } from '../../cache/cache'

@injectable()
export class AdmissionDataService {
    constructor(
        @inject('AdmissionDataRepository')
        private repo: AdmissionDataRepositoryMethods,

        private readonly clearCache: CacheService
    ) {}

    getAdmissionData = async (
        admissionNumber: string
    ): Promise<AdmissionDataResult> => {
        const cacheKey = `admission:admissionNumber${admissionNumber}`

        const cached = await this.clearCache.get<AdmissionDataResult>(cacheKey)
        if (cached) return cached

        const data = await this.repo.getAdmissionData(admissionNumber)

        if (!data) {
            return {
                status: Status.NAME_NOT_EXIST,
                data: [],
            }
        }

        const response: AdmissionDataResult = {
            status: Status.SUCCESS,
            data: [data],
        }

        await this.clearCache.set(cacheKey, response, CACHE_TTL)

        return response
    }
}
