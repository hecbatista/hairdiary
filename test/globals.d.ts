/**
 * Switches the time zone for the rest of the current test (IANA name, e.g. "Pacific/Auckland").
 * Provided by test/timeZoneEnvironment.js; every test starts in America/Los_Angeles.
 */
declare function setTimeZone(timeZone: string): void;
