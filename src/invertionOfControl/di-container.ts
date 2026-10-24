import { container } from 'tsyringe'

import { QuestionRepository } from '../examQuestion/question/repository/Question.repo'
import { QuestionService } from '../examQuestion/question/service/Question.service'
import { QuestionController } from '../examQuestion/question/controller/Question.controller'

import { HealthService } from '../utils/HealthChecker/HealthCheckerService'
import { HealthController } from '../utils/HealthChecker/HealthCheckerContoller'
import { ModelTitleRepository } from '../model/title/repository/ModelTitle.repo'
import { ModelTitleService } from '../model/title/service/ModelTitle.service'
import { ModelTitleController } from '../model/title/controller/ModelTitle.controller'
import { CommonRepository } from '../common/repo/common.repo'
// import { DeleteController } from '../deleteFunctionality/controller/Delete.Controller'
// import { DeleteService } from '../deleteFunctionality/service/Delete.service'
// import { DeleteRepository } from '../deleteFunctionality/repository/Delete.repo'
import { RoleRepository } from '../Rbac/role/repository/Role.repo'
import { RoleService } from '../Rbac/role/service/Role.service'
import { RoleController } from '../Rbac/role/controller/Role.controller'
import { ModuleRepository } from '../Rbac/frontEndModules/repository/Module.repo'
import { ModuleService } from '../Rbac/frontEndModules/service/Module.service'
import { ModuleController } from '../Rbac/frontEndModules/controller/Modules.controller'
import { RoleModuleAccessService } from '../Rbac/roleModuleAccess/service/RoleModuleAccess.service'
import { RoleModuleAccessController } from '../Rbac/roleModuleAccess/controller/RoleModuleAccess.controller'
import { RoleModuleAccessRepository } from '../Rbac/roleModuleAccess/repository/RoleModuleAccess.repo'
import { AdminController } from '../admin/controller/Admin.controller'
import { AdminService } from '../admin/service/Admin.service'
import { AdminRepository } from '../admin/repository/Admin.repo'
import { LoginController } from '../security/login/controller/login.controller'
import { LoginService } from '../security/login/service/Login.service'
import { LoginRepository } from '../security/login/repository/Login.repo'
import { UserController } from '../user/controller/User.controller'
import { UserService } from '../user/service/User.service'
import { UserRepository } from '../user/repository/User.repo'
import { QuestionCourseController } from '../examQuestion/subject/controller/QuestionCourse.controller'
import { QuestionCourseService } from '../examQuestion/subject/service/QuestionCourse.service'
import { QuestionCourseRepository } from '../examQuestion/subject/repository/QuestionCourse.repo'
import { StudentController } from '../student/controller/Student.controller'
import { StudentService } from '../student/service/Student.service'
import { StudentRepository } from '../student/repository/Student.repo'
import { ExamRequestRepository } from '../exam-mgt/examRequest/repository/ExamRequest.repo'
import { ExamRequestService } from '../exam-mgt/examRequest/service/ExamRequest.service'
import { ExamRequestController } from '../exam-mgt/examRequest/controller/ExamRequest.controller'
import { SchedulingRepository } from '../exam-mgt/scheduling/repository/Scheduling.repo'
import { SchedulingService } from '../exam-mgt/scheduling/service/Scheduling.service'
import { SchedulingController } from '../exam-mgt/scheduling/controller/Scheduling.controller'
import { QuestionMappingController } from '../examQuestion/questionMapping/controller/QuestionMapping.controller'
import { QuestionMappingService } from '../examQuestion/questionMapping/service/QuestionMapping.service'
import { QuestionMappingRepository } from '../examQuestion/questionMapping/repository/QuestionMapping.repo'
import { RejectLogService } from '../exam-mgt/logs/rejectLogs/service/RejectLog.service'
import { RejectLogRepository } from '../exam-mgt/logs/rejectLogs/repository/RejectLog.repo'
import { StudentLoginService } from '../security/studentLogin/service/StudentLogin.service'
import { StudentLoginRepository } from '../security/studentLogin/repository/StudentLogin.repo'
import { ExamSessionService } from '../exam-mgt/session/examSession/service/ExamSession.service'
import { ExamSessionRepository } from '../exam-mgt/session/examSession/repository/ExamSession.repo'
import { StudentLoginController } from '../security/studentLogin/controller/StudentLogin.controller'
import { ExamSessionController } from '../exam-mgt/session/examSession/controller/ExamSession.controller'
import { ExamSessionQuestionService } from '../exam-mgt/session/exam-session-question/service/ExamSessionQuestion.service'
import { ExamSessionQuestionRepository } from '../exam-mgt/session/exam-session-question/repository/ExamSessionQuestion.repo'
import { ExamReadyController } from '../exam-mgt/session/examReady/controller/ExamReady.controller'
import { ExamReadyService } from '../exam-mgt/session/examReady/service/ExamReady.service'
import { ExamReadyRepository } from '../exam-mgt/session/examReady/repository/ExamReady.repo'
import { ExamAnswerLogController } from '../exam-mgt/logs/examAnswerLogs/controller/ExamAnswerLogs.controller'
import { ExamAnswerLogService } from '../exam-mgt/logs/examAnswerLogs/service/ExamAnswerLogs.service'
import { ExamAnswerLogRepository } from '../exam-mgt/logs/examAnswerLogs/repository/ExamAnswerLogs.repo'
import { GradeController } from '../grade/controller/Grade.controller'
import { GradeService } from '../grade/service/Grade.service'
import { GradeRepository } from '../grade/repository/Grade.repo'
import { ExamLogsRepository } from '../exam-mgt/logs/examLogs/repository/ExamLogs.repo'
import { ExamLogsService } from '../exam-mgt/logs/examLogs/service/ExamLogs.service'
import { ModelQuestionMappingController } from '../model/modelQuestionMapping/controller/ModelQuestionMapping.controller'
import { ModelQuestionMappingService } from '../model/modelQuestionMapping/service/ModelQuestionMapping.service'
import { ModelQuestionMappingRepository } from '../model/modelQuestionMapping/repository/ModelQuestionMapping.repo'
import { DateScheduleController } from '../dateSchedule/controller/DateSchedule.controller'
import { DateScheduleService } from '../dateSchedule/service/DateSchedule.service'
import { DateScheduleRepository } from '../dateSchedule/repository/DateSchedule.repo'
import { ModelSubjectController } from '../model/subject/controller/ModelSubject.controller'
import { ModelSubjectService } from '../model/subject/service/ModelSubject.service'
import { ModelSubjectRepository } from '../model/subject/repository/ModelSubject.repo'

import { CertificateController } from '../certificate/certificateIssue/controller/Certificate.controller'
import { CertificateService } from '../certificate/certificateIssue/service/Certificate.service'
import { CertificateRepository } from '../certificate/certificateIssue/repository/Certificate.repo'
import { AdmissionDataService } from '../admissionData/service/AdmissionData.service'
import { AdmissionDataController } from '../admissionData/controller/AdmissionData.controller'
import { AdmissionDataRepository } from '../admissionData/repository/AdmissionData.repo'
import { StudentServiceForDesigner } from '../designer/student/service/Student.service'
import { StudentRepositoryForDesigner } from '../designer/student/repository/Student.repo'
import { StudentControllerForDesigner } from '../designer/student/controller/Student.Controller'
import { CourseController } from '../course/controller/Course.controller'
import { CourseRepository } from '../course/repository/Course.repo'
import { CourseService } from '../course/service/Course.service'
import { CourseCategoryController } from '../courseCategory/controller/CourseCategory.controller'
import { CourseCategoryRepository } from '../courseCategory/repository/CourseCategory.repo'
import { CourseCategoryService } from '../courseCategory/service/CourseCategory.service'


container.register('QuestionController', {
    useClass: QuestionController,
})
container.register('QuestionService', {
    useClass: QuestionService,
})

container.register('QuestionRepository', {
    useClass: QuestionRepository,
})

container.register('CommonRepository', {
    useClass: CommonRepository,
})

container.register('ModelTitleController', {
    useClass: ModelTitleController,
})
container.register('ModelTitleService', {
    useClass: ModelTitleService,
})
container.register('StudentsCourseRepository', {
    useClass: ModelTitleRepository,
})

container.register('StudentControllerForDesigner', {
    useClass: StudentControllerForDesigner,
})
container.register('StudentServiceForDesigner', {
    useClass: StudentServiceForDesigner,
})
container.register('StudentRepositoryForDesigner', {
    useClass: StudentRepositoryForDesigner,
})

// container.register('DeleteController', {
//     useClass: DeleteController,
// })

// container.register('DeleteService', {
//     useClass: DeleteService,
// })

// container.register('DeleteRepository', {
//     useClass: DeleteRepository,
// })

container.register('GradeController', {
    useClass: GradeController,
})

container.register('GradeService', {
    useClass: GradeService,
})

container.register('GradeRepository', {
    useClass: GradeRepository,
})

container.register('ExamLogsRepository', {
    useClass: ExamLogsRepository,
})

container.register('ExamLogsService', {
    useClass: ExamLogsService,
})

container.register('RoleRepository', {
    useClass: RoleRepository,
})
container.register('RoleService', {
    useClass: RoleService,
})
container.register('RoleController', {
    useClass: RoleController,
})

container.register('SchedulingRepository', {
    useClass: SchedulingRepository,
})
container.register('SchedulingService', {
    useClass: SchedulingService,
})
container.register('SchedulingController', {
    useClass: SchedulingController,
})

container.register('ExamRequestRepository', {
    useClass: ExamRequestRepository,
})
container.register('ExamRequestService', {
    useClass: ExamRequestService,
})
container.register('ExamRequestController', {
    useClass: ExamRequestController,
})

container.register('ModuleRepository', {
    useClass: ModuleRepository,
})
container.register('ModuleService', {
    useClass: ModuleService,
})
container.register('ModuleController', {
    useClass: ModuleController,
})

container.register('RoleModuleAccessController', {
    useClass: RoleModuleAccessController,
})
container.register('RoleModuleAccessService', {
    useClass: RoleModuleAccessService,
})
container.register('RoleModuleAccessRepository', {
    useClass: RoleModuleAccessRepository,
})

container.register('ModelQuestionMappingController', {
    useClass: ModelQuestionMappingController,
})
container.register('ModelQuestionMappingService', {
    useClass: ModelQuestionMappingService,
})
container.register('ModelQuestionMappingRepository', {
    useClass: ModelQuestionMappingRepository,
})

container.register('DateScheduleController', {
    useClass: DateScheduleController,
})
container.register('DateScheduleService', {
    useClass: DateScheduleService,
})
container.register('DateScheduleRepository', {
    useClass: DateScheduleRepository,
})

container.register('ModelSubjectController', {
    useClass: ModelSubjectController,
})
container.register('ModelSubjectService', {
    useClass: ModelSubjectService,
})
container.register('ModelSubjectRepository', {
    useClass: ModelSubjectRepository,
})

container.register('CertificateController', {
    useClass: CertificateController,
})
container.register('CertificateService', {
    useClass: CertificateService,
})
container.register('CertificateRepository', {
    useClass: CertificateRepository,
})

container.register('AdmissionDataService', {
    useClass: AdmissionDataService,
})
container.register('AdmissionDataController', {
    useClass: AdmissionDataController,
})
container.register('AdmissionDataRepository', {
    useClass: AdmissionDataRepository,
})

container.register('LoginController', {
    useClass: LoginController,
})
container.register('LoginService', {
    useClass: LoginService,
})
container.register('LoginRepository', {
    useClass: LoginRepository,
})

container.register('QuestionMappingController', {
    useClass: QuestionMappingController,
})
container.register('QuestionMappingService', {
    useClass: QuestionMappingService,
})
container.register('QuestionMappingRepository', {
    useClass: QuestionMappingRepository,
})

container.register('RejectLogService', {
    useClass: RejectLogService,
})
container.register('RejectLogRepository', {
    useClass: RejectLogRepository,
})

container.register('StudentLoginController', {
    useClass: StudentLoginController,
})
container.register('StudentLoginService', {
    useClass: StudentLoginService,
})
container.register('StudentLoginRepository', {
    useClass: StudentLoginRepository,
})

container.register('ExamSessionController', {
    useClass: ExamSessionController,
})
container.register('ExamSessionService', {
    useClass: ExamSessionService,
})
container.register('ExamSessionRepository', {
    useClass: ExamSessionRepository,
})

container.register('ExamAnswerLogController', {
    useClass: ExamAnswerLogController,
})
container.register('ExamAnswerLogService', {
    useClass: ExamAnswerLogService,
})
container.register('ExamAnswerLogRepository', {
    useClass: ExamAnswerLogRepository,
})

container.register('ExamSessionQuestionService', {
    useClass: ExamSessionQuestionService,
})
container.register('ExamSessionQuestionRepository', {
    useClass: ExamSessionQuestionRepository,
})

container.register('UserController', {
    useClass: UserController,
})
container.register('UserService', {
    useClass: UserService,
})
container.register('UserRepository', {
    useClass: UserRepository,
})

container.register('QuestionCourseController', {
    useClass: QuestionCourseController,
})
container.register('QuestionCourseService', {
    useClass: QuestionCourseService,
})
container.register('QuestionCourseRepository', {
    useClass: QuestionCourseRepository,
})

container.register('StudentController', {
    useClass: StudentController,
})
container.register('StudentService', {
    useClass: StudentService,
})
container.register('StudentRepository', {
    useClass: StudentRepository,
})

container.register('AdminController', {
    useClass: AdminController,
})
container.register('AdminService', {
    useClass: AdminService,
})
container.register('AdminRepository', {
    useClass: AdminRepository,
})
container.register('ExamReadyController', {
    useClass: ExamReadyController,
})
container.register('ExamReadyService', {
    useClass: ExamReadyService,
})
container.register('ExamReadyRepository', {
    useClass: ExamReadyRepository,
})

container.register('HealthService', { useClass: HealthService })
container.register('HealthController', { useClass: HealthController })

container.register('CourseCategoryController', {
    useClass: CourseCategoryController,
})

container.register('CourseCategoryService', {
    useClass: CourseCategoryService,
})

container.register('CourseCategoryRepository', {
    useClass: CourseCategoryRepository,
})

container.register('CourseController', {
    useClass: CourseController,
})

container.register('CourseService', {
    useClass: CourseService,
})

container.register('CourseRepository', {
    useClass: CourseRepository,
})