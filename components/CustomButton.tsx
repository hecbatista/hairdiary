import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Modal, Keyboard, TouchableWithoutFeedback } from "react-native";
import { ReactNode } from "react";

type ButtonProps = {
    buttonText: string;
    handleSave: any;
}

const styles = StyleSheet.create({
    submitButton: {
        backgroundColor: "#1E1E1E",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center"
    },
    submitButtonText: {
        color: "white",
        fontSize: 18,
        fontFamily: "Poppins-SemiBold"
    },
});

export default function CustomButton({ buttonText, handleSave }: ButtonProps) {
    return(
        <Pressable
            onPress={handleSave}
            style={styles.submitButton}
        >
            <Text style={styles.submitButtonText}>{buttonText}</Text>
        </Pressable>
    );
}