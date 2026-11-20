/** @type {import("jest").Config} */
module.exports = {
    preset: "jest-expo",
    moduleNameMapper: {
        // The real icons load fonts through expo-font, which imports expo-asset. expo-asset is
        // only installed nested under expo/, so Jest can't resolve it. Icons are presentational,
        // so tests render a stub instead (see test/vectorIconMock.tsx).
        "^@expo/vector-icons/(.*)$": "<rootDir>/test/vectorIconMock.tsx",
    },
};
