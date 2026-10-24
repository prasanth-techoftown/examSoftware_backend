import express from 'express'
import cors, { CorsOptions } from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import compression from 'compression'
import './invertionOfControl/di-container'

import HealthRouter from './utils/HealthChecker/Health.routes'
import { httpRequestDuration } from './Metrics/metrics'
import examRequestRoutes from './exam-mgt/examRequest/routes/ExamRequest.routes'
import refreshTokenRoutes from './jwtService/refreshToken/refreshToken.routes'
import questionRoutes from './examQuestion/question/routes/Question.routes'
import modelTitleRoutes from './model/title/routes/ModelTitle.routes'
import roleRoutes from './Rbac/role/routes/Role.routes'
import moduleRoutes from './Rbac/frontEndModules/routes/Module.routes'
import roleModuleAccessRoutes from './Rbac/roleModuleAccess/routes/RoleModuleAccess.routes'
import adminRoutes from './admin/routes/Admin.routes'
import loginRoutes from './security/login/routes/Login.routes'
import checkSessionRoutes from './security/login/routes/Check.session'
import schedulingRoutes from './exam-mgt/scheduling/routes/Scheduling.routes'
import questionMappingRoutes from './examQuestion/questionMapping/routes/QuestionMapping.routes'
import path from 'path'
import examSessionRoutes from './exam-mgt/session/examSession/routes/ExamSession.routes'
import commonCourseRoutes from './examQuestion/subject/routes/QuestionCourse.routes'
import studentRoutes from './student/routes/Student.routes'
import { sessionMiddleware } from './middleware/sessionMiddleware'
import studentLoginRoutes from './security/studentLogin/routes/StudentLogin.routes'
import examReadyRoutes from './exam-mgt/session/examReady/routes/ExamReady.routes'
import examQuestionRoutes from './exam-mgt/session/exam-session-question/routes/ExamSession.routes'
import examAnswerRoutes from './exam-mgt/logs/examAnswerLogs/routes/ExamAnswerLogs.routes'
import gradeRoutes from './grade/routes/Grade.routes'
import modelQuestionMappingRoutes from './model/modelQuestionMapping/routes/ModelQuestionMapping.routes'
import dateScheduleRoutes from './dateSchedule/routes/DateSchedule.routes'
import modelSubjectRoutes from './model/subject/routes/ModelSubject.routes'
import certificateRoutes from './certificate/certificateIssue//routes/Certificate.routes'
import admissionDataRoutes from './admissionData/routes/AdmissionData.routes'
import DesignerStudent from './designer/student/routes/Student.routes'
import courseCategoryRoutes from './courseCategory/routes/CourseCategory.routes'
import emcaCourseRoutes from './course/routes/Course.routes'

dotenv.config()
const app = express()
app.set('trust proxy', 1)
;(app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                'default-src': ["'self'"],
                'img-src': ["'self'", 'data:', 'blob:'],
                'script-src': ["'self'"],
                'upgrade-insecure-requests': [],
            },
        },
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
),
    app.use(sessionMiddleware),
    app.use(compression()))

const allowedOrigins: string[] =
    process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) ?? []

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            console.log(`CORS policy: Origin ${origin} not allowed`)
            callback(new Error('Not allowed by CORS'))
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Request-ID',
        'Idempotency-Key',
    ],
    credentials: true,
}

app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer()

    if (!req.path.startsWith('/v1/uploads')) {
        res.setHeader('Content-Type', 'application/json')
    }

    res.setHeader('Cache-Control', 'no-store')
    res.on('finish', () => {
        end({
            method: req.method,
            route: req.route?.path || req.path,
            status: res.statusCode.toString(),
        })
    })

    next()
})
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))

app.get('/v1/debug-proxy', (req, res) => {
    res.json({
        protocol: req.protocol,
        secure: req.secure,
        remoteAddress: req.ip,
        headers: req.headers['x-forwarded-proto'],
    })
})

app.use('/v1/user', loginRoutes)

app.use('/v1/login', studentLoginRoutes)

app.use('/v1/auth', checkSessionRoutes)

app.use('/v1/exam', questionRoutes)

app.use('/v1/examReady', examReadyRoutes)

app.use('/v1/examQuestion', examQuestionRoutes)

app.use('/v1/admin', adminRoutes)

app.use('/v1/refreshToken', refreshTokenRoutes)

app.use('/v1/title', modelTitleRoutes)

app.use('/v1/modelQuestionMapping', modelQuestionMappingRoutes)

app.use('/v1/modelSubject', modelSubjectRoutes)

app.use('/v1/grade', gradeRoutes)

app.use('/v1/courseCategory', courseCategoryRoutes)

app.use('/v1/course', emcaCourseRoutes)

app.use('/v1/courseForQuestion', commonCourseRoutes)

app.use('/v1/roleModuleAccess', roleModuleAccessRoutes)

app.use('/v1/role', roleRoutes)

app.use('/v1/student', studentRoutes)

app.use('/v1/dateSchedule', dateScheduleRoutes)

app.use('/v1/examRequest', examRequestRoutes)

app.use('/v1/examAnswer', examAnswerRoutes)

app.use('/v1/examSession', examSessionRoutes)

app.use('/v1/exam-scheduling', schedulingRoutes)

app.use('/v1/questionMapping', questionMappingRoutes)

app.use('/v1/certificate', certificateRoutes)

app.use('/v1/module', moduleRoutes)

app.use('/v1/admissionData', admissionDataRoutes)

app.use('/v1/designer-student', DesignerStudent)

const uploadsPath = path.resolve(__dirname, '../uploads')

app.use('/v1/uploads', express.static(uploadsPath))

app.use('/v1/health', HealthRouter)

export default app