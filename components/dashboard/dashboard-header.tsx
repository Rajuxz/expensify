export function DashboardHeader({ now }: { now: Date }) {
    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
                {now.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                })}
                {" · "}Here&apos;s where your money went this week
            </p>
        </div>
    )
}
