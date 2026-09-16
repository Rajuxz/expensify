import { useReportExport } from "@/hooks/use-report-export"
import { ReportGrid } from "@/features/reports/components/report-grid"
import CustomReportsSection from "./custom-report-section"

export function ReportFooter() {
    const { loading, handleExport } = useReportExport()

    return (
        <div className="border-t pt-5 space-y-4">
            <ReportGrid
                title="General reports"
                description="Export your expense data by period."
                loading={loading}
                onExport={handleExport}
            />
            <CustomReportsSection
                title={"Custom Reports"}
                description="Export the reports you need."
                loading={loading}
                onExport={handleExport}
            />
        </div>
    )
}
