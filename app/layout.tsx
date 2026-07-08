import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

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
        <html
            lang="en"
            className={cn("h-full", "antialiased", spaceGrotesk.variable, "font-mono", jetbrainsMono.variable)}
        >
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    )
}
