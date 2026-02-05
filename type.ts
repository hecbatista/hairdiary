export type EntryType = 
    | "Wash"
    | "Haircut"
    | "Hair Mask"
    | "Chemical Treatment"
    | "Good Hair Day"
    | "Other";

export type Entry = {
    id: string;
    date: string;
    type: EntryType;
    notes?: string;
    photoUri?: string;
};

export const ENTRY_TYPES: EntryType[] = [
    "Wash",
    "Haircut",
    "Hair Mask",
    "Chemical Treatment",
    "Good Hair Day",
    "Other"
]

export type Profile = {
    name: string;
    journey: string;
    photoUri?: string;
}