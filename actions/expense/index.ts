"user server"
import { auth } from "@clerk/nextjs/server"
export async function createExpense(data: FormData) {
    const { userId } = await auth()

    if (!userId) {
        throw new Error("Unauthorized.")
    }

    // adding expenses in the database.

    
}
