import 'reflect-metadata'
import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
import { Question } from '../examQuestion/question/entity/Question'
import { Option } from '../examQuestion/option/entity/Option'
import { SEM_Student } from '../student/entity/student.entity'
import { SEM_Role } from '../Rbac/role/entity/Role'
import { SEM_Access } from '../Rbac/roleModuleAccess/entity/Access'
import { SEM_FrontendModuleEntity } from '../Rbac/frontEndModules/entity/FrontendModule'
import { SEM_RoleModuleAccess } from '../Rbac/roleModuleAccess/entity/RoleModuleAccess'
import { SEM_User } from '../user/entity/User'
import { SEM_Admin } from '../admin/entity/Admin'
import { SEM_QuestionCourse } from '../examQuestion/subject/entity/QuestionCourse.entity'
import { ExamRequest } from '../exam-mgt/examRequest/entity/ExamRequest'
import { StudentLogin } from '../security/studentLogin/entity/StudentLogin'
import { ExamSession } from '../exam-mgt/session/examSession/entity/ExamSession'
import { ExamScheduling } from '../exam-mgt/scheduling/entity/Scheduling'
import { ExamAnswerLogs } from '../exam-mgt/logs/examAnswerLogs/entity/ExamAnswerLogs'
import { sem_QuestionMapping } from '../examQuestion/questionMapping/entity/QuestionMapping'
import { RejectLogs } from '../exam-mgt/logs/rejectLogs/entity/RejectLogs'
import { ExamSessionQuestion } from '../exam-mgt/session/exam-session-question/entity/ExamSessionQuestion'
import { SEM_GradeEntity } from '../grade/entity/Grade.entity'
import { ExamActivityLog } from '../exam-mgt/logs/examLogs/entity/ExamLogs'
import { SEM_ModelTitle } from '../model/title/entity/ModelTitle.entity'
import { sem_ModelQuestionMapping } from '../model/modelQuestionMapping/entity/ModelQuestionMapping'
import { SEM_DateSchedule } from '../dateSchedule/entity/DateSchedule'
import { SEM_ModelSubject } from '../model/subject/entity/ModelSubject.entity'
import { SEM_Course } from '../course/entity/Course.entity'
import { SEM_CourseCategory } from '../courseCategory/entity/CourseCategory.entity'

dotenv.config()
type DbType = 'mysql'

export const AppDataSource = new DataSource({
    type: process.env.DB_TYPE as DbType,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [
        Question,
        Option,
        SEM_ModelTitle,
        SEM_Student,
        SEM_Role,
        SEM_Access,
        SEM_FrontendModuleEntity,
        SEM_RoleModuleAccess,
        SEM_User,
        SEM_Admin,
        SEM_QuestionCourse,
        ExamRequest,
        StudentLogin,
        ExamSession,
        ExamScheduling,
        ExamAnswerLogs,
        sem_QuestionMapping,
        RejectLogs,
        ExamSessionQuestion,
        SEM_GradeEntity,
        ExamActivityLog,
        sem_ModelQuestionMapping,
        SEM_DateSchedule,
        SEM_ModelSubject,
        SEM_CourseCategory,
        SEM_Course,
    ],

    extra: {
        connectionLimit: Number(process.env.DB_POOL_LIMIT),
        connectTimeout: Number(process.env.DB_TIMEOUT),
        waitForConnections: true,
        queueLimit: 0,
    },

})