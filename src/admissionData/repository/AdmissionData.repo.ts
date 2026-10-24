import { injectable } from 'tsyringe'
import { AppDataSource } from '../../config/data-source'
import { AdmissionDataRepositoryMethods } from './AdmissionData.repoInterface'
import { AdmissionDataInfo } from '../types/AdmissionData.types'

@injectable()
export class AdmissionDataRepository implements AdmissionDataRepositoryMethods {
    getAdmissionData = async (
        admissionNumber: string
    ): Promise<AdmissionDataInfo> => {
        let query = `
    SELECT 
      af.id AS admissionId,
      af.branchId,
      af.admissionNumber,
      af.dateOfBirth,
      af.dateOfAdmission,
      af.firstName,
      af.lastName,
      af.gender,
af.email,
af.photoName,
      af.phoneNumber,
      af.whatsappNumber,
      af.address1,
      af.address2,
      af.city,
      af.state,
      af.pincode,
      af.qualification,
      af.courseId,
      c.name AS courseName,
b.name as branchName,
      af.totalFees,
      af.notes,

      af.parentOrGuardianName,
      af.parentOrGuardianNumber,

      af.refrencedBy,
      u.firstName as counselledBy,

      af.academicYear,
      af.createdAt

    FROM admission_form af
    LEFT JOIN course c 
      ON c.id = af.courseId 
      AND c.isDeleted = 0

         LEFT JOIN branch b 
      ON b.id = af.branchId 
      AND b.isDeleted = 0
          LEFT JOIN user u
      ON u.id = af.counselledBy
      AND u.isDeleted = 0

    WHERE af.isDeleted = 0 and af.admissionNumber=?
  `
        return AppDataSource.manager.query(query, [admissionNumber])
    }
}
