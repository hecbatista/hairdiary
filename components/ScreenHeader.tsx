import { View, Pressable, Text, StyleSheet } from "react-native";
import { NavigationProp } from "@react-navigation/native";
import Entypo from "@expo/vector-icons/Entypo";
import { Colors } from "../colors";

// Type declaration
interface ScreenHeaderProps {
    title: string;
    navigation: NavigationProp<any>;
}

// Style Sheet
const styles = StyleSheet.create({
    headerContainer: {flexDirection: "row", justifyContent: "space-between", marginBottom: 20, alignItems: "center"},
    backButton: {width: 50, height: 50, justifyContent: "center", alignItems: "center"},
    title: { flex: 1, fontSize: 28, fontFamily: "Poppins-SemiBold", textAlign: "center" },
});

/**
 * Returns the screen header with title and back button.
 * 
 * @params
 * - title (string): the title of the screen
 * - navigation (NavigationProp<any): the navigation to use to go back 
 * @returns the screen header.
 */
export default function ScreenHeader({ title, navigation }: ScreenHeaderProps) {
    return (
        <View style={styles.headerContainer}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                <Entypo name="chevron-left" size={30} color={Colors.text} />
            </Pressable>
            <Text style={styles.title}>{title}</Text>
         </View>
    );
}