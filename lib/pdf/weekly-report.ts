import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface WeeklyReportData {
    from: string
    to: string
    total: number
    rows: {
        time: string
        title: string
        category: string
        paymentType: string
        amount: number
        note: string
    }[]
}

export function generateWeeklyReportPdf(data: WeeklyReportData) {
    const doc = new jsPDF({ orientation: "landscape", format: "a4" })

    doc.setFontSize(16)
    doc.text("Weekly Expense Report", 14, 18)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`From: ${data.from}`, 14, 26)
    doc.text(`To: ${data.to}`, 14, 32)
    doc.text(`Total: Rs. ${data.total.toFixed(2)}`, 14, 40)

    autoTable(doc, {
        startY: 45,
        head: [["Time", "Title", "Payment", "Amount (Rs.) ", "Note"]],
        body: data.rows.map((r) => [
            r.time,
            r.title,
            r.paymentType,
            `${r.amount.toFixed(2)}`,
            r.note,
        ]),
        headStyles: { fillColor: [30, 30, 30] },
        styles: { fontSize: 9 },
    })

    doc.save(`weekly-report-${data.from}-${data.to}.pdf`)
}

