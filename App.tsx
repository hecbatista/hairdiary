import { Text, View, StyleSheet, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { supabase } from "./lib/supabase";

import HomeScreen from "./screens/HomeScreen";
import AddEntryScreen from "./screens/AddEntryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { useEffect } from "react";
import LoginScreen from "./screens/LoginScreen";
import type { RootStackParamList } from "./navigation/types";
import { GluestackUIProvider } from "./components/ui/gluestack-ui-provider";
import "./global.css";

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    const [loaded, error] = useFonts({
        "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
        "Poppins-Medium": require("./assets/fonts/Poppins-Medium.ttf"),
        "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf"),
        "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf"),
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        // Light only until dark mode lands (#52); the provider sets the app's color scheme.
        <GluestackUIProvider mode="light">
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="AddEntry" component={AddEntryScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </GluestackUIProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#fff",
        alignItems: "center",
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "600",
        marginBottom: 12,
    },
});
