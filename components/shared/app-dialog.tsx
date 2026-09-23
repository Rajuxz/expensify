"use client"
import React, { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

type AppDialogProps = {
    trigger: React.ReactElement
    title?: string
    description?: string
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const AppDialog = ({
    trigger,
    title,
    description,
    children,
    open,
    onOpenChange,
}: AppDialogProps) => {
    const pathname = usePathname()
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = open !== undefined

    // A link inside a dialog (e.g. "Manage categories") navigates client-side;
    // without this the dialog would stay open over the new page.
    const lastPathname = useRef(pathname)
    useEffect(() => {
        if (lastPathname.current === pathname) return
        lastPathname.current = pathname
        setInternalOpen(false)
        if (isControlled) onOpenChange?.(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname])

    return (
        <Dialog
            open={isControlled ? open : internalOpen}
            onOpenChange={(next) => {
                if (!isControlled) setInternalOpen(next)
                onOpenChange?.(next)
            }}
        >
            <DialogTrigger render={trigger} />
            <DialogContent>
                {(title || description) && (
                    <DialogHeader>
                        {title && <DialogTitle>{title}</DialogTitle>}
                        {description && (
                            <DialogDescription>{description}</DialogDescription>
                        )}
                    </DialogHeader>
                )}
                {children}
            </DialogContent>
        </Dialog>
    )
}

export default AppDialog
