// pluralize(3, "expense") -> "3 expenses"
export default function pluralize(count: number, word: string): string {
    return `${count} ${word}${count === 1 ? "" : "s"}`
}
