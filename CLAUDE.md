# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

Hair Diary is an iOS app (React Native + Expo + TypeScript) for anyone caring for their hair. Users log hair care entries on a calendar (washes, haircuts, masks, treatments, Good Hair Days) and manage a profile. The backend is Supabase (Auth, Postgres with RLS, Storage).

It is a portfolio project: favor clean, well-documented, tested code over quick hacks. The roadmap lives in the README and is tracked as issues on the [Hair Diary Roadmap](https://github.com/users/hecbatista/projects/1) project board.

## Commands

```bash
npm start            # Expo dev server (press i for iOS simulator)
npm run ios          # Start directly on the iOS simulator
npx tsc --noEmit     # Typecheck (strict mode)
npm run lint         # ESLint (expo config + TypeScript rules + Prettier)
npm run lint:fix     # ESLint with autofix
npm run format       # Format everything with Prettier
npm run format:check # Check formatting without writing

npx supabase start                    # Start the local Supabase stack (Docker); applies migrations + seed
npx supabase status                   # Print local URLs and keys (API URL, anon/publishable key, Studio)
npx supabase stop                     # Stop the local stack (keeps data)
npx supabase migration new <name>     # Create supabase/migrations/<timestamp>_<name>.sql
npx supabase db reset                 # Rebuild the local database from all migrations + seed.sql
```

Not set up yet (each has a roadmap issue; add the command here when it lands):
- Tests: Jest + React Native Testing Library (#12)
- Generated Supabase types (#5)
- CI with GitHub Actions (#7)

## Architecture

```
App.tsx              # Font loading, splash screen, native stack navigator
screens/             # One file per screen (Login, Home, AddEntry, Profile)
components/          # Shared UI (HeaderGradient, ScreenHeader)
components/form/     # Form wrapper, shared formStyles, and form_fields/ inputs
lib/                 # Supabase client + data-access functions (the only place that talks to Supabase, except auth in LoginScreen)
type.ts              # App-level types (Entry, EntryType, ENTRY_TYPES, Profile)
colors.ts            # Color palette (Colors)
utils/               # Pure helpers (date formatting, today's ISO date)
supabase/            # Supabase CLI project: config.toml, migrations/, seed.sql
storage/             # Legacy AsyncStorage profile cache, superseded by lib/supabaseProfile.ts
```

**Navigation:** a single native stack in `App.tsx` with `headerShown: false`. Routes: `Login`, `Home`, `AddEntry` (param `date: "YYYY-MM-DD"`), `Profile`. Screens draw their own header with `HeaderGradient` + `ScreenHeader`. Route params are currently untyped (`NavigationProp<any>`, `route: any`). Typing them is issue #6.

**Data flow:** screens call async functions in `lib/`. HomeScreen reloads entries and the profile in `useFocusEffect`, so returning from AddEntry or Profile refreshes data automatically.

## Supabase

- Client: `lib/supabase.ts`, configured from `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`. It throws on startup if either is missing. Never commit `.env`, never read or print its contents, and never put a service-role key in the app.
- Environment: required keys are listed in `.env.example`. Add any new variable there, and to the README's Environment setup section, in the same PR. Access variables statically (`process.env.EXPO_PUBLIC_X`) so Expo can inline them.
- Dev is the local Supabase stack (Supabase CLI + Docker, see Commands), used by `.env` and the `development` EAS build (simulator). Prod is a hosted Supabase project, created for the TestFlight release and used by the `preview` and `production` builds. Each profile in `eas.json` reads its variables from the matching EAS environment, not from `.env`. Don't create extra hosted projects: the free plan allows only two. Schema changes go in migrations so both backends stay in sync.
- Schema lives in `supabase/migrations/` (Supabase CLI, imperative migrations). The local stack is built from it; never change a database by hand without a migration. Create files with `npx supabase migration new <name>` (don't invent timestamps), don't edit migrations that are already on `main`, and verify with `npx supabase db reset`.
- Tables (quoted, capitalized names, matching the app's `.from("Entries")` / `.from("Users")`):
  - `Entries`: `entry_id` (uuid), `user_id`, `date` (`date`, returned as YYYY-MM-DD), `entry_type` (text with a check constraint listing `ENTRY_TYPES`; adding a type needs a migration), `notes`, `created_at`
  - `Users`: `user_id`, `email`, `hair_journey`, `profile_picture`, `created_at`. One row per auth user, inserted by the `on_auth_user_created` trigger (`private.handle_new_user()`), never by the app. Users can only update `hair_journey` and `profile_picture` (column-level grant).
- Storage bucket: `profile_picture` (public, images up to 10 MiB), with files at `{user_id}/{user_id}-{timestamp}.{ext}`. Policies allow each user to read and write only their own `{user_id}/` folder.
- Every query is scoped to the current user (`.eq("user_id", user.id)`), and RLS enforces ownership server side. New tables are not exposed to the Data API automatically (`auto_expose_new_tables = false` in `config.toml`, matching hosted projects since Oct 30, 2026), so every new table's migration needs explicit `grant`s to `authenticated` (and `service_role`), `enable row level security`, and owner policies using `(select auth.uid()) = user_id` with `to authenticated`. Grant `anon` nothing unless a feature is truly public.
- Local seed (`supabase/seed.sql`): test account `test@hairdiary.test` / `password123` with a profile and a few entries.
- The auth session is not persisted yet (no AsyncStorage `auth.storage` configured; see #13).

### `lib/` function pattern

Follow the existing functions in `lib/supabaseEntries.ts`:
1. JSDoc with `@param`, `@returns` and `@throws`.
2. Get the user with `supabase.auth.getUser()` and throw `new Error("No user logged in!")` if there is none.
3. Query with the user's id and throw any Supabase `error`.
4. Map snake_case database rows (`entry_id`, `entry_type`) to the camelCase app types in `type.ts` (`id`, `type`). Database row shapes are declared as interfaces in the same file (e.g. `DatabaseEntry`) until generated types arrive (#5).
5. Let errors propagate. The screen decides how to show them.

## Code conventions

- TypeScript strict mode. Function components with default exports, one component per file, file name matching the component.
- 4-space indentation (2 in JSON), double quotes, semicolons, trailing commas, 100-character lines. Prettier (`.prettierrc.json`) enforces this and runs as an ESLint rule (`eslint.config.js`), so run `npm run format` or `npm run lint:fix` instead of fixing style by hand. Lint must pass with no errors or warnings.
- Styles: `StyleSheet.create` in the same file. Use `Colors` from `colors.ts` rather than new hex values where a palette color fits. Fonts are `Poppins-Regular`, `Poppins-Medium`, `Poppins-SemiBold` and `Poppins-Bold` (set `fontFamily`, not `fontWeight`).
- Screen layout: root `View` with `flex: 1`, `backgroundColor: Colors.background`, `paddingTop: 75`, then `<HeaderGradient/>` and either `<ScreenHeader title=... navigation=.../>` or a custom header row.
- Forms: wrap fields in `<Form buttonText=... handleSave=...>` and use the inputs in `components/form/form_fields/` (`ShortText`, `LongText`, `Dropdown`). Shared input styles live in `components/form/FormStyle.tsx` (`formStyles`). Add new reusable inputs there instead of styling inputs per screen.
- Dates are `"YYYY-MM-DD"` strings throughout. Use `todayISO()` and `formatDateLong()` from `utils/`.
- Add JSDoc to exported functions and components, matching the existing style.
- Prefer small, focused changes that match the surrounding code. Don't reformat unrelated code.

## Known issues

- `npx tsc --noEmit` currently fails: `AddEntryScreen` passes `allOptions` to `Dropdown`, but `Dropdown` doesn't accept that prop and always renders `ENTRY_TYPES`.
- `HomeScreen` imports `loadProfile` from `storage/profileStage` but shadows it with a local function of the same name. The `storage/` module is unused legacy code.
- Errors are mostly only `console.error`'d with no user feedback (#13).

## Workflow

- Work is tracked as GitHub issues with a milestone per roadmap phase and labels (`feature`, `chore`, `tech-debt`, `frontend`, `backend`, `infra`, `research`). Sprints are 2-week iterations on the project board.
- Branch from `main` with names like `feat/<issue>-short-name`, `chore/<issue>-short-name` or `docs/short-name`.
- PRs target `main`, reference the issue with `Closes #N`, and are merged with merge commits.
- When a change adds tooling, commands or conventions, update this file in the same PR.

## Claude Code setup

- Project skills live in `.claude/skills/`:
  - `start-issue`: issue → branch → board status → PR that closes the issue
  - `add-screen`: new screen with the standard layout, registered in `App.tsx`
  - `add-data-function`: Supabase data-access function in `lib/`, plus schema/RLS changes
  - `add-form-field`: reusable input in `components/form/form_fields/`
- Add a skill when a workflow repeats, e.g. writing tests once Jest lands (#12) or writing migrations now that the Supabase CLI is set up.
- `.claude/settings.json` holds shared permissions: safe read-only commands are allowed and reading `.env` is denied. It also enables the Expo plugin. Personal overrides go in `.claude/settings.local.json`, which is git-ignored.

### Third-party skills

| Skill | Source | Use for |
|---|---|---|
| `expo` plugin (`expo:*` skills) | `expo@claude-plugins-official`, enabled in `.claude/settings.json` | Expo SDK work, EAS Build/Submit to TestFlight (`expo:eas-app-stores`), SDK upgrades, native UI, animation |
| `supabase` | `supabase/agent-skills` | Auth, Storage, Edge Functions, CLI, migrations, RLS, debugging Supabase errors |
| `supabase-postgres-best-practices` | `supabase/agent-skills` | Schema design, migrations, RLS policies, indexes, query performance |
| `gluestack-ui-v5` | `gluestack/agent-skills` | gluestack-ui components and Tailwind/NativeWind styling |

- The `supabase` and `gluestack-ui-v5` skills are installed with the [`skills` CLI](https://github.com/vercel-labs/skills). Files live in `.agents/skills/`, are symlinked into `.claude/skills/`, and are pinned in `skills-lock.json`. Don't edit them by hand; update with `npx skills update -p`. Teammates restore them with `npx skills experimental_install`.
- **Project conventions win over generic skill advice.** This app uses React Navigation (not Expo Router), `StyleSheet` styling, and the custom form components. Don't migrate to Expo Router, `@expo/ui`, or gluestack/NativeWind as a side effect of another task.
- gluestack-ui is **not installed yet**. Use the `gluestack-ui-v5` skill only for the issue that adopts it, or for work after that has landed. Update the Code conventions section above when it does.
