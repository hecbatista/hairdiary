import { View, Text, StyleSheet, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useState } from "react";
import { Entry, ENTRY_TYPES, EntryType } from "../type";
import { Colors } from "../colors";
import { formatDateLong } from "../utils/dateFormat";
import HeaderGradient from "../components/HeaderGradient";
import ScreenHeader from "../components/ScreenHeader";
import { NavigationProp } from "@react-navigation/native"
import Form from "../components/form/Form";
import LongText from "../components/form/form_fields/LongText";
import Dropdown from "../components/form/form_fields/Dropdown";
import { createEntry } from "../lib/supabaseEntries";

//Type declaration
interface AddEntryScreenProps {
    route: any;
    navigation: NavigationProp<any>;
}

/**
 * Screen for creating a new hair diary entry.
 * 
 * @route params:
 * - date (string) - selected date in "YYYY-MM-DD format
 * - onSave (function) - callback to add the new entry to the state
 * @returns the add entry screen.
 */
export default function AddEntryScreen({ route, navigation }: AddEntryScreenProps) {
    // Unpacking package sent from HomeScreen
    const { date } = route.params;

    // Form Fields
    const [type, setType] = useState<EntryType>("Wash");
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Handles the save of a new entry.
    async function handleSave() {
        setIsLoading(true);

        try {
            await createEntry({
                date,
                type,
                notes: notes.trim(),
            });

            console.log("Entry saved!");

            navigation.goBack();
        } catch (error) {
            console.error("Error saving entry:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <HeaderGradient/>
                <ScreenHeader title="Add Entry" navigation={navigation} />

                <Text style={styles.subtitle}>{formatDateLong(date, false)}</Text>

                <Form buttonText="Save Entry" handleSave={handleSave}>
                    <Dropdown label="Type" option={type} allOptions={ENTRY_TYPES} setOption={(val) => setType(val as EntryType)}/>
                    <LongText label="Notes" placeHolder="How did your hair feel?" value={notes} onChangeText={setNotes}/>
                </Form>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 24, paddingTop: 75, backgroundColor: Colors.background},
    subtitle: { fontSize: 24, fontFamily: "Poppins-SemiBold", textAlign: "center", marginBottom: 16 },
});