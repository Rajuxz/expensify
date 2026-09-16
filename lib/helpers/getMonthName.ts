export function getMonthName(month: number): string {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    if (month < 1 || month > 12) {
        throw new Error("Month must be between 1 and 12")
    }

    return months[month - 1]
}
