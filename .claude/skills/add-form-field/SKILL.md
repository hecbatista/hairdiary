---
name: add-form-field
description: Add a reusable form input component (e.g. rating, tag picker, date picker, product multi-select, photo picker) to components/form/form_fields/. Use when a form needs an input the existing ShortText, LongText and Dropdown fields don't cover.
---

# Add a form field

Form inputs live in `components/form/form_fields/` and share styles from `components/form/FormStyle.tsx` (`formStyles`). Screens compose them inside `<Form buttonText=... handleSave=...>`.

## 1. Create `components/form/form_fields/<Name>.tsx`

Follow `ShortText.tsx`: a label on top, then the control, with the value controlled by the parent.

```tsx
import { View, Text } from "react-native";
import { formStyles } from "../FormStyle";

interface <name>Props {
    label: string;
    value: <ValueType>;
    onChange: (value: <ValueType>) => void;
}

/**
 * <What the field is for.>
 */
export default function <Name>({ label, value, onChange }: <name>Props) {
    return (
        <View>
            <Text style={formStyles.label}>{label}</Text>
            {/* control */}
        </View>
    );
}
```

- Keep it controlled: no internal copy of `value`. Local UI state, like `showDropdown` in `Dropdown.tsx`, is fine.
- Type the props precisely. Avoid `any`, and use a generic (`<T extends string>`) when the field works with any option list.
- Pass option lists in as props instead of importing domain constants. (`Dropdown` currently hardcodes `ENTRY_TYPES`; don't copy that.)
- Add new shared styles to `formStyles` in `FormStyle.tsx` and reuse `Colors` and the Poppins fonts.
- Use `@expo/vector-icons` (Ionicons, Entypo) for icons, as the existing fields do.

## 2. Use it

```tsx
<Form buttonText="Save Entry" handleSave={handleSave}>
    <<Name> label="..." value={value} onChange={setValue} />
</Form>
```

## 3. Verify

- `npx tsc --noEmit`
- Check it in the simulator: the label, the selected state, keyboard dismissal, and how it looks next to the other fields.
- Add a component test with React Native Testing Library once Jest is set up (#12).
