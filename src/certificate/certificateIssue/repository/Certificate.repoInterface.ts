import { CertificateInfo } from '../types/Certificate.types'
import { GetPaginationOptions } from '../../../constant/Result.types'

export interface CertificateRepositoryMethods {
    getAllStudent(
        option: GetPaginationOptions
    ): Promise<{ data: CertificateInfo[]; total: number }>
}
