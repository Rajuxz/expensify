// hooks/use-period-stat.ts
import useSWR from "swr"

export function usePeriodStat<T>(
    key: string,
    fetcher: () => Promise<T>,
    deps: unknown[] = []
) {
    return useSWR([key, ...deps], fetcher)
}
