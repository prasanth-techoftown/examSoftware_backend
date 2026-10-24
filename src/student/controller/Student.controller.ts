import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'
import { sendError, sendSuccess } from '../../utils/Response'
import { ERORR_MESSAGES } from '../../constant/Error.message'
import { getPagination } from '../../utils/pagination'
import { SUCCESS_MESSAGES } from '../../constant/Success.message'
import { DataSanitize } from '../../utils/DataSanitize'
import { Status } from '../../constant/Result.types'
import { StudentServiceMethods } from '../service/Student.serviceInterface'
import { StudentDTO } from './Student.DTO'
import { MulterFiletypes } from '../../middleware/multer/MuterTypes'
import { UpdateStudentDTO } from './UpdateStudent.DTO'

@injectable()
export class StudentController {
    constructor(
        @inject('StudentService')
        private studentService: StudentServiceMethods
    ) {}

    addStudent = async (req: Request, res: Response) => {
        try {
            let {
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
                examDate,
            } = req.body
            const file = req.file as Express.Multer.File | undefined

            // if (!file) {
            //     return sendError(res, 'Student photo is required', 400)
            // }

            const photoName = file?.filename ?? null
            const missingFields = [
                'admissionNumber',
                'firstName',
                'lastName',
                'phoneNumber',
                'whatsappNumber',
                'gender',
                'address',
                'city',
                'state',
                'pincode',
                'parentOrGuardianName',
                'parentOrGuardianNumber',
                // 'counselledBy',
                'courseId',
                'dateOfBirth',
                'qualification',
                'totalFees',

                'dateOfAdmission',

                'email',
                'createdBy',
            ].filter((field) => !req.body[field])

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD} ${missingFields.join(', ')}`,
                    400
                )
            }

            try {
                ;({
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
                    dateOfBirth,
                    qualification,
                    totalFees,
                    notes,
                    academicYear,
                    dateOfAdmission,
                    branchId,
                    email,
                    createdBy,
                    examDate,
                } = DataSanitize({
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
                    dateOfBirth,
                    qualification,
                    totalFees,
                    notes,
                    academicYear,
                    dateOfAdmission,
                    branchId,
                    email,
                    createdBy,
                    examDate,
                }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)

                return
            }

            const data = new StudentDTO(
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
                Number(courseId),
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
                photoName,
                examDate
            )

            const result = await this.studentService.addStudent(data)

            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    ` Name ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
            }
            if (result.status !== Status.SUCCESS) {
                return sendError(res, ERORR_MESSAGES.SERVER, 400)
            }

            return sendSuccess(res, SUCCESS_MESSAGES.CREATED)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    getAllStudent = async (req: Request, res: Response) => {
        try {
            const pagination = getPagination(req.query)
console.log("innnn");

            const search =
                typeof req.query.search === 'string'
                    ? req.query.search
                    : undefined

            const result = await this.studentService.getAllStudent({
                ...pagination,
                search,
            })
            console.log(result,"resu");
            
            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    updateStudent = async (req: Request, res: Response) => {
        try {
            let {
                id,
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
                updatedBy,
            } = req.body
            const file = req.file as MulterFiletypes

            const photoName = file ? file.filename : null
            const missingFields = ['id', 'updatedBy'].filter(
                (field) =>
                    req.body[field] === undefined ||
                    req.body[field] === null ||
                    req.body[field] === ''
            )

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD} ${missingFields.join(', ')}`,
                    400
                )
            }

            const data = new UpdateStudentDTO(
                id,
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
                updatedBy,
                photoName
            )
            const result = await this.studentService.updateStudent(data)

            if (result.status === Status.NAME_NOT_EXIST) {
                return sendError(res, `Student ${Status.NAME_NOT_EXIST}`, 404)
            }

            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    `Name ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    400
                )
            }

            return sendSuccess(res, SUCCESS_MESSAGES.UPDATED, {
                student: result,
            })
        } catch (error) {
            console.log(error, 'controller')

            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
