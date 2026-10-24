import { AdmissionDataResult } from '../types/AdmissionData.types'

export interface AdmissionDataServiceMethods {
    getAdmissionData(admissionNumber: string): Promise<AdmissionDataResult>
}
