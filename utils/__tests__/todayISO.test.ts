import { todayISO } from "../todayISO";

describe("todayISO", () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it("returns the current date as YYYY-MM-DD", () => {
        jest.useFakeTimers({ now: new Date("2026-11-19T15:30:00Z") });

        expect(todayISO()).toBe("2026-11-19");
    });

    it("zero-pads single-digit months and days", () => {
        jest.useFakeTimers({ now: new Date("2026-02-05T12:00:00Z") });

        expect(todayISO()).toBe("2026-02-05");
    });
});
