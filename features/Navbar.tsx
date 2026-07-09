"use client"

import { useState } from "react"
import Link from "next/link"
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

const menuItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
]

function AuthButtons() {
    return (
        <>
            <Show when="signed-out">
                <SignInButton>
                    <button className=" rounded-full font-medium text-sm h-10 px-4 cursor-pointer hover:bg-gray-700/10">
                        Sign In
                    </button>
                </SignInButton>
                <SignUpButton>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-full font-medium text-sm h-10 px-4 cursor-pointer">
                        Sign Up
                    </button>
                </SignUpButton>
            </Show>
            <Show when="signed-in">
                <UserButton />
            </Show>
        </>
    )
}

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="border-b bg-white dark:bg-neutral-950 dark:border-neutral-800">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                {/* Left: logo + menu links */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-lg font-semibold">
                        Expensify
                    </Link>

                    <div className="hidden items-center gap-4 sm:flex">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-md text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right: auth buttons (desktop) + hamburger (mobile) */}
                <div className="flex items-center gap-4">
                    <div className="hidden items-center gap-4 sm:flex">
                        <AuthButtons />
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="sm:hidden"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {isOpen && (
                <div className="flex flex-col gap-4 border-t px-4 py-4 sm:hidden dark:border-neutral-800">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="text-sm text-neutral-600 mx-4 dark:text-neutral-400"
                        >
                            {item.label}
                        </Link>
                    ))}
                    <div className="flex flex-col items-start mx-4 gap-4 pt-2 border-t dark:border-neutral-800">
                        <AuthButtons />
                    </div>
                </div>
            )}
        </nav>
    )
}
