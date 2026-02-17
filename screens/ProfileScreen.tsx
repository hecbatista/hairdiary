import { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Image, Pressable } from "react-native";
import type { Profile } from "../type";
import { loadProfile, saveProfile } from "../storage/profileStage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Colors } from "../colors";
import Entypo from "@expo/vector-icons/Entypo";
import HeaderGradient from "../components/HeaderGradient";
import { formStyles } from "../components/FormStyle";
import ScreenHeader from "../components/ScreenHeader";
import { NavigationProp } from "@react-navigation/native";

const DEFAULT_PROFILE: Profile = { name: "", journey: "", photoUri: undefined };

export default function ProfileScreen({ navigation }: { navigation: NavigationProp<any> }) {
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
        const filename = uri.split("/").pop() ?? `pfp-${Date.now()}.jpg`;
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
            <HeaderGradient/>
            <ScreenHeader title="Profile" navigation={navigation} />
            <View style={formStyles.formContainer}>
                <Pressable style={formStyles.avatarWrap} onPress={pickProfilePhoto}>
                    {profile.photoUri ? (
                        <Image source={{ uri: profile.photoUri }} style={formStyles.avatar} />
                    ) : (
                        <View style={[formStyles.avatar, formStyles.avatarPlaceholder]}>
                            <Text style={formStyles.avatarText}>Add Photo</Text>
                        </View>
                    )}
                    <View style={formStyles.editBadgeOuter}>
                        <View style={formStyles.editBadgeInner}>
                            <Entypo name="pencil" size={18} color="white" />
                        </View>
                    </View>
                </Pressable>

                <Text style={formStyles.label}>Name</Text>
                <TextInput
                    value={profile.name}
                    onChangeText={(t) => updateField("name", t)}
                    placeholder="Your name"
                    style={formStyles.smallInput}
                />

                <Text style={formStyles.label}>Hair Journey</Text>
                <TextInput
                    value={profile.journey}
                    onChangeText={(t) => updateField("journey", t)}
                    placeholder="What are you goals? (growth, health, curls, etc.)"
                    style={[formStyles.bigInput, formStyles.textArea]}
                    multiline
                />

                <Pressable style={formStyles.submitButton} onPress={handleSave}>
                    <Text style={formStyles.submitButtonText}>Save Profile</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 24, paddingTop: 75, backgroundColor: Colors.background},
});