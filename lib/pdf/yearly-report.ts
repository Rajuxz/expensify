import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface ReportData {
    year: number
    user: string
    total: number
    rows: {
        time: string
        date: string
        category: string
        title: string
        paymentType: string
        amount: number
        note: string
    }[]
}

export function generateYearlyReportPdf(data: ReportData) {
    const doc = new jsPDF({
        orientation: "portrait",
        format: "a4",
    })

    doc.setFontSize(16)
    doc.text("Yearly Expense Report", 14, 18)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`User: ${data.user}`, 14, 26)
    doc.text(`Year: ${data.year}`, 14, 32)
    doc.text(`Total: Rs. ${data.total.toFixed(2)}`, 14, 36)

    autoTable(doc, {
        startY: 42,
        head: [
            ["S.N.", "Date", "Title", "Category", "Payment", "Amount", "Note"],
        ],
        body: data.rows.map((r, i) => [
            i + 1,
            r.date,
            r.title,
            r.category,
            r.paymentType,
            `Rs. ${r.amount.toFixed(2)}`,
            r.note,
        ]),
        headStyles: { fillColor: [30, 30, 30] },
        styles: { fontSize: 9 },
    })

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)

        const pageSize = doc.internal.pageSize
        const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth()
        const pageHeight = pageSize.height
            ? pageSize.height
            : pageSize.getHeight()

        doc.setFontSize(9)
        doc.setTextColor(150)

        // Formats as "Page 1 of 3" centered at bottom footer
        const footerText = `Page ${i} of ${pageCount}`
        doc.text(footerText, pageWidth / 2, pageHeight - 10, {
            align: "center",
        })
    }
    doc.save(`annual-report-of-${data.year}.pdf`)
}
