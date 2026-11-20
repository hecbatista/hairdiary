/**
 * Raw color values for code that can't use NativeWind classes: `react-native-calendars` themes,
 * `expo-linear-gradient` stops, and screens still on `StyleSheet` until #51.
 *
 * The tokens in `global.css` are the source of truth. Each key here is a token name in camelCase
 * (`secondaryStrong` is `--secondary-strong`), and `colors.test.ts` fails if a value drifts from
 * its token. In new UI, prefer the class (`bg-secondary`) over `Colors.secondary`.
 */
export const Colors = {
    background: "#EAD9D1",
    foreground: "#000000",
    card: "#F7F1EE",
    surface: "#FFFFFF",
    primary: "#1E1E1E",
    primaryForeground: "#FFFFFF",
    primaryMuted: "#2A2A2A",
    secondary: "#AD948B",
    secondaryStrong: "#61524A",
    accent: "#D7B5A6",
    calendar: "#BFA69A",
    muted: "#D9D9D9",
    mutedForeground: "#6E6E6E",
    border: "#F0F0F0",
    ring: "#007AFF",
    destructive: "#E7000B",

    /** @deprecated Use `foreground` (`--foreground`). */
    text: "#000000",
    /** @deprecated Use `mutedForeground` (`--muted-foreground`). */
    mutedText: "#6E6E6E",
} as const;
