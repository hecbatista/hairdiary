import { supabase } from "./supabase";
import { Entry, EntryType } from "../type"

/**
 * Database representation of a entry. 
 * Maps to Entries table in Supabase.
 */
export interface DatabaseEntry {
    entry_id: string;
    user_id: string;
    date: string;
    entry_type: EntryType;
    notes: string | null;
}

/**
 * Fetches authenticated user entries from database.
 * 
 * @returns {Promise<Entry[]>} The user's entries.
 * @throws {Error} if user is not logged in.
 */
export async function fetchUserEntries(): Promise<Entry[]> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("No user logged in!");
        }

        const { data, error } = await supabase
            .from("Entries")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false });

        if (error) throw error;

        return (data || []).map(dbEntry => ({
            id: dbEntry.entry_id,
            date: dbEntry.date,
            type: dbEntry.entry_type as EntryType,
            notes: dbEntry.notes || "",
        }));
    } catch (error) {
        throw error;
    }
}

/**
 * Creates a user entry in the database.
 * 
 * @param {Omit<Entry, "id">} entry the entry to upload.
 * @returns {Promise<Entry>}
 * @throws {Error} if no user is logged in or problem uploading to database.
 */
export async function createEntry(entry: Omit<Entry, "id">): Promise<Entry> {
    try {
        const { data : { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("No user logged in!");
        }

        const dbEntry = {
            user_id: user.id,
            date: entry.date,
            entry_type: entry.type,
            notes: entry.notes || null,
        };

        const { data, error } = await supabase
            .from("Entries")
            .insert([dbEntry])
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.entry_id,
            date: data.date,
            type: data.entry_type as EntryType,
            notes: data.notes || "",
        };
    } catch (error) {
        throw error;
    }
}