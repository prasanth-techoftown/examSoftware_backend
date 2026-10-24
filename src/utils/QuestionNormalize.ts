export const normalize = (val?: string) => {
    if (!val) return ''
    return val.trim().toLowerCase().replace(/\s+/g, ' ')
}
