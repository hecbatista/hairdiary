import { Tables, TablesInsert } from "./database.types";
import { supabase } from "./supabase";
import { Entry, EntryType } from "../type";

/**
 * Maps a row of the Entries table to the app's `Entry` type.
 *
 * @param {Tables<"Entries">} row the database row.
 * @returns {Entry} the entry in app (camelCase) shape.
 */
function toEntry(row: Tables<"Entries">): Entry {
    return {
        id: row.entry_id,
        date: row.date,
        // The column is text with a check constraint listing ENTRY_TYPES.
        type: row.entry_type as EntryType,
        notes: row.notes || "",
    };
}

/**
 * Fetches authenticated user entries from database.
 *
 * @returns {Promise<Entry[]>} The user's entries.
 * @throws {Error} if user is not logged in.
 */
export async function fetchUserEntries(): Promise<Entry[]> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("No user logged in!");
        }

        const { data, error } = await supabase
            .from("Entries")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false });

        if (error) throw error;

        return (data || []).map(toEntry);
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
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("No user logged in!");
        }

        const dbEntry: TablesInsert<"Entries"> = {
            user_id: user.id,
            date: entry.date,
            entry_type: entry.type,
            notes: entry.notes || null,
        };

        const { data, error } = await supabase.from("Entries").insert([dbEntry]).select().single();

        if (error) throw error;

        return toEntry(data);
    } catch (error) {
        throw error;
    }
}
