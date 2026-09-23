// components/report-grid.tsx
import { reports, Period } from "@/constants/report-footer-constants"
import ReportRow from "@/features/reports/components/report-row"
type ReportGridProps = {
    title: string
    description: string
    loading: string | null
    onExport: (period: Period, format: "csv" | "pdf") => void
}

export function ReportGrid({
    title,
    description,
    loading,
    onExport,
}: ReportGridProps) {
    return (
        <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {reports.map((report) => (
                    <ReportRow
                        key={report.period}
                        report={report}
                        loading={loading}
                        onExport={onExport}
                    />
                ))}
            </div>
        </div>
    )
}
