import { injectable } from 'tsyringe'
import { AppDataSource } from '../../../../config/data-source'
import { ExamReadyRepoMethods } from './ExamReady.repoInterface'
import { ExamReadyDetails } from '../types/ExamREady.types'

@injectable()
export class ExamReadyRepository implements ExamReadyRepoMethods {
    getExamReadyDetails = async (
        studentId: number
    ): Promise<ExamReadyDetails | null> => {
        const query = `
            SELECT
    s.id AS id,
    s.firstName,
    s.lastName,
    s.admissionNumber,
    s.courseName,
    s.courseId,
    s.academicYear,
    s.email,
    s.phoneNumber,
    s.gender,
    s.branchName,

    sch.id AS scheduleId,
    sch.examDate,
    sch.status AS scheduleStatus,

    qm.courseTotalQuestion AS totalQuestions,
    qm.subjectTotalQuestion,
    qm.time AS durationMinutes

FROM sem_student s

INNER JOIN sem_exam_schedule sch
    ON sch.studentId = s.id
    AND sch.status = 'SCHEDULED'
    AND sch.isDeleted = 0
    AND DATE(sch.examDate) = CURDATE()

LEFT JOIN sem_question_mapping qm
    ON qm.crmCourseId = s.courseId
    AND qm.isDeleted = 0

WHERE s.id = ?
  AND s.isDeleted = 0

ORDER BY sch.id DESC
LIMIT 1;

        `
        const rows: ExamReadyDetails[] = await AppDataSource.manager.query(
            query,
            [studentId]
        )
        return rows[0] ?? null
    }
}
