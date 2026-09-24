// Settings (server component). Reads the saved timezone on the server;
// each card below is its own client component.
import requireUser from "@/lib/auth/getCurrentUser"
import { userTimeZone } from "@/lib/auth/timezone"
import ManageCategory from "@/features/setting/components/manage-category"
import ManageCurrency from "@/features/setting/components/manage-currency"
import ManageProfile from "@/features/setting/components/manage-profile"
import { ManageTimezone } from "@/features/setting/components/manage-timezone"
import SignOut from "@/features/setting/components/sign-out"

export default async function SettingsPage() {
    const user = await requireUser()

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Settings</h2>

            <ManageProfile />
            <ManageCategory />
            <ManageTimezone current={userTimeZone(user)} />
            <ManageCurrency />
            <SignOut />
        </div>
    )
}
