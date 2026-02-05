import { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, Alert, Image, Pressable } from "react-native";
import type { Profile } from "../type";
import { loadProfile, saveProfile } from "../storage/profileStage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

const DEFAULT_PROFILE: Profile = { name: "", journey: "", photoUri: undefined };

const MOCK_PROFILE: Profile = {
    name: "Hector",
    journey: "Growing my curls and NO FRIZZ!"
}

export default function ProfileScreen() {
    const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const saved = await loadProfile();
                if (saved) setProfile(saved);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    function updateField<K extends keyof Profile>(key: K, value: Profile[K]) {
        setProfile((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSave() {
        try {
            await saveProfile({
                name: profile.name.trim(),
                journey: profile.journey.trim(),
                photoUri: profile.photoUri,
            });
            Alert.alert("Saved", "Your profile was updated.");
        } catch {
            Alert.alert("Error", "Could not save your profile.");
        }
    }

    async function persistImageToApp(uri: string) {
        const filename = uri.split("/").pop() ?? 'pfp-${Date.now()}.jpg';
        const dest = FileSystem.documentDirectory + filename;

        await FileSystem.copyAsync({ from: uri, to: dest });
        return dest;
    }

    async function pickProfilePhoto() {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert("Permission needed", "Please allow photo library access.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled) return;

        const pickedUri = result.assets[0].uri;
        const stableUri = await persistImageToApp(pickedUri);

        updateField("photoUri", stableUri);
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading Profile...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>

            <Pressable style={styles.avatarWrap} onPress={pickProfilePhoto}>
                {profile.photoUri ? (
                    <Image source={{ uri: profile.photoUri }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>Add Photo</Text>
                    </View>
                )}
            </Pressable>

            {profile.photoUri && (
                <View style={{ marginBottom: 12 }}>
                    <Button title="Remove Photo" onPress={() => updateField("photoUri", undefined)} />
                </View>
            )}


            <Text style={styles.label}>Name</Text>
            <TextInput
                value={profile.name}
                onChangeText={(t) => updateField("name", t)}
                placeholder="Your name"
                style={styles.input}
            />

            <Text style={styles.label}>Hair Journey</Text>
            <TextInput
                value={profile.journey}
                onChangeText={(t) => updateField("journey", t)}
                placeholder="What are you goals? (growth, health, curls, etc.)"
                style={[styles.input, styles.textArea]}
                multiline
            />

            <Button title="Save Profile" onPress={handleSave} />

        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, paddingTop: 50 },
    title: { fontSize: 28, fontWeight: "700", marginBottom: 16 },
    label: { fontSize: 16, fontWeight: "600", marginBottom: 6, marginTop: 12 },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: "top",
    },
    avatarWrap: {
        alignSelf: "center",
        marginBottom: 16,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 14,
        opacity: 0.7,
    }
});