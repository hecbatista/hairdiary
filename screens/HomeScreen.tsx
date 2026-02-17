import { useMemo, useState, useCallback } from "react";
import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import { StyleSheet, View, Text, FlatList, Image, Pressable } from "react-native";
import { Calendar } from "react-native-calendars";
import { Entry, Profile } from "../type";
import { loadProfile } from "../storage/profileStage";
import { Colors } from "../colors";
import { formatDateLong } from "../utils/dateFormat";
import HeaderGradient from "../components/HeaderGradient";
import { todayISO } from "../utils/todayISO";

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 75, backgroundColor: Colors.background },
    title: { fontSize: 32, fontWeight: "700", alignContent: "center", fontFamily: "Poppins-Bold" },
    sectionHeader: {
        marginTop: 12,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    sectionTitle: { fontSize: 20, fontFamily: "Poppins-SemiBold" },
    empty: { marginTop: 12, fontSize: 14, fontFamily: "Poppins-Regular", color: "grey" },
    card: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: { fontSize: 16, fontFamily: "Poppins-SemiBold", marginBottom: 4 },
    cardBody: { fontSize: 14, opacity: 0.85, fontFamily: "Poppins-Regular" },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 60,
        marginRight: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 20,
        fontFamily: "Poppins-SemiBold"
    },
    calendar: {
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 14,
        marginBottom: 14,
    },
    button: {
        borderRadius: 50,
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonText: {
        padding: 16,
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
    }
});

/**
 * Main screen displaying a calendar and diary entries.
 * Tap a date to view its entries, or navigate to AddEntry or Profile screens.
 * @param param0 
 * @returns 
 */
export default function HomeScreen({ navigation }: { navigation: NavigationProp<any>} ) {
    const [selectedDate, setSelectedDate] = useState(todayISO());
    const [entries, setEntries] = useState<Entry[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);

    function addEntry(entry: Entry) {
        setEntries((prev) => [...prev, entry]);
    }

    const entriesForSelectedDate = useMemo(() => {
        return entries.filter((e) => e.date === selectedDate);
    }, [entries, selectedDate]);

    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};

        for (const e of entries) {
            marks[e.date] = { marked: true, dotColor: "white" }
        }

        marks[selectedDate] = {
            ...(marks[selectedDate] ?? {}),
            selected: true,
            selectedColor: "#61524A",
        };

        return marks;
    }, [entries, selectedDate]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            (async () => {
                const saved = await loadProfile();
                if (isActive) {
                    setProfile(saved);
                }
            })();

            return () => {
                isActive = false;
            };
        }, [])
    );

    return (
        <View style={styles.container}>
            <HeaderGradient/>

            <View style={styles.headerRow}>
                <Pressable style={styles.avatar} onPress={() => navigation.navigate("Profile")}>
                    <Image source={{uri: profile?.photoUri}} style={styles.avatar} />
                </Pressable>
                <Text style={styles.title}>Hair Diary</Text>        
            </View>
            
            <Calendar
                markedDates={markedDates}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                style={styles.calendar}
                theme={{
                    backgroundColor: "#AD948B",
                    calendarBackground: "#AD948B",
                    arrowColor: "black",
                    todayTextColor: "white",
                    textSectionTitleColor: "black",
                    monthTextColor: "black",
                    textMonthFontFamily: "Poppins-Bold",
                    textMonthFontSize: 20,
                    textDayFontFamily: "Poppins-Regular",
                    textDayHeaderFontFamily: "Poppins-Regular",
                    inactiveDotColor: "black",
                    dayTextColor: "black",
                    selectedDayBackgroundColor: "#61524A",
                }}
            />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Entries on {formatDateLong(selectedDate, false)}</Text>
                <Pressable onPress={() => navigation.navigate("AddEntry", { date: selectedDate, onSave: addEntry, })}
                    style={styles.button}>
                    <Text style={styles.buttonText}>Add Entry</Text>
                </Pressable>
            </View>

            {entriesForSelectedDate.length === 0 ? (
                <Text style={styles.empty}>No entries for this day yet.</Text>
            ) : (
                <FlatList
                    data={entriesForSelectedDate}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>{item.type}</Text>
                            {!!item.notes && <Text style={styles.cardBody}>{item.notes}</Text>}
                        </View>
                    )}
                />
            )}
        </View>
    );
}

