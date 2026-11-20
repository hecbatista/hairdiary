/**
 * Returns today's date in the device's time zone as a "YYYY-MM-DD" string.
 *
 * @returns the local calendar date, e.g. "2026-11-19".
 */
export function todayISO() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
