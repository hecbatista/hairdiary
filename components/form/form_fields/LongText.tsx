import { TextInput, View, Text } from "react-native";
import { formStyles } from "../FormStyle";

interface longTextProps {
    label: string;
    placeHolder: string;
    value: string;
    onChangeText: (text: string) => void;
}

export default function LongText({ label, placeHolder, value, onChangeText }: longTextProps) {
    return (
        <View>
            <Text style={formStyles.label}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeHolder}
                style={formStyles.bigInput}
                multiline
            />
        </View>
    );
}