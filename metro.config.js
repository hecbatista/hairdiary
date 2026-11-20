const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import("expo/metro-config").MetroConfig} */
const config = getDefaultConfig(__dirname);

// Compiles global.css with Tailwind and adds `className` to React Native components.
// inlineRem: 16 makes `rem` values (Tailwind's defaults) resolve to 16px on native.
module.exports = withNativewind(config, { inlineRem: 16 });
