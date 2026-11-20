// Jest environment: the jest-expo (React Native) environment plus a pinned, switchable time zone.
//
// Setting `process.env.TZ` inside a test has no effect, because tests see a copy of
// `process.env`. This environment sets TZ on the real worker process instead, where Node applies it
// to every `Date`. Each test starts in DEFAULT_TIME_ZONE, so results don't depend on the machine's
// zone, and a test can switch zones with the `setTimeZone()` global (declared in test/globals.d.ts).
const ReactNativeEnvironment = require("react-native/jest/react-native-env");

/** A zone behind UTC, so code that mixes up UTC and local dates fails in the evening. */
const DEFAULT_TIME_ZONE = "America/Los_Angeles";

module.exports = class TimeZoneEnvironment extends ReactNativeEnvironment {
    constructor(config, context) {
        super(config, context);
        process.env.TZ = DEFAULT_TIME_ZONE;
        this.global.setTimeZone = (timeZone) => {
            process.env.TZ = timeZone;
        };
    }

    async handleTestEvent(event, state) {
        await super.handleTestEvent?.(event, state);
        // test_start fires before the test's beforeEach hooks, so they can still switch zones.
        if (event.name === "test_start") {
            process.env.TZ = DEFAULT_TIME_ZONE;
        }
    }
};
