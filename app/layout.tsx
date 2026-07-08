import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

import {
    ClerkProvider,
    Show,
    SignInButton,
    SignUpButton,
    UserButton,
} from "@clerk/nextjs"

const spaceGrotesk = Space_Grotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "Expensify",
    description: "Your beautiful expense tracker application.",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={`${spaceGrotesk.variable} antialiased`}>
                <ClerkProvider>{children}</ClerkProvider>
            </body>
        </html>
    )
}
