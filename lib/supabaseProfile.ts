import { Profile } from "../type";
import { supabase } from "./supabase";

/**
 * Database representation of a user profile.
 * Maps to the Users table in Supabase.
 */
export interface UserProfile {
    user_id: string;
    email: string;
    hair_journey: string | null;
    profile_picture: string | null;
}

/**
 * Fetches the current authenticated user's profile from the database.
 * 
 * @returns {Promise<Profile | null>} The user's profile data, or null if no user is logged in.
 * @throws {Error} If no user is logged in
 */
export async function fetchUserProfile(): Promise<Profile | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("No user logged in!");
        }


        const { data, error } = await supabase
            .from("Users")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (error) throw error;

        return {
            name: user.email?.split("@")[0] || "",
            journey: data.hair_journey || "",
            photoUri: data.profile_picture
        };
    } catch (error) {
        return null;
    }
}

/**
 * Updates the current user profile in the database.
 * Updates both the hair journey text and profile picture URL.
 * 
 * @param {Profile} profile - The updated profile data.
 * @returns {Promise<void>}
 * @throws {Error} If user is not logged in or update fails.
 */
export async function updateUserProfile(profile: Profile): Promise<void> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            throw new Error("No user logged in!");
        }

        const { data, error } = await supabase
            .from("Users")
            .update({
                hair_journey: profile.journey || null,
                profile_picture: profile.photoUri || null
            })
            .eq("user_id", user.id)
            .select();

        if (error) {
            throw error;
        }

    } catch (error) {
        throw error;
    }
}

/**
 * Uploads a profile picture to Supabase Storage.
 * 
 * @param {string} uri - Local URI of the image to upload
 * @returns {Promise<string>} The public URL of the uploaded image
 * @throws {Error} If user is not logged in, file is empty, or upload fails
 */
export async function uploadProfilePicture(uri: string): Promise<string> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            throw new Error("No user logged in!");
        }

        const arraybuffer = await fetch(uri).then((res) => res.arrayBuffer());
        
        if (arraybuffer.byteLength === 0) {
            throw new Error("Image file is empty");
        }

        const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath =   `${user.id}/${fileName}`;

        // Upload binary data
        const { data, error } = await supabase.storage
            .from("profile_picture")
            .upload(filePath, arraybuffer, {
                contentType: `image/${fileExt}`,
                upsert: true,
            });

        if (error) {
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from("profile_picture")
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error) {
        throw error;
    }
}


