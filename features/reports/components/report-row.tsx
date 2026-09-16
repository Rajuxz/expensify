// components/report-row.tsx
import { reports, Period } from "@/constants/report-footer-constants"
import ExportButtons from "@/features/reports/components/export-buttons"
function ReportRow({
    report,
    loading,
    onExport,
}: {
    report: (typeof reports)[number]
    loading: string | null
    onExport: (period: Period, format: "csv" | "pdf") => void
}) {
    const { period, label, description, icon: Icon } = report

    return (
        <div className="group flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors hover:border-foreground/20 hover:bg-muted/40">
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium leading-none">{label}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                        {description}
                    </p>
                </div>
            </div>
            <ExportButtons
                period={period}
                loading={loading}
                onExport={onExport}
            />
        </div>
    )
}

export default ReportRow
