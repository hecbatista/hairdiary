/** @type {import("jest").Config} */
module.exports = {
    preset: "jest-expo",
    // jest-expo's environment plus a pinned time zone and a setTimeZone() global.
    testEnvironment: "<rootDir>/test/timeZoneEnvironment.js",
    // Runs after jest-expo's own setup files.
    setupFiles: ["<rootDir>/test/setupWindowScreen.js"],
    // Claude Code keeps git worktrees (full copies of the repo) in .claude/worktrees/. Without
    // these, Jest collects their stale tests and reports duplicate package and mock names.
    testPathIgnorePatterns: ["/node_modules/", "<rootDir>/.claude/"],
    modulePathIgnorePatterns: ["<rootDir>/.claude/"],
    // jest-expo transforms react-native*, expo* and @react-navigation packages; gluestack-ui and
    // NativeWind also ship untranspiled code. react-native-css matches the react-native prefix.
    transformIgnorePatterns: [
        "/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|nativewind|@gluestack-ui|tailwind-variants))",
        "/node_modules/react-native-reanimated/plugin/",
    ],
    moduleNameMapper: {
        // The "@/" alias from tsconfig.json, used by gluestack-ui components in components/ui/.
        "^@/(.*)$": "<rootDir>/$1",
        // Metro compiles global.css; Jest only needs the import to resolve. Tests that need real
        // styles compile the CSS themselves (see components/ui/gluestack-ui-provider/__tests__/GluestackUIProvider.test.tsx).
        "\\.css$": "<rootDir>/test/styleMock.js",
        // The real icons load fonts through expo-font, which imports expo-asset. expo-asset is
        // only installed nested under expo/, so Jest can't resolve it. Icons are presentational,
        // so tests render a stub instead (see test/vectorIconMock.tsx).
        "^@expo/vector-icons/(.*)$": "<rootDir>/test/vectorIconMock.tsx",
    },
};
