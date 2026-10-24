import {
    RoleModuleAccessInfo,
    RoleModuleAccessInfoRow,
} from '../Rbac/roleModuleAccess/types/RoleModule.types'

export const formatPermissions = (data: RoleModuleAccessInfo[]) => {
    const result: Record<string, string[]> = {}
    data.forEach((item) => {
        const moduleName = item.moduleName

        if (!result[moduleName]) {
            result[moduleName] = []
        }

        const accessList = item.access.map((a) => a.accessName)

        result[moduleName].push(...accessList)
    })

    return result
}

export const formatPermissionsFromRows = (
    rows: RoleModuleAccessInfoRow[]
): Record<string, string[]> => {
    const result: Record<string, string[]> = {}

    rows.forEach((row) => {
        if (!result[row.moduleName]) {
            result[row.moduleName] = []
        }
        if (!result[row.moduleName].includes(row.accessName)) {
            result[row.moduleName].push(row.accessName)
        }
    })

    return result
}
