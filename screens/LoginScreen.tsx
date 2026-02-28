import { NavigationProp } from "@react-navigation/native";
import { View, StyleSheet, Text, Pressable, TextInput } from "react-native";
import { Colors } from "../colors";
import HeaderGradient from "../components/HeaderGradient";
import { formStyles } from "../components/form/FormStyle";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import Form from "../components/form/Form";
import ShortText from "../components/form/form_fields/ShortText";

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: Colors.background, justifyContent: "center" },
    workspace: { flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center" },
    title: { fontSize: 48, textAlign: "center", fontFamily: "Poppins-Bold" },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 20,
        fontFamily: "Poppins-SemiBold",
        justifyContent: "center"
    }
});

export default function LoginScreen({ navigation }: { navigation: NavigationProp<any>}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError(error.message);
            console.log(error);
        } else {
            console.log("loggedin!")
            navigation.navigate("Home")
        }
    }

    return(
        <View style={styles.container}>
            <HeaderGradient/>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Hair Diary</Text>
                </View> 

                <Form buttonText="Login" handleSave={handleLogin}>
                    <ShortText placeHolder="Username" value={email} onChangeText={setEmail} label="Username"/>
                    <Text style={formStyles.label}>Password</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        secureTextEntry
                        style={formStyles.smallInput}
                    />
                </Form>
        </View>
    );
}