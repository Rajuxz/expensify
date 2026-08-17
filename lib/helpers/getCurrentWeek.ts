export default function getCurrentWeek() {
    const date = new Date()

    const day = date.getDay()
    const diff = day === 0 ? -6 : 1 - day

    const fromDate = new Date(date)
    fromDate.setDate(date.getDate() + diff)
    fromDate.setHours(0, 0, 0, 0)

    const toDate = new Date(fromDate)
    toDate.setDate(fromDate.getDate() + 6)
    toDate.setHours(23, 59, 59, 999)

    return { fromDate, toDate }
}
