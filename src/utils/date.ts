export const getTodayInIST = (): string => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}
