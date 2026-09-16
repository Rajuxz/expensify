import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export default clerkMiddleware(async (auth, req) => {
    const pathname = req.nextUrl.pathname
    const { isAuthenticated, redirectToSignIn } = await auth()

    if (pathname === "/" && isAuthenticated) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
        if (!isAuthenticated) return redirectToSignIn()
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
        // Always run for Clerk-specific frontend API routes
        "/__clerk/(.*)",
    ],
}
