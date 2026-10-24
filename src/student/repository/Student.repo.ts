import { injectable } from 'tsyringe'

import { AppDataSource } from '../../config/data-source'

import { ResultSetHeader } from 'mysql2'
import { GetPaginationOptions } from '../../constant/Result.types'
import { StudentRepositoryMethods } from './Student.repoInterface'
import { StudentDTO } from '../controller/Student.DTO'
import { InsertResult, StudentInfo } from '../types/Student.types'
import { UpdateStudentDTO } from '../controller/UpdateStudent.DTO'
import { QueryRunner } from 'typeorm'

@injectable()
export class StudentRepository implements StudentRepositoryMethods {
    addStudent = async (
        data: StudentDTO,
    ): Promise<number> => {
        const result = (await AppDataSource.manager.query(
            `INSERT INTO sem_student
     ( 
           admissionNumber,
        firstName,
        lastName,
        phoneNumber,
        whatsappNumber,
        gender,
        address,
  
        city,
        state,
        pincode,
        parentOrGuardianName,
        parentOrGuardianNumber,
        counselledBy,
        courseId,
        courseName,
        dateOfBirth,
        qualification,
        totalFees,
        notes,
        academicYear,
        dateOfAdmission,
        branchId,
        email,
        createdBy,
        photoName)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                data.getAdmissionNumber(),
                data.getFirstName(),
                data.getLastName(),
                data.getPhoneNumber(),
                data.getWhatsappNumber(),
                data.getGender(),
                data.getAddress(),

                data.getCity(),
                data.getState(),
                data.getPincode(),
                data.getParentOrGuardianName(),
                data.getParentOrGuardianNumber(),
                data.getCounselledBy(),
                data.getCourseId(),
                data.getCourseName(),
                data.getDateOfBirth(),
                data.getQualification(),
                data.getTotalFees(),
                data.getNotes(),
                data.getAcademicYear(),
                data.getDateOfAdmission(),
                data.getBranchId(),
                data.getEmail(),
                data.getCreatedBy(),
                data.getPhotoName(),
            ]
        )) as InsertResult
        return result.insertId
    }

    getAllStudent = async ({
        limit,
        offset,
        all = false,
        search,
    }: GetPaginationOptions): Promise<{
        student: StudentInfo[]
        total: number
    }> => {
        const whereConditions: string[] = ['s.isDeleted = 0']
        let paginationClause = ''
        const params = []
        const paginationParams = []

        if (search) {
            whereConditions.push(
                '(LOWER(REPLACE(s.firstName," ","")) LIKE ? OR LOWER(REPLACE(s.admissionNumber," ","")) LIKE ?)'
            )
            params.push(`%${search}%`, `%${search}%`)
        }
        if (!all && limit !== undefined && offset !== undefined) {
            paginationClause = ' LIMIT ? OFFSET ? '
            paginationParams.push(limit, offset)
        }

        const studentsQuery = `
  SELECT 
    s.id,
    s.admissionNumber,
    s.firstName,
    s.lastName,
    s.phoneNumber,
    s.whatsappNumber,
    s.gender,
    s.address,
    
    s.city,
    s.state,
    s.pincode,
    s.parentOrGuardianName,
    s.parentOrGuardianNumber,
    s.counselledBy,
    s.courseId,
    s.courseName,
    s.dateOfBirth,
    s.qualification,
    s.totalFees,
    s.notes,
    s.academicYear,
    s.dateOfAdmission,
    s.branchId,
    s.email,
    s.createdBy,
    s.photoName

FROM sem_student s
WHERE ${whereConditions.join(' AND ')}

ORDER BY s.firstName ASC
${paginationClause}

  `
        const student = await AppDataSource.manager.query(studentsQuery, [
            ...params,
            ...paginationParams,
        ])

        const totalQuery = `
    SELECT COUNT(*) as total
    FROM sem_student s
  WHERE ${whereConditions.join(' AND ')}
  `
        const totalResult = await AppDataSource.manager.query(
            totalQuery,
            params
        )
        const total = totalResult[0]?.total ?? 0
        return { student, total }
    }

    updateStudent = async (
        data: UpdateStudentDTO
    ): Promise<ResultSetHeader> => {
        const query = `
        UPDATE sem_student SET
            admissionNumber = COALESCE(?, admissionNumber),
            firstName = COALESCE(?, firstName),
            lastName = COALESCE(?, lastName),
            phoneNumber = COALESCE(?, phoneNumber),
            whatsappNumber = COALESCE(?, whatsappNumber),
            gender = COALESCE(?, gender),
            address = COALESCE(?, address),
        
            city = COALESCE(?, city),
            state = COALESCE(?, state),
            pincode = COALESCE(?, pincode),
            parentOrGuardianName = COALESCE(?, parentOrGuardianName),
            parentOrGuardianNumber = COALESCE(?, parentOrGuardianNumber),
            counselledBy = COALESCE(?, counselledBy),
            courseId = COALESCE(?, courseId),
            courseName = COALESCE(?, courseName),
            dateOfBirth = COALESCE(?, dateOfBirth),
            qualification = COALESCE(?, qualification),
            totalFees = COALESCE(?, totalFees),
            notes = COALESCE(?, notes),
            academicYear = COALESCE(?, academicYear),
            dateOfAdmission = COALESCE(?, dateOfAdmission),
            branchId = COALESCE(?, branchId),
            email = COALESCE(?, email),
            updatedBy = COALESCE(?, updatedBy),
            photoName = COALESCE(?, photoName)
        WHERE id = ?
    `

        return AppDataSource.manager.query(query, [
            data.getAdmissionNumber(),
            data.getFirstName(),
            data.getLastName(),
            data.getPhoneNumber(),
            data.getWhatsappNumber(),
            data.getGender(),
            data.getAddress(),
       
            data.getCity(),
            data.getState(),
            data.getPincode(),
            data.getParentOrGuardianName(),
            data.getParentOrGuardianNumber(),
            data.getCounselledBy(),
            data.getCourseId(),
            data.getCourseName(),
            data.getDateOfBirth(),
            data.getQualification(),
            data.getTotalFees(),
            data.getNotes(),
            data.getAcademicYear(),
            data.getDateOfAdmission(),
            data.getBranchId(),
            data.getEmail(),
            data.getUpdatedBy(),
            data.getPhotoName(),
            data.getId(),
        ])
    }
    getStudentById = async (id: number): Promise<StudentInfo | null> => {
        const query = `
    SELECT 
      s.id,
      s.admissionNumber,
      s.firstName,
      s.lastName,
      s.phoneNumber,
      s.whatsappNumber,
      s.gender,
      s.address,
   s.city,
      s.state,
      s.pincode,
      s.parentOrGuardianName,
      s.parentOrGuardianNumber,
      s.counselledBy,
      s.courseId,
      s.courseName,
      s.dateOfBirth,
      s.qualification,
      s.totalFees,
      s.notes,
      s.academicYear,
      s.dateOfAdmission,
      s.branchId,
      s.email,
      s.photoName
    
    FROM sem_student s
 

    WHERE s.id = ? AND s.isDeleted = 0
    LIMIT 1
  `

        const result = await AppDataSource.manager.query(query, [id])

        return result[0] || null
    }
}
