// To handle both mouse click and keyboard (Enter/Space) selection
export function selectableProps(onSelect: () => void) {
    return {
        role: "button" as const,
        tabIndex: 0,
        onClick: onSelect,
        onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect()
            }
        },
    }
}
