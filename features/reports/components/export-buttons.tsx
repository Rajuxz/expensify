import { FileSpreadsheet, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Period } from "@/constants/report-footer-constants"

function ExportButtons({
    period,
    loading,
    onExport,
}: {
    period: Period
    loading: string | null
    onExport: (period: Period, format: "csv" | "pdf") => void
}) {
    return (
        <div className="flex items-center gap-1.5 shrink-0">
            <Button
                variant="ghost"
                size="sm"
                disabled={loading !== null}
                onClick={() => onExport(period, "csv")}
                className="h-8 px-2.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">
                    {loading === `${period}-csv` ? "..." : "CSV"}
                </span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                disabled={loading !== null}
                onClick={() => onExport(period, "pdf")}
                className="h-8 px-2.5 text-rose-700 hover:text-rose-800 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">
                    {loading === `${period}-pdf` ? "..." : "PDF"}
                </span>
            </Button>
        </div>
    )
}

export default ExportButtons
