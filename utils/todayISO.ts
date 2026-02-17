/**
 * Returns the date as a "YYYY-MM-DD" string.
 * 
 * @returns the date formated as string.
 */
export function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}