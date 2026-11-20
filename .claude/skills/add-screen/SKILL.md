---
name: add-screen
description: Add a new screen to the Hair Diary app following the existing layout, styling and navigation conventions. Use when creating any new screen or page (e.g. Settings, Product Shelf, Stats).
---

# Add a screen

## 1. Create `screens/<Name>Screen.tsx`

Use `screens/AddEntryScreen.tsx` as the reference. The skeleton:

```tsx
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../colors";
import HeaderGradient from "../components/HeaderGradient";
import ScreenHeader from "../components/ScreenHeader";
import type { RootStackScreenProps } from "../navigation/types";

/**
 * <One-line description of the screen.>
 *
 * @returns the <name> screen.
 */
export default function <Name>Screen({ navigation }: RootStackScreenProps<"<Name>">) {
    return (
        <View style={styles.container}>
            <HeaderGradient/>
            <ScreenHeader title="<Title>" navigation={navigation} />
            {/* content */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, paddingTop: 75, backgroundColor: Colors.background },
});
```

- Type props with `RootStackScreenProps<"<Name>">` (add `route` to the destructuring if the screen reads params). Never use `NavigationProp<any>` or `route: any`.
- Wrap the screen in `TouchableWithoutFeedback onPress={Keyboard.dismiss}` if it has text inputs.
- Use `Colors` and the Poppins font families (`fontFamily: "Poppins-SemiBold"`, etc.).
- For cards and lists, reuse the card style from `screens/HomeScreen.tsx` (white, `borderRadius: 12`, soft shadow).
- Build forms with `Form` + `components/form/form_fields/*`.

## 2. Add the route to `RootStackParamList` and register it in `App.tsx`

In `navigation/types.ts`, add the route with its params (`undefined` if it takes none):

```ts
export type RootStackParamList = {
    // ...
    <Name>: undefined; // or e.g. { entryId: string }
};
```

Then register it in `App.tsx`:

```tsx
import <Name>Screen from './screens/<Name>Screen';
// ...
<Stack.Screen name="<Name>" component={<Name>Screen}/>
```

If the route takes params, also document them in the screen's JSDoc (like `@route params` in AddEntryScreen). `navigation.navigate` and `route.params` are type-checked against `RootStackParamList`.

## 3. Link to it

Navigate from an existing screen with `navigation.navigate("<Name>", { ...params })`.

## 4. Load data on focus

If the screen shows Supabase data that other screens can change, load it in `useFocusEffect(useCallback(() => { ... }, []))`, as HomeScreen does, and put the queries in `lib/` (see the `add-data-function` skill).

## 5. Verify

- `npx tsc --noEmit`
- `npm run lint`
- Run on the iOS simulator (`npm run ios`) and check the screen renders, the back button works, and data loads.
- Update the file structure section in `README.md` and the Architecture section in `CLAUDE.md`.
