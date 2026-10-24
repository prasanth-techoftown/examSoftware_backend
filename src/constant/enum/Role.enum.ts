export const ROLE = Object.freeze({
    SUPERADMIN: 'SUPERADMIN',
    STUDENT: 'STUDENT',
    SUBADMIN: 'SUBADMIN',
    DESIGNER: 'DESIGNER',
})

export type RoleType = (typeof ROLE)[keyof typeof ROLE]

export const SYSTEM_ROLES = [ROLE.SUPERADMIN, ROLE.STUDENT] as const

export type SystemRoleType = (typeof SYSTEM_ROLES)[number]
