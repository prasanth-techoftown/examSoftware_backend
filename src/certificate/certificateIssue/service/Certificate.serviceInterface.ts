import { GetPaginationOptions } from '../../../constant/Result.types'
import { CertificateResult } from '../types/Certificate.types'

export interface CertificateServiceMethods {
    getAllStudent(options: GetPaginationOptions): Promise<CertificateResult>
}
