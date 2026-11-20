import { View } from "react-native";

interface IconProps {
    name: string;
}

/**
 * Test stand-in for every `@expo/vector-icons/<Set>` component (mapped in `jest.config.js`).
 *
 * Renders an empty view with the test ID `icon-<name>`, so tests can check which icon shows
 * without loading fonts.
 *
 * @param props.name The icon name, e.g. "checkmark".
 */
export default function VectorIconMock({ name }: IconProps) {
    return <View testID={`icon-${name}`} />;
}
