import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface DailyReportData {
    date: string
    user: string
    total: number
    rows: {
        time: string
        category: string
        title: string
        paymentType: string
        amount: number
        note: string
    }[]
}

export function generateDailyReportPdf(data: DailyReportData) {
    const doc = new jsPDF({
        orientation: "portrait",
        format: "a4",
    })

    doc.setFontSize(16)
    doc.text("Daily Expense Report", 14, 18)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`User: ${data.user}`, 14, 26)
    doc.text(`Date: ${data.date}`, 14, 32)
    doc.text(`Total: Rs. ${data.total.toFixed(2)}`, 14, 36)

    autoTable(doc, {
        startY: 42,
        head: [["S.N.", "Title", "Category", "Payment", "Amount", "Note"]],
        body: data.rows.map((r, i) => [
            i + 1,
            r.title,
            r.category,
            r.paymentType,
            `Rs. ${r.amount.toFixed(2)}`,
            r.note,
        ]),
        headStyles: { fillColor: [30, 30, 30] },
        styles: { fontSize: 9 },
    })

    doc.save(`daily-report-${data.date}.pdf`)
}
