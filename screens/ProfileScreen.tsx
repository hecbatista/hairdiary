import { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, Alert, Image, Pressable } from "react-native";
import type { Profile } from "../type";
import { loadProfile, saveProfile } from "../storage/profileStage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../colors";
import Entypo from "@expo/vector-icons/Entypo";

const DEFAULT_PROFILE: Profile = { name: "", journey: "", photoUri: undefined };

export default function ProfileScreen({ navigation }: any) {
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
            navigation.goBack();
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
                <Text style={styles.title}>Profile</Text>
            </View>

            <View style={styles.formContainer}>
                <Pressable style={styles.avatarWrap} onPress={pickProfilePhoto}>
                    {profile.photoUri ? (
                        <Image source={{ uri: profile.photoUri }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarText}>Add Photo</Text>
                        </View>
                    )}
                    <View style={styles.editBadgeOuter}>
                        <View style={styles.editBadgeInner}>
                            <Entypo name="pencil" size={18} color="white" />
                        </View>
                    </View>
                </Pressable>

                


                <Text style={styles.label}>Name</Text>
                <TextInput
                    value={profile.name}
                    onChangeText={(t) => updateField("name", t)}
                    placeholder="Your name"
                    style={styles.smallInput}
                />

                <Text style={styles.label}>Hair Journey</Text>
                <TextInput
                    value={profile.journey}
                    onChangeText={(t) => updateField("journey", t)}
                    placeholder="What are you goals? (growth, health, curls, etc.)"
                    style={[styles.input, styles.textArea]}
                    multiline
                />

                <Pressable style={styles.submitButton} onPress={handleSave}>
                    <Text style={styles.submitButtonText}>Save Profile</Text>
                </Pressable>
            </View>
            

        </View>
    )
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 24, paddingTop: 75, backgroundColor: Colors.background},
    headerContainer: {flexDirection: "row", justifyContent: "space-between", marginBottom: 20, alignItems: "center"},
    backButton: {width: 50, height: 50, justifyContent: "center", alignItems: "center"},
    title: { flex: 1, fontSize: 28, fontFamily: "Poppins-SemiBold", textAlign: "center" },
    formContainer: { borderRadius: 16, backgroundColor: "#AD948B", padding: 24 },
    label: { fontSize: 16, marginBottom: 8, fontFamily: "Poppins-Regular" },
    smallInput: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        textAlignVertical: "top",
        marginBottom: 24,
        fontFamily: "Poppins-Regular",
        fontSize: 16
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
    textArea: {
        minHeight: 120,
        textAlignVertical: "top",
    },
    avatarWrap: {
        alignSelf: "center",
        marginBottom: 16,
        position: "relative",
        overflow: "hidden"
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
    editBadgeOuter: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 38,
        height: 38,
        backgroundColor: "#AD948B",
        borderRadius: 21,
        justifyContent: "center",
        alignItems: "center"
    },
    editBadgeInner: {
        width: 32,
        height: 32,
        borderRadius: 18,
        backgroundColor: "#2A2A2A",
        justifyContent: "center",
        alignItems: "center"
    }
});