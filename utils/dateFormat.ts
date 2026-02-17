/**
 * Formats YYYY-MM-DD into a user reading date Month Day, Year.
 * 
 * @param dateString Date as YYYY-MM-DD
 * @param yearIncluded Include year in result?
 * @returns the formatted user readiable date.
 */
export function formatDateLong(dateString: string, yearIncluded: boolean): string {
    const [year, month, day] = dateString.split("-").map(Number);

    const date = new Date(year, month - 1, day);
    const monthName = date.toLocaleDateString('en-US', { month: 'long' })
    const dayNum = date.getDate();

    /** 
     * Returns the ending of the date for sentence structure
     * Ex: September 1st, September 2nd, September 3rd, etc.
     */
    const getOrdinal = (day: number): string => {
        if (day > 3 && day < 21) return 'th';
        switch(day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    const result = yearIncluded ? `${monthName} ${dayNum}${getOrdinal(dayNum)}, ${year}` : `${monthName} ${dayNum}${getOrdinal(dayNum)}`
    return result;
}