/**
 * Babel config. The app uses Expo's default preset: in Metro, NativeWind v5 adds `className`
 * support through its resolver (`withNativewind` in metro.config.js), not through Babel.
 *
 * Jest doesn't run Metro, so tests add `nativewind/babel`, which rewrites `react-native` imports
 * to `react-native-css` components the same way. Without it, `className` is ignored in tests.
 * (`nativewind/babel` also adds the worklets plugin, so the Expo preset's copy is turned off.)
 */
module.exports = function (api) {
    if (api.env("test")) {
        return {
            presets: [
                ["babel-preset-expo", { worklets: false, reanimated: false }],
                "nativewind/babel",
            ],
        };
    }

    return { presets: ["babel-preset-expo"] };
};
