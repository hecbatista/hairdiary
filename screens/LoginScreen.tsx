import { NavigationProp } from "@react-navigation/native";
import { View, StyleSheet, Text, Pressable, TextInput } from "react-native";
import { Colors } from "../colors";
import HeaderGradient from "../components/HeaderGradient";
import { formStyles } from "../components/form/FormStyle";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import Form from "../components/form/Form";
import ShortText from "../components/form/form_fields/ShortText";
import Entypo from "@expo/vector-icons/Entypo";
import CustomButton from "../components/CustomButton";

const styles = StyleSheet.create({
    container: { flex: 1, padding: 25, paddingTop: 125, backgroundColor: Colors.background },
    workspace: { flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center" },
    title: { fontSize: 48, textAlign: "left", fontFamily: "Poppins-Bold", marginBottom: 10 },
    headerRow: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 20,
        fontFamily: "Poppins-SemiBold",
        justifyContent: "center"
    },
    labelBoldText: {
        fontSize: 16, fontFamily: "Poppins-Bold", marginBottom: 10
    },
    labelText: {
        fontSize: 16, fontFamily: "Poppins-Regular", marginBottom: 10
    },
    signUpContainer: {
        flexDirection: "row", gap: "2", marginTop: 15
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
                <Text style={styles.title}>Log in</Text>
                <ShortText placeHolder="Email" value={email} onChangeText={setEmail} label="Email" icon={<Entypo name="mail" size={18} color="grey"/>}/>
                <ShortText placeHolder="Password" value={password} onChangeText={setPassword} label="Password" icon={<Entypo name="lock" size={18} color="grey"/>} secure={true}/>
                <Pressable onPress={() => navigation.navigate("ResetPassword")}>
                    <Text style={styles.labelBoldText}>Forgot Password?</Text>
                </Pressable>
                <CustomButton buttonText="LOG IN" handleSave={handleLogin}/>
                <View style={styles.signUpContainer}>
                    <Text style={styles.labelText}>Don't have an account?</Text>
                    <Pressable onPress={() => navigation.navigate("SignUpScreen")}>
                        <Text style={styles.labelBoldText}>Sign Up</Text>
                    </Pressable>
                </View>
        </View>
    );
}