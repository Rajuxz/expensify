"use client"
import ManageCategory from "@/features/setting/components/manage-category"
import ManageCurrency from "@/features/setting/components/manage-currency"
import ManageProfile from "@/features/setting/components/manage-profile"
import SignOut from "@/features/setting/components/sign-out"

export default function SettingsPage() {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Settings</h2>

            <ManageProfile />
            <ManageCategory />
            <ManageCurrency />
            <SignOut />
        </div>
    )
}
