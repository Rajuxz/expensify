import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface DailyReportData {
    date: string
    total: number
    rows: {
        time: string
        category: string
        paymentType: string
        amount: number
        note: string
    }[]
}

export function generateDailyReportPdf(data: DailyReportData) {
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text("Daily Expense Report", 14, 18)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Date: ${data.date}`, 14, 26)
    doc.text(`Total: Rs. ${data.total.toFixed(2)}`, 14, 32)

    autoTable(doc, {
        startY: 38,
        head: [["Time", "Category", "Payment", "Amount", "Note"]],
        body: data.rows.map((r) => [
            r.time,
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
