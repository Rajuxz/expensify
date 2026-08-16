"use client"
import AppDialog from "@/components/shared/app-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pen, Trash2 } from "lucide-react"
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

    const [name, setName] = useState("")

    return (
        <div className="space-y-2">
            {visibleCategories?.map((cat) => (
                <div
                    key={cat.id}
                    className="flex items-center justify-between text-sm"
                >
                    <div>
                        <span>{cat.name}</span>
                    </div>
                    <div>
                        <AppDialog
                            trigger={
                                <Button
                                    variant="ghost"
                                    className={"cursor-pointer"}
                                    size="icon"
                                    onClick={() => console.log("This")}
                                >
                                    <Pen className="h-4 2-4 text-green-600" />
                                </Button>
                            }
                            title="Rename category"
                            description="Please enter the name of your category."
                        >
                            <div>
                                <Input value={cat.name} />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={
                                        "bg-black w-fit mt-3 px-3 text-white cursor-pointer hover:bg-black hover:text-white"
                                    }
                                >
                                    Update
                                </Button>
                            </div>
                        </AppDialog>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => console.log("This")}
                        >
                            <Trash2 className="h-4 w-4 text-red-500 cursor-pointer" />
                        </Button>
                    </div>
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
