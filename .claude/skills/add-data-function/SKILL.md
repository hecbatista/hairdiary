---
name: add-data-function
description: Add or change a Supabase data-access function in lib/ (fetch, create, update, delete, storage upload), including any schema change it needs. Use whenever a feature needs to read or write Supabase data.
---

# Add a Supabase data function

Every Supabase query lives in `lib/`. Screens never call `supabase.from(...)` directly. Entry functions go in `lib/supabaseEntries.ts` and profile/storage functions in `lib/supabaseProfile.ts`. A new domain gets a new file such as `lib/supabaseProducts.ts`.

## 1. App type

Add or extend the camelCase app type in `type.ts` (e.g. `Entry`, `Profile`). Keep optional fields optional.

## 2. Function

Match the existing functions exactly:

```ts
/**
 * Updates an existing entry for the authenticated user.
 *
 * @param {Entry} entry the entry with updated fields.
 * @returns {Promise<Entry>} The updated entry.
 * @throws {Error} if no user is logged in or the update fails.
 */
export async function updateEntry(entry: Entry): Promise<Entry> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("No user logged in!");
        }

        const { data, error } = await supabase
            .from("Entries")
            .update({
                date: entry.date,
                entry_type: entry.type,
                notes: entry.notes || null,
            })
            .eq("entry_id", entry.id)
            .eq("user_id", user.id)
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
```

Rules:
- Always scope by `user_id`, even though RLS also enforces it.
- Map snake_case columns to camelCase app fields in both directions. If several functions repeat the same mapping, pull it into one helper (e.g. `toEntry(dbEntry)`).
- Declare the row shape as an interface next to the functions (like `DatabaseEntry`) until generated types exist (#5). After that, use the generated `Database` types instead.
- Throw errors and let the screen handle them (show feedback, stop the loading state).
- Storage uploads follow `uploadProfilePicture`: read the file with `fetch(uri).then(r => r.arrayBuffer())`, save it under a `{user_id}/` prefix, and set `contentType`.

## 3. Schema changes

If the function needs a new table, column or bucket:
- **Before #4 (no `supabase/` folder):** write the SQL, including RLS policies, in the PR description so it can be applied in the Supabase dashboard. Tell the user it must be applied manually.
- **After #4:** `supabase migration new <name>`, write the SQL (table/column changes **and** RLS policies) in the new migration, apply it locally, then regenerate types (`npm run gen:types` once #5 lands).
- New tables always get RLS enabled, with owner-only policies unless the feature is explicitly public (e.g. community posts).

## 4. Call it from the screen

```ts
setIsLoading(true);
try {
    await updateEntry(entry);
    navigation.goBack();
} catch (error) {
    console.error("Error updating entry:", error);
    // TODO(#13): user-facing error feedback
} finally {
    setIsLoading(false);
}
```

## 5. Verify

- `npx tsc --noEmit`
- Exercise the flow in the simulator and confirm the row in Supabase.
- Add unit tests with Supabase mocked once Jest is set up (#12).
- Update the Supabase section of `CLAUDE.md` if the schema changed.
