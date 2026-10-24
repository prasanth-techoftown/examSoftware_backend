export const calculateTimeTaken = (startedAt: string, submittedAt: string) => {
    const start = new Date(startedAt)
    const end = new Date(submittedAt)

    const diffMs = end.getTime() - start.getTime()
    if (diffMs <= 0) return '0 min 0 sec'

    const totalSeconds = Math.floor(diffMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes} min ${seconds} sec`
}
