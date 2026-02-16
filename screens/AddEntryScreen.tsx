import { View, Text, StyleSheet, TextInput, Button, Pressable, ScrollView, Modal, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useState } from "react";
import { Entry, ENTRY_TYPES, EntryType } from "../type";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../colors";
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from "@expo/vector-icons/build/Ionicons";

export default function AddEntryScreen({ route, navigation }: any) {
    const { date, onSave } = route.params;

    const [type, setType] = useState<EntryType>("Wash");
    const [notes, setNotes] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

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

    const formatDateLong = (dateString: string): string => {
        const [year, month, day] = dateString.split("-").map(Number);

        const date = new Date(year, month - 1, day);
        const monthName = date.toLocaleDateString('en-US', { month: 'long' })
        const dayNum = date.getDate();

        const getOrdinal = (day: number): string => {
            if (day > 3 && day < 21) return 'th';
            switch(day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };

        return `${monthName} ${dayNum}${getOrdinal(dayNum)}, ${year}`;
    }

    const selectType = (selectedType: EntryType) => {
        setType(selectedType);
        setShowDropdown(false);
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <LinearGradient
                colors={["#AD948B", "#EAD9D1"]}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 140,
                }}/>
                <View style={styles.headerContainer}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Entypo name="chevron-left" size={30} color={Colors.text} />
                    </Pressable>
                    <Text style={styles.title}>Add Entry for</Text>
                </View>

                <Text style={styles.subtitle}>{formatDateLong(date)}</Text>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Type</Text>
                    <Pressable style={styles.dropdownButton} onPress={() => setShowDropdown(true)}>
                        <Text style={styles.dropdownText}>{type}</Text>
                        <Entypo name="chevron-down" size={24} color="black"/>
                    </Pressable>

                    <Text style={styles.label}>Notes</Text>
                    <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="How did your hair feel today?"
                        style={styles.input}
                        multiline
                    />

                    <Pressable
                        onPress={handleSave}
                        style={styles.submitButton}
                    >
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </Pressable>
                </View>

                <Modal
                    visible={showDropdown}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowDropdown(false)}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setShowDropdown(false)}
                    >
                        <View style={styles.dropdownMenu}>
                            <ScrollView>
                                    {ENTRY_TYPES.map((t) => (
                                        <Pressable
                                            key={t}
                                            style={styles.dropdownOption}
                                            onPress={() => selectType(t as EntryType)}
                                        >
                                            <Text style={styles.optionText}>{t}</Text>
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
    formContainer: { borderRadius: 16, backgroundColor: "#AD948B", padding: 24 },
    label: { fontSize: 16, marginBottom: 8 },
    dropdownButton: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24
    },
    dropdownText: {
        fontSize: 16,
        fontFamily: "Poppins-Regular"
    },
    input: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        minHeight: 120,
        textAlignVertical: "top",
        marginBottom: 24,
        fontFamily: "Poppins-Regular",
        fontSize: 16
    },
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    dropdownMenu: {
        backgroundColor: "white",
        overflow: "hidden",
        borderRadius: 12,
        width: "80%",
        maxHeight: 400,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    dropdownOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0"
    },
    optionText: {
        fontSize: 16,
        fontFamily: "Poppins-Regular",
        color: "#000"
    }
});