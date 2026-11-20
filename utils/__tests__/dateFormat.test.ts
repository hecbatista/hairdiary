import { formatDateLong } from "../dateFormat";

describe("formatDateLong", () => {
    it("formats a date with the year", () => {
        expect(formatDateLong("2025-09-14", true)).toBe("September 14th, 2025");
    });

    it("formats a date without the year", () => {
        expect(formatDateLong("2025-09-14", false)).toBe("September 14th");
    });

    it.each([
        ["2025-03-01", "March 1st"],
        ["2025-03-02", "March 2nd"],
        ["2025-03-03", "March 3rd"],
        ["2025-03-04", "March 4th"],
        ["2025-03-11", "March 11th"],
        ["2025-03-12", "March 12th"],
        ["2025-03-13", "March 13th"],
        ["2025-03-21", "March 21st"],
        ["2025-03-22", "March 22nd"],
        ["2025-03-23", "March 23rd"],
        ["2025-03-30", "March 30th"],
        ["2025-03-31", "March 31st"],
    ])("uses the right ordinal suffix for %s", (input, expected) => {
        expect(formatDateLong(input, false)).toBe(expected);
    });

    it.each(["America/Los_Angeles", "UTC", "Pacific/Auckland"])(
        "keeps the calendar day in %s",
        (timeZone) => {
            setTimeZone(timeZone);

            // Parsed as a local date, so the first of the month never shifts to the previous day.
            expect(formatDateLong("2026-01-01", true)).toBe("January 1st, 2026");
            expect(formatDateLong("2026-12-31", true)).toBe("December 31st, 2026");
        },
    );
});
