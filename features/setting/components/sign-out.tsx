import { SignOutButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import AppDialog from "@/components/shared/app-dialog"
import { LogOutIcon } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
const SignOut = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Session Management</CardTitle>
                <CardDescription>Log out current session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <AppDialog
                    trigger={
                        <Button
                            variant="ghost"
                            className={
                                "bg-gray-500 text-white hover:text-white hover:bg-gray-600 transition-colors duration-100"
                            }
                        >
                            <LogOutIcon className="h-4 w-4" /> Log Out
                        </Button>
                    }
                    title="Log Out"
                    description="Are you sure?"
                >
                    <SignOutButton redirectUrl="/">
                        <Button
                            variant="ghost"
                            className={
                                "bg-red-500 text-white w-fit hover:bg-red-600 hover:text-white"
                            }
                        >
                            Yes! Log Out
                        </Button>
                    </SignOutButton>
                </AppDialog>
            </CardContent>
        </Card>
    )
}

export default SignOut
