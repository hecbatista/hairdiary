import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { useState } from "react";
import { Entry, ENTRY_TYPES, EntryType } from "../type";
import { Picker } from "@react-native-picker/picker";

export default function AddEntryScreen({ route, navigation }: any) {
    const { date, onSave } = route.params;

    const [type, setType] = useState<EntryType>("Wash");
    const [notes, setNotes] = useState("");

    function handleSave() {
        const newEntry: Entry = {
            id: Date.now().toString(),
            date,
            type,
            notes,
        };
        
        onSave(newEntry);
        navigation.goBack();
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>New Entry</Text>
            <Text style={styles.label}>Date: {date}</Text>

            <Text style={styles.label}>Type</Text>
            <View style={styles.pickerWrap}>
                <Picker
                    selectedValue={type}
                    onValueChange={(val) => setType(val as EntryType)}
                >
                {ENTRY_TYPES.map((t) => (
                    <Picker.Item key={t} label={t} value={t} />
                ))}
                </Picker>
            </View>

            <Text style={styles.label}>Notes</Text>
            <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="How did your hair feel today?"
                style={styles.input}
                multiline
            />

            <Button
                title="Save"
                onPress={handleSave}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 24},
    title: { fontSize: 24, fontWeight: "600", marginBottom: 16 },
    label: { fontSize: 16, marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        minHeight: 120,
        textAlignVertical: "top",
        marginBottom: 16,
    },
    pickerWrap: {
        borderWidth: 1,
        borderRadius: 10,
        overflow: "hidden",
    }
});