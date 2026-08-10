import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import React from "react"

const ManageData = () => {
    const handleExportData = () => {
        // TODO: generate CSV/JSON export of all expenses
        console.log("exporting all data")
    }

    const handleDeleteAccount = () => {
        // TODO: confirm dialog + cascade delete via Server Action
        console.log("delete account requested")
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Data</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
                <Button variant="outline" onClick={handleExportData}>
                    Export Data
                </Button>
                <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-600"
                    onClick={handleDeleteAccount}
                >
                    Delete Account
                </Button>
            </CardContent>
        </Card>
    )
}

export default ManageData
