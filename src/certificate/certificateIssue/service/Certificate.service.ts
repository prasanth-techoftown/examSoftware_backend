import { inject, injectable } from 'tsyringe'
import { CertificateResult } from '../types/Certificate.types'
import { AppError } from '../../../constant/App.error'
import { GetPaginationOptions, Status } from '../../../constant/Result.types'
import { CertificateRepositoryMethods } from '../repository/Certificate.repoInterface'
import { CertificateServiceMethods } from './Certificate.serviceInterface'
import { CACHE_KEYS, CACHE_TTL } from '../../../cache/cache'
import { CacheService } from '../../../cache/ClearCache'

@injectable()
export class CertificateService implements CertificateServiceMethods {
    constructor(
        @inject('CertificateRepository')
        private certificateRepository: CertificateRepositoryMethods,

        private clearCache: CacheService
    ) {}

    getAllStudent = async ({
        limit,
        offset,
        all,
        search,
    }: GetPaginationOptions): Promise<CertificateResult> => {
        try {
            const cacheKey = CACHE_KEYS.CERTIFICATE_LIST({
                limit,
                offset,
                all,
                search,
            })

            const cached =
                await this.clearCache.get<CertificateResult>(cacheKey)

            if (cached) return cached
            const rows = await this.certificateRepository.getAllStudent({
                limit,
                offset,
                all,
                search,
            })
            if (!rows || rows.data.length === 0) {
                return { status: Status.NO_NAME_FOUND, data: [], total: 0 }
            }

            const response: CertificateResult = {
                status: Status.SUCCESS,
                data: rows.data,
                total: rows.total,
            }
            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (err) {
            if (err instanceof AppError) throw err
            console.log(err)
            throw new AppError('Failed to fetch  Certificate Student List', 500)
        }
    }
}
