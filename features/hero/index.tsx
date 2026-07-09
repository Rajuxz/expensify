"use client"

import Link from "next/link"
import { ArrowRight, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-[#FAF9F6] px-6 py-20 sm:py-28 lg:py-36">
            <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-2 lg:items-center">
                {/* Left: copy */}
                <div className="flex flex-col gap-6 text-center lg:text-left">
                    <span className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-[#D8D3C7] bg-white px-3 py-1 text-xs font-mono uppercase tracking-widest text-[#2F6F4E] lg:mx-0">
                        Track every rupee
                    </span>

                    <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-[#1B2B22] sm:text-5xl lg:text-6xl">
                        Know where your money
                        <span className="text-[#2F6F4E]"> actually</span> goes.
                    </h1>

                    <p className="mx-auto max-w-md text-base text-[#1B2B22]/70 sm:text-lg lg:mx-0">
                        Expensify turns receipts and bank swipes into a clear,
                        running ledger — so every expense is logged,
                        categorized, and accounted for.
                    </p>

                    <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full border-[#D8D3C7] text-[#1B2B22] sm:w-auto"
                        >
                            <Link href="#how-it-works">See how it works</Link>
                        </Button>
                    </div>
                </div>

                {/* Right: ledger snippet card */}
                <div className="relative mx-auto w-full max-w-sm hidden md:block">
                    <div className="rounded-2xl border border-[#D8D3C7] bg-white p-6 shadow-[0_20px_60px_-25px_rgba(27,43,34,0.35)]">
                        <div className="flex items-center justify-between border-b border-dashed border-[#D8D3C7] pb-4">
                            <span className="font-mono text-xs uppercase tracking-wider text-[#1B2B22]/50">
                                This month
                            </span>
                            <TrendingDown className="h-4 w-4 text-[#2F6F4E]" />
                        </div>

                        <p className="mt-4 font-mono text-3xl font-semibold text-[#1B2B22]">
                            ₹18,240
                            <span className="text-base text-[#1B2B22]/40">
                                .00
                            </span>
                        </p>

                        <ul className="mt-6 space-y-3">
                            {[
                                { label: "Groceries", amount: "₹2,150" },
                                { label: "Rent", amount: "₹9,000" },
                                { label: "Transport", amount: "₹640" },
                            ].map((row) => (
                                <li
                                    key={row.label}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="text-[#1B2B22]/70">
                                        {row.label}
                                    </span>
                                    <span className="font-mono text-[#1B2B22]">
                                        {row.amount}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="absolute -right-4 -top-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A227] text-sm font-bold text-white shadow-lg sm:-right-6 sm:-top-6">
                        +12%
                    </div>
                </div>
            </div>
        </section>
    )
}
