import { cn } from "@/lib/utils"

type StatusBadgeProps = {
    label: string
    variant?: "accent" | "warning"
}

export function StatusBadge({ label, variant = "accent" }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full py-1 pl-2 pr-2.5 text-xs font-medium",
                variant === "accent" && "bg-blue-100 text-blue-700",
                variant === "warning" && "bg-amber-100 text-amber-700"
            )}
        >
            <span className="relative flex h-2 w-2">
                <span
                    className={cn(
                        "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                        variant === "accent" && "bg-blue-500",
                        variant === "warning" && "bg-amber-500"
                    )}
                />
                <span
                    className={cn(
                        "relative inline-flex h-2 w-2 rounded-full",
                        variant === "accent" && "bg-blue-500",
                        variant === "warning" && "bg-amber-500"
                    )}
                />
            </span>
            {label}
        </span>
    )
}
