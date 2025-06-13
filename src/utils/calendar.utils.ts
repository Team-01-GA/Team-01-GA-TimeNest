/**
 * Returns the Date representing the Monday that starts the visible calendar grid for a month view.
 */
export function getMonthStartForCalendarGrid(date: Date): Date {
    const start = new Date(date);
    start.setDate(1);
    const day = start.getDay(); // 0 (Sun) to 6 (Sat)
    start.setDate(start.getDate() - ((day + 6) % 7)); // Align to previous Monday
    return start;
}

/**
 * Checks if two dates fall on the exact same day (ignores hours/mins/etc).
 */
export function isSameCalendarDay(a: Date, b: Date): boolean {
    return (
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear()
    );
}

export function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}