import { AdmissionDataInfo } from '../types/AdmissionData.types'

export interface AdmissionDataRepositoryMethods {
    getAdmissionData(admissionNumber: string): Promise<AdmissionDataInfo>
}
