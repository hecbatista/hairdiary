import { todayISO } from "../todayISO";

describe("todayISO", () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    /** Freezes the clock at the given instant (an ISO string with an explicit offset). */
    function setNow(instant: string) {
        jest.useFakeTimers({ now: new Date(instant) });
    }

    it("returns the local date late in the evening, when UTC is already tomorrow", () => {
        setTimeZone("America/Los_Angeles");
        setNow("2026-11-19T20:00:00-08:00"); // 2026-11-20T04:00Z

        expect(todayISO()).toBe("2026-11-19");
    });

    it("returns the local date early in the morning, when UTC is still yesterday", () => {
        setTimeZone("Pacific/Auckland");
        setNow("2026-11-19T08:00:00+13:00"); // 2026-11-18T19:00Z

        expect(todayISO()).toBe("2026-11-19");
    });

    it("rolls over at local midnight", () => {
        setTimeZone("America/Los_Angeles");
        setNow("2026-11-19T23:59:59-08:00");
        expect(todayISO()).toBe("2026-11-19");

        setNow("2026-11-20T00:00:00-08:00");
        expect(todayISO()).toBe("2026-11-20");
    });

    it("zero-pads single-digit months and days", () => {
        setTimeZone("UTC");
        setNow("2026-02-05T12:00:00Z");

        expect(todayISO()).toBe("2026-02-05");
    });
});
