import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="mt-2 text-muted-foreground ">
                The page you're looking for doesn't exist.
                <Link href={"/"} className="flex items-start">
                    <span className="mr-5">Go Back</span>
                    <ArrowLeft />
                </Link>
            </p>
        </div>
    )
}
