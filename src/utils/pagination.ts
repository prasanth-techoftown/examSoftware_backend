type QueryParams = {
    all?: string
    limit?: string
    page?: string
    search?: string
}
export const getPagination = (query: QueryParams) => {
    const all = query.all === 'true'

    if (all) {
        return { all: true }
    }

    const limit = Number(query.limit) || 15
    const page = Number(query.page) || 1
    const offset = (page - 1) * limit

    return { all: false, limit, offset }
}
