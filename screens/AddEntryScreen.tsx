import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Modal, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useState } from "react";
import { Entry, ENTRY_TYPES, EntryType } from "../type";
import { Colors } from "../colors";
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDateLong } from "../utils/dateFormat";
import HeaderGradient from "../components/HeaderGradient";
import { formStyles } from "../components/FormStyle";
import ScreenHeader from "../components/ScreenHeader";

/**
 * Screen for creating a new hair diary entry.
 * 
 * @route params:
 * - date (string) - selected date in "YYYY-MM-DD format
 * - onSave (function) - callback to add the new entry to the state
 * @returns the add entry screen.
 */
export default function AddEntryScreen({ route, navigation }: any) {
    // Unpacking package sent from HomeScreen
    const { date, onSave } = route.params;

    // Form Fields
    const [type, setType] = useState<EntryType>("Wash");
    const [notes, setNotes] = useState("");
    // Status of modal dropdown
    const [showDropdown, setShowDropdown] = useState(false);

    // Handles the save of a new entry.
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

    // Resets dropdown modal after selecting type.
    const selectType = (selectedType: EntryType) => {
        setType(selectedType);
        setShowDropdown(false);
    }

    // Component.
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <HeaderGradient></HeaderGradient>
                <ScreenHeader title="Add Entry" navigation={navigation} />

                <Text style={styles.subtitle}>{formatDateLong(date, false)}</Text>

                <View style={formStyles.formContainer}>
                    <Text style={formStyles.label}>Type</Text>
                    <Pressable style={formStyles.dropdownButton} onPress={() => setShowDropdown(true)}>
                        <Text style={formStyles.dropdownText}>{type}</Text>
                        <Entypo name="chevron-down" size={24} color="black"/>
                    </Pressable>

                    <Text style={formStyles.label}>Notes</Text>
                    <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="How did your hair feel today?"
                        style={formStyles.bigInput}
                        multiline
                    />

                    <Pressable
                        onPress={handleSave}
                        style={formStyles.submitButton}
                    >
                        <Text style={formStyles.submitButtonText}>Submit</Text>
                    </Pressable>
                </View>

                <Modal
                    visible={showDropdown}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowDropdown(false)}
                >
                    <Pressable
                        style={formStyles.modalOverlay}
                        onPress={() => setShowDropdown(false)}
                    >
                        <View style={formStyles.dropdownMenu}>
                            <ScrollView>
                                    {ENTRY_TYPES.map((t) => (
                                        <Pressable
                                            key={t}
                                            style={formStyles.dropdownOption}
                                            onPress={() => selectType(t as EntryType)}
                                        >
                                            <Text style={formStyles.optionText}>{t}</Text>
                                            {type === t && (
                                                <Ionicons name="checkmark" size={24} color="#007AFF" />
                                            )}
                                        </Pressable>
                                    ))}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 24, paddingTop: 75, backgroundColor: Colors.background},
    headerContainer: {flexDirection: "row", justifyContent: "space-between", marginBottom: 20, alignItems: "center"},
    backButton: {width: 50, height: 50, justifyContent: "center", alignItems: "center"},
    title: { flex: 1, fontSize: 28, fontFamily: "Poppins-SemiBold", textAlign: "center" },
    subtitle: { fontSize: 24, fontFamily: "Poppins-SemiBold", textAlign: "center", marginBottom: 16 },
});