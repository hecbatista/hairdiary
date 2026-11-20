import type { NativeStackScreenProps } from "@react-navigation/native-stack";

/**
 * Routes of the root native stack in `App.tsx` and the params each one takes.
 * `undefined` means the route takes no params.
 */
export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    /** `date` is the selected calendar day, as a "YYYY-MM-DD" string. */
    AddEntry: { date: string };
    Profile: undefined;
};

/**
 * Props React Navigation passes to a screen of the root stack.
 *
 * @example
 * export default function ProfileScreen({ navigation }: RootStackScreenProps<"Profile">) {}
 */
export type RootStackScreenProps<RouteName extends keyof RootStackParamList> =
    NativeStackScreenProps<RootStackParamList, RouteName>;

// Types `useNavigation()`, `<Link>` and other navigation helpers with the root stack's routes.
declare global {
    namespace ReactNavigation {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface RootParamList extends RootStackParamList {}
    }
}
