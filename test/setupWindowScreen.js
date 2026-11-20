// react-aria (used by gluestack-ui's overlays) patches window.screen.orientation when it loads under
// NODE_ENV=test, and throws if window.screen is missing, as it is in the React Native Jest
// environment. An empty object is enough: react-aria fills in the rest. See jest.config.js.
if (typeof window === "object" && window.screen === undefined) {
    window.screen = {};
}
