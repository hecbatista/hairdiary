import { useMemo, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { StyleSheet, View, Text, Button, FlatList, Image } from "react-native";
import { Calendar } from "react-native-calendars";
import { Entry, EntryType, Profile } from "../type";
import { loadProfile } from "../storage/profileStage";

function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}

export default function HomeScreen({ navigation }: any) {
    const [selectedDate, setSelectedDate] = useState(todayISO());

    const [entries, setEntries] = useState<Entry[]>([]);

    function addEntry(entry: Entry) {
        setEntries((prev) => [...prev, entry]);
    }

    const entriesForSelectedDate = useMemo(() => {
        return entries.filter((e) => e.date === selectedDate);
    }, [entries, selectedDate]);

    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};

        for (const e of entries) {
            marks[e.date] = { marked: true }
        }

        marks[selectedDate] = {
            ...(marks[selectedDate] ?? {}),
            selected: true,
            selectedColor: "#111827",
        };

        return marks;
    }, [entries, selectedDate]);

    const styles = StyleSheet.create({
        container: { flex: 1, padding: 16, paddingTop: 50 },
        title: { fontSize: 28, fontWeight: "700", marginBottom: 12 },
        sectionHeader: {
            marginTop: 12,
            marginBottom: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12
        },
        sectionTitle: { fontSize: 16, fontWeight: "600" },
        empty: { marginTop: 12, fontSize: 14, opacity: 0.7 },
        card: {
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            marginBottom: 10,
        },
        cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
        cardBody: { fontSize: 14, opacity: 0.85 },
        avatar: {
            width: 120,
            height: 120,
            borderRadius: 60,
        },
    });

    const [profile, setProfile] = useState<Profile | null>(null);

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
            <Text style={styles.title}>Hair Diary</Text>

            <Button title="Profile" onPress={() => navigation.navigate("Profile")}/>
            <Image source={{uri: profile?.photoUri}} style={styles.avatar} />

            <Calendar
                markedDates={markedDates}
                onDayPress={(day) => setSelectedDate(day.dateString)}
            />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Entries on {selectedDate}</Text>
                <Button
                    title="Add Entry"
                    onPress={() => navigation.navigate("AddEntry", { date: selectedDate, onSave: addEntry, })}
                />
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

