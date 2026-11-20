import { createEntry, fetchUserEntries } from "../supabaseEntries";

jest.mock("../supabase");

// The manual mock in lib/__mocks__/supabase.ts, as seen by the code under test.
const { supabase, createQueryBuilder, mockUser } =
    jest.requireMock<typeof import("../__mocks__/supabase")>("../supabase");

const USER = { id: "user-123", email: "test@hairdiary.test" };

// Reset implementations too (not just calls), so a test that forgets mockUser() can't
// inherit the previous test's user. Scoped to these files: a global resetMocks would also wipe
// the implementations of jest-expo's React Native mocks.
beforeEach(() => {
    jest.resetAllMocks();
});

describe("fetchUserEntries", () => {
    it("queries only the signed-in user's entries, newest first", async () => {
        mockUser(USER);
        const query = createQueryBuilder({ data: [], error: null });
        supabase.from.mockReturnValue(query);

        await fetchUserEntries();

        expect(supabase.from).toHaveBeenCalledWith("Entries");
        expect(query.eq).toHaveBeenCalledWith("user_id", USER.id);
        expect(query.order).toHaveBeenCalledWith("date", { ascending: false });
    });

    it("maps database rows to app entries", async () => {
        mockUser(USER);
        supabase.from.mockReturnValue(
            createQueryBuilder({
                data: [
                    {
                        entry_id: "e1",
                        user_id: USER.id,
                        date: "2026-11-19",
                        entry_type: "Wash",
                        notes: "Used the new shampoo",
                        created_at: "2026-11-19T10:00:00Z",
                    },
                    {
                        entry_id: "e2",
                        user_id: USER.id,
                        date: "2026-11-02",
                        entry_type: "Haircut",
                        notes: null,
                        created_at: "2026-11-02T10:00:00Z",
                    },
                ],
                error: null,
            }),
        );

        await expect(fetchUserEntries()).resolves.toEqual([
            { id: "e1", date: "2026-11-19", type: "Wash", notes: "Used the new shampoo" },
            { id: "e2", date: "2026-11-02", type: "Haircut", notes: "" },
        ]);
    });

    it("returns an empty list when the query returns no data", async () => {
        mockUser(USER);
        supabase.from.mockReturnValue(createQueryBuilder({ data: null, error: null }));

        await expect(fetchUserEntries()).resolves.toEqual([]);
    });

    it("throws when no user is logged in, without querying", async () => {
        mockUser(null);

        await expect(fetchUserEntries()).rejects.toThrow("No user logged in!");
        expect(supabase.from).not.toHaveBeenCalled();
    });

    it("propagates Supabase errors", async () => {
        mockUser(USER);
        const error = { message: "permission denied for table Entries", code: "42501" };
        supabase.from.mockReturnValue(createQueryBuilder({ data: null, error }));

        await expect(fetchUserEntries()).rejects.toBe(error);
    });
});

describe("createEntry", () => {
    const newEntry = { date: "2026-11-19", type: "Hair Mask" as const, notes: "Overnight" };

    it("inserts a row owned by the signed-in user", async () => {
        mockUser(USER);
        const query = createQueryBuilder({
            data: {
                entry_id: "e9",
                user_id: USER.id,
                date: "2026-11-19",
                entry_type: "Hair Mask",
                notes: "Overnight",
            },
            error: null,
        });
        supabase.from.mockReturnValue(query);

        await createEntry(newEntry);

        expect(supabase.from).toHaveBeenCalledWith("Entries");
        expect(query.insert).toHaveBeenCalledWith([
            {
                user_id: USER.id,
                date: "2026-11-19",
                entry_type: "Hair Mask",
                notes: "Overnight",
            },
        ]);
    });

    it("stores empty notes as null", async () => {
        mockUser(USER);
        const query = createQueryBuilder({
            data: { entry_id: "e9", date: "2026-11-19", entry_type: "Wash", notes: null },
            error: null,
        });
        supabase.from.mockReturnValue(query);

        await createEntry({ date: "2026-11-19", type: "Wash", notes: "" });

        expect(query.insert).toHaveBeenCalledWith([expect.objectContaining({ notes: null })]);
    });

    it("returns the created row as an app entry", async () => {
        mockUser(USER);
        supabase.from.mockReturnValue(
            createQueryBuilder({
                data: {
                    entry_id: "e9",
                    user_id: USER.id,
                    date: "2026-11-19",
                    entry_type: "Hair Mask",
                    notes: null,
                },
                error: null,
            }),
        );

        await expect(createEntry(newEntry)).resolves.toEqual({
            id: "e9",
            date: "2026-11-19",
            type: "Hair Mask",
            notes: "",
        });
    });

    it("throws when no user is logged in, without inserting", async () => {
        mockUser(null);

        await expect(createEntry(newEntry)).rejects.toThrow("No user logged in!");
        expect(supabase.from).not.toHaveBeenCalled();
    });

    it("propagates Supabase errors", async () => {
        mockUser(USER);
        const error = { message: "new row violates check constraint", code: "23514" };
        supabase.from.mockReturnValue(createQueryBuilder({ data: null, error }));

        await expect(createEntry(newEntry)).rejects.toBe(error);
    });
});
