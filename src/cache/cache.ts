import { CertificateStatus } from '../certificate/certificateIssue/types/Certificate.types'

export const CACHE_TTL = Number(process.env.CACHE_TTL) || 60 * 5
export const CACHE_KEYS = {
    QUESTION_ALL: 'question_tbl',
    COURSE_ALL: 'course:all',
    CERTIFICATE_NUMBER_ALL: 'certificateNumber:all',
    ROLE_ALL: 'role:all',
    ROLE_ADMIN: 'role:admin',
    MODULE_ALL: 'module:all',
    DATE_SCHEDULE: 'dateScheduling',
    ROLE_MODULE_ACCESS: 'role:roleModuleAccess:all',
    ROLE_MODULE_ACCESS_BY_ID: (id: string) => `role:roleModuleAccess:${id}`,
    ADMIN_ALL: 'admin:all',
    USER_ALL: 'user:all',
    EXAM_REQUEST_ALL: 'examRequest:all',
    USERDETAILS: (id: number | string) => `user:details:${id}`,
    SCHEDULING_LIST: (params: {
        limit?: number
        offset?: number
        all?: boolean
        search?: string
        status?: string
    }) => {
        const parts = [
            'scheduling',
            'global',
            params.all ? 'ALL' : 'PAGE',
            params.limit ?? 0,
            params.offset ?? 0,
        ]

        if (params.search) {
            parts.push('search', encodeURIComponent(params.search))
        }

        if (params.status) {
            parts.push('status', params.status)
        }

        return parts.join(':')
    },
    CERTIFICATE_LIST: (params: {
        limit?: number
        offset?: number
        all?: boolean
        search?: string
    }) => {
        const parts = [
            'certificate',
            'global',
            params.all ? 'ALL' : 'PAGE',
            params.limit ?? 0,
            params.offset ?? 0,
        ]

        if (params.search) {
            parts.push('search', params.search)
        }

        return parts.join(':')
    },

    CERTIFICATE_STATUS: (params: {
        limit?: number
        offset?: number
        all?: boolean
        search?: string
        status?: string
    }) => {
        const parts = [
            'certificate-status',
            'global',
            params.all ? 'ALL' : 'PAGE',
            params.limit ?? 0,
            params.offset ?? 0,
        ]

        if (params.search) {
            parts.push('search', params.search)
        }

        if (params.status) {
            parts.push('status', params.status)
        }

        return parts.join(':')
    },
    STUDENT_LIST: (params: {
        limit?: number
        offset?: number
        all?: boolean
        search?: string
        tab?: string
    }) => {
        const parts = [
            'student',
            'global',
            params.all ? 'ALL' : 'PAGE',
            params.limit ?? 0,
            params.offset ?? 0,
            params.tab ?? CertificateStatus.NOT_YET_SENT,
        ]

        if (params.search) {
            parts.push('search', params.search)
        }

        return parts.join(':')
    },
    COMPLETED_STUDENT_LIST: (params: {
        limit?: number
        offset?: number
        all?: boolean
        search?: string
        tab?: string
    }) => {
        const parts = [
            'completed_student',
            'global',
            params.all ? 'ALL' : 'PAGE',
            params.limit ?? 0,
            params.offset ?? 0,
            params.tab ?? CertificateStatus.NOT_YET_SENT,
        ]

        if (params.search) {
            parts.push('search', params.search)
        }

        return parts.join(':')
    },

    COMPLETED_STUDENT_LIST_BY_BRANCH: (params: {
        limit?: number
        offset?: number
        search?: string
        tab?: string
        branchId: string
    }) => {
        const parts = [
            'completed_student:branch',
            'global',
            params.limit ?? 0,
            params.offset ?? 0,
            params.tab ?? CertificateStatus.NOT_YET_SENT,
            params.branchId,
        ]

        if (params.search) {
            parts.push('search', params.search)
        }

        return parts.join(':')
    },

    DESIGNER_STUDENT_LIST: (params: {
        limit?: number
        offset?: number
        all?: boolean
        search?: string
        perBranchLimit?: number
    }) => {
        const parts = [
            'designer_student',
            'global',
            params.all ? 'ALL' : 'PAGE',
            params.limit ?? 0,
            params.offset ?? 0,
        ]

        if (params.search) {
            parts.push('search', params.search)
        }

        if (params.perBranchLimit) {
            parts.push('perBranchLimit', params.perBranchLimit)
        }

        return parts.join(':')
    },

    DESIGNER_STUDENT_LIST_BRANCH: (params: {
        limit?: number
        offset?: number
        search?: string
        branchId?: string
    }) => {
        const parts = [
            'designer_student',
            'global',
            params.limit ?? 0,
            params.offset ?? 0,
        ]

        if (params.search) {
            parts.push('search', params.search)
        }

        if (params.branchId) {
            parts.push('branchId', params.branchId)
        }

        return parts.join(':')
    },

    PRINTED_STUDENT_LIST_BRANCH: (params: {
        limit?: number
        offset?: number
        search?: string
        branchId?: string
        status?: string
    }) => {
        const parts = [
            'printed_student',
            'global',
            params.limit ?? 0,
            params.offset ?? 0,
        ]

        if (params.search) {
            parts.push('search', params.search)
        }

        if (params.branchId) {
            parts.push('branchId', params.branchId)
        }

        if (params.status) {
            parts.push('status', params.status)
        }

        return parts.join(':')
    },
}
