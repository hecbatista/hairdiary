import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Modal, Keyboard, TouchableWithoutFeedback } from "react-native";
import { formStyles } from "./FormStyle";
import { ReactNode } from "react";

type FormProps = {
    children: ReactNode;
    buttonText: string;
    handleSave: any;
};

export default function Form({ children, buttonText, handleSave }: FormProps) {
    return(
        <View>
            <View style={formStyles.formContainer}>
                {children}
                    <Pressable
                        onPress={handleSave}
                        style={formStyles.submitButton}
                    >
                        <Text style={formStyles.submitButtonText}>{buttonText}</Text>
                    </Pressable>
            </View>
        </View>
    );
}