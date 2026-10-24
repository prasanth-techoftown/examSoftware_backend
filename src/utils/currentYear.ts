const getCurrentAcademicYear = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() // 0 = Jan, 11 = Dec

    return month >= 7 ? year : year - 1
}

// Export
export const academicYear = getCurrentAcademicYear() // e.g., 2025
