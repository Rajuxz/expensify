import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import { Label } from "@/components/ui/label"
const ManageProfile = () => {
    const { user, isLoaded } = useUser()
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                    Managed via your account provider.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {isLoaded ? (
                    <>
                        <Field>
                            <Label>Name</Label>
                            <Input
                                defaultValue={user?.fullName ?? ""}
                                disabled
                            />
                        </Field>
                        <Field>
                            <Label>Email</Label>
                            <Input
                                defaultValue={
                                    user?.primaryEmailAddress?.emailAddress ??
                                    ""
                                }
                                disabled
                            />
                        </Field>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Loading profile...
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

export default ManageProfile
