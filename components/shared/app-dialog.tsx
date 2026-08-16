import React from "react"

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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
