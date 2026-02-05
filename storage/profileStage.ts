import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Profile } from "../type"

const PROFILE_KEY = "profile_v1";

export async function loadProfile(): Promise<Profile | null> {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
}

export async function saveProfile(profile: Profile): Promise<void> {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}