import { TextInput, View, Text, StyleSheet } from "react-native";
import { formStyles } from "../FormStyle";
import { ReactNode } from "react";

interface shortTextProps {
    label: string;
    placeHolder: string;
    value: string;
    onChangeText: (text: string) => void;
    icon?: ReactNode;
    secure?: boolean;
}

const styles = StyleSheet.create({
    inputWrapper: {
        position: "relative",
    },
    iconContainer: {
        position: "absolute",
        left: 16,
        top: 18,
        zIndex: 1,
    },
    inputWithIcon: {
        paddingLeft: 48
    }
})

export default function ShortText({ label, placeHolder, value, onChangeText, icon, secure }: shortTextProps) {
    return (
        <View>
            <Text style={formStyles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeHolder}
                    style={
                        icon
                            ? [formStyles.smallInput, styles.inputWithIcon]
                            : formStyles.smallInput
                    }
                    secureTextEntry={secure}
                />
            </View>
        </View>
    );
}