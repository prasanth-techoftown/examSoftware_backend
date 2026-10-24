export type GetPaginationOptions = {
    limit?: number
    offset?: number
    all?: boolean
    search?: string
    date?: string
    status?: string
}

export enum Status {
    NAME_ALREADY_EXIST = 'Name_already_exist',
    SUCCESS = 'success',
    ERROR = 'error',
    INVALID_NAME = 'Invalid_name',
    NAME_NOT_EXIST = 'not_exist',
    NO_NAME_FOUND = 'No_name_found',
    BRANCH_ID_REQUIRED = 'BranchId_Required',
}
export interface Result<TStatus> {
    status: TStatus
    message?: string
}
