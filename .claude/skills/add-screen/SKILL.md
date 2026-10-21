---
name: add-screen
description: Add a new screen to the Hair Diary app following the existing layout, styling and navigation conventions. Use when creating any new screen or page (e.g. Settings, Product Shelf, Stats).
---

# Add a screen

## 1. Create `screens/<Name>Screen.tsx`

Use `screens/AddEntryScreen.tsx` as the reference. The skeleton:

```tsx
import { View, Text, StyleSheet } from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { Colors } from "../colors";
import HeaderGradient from "../components/HeaderGradient";
import ScreenHeader from "../components/ScreenHeader";

//Type declaration
interface <Name>ScreenProps {
    navigation: NavigationProp<any>;
}

/**
 * <One-line description of the screen.>
 *
 * @returns the <name> screen.
 */
export default function <Name>Screen({ navigation }: <Name>ScreenProps) {
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

- If typed navigation params exist (issue #6), use them instead of `NavigationProp<any>`.
- Wrap the screen in `TouchableWithoutFeedback onPress={Keyboard.dismiss}` if it has text inputs.
- Use `Colors` and the Poppins font families (`fontFamily: "Poppins-SemiBold"`, etc.).
- For cards and lists, reuse the card style from `screens/HomeScreen.tsx` (white, `borderRadius: 12`, soft shadow).
- Build forms with `Form` + `components/form/form_fields/*`.

## 2. Register the route in `App.tsx`

```tsx
import <Name>Screen from './screens/<Name>Screen';
// ...
<Stack.Screen name="<Name>" component={<Name>Screen}/>
```

If the route takes params, document them in the screen's JSDoc (like `@route params` in AddEntryScreen). Add them to the param list type too once #6 lands.

## 3. Link to it

Navigate from an existing screen with `navigation.navigate("<Name>", { ...params })`.

## 4. Load data on focus

If the screen shows Supabase data that other screens can change, load it in `useFocusEffect(useCallback(() => { ... }, []))`, as HomeScreen does, and put the queries in `lib/` (see the `add-data-function` skill).

## 5. Verify

- `npx tsc --noEmit`
- Run on the iOS simulator (`npm run ios`) and check the screen renders, the back button works, and data loads.
- Update the file structure section in `README.md` and the Architecture section in `CLAUDE.md`.
