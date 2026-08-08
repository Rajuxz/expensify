export function getStartOfWeek(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay() // 0 = Sunday
    d.setDate(d.getDate() - day) // back up to Sunday
    d.setHours(0, 0, 0, 0)
    return d
}
