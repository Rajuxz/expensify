"use client"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"

const PAGE_SIZE = 5
type Category = {
    id: string
    name: string
}
export function CategoryList({ categories = [] }: { categories?: Category[] }) {
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

    const visibleCategories = categories?.slice(0, visibleCount)
    const hasMore = (categories?.length ?? 0) > visibleCount

    return (
        <div className="space-y-2">
            {visibleCategories?.map((cat) => (
                <div
                    key={cat.id}
                    className="flex items-center justify-between text-sm"
                >
                    <span>{cat.name}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => console.log("This")}
                    >
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            ))}

            {hasMore && (
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                >
                    Load more ({categories.length - visibleCount} remaining)
                </Button>
            )}
        </div>
    )
}
