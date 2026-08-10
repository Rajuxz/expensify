import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const currencies = ["Rs.", "$", "¥"]

import { Label } from "recharts"
export default function ManageCurrency() {
    const [currency, setCurrency] = useState("Rs.")
    const [monthlyBudget, setMonthlyBudget] = useState("")
    const [emailAlerts, setEmailAlerts] = useState(true)

    // Placeholder — replace with real category fetch (Server Action/SWR)

    const handleSavePreferences = () => {
        // TODO: persist currency/budget/notification prefs
        console.log({ currency, monthlyBudget, emailAlerts })
    }

    const handleExportData = () => {
        // TODO: generate CSV/JSON export of all expenses
        console.log("exporting all data")
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Change Currency Preferance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Field>
                    <Label>Currency</Label>
                    <Combobox
                        items={currencies}
                        value={currency}
                        onValueChange={(value) => console.log("Test")}
                    >
                        <ComboboxInput placeholder="Currency" />
                        <ComboboxContent>
                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                            <ComboboxList>
                                {(item) => (
                                    <ComboboxItem key={item} value={item}>
                                        {item}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </Field>

                <Button onClick={handleSavePreferences}>
                    Save Preferences
                </Button>
            </CardContent>
        </Card>
    )
}
