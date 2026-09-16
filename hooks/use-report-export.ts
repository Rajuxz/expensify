// features/reports/hooks/use-report-export.ts
import { useState } from "react"
import { toast } from "sonner"
import pdfExportConfig, {
    ReportPeriod,
    ReportParams,
} from "@/lib/reports/pdf-export-config"

export function useReportExport() {
    const [loading, setLoading] = useState<string | null>(null)

    async function handleExport(
        period: ReportPeriod,
        format: "csv" | "pdf",
        params?: ReportParams
    ) {
        const key = `${period}-${format}`
        setLoading(key)

        try {
            if (format !== "pdf") {
                toast.error("This report type isn't available yet.")
                return
            }

            const config = pdfExportConfig[period]
            const data = await config.fetchData(params)

            if (data.rows.length === 0) {
                toast.error(config.emptyMessage)
                return
            }

            const { generate } = await config.generatePdf()
            generate(data)
            toast.success("PDF downloaded.")
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong generating the report.")
        } finally {
            setLoading(null)
        }
    }

    return { loading, handleExport }
}
