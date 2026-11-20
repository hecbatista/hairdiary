/** @type {import("jest").Config} */
module.exports = {
    preset: "jest-expo",
    // jest-expo's environment plus a pinned time zone and a setTimeZone() global.
    testEnvironment: "<rootDir>/test/timeZoneEnvironment.js",
    // Claude Code keeps git worktrees (full copies of the repo) in .claude/worktrees/. Without
    // these, Jest collects their stale tests and reports duplicate package and mock names.
    testPathIgnorePatterns: ["/node_modules/", "<rootDir>/.claude/"],
    modulePathIgnorePatterns: ["<rootDir>/.claude/"],
    moduleNameMapper: {
        // The real icons load fonts through expo-font, which imports expo-asset. expo-asset is
        // only installed nested under expo/, so Jest can't resolve it. Icons are presentational,
        // so tests render a stub instead (see test/vectorIconMock.tsx).
        "^@expo/vector-icons/(.*)$": "<rootDir>/test/vectorIconMock.tsx",
    },
};
