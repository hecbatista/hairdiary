import { TextInput, View, Text } from "react-native";
import { formStyles } from "../FormStyle";

interface shortTextProps {
    label: string;
    placeHolder: string;
    value: string;
    onChangeText: (text: string) => void;
}

export default function ShortText({ label, placeHolder, value, onChangeText }: shortTextProps) {
    return (
        <View>
            <Text style={formStyles.label}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeHolder}
                style={formStyles.smallInput}
            />
        </View>
    );
}