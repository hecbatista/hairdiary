# 💇‍♀️ Hair Diary

An app designed to empower people embrace their hair care in an easy and visual way. It helps track hair care routines, products, and styles. Built with React Native and TypeScript, it helps people achieve their goals of their hair care journey.

## ⚙️ Tech Stack

**Core Technolgies**
- React Native
- TypeScript
- Expo
- Supabase

**Front-End Libraries**
- **React Navigation** - Screen navigation and routing.
- **react-native-calendars** - Interactive calendar component w/ custom styling
- **expo-linear-gradient** - Gradient background
- **expo-font** - Customer typography
- **expo-image-picker** - Profile picture uploads

**Back-End & Database**
- **Supabase Auth** - User authentication & session management
- **Supabase Database (PostgreSQL)** - Relational database w/ RLS policies
- **Supabase Storage** - Cloud storage for Profile Pictures 

## 🏗️ File structure
```
hair-diary/
├── CLAUDE.md                 # Project guide for Claude Code
├── .env.example              # Required environment variables (copy to .env)
├── eas.json                  # EAS Build profiles, each tied to an EAS environment
├── .claude/
│   ├── settings.json         # Shared Claude Code permissions
│   └── skills/               # Project skills (start-issue, add-screen, ...)
├── screens/
│   ├── HomeScreen.tsx        # Calendar and entries display
│   ├── AddEntryScreen.tsx    # Entry creation
│   ├── ProfileScreen.tsx     # User profile management
│   └── LoginScreen.tsx       # Authentication
├── lib/
│   ├── supabase.ts           # Supabase client configuration
│   ├── supabaseEntries.ts    # Entry operations
│   └── supabaseProfile.ts    # Profile and storage operations
├── components/
│   ├── form/                 # Reusable form components
│   ├── HeaderGradient.tsx    # Background gradient header component
│   └── ScreenHeader.tsx      # Navigation header
├── utils/
│   ├── dateFormat.ts         # Date formatting utilities
│   └── todayISO.ts           # Date helper functions
└── assets/
    └── fonts/                # Poppins font family
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed.

### Required Software

- **Node.js** (v14.0 or higher)
- **npm** (v6.0 or higher) or **yarn**
- **Git**

## Installation

Once you have the prerequisites installed, follow these steps:

1. **Clone the repository**
```
bash
git clone https://github.com/hecbatista/hairdiary.git
cd hairdiary
```

2. **Install dependencies**
```
bash
npm install
```
or
```
bash
yarn install
```

3. **Configure environment variables** (see [Environment setup](#-environment-setup))
```bash
cp .env.example .env
```
Then fill in `.env` with your local Supabase stack's URL and anon key.

4. **Start the development server**
```
bash
npm start
```
or
```
bash
npx expo start
```

## 🔐 Environment setup

The app reads its Supabase config from two variables. Both are listed in [`.env.example`](.env.example):

| Variable | Local stack | Hosted project |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | `API URL` from `npx supabase status` (`http://127.0.0.1:54321`) | Dashboard → Project Settings → API → Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `anon key` from `npx supabase status` (newer CLI versions call it the publishable key) | Dashboard → Project Settings → API → `anon` `public` key |

`EXPO_PUBLIC_` variables are bundled into the app, so they must only hold public values. The anon key is safe to ship because Row Level Security protects every table. **Never** use the `service_role` / secret key in the app. If either variable is missing, the app throws on startup with a message pointing back here.

### Dev and prod

Dev and prod use separate backends, so testing never touches real user data:

| Environment | Backend | Used by |
|---|---|---|
| Dev | Local Supabase stack, run with the Supabase CLI and Docker | `.env` for `npm start`, and the `development` EAS build (iOS simulator) |
| Prod | Hosted Supabase project, created for the TestFlight release | The `preview` and `production` EAS builds |

Dev runs locally so it never pauses for inactivity and doesn't use one of the Supabase free plan's two hosted project slots. The schema, RLS policies and `profile_picture` storage bucket live in the repo as migrations (#4), so the local stack and the prod project are built from the same source.

> **Status:** the Supabase CLI setup and migrations arrive with #4, and the hosted prod project is created as part of the TestFlight release. Until then, `preview` and `production` builds have no backend to point at.

### Local development

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/). Start the local stack, then print its URL and keys:
```bash
npx supabase start
```
```bash
npx supabase status
```
Copy the `API URL` and `anon key` into `.env`. The iOS simulator reaches `127.0.0.1` on your Mac. On a physical device, use your Mac's LAN IP address instead.

Expo loads `.env` automatically when you run `npm start`. `.env` and `.env*.local` are git-ignored. After changing a variable, restart with a clean cache:
```bash
npx expo start --clear
```

### EAS builds

EAS Build does not upload your local `.env`. Each profile in [`eas.json`](eas.json) instead reads variables from its matching [EAS environment](https://docs.expo.dev/eas/environment-variables/):

| Build profile | EAS environment | Backend |
|---|---|---|
| `development` | `development` | Local stack (`http://127.0.0.1:54321`, simulator only) |
| `preview` | `preview` | Hosted prod project (set up at release) |
| `production` | `production` | Hosted prod project (set up at release) |

One-time setup (requires the EAS CLI and an Expo account):
```bash
npm install -g eas-cli
```
```bash
eas login
```
```bash
eas init
```
Then create both variables in the `development` environment with your local stack's values:
```bash
eas env:create --environment development --name EXPO_PUBLIC_SUPABASE_URL --value http://127.0.0.1:54321 --visibility plaintext
```
Repeat for `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Once the hosted prod project exists, create both variables in the `preview` and `production` environments with its values. Check the result with `eas env:list --environment development`. To pull an environment's values into a local file, run `eas env:pull --environment development` (it writes `.env.local`, which is git-ignored).


## 📸 Preview
<p align=center>
    <img src="screenshots/homescreen.png" width=250 />
    <img src="screenshots/addentryscreen.png" width=250 />
    <img src="screenshots/profilescreen.png" width=250 />
</p>

## 🎯 Features
- **User Authentication** - Secure login
- **Calendar-Based Tracking** - Visual interface w/ marked dates
- **Custom Entry Logging** - Record daily routines, styling, and treatments
- **Cloud Data Storage** - Entries sync across devices w/ Supabase
- **Profile Managment** - Upload profile pictures to cloud storage

## 🌟 Final App Goal
A polished, well-engineered iOS app that helps **anyone** caring for their hair understand what works for them. Users log their routines, products, and photos, see their progress and trends over time, share Good Hair Days with a community, and get smart, personalized recommendations to improve their hair health.

The app is shipped as a **TestFlight beta** and doubles as a portfolio project showcasing full-stack mobile development: clean architecture, tested code, CI, and a version-controlled Supabase backend.

## 🥅 Goals
- Develop Front-End Skills w/ React-Native
- Develop Back-End Skills w/ Supabase and Expo Routing
- Improve upon code design and documentation
- Learn cloud storage and database integration
- Practice professional workflows: testing, CI, and sprint planning w/ GitHub Projects
- Implement machine learning recommendations (LLM-powered and classic ML)

## 🗺️ Roadmap
Work is planned in 2-week sprints on the [Hair Diary Roadmap](https://github.com/users/hecbatista/projects/1) project board, with one ticket per item below. Phases are ordered by priority.

### Phase 1 — Foundation *(Sprint 1)*
- [x] **Lint & format** - ESLint + Prettier
- [ ] **Refactor & types** - Typed navigation (no `any`), consistent error handling w/ user feedback
- [ ] **Backend setup** - Supabase CLI w/ migrations & RLS policies in repo, local dev + seed data, generated DB types, env & secrets config
- [ ] **Tests** - Jest + React Native Testing Library for components and `lib/` functions
- [ ] **CI pipeline** - GitHub Actions running typecheck, lint, and tests on PRs
- [x] **Claude Code setup** - `CLAUDE.md` and project skills for AI-assisted development
- [ ] **Edit & delete entries**
- [ ] **Photos on entries** - Attach progress photos via Supabase Storage

### Phase 2 — Accounts & Onboarding
- [ ] **Sign up flow** - Email sign up & password reset
- [ ] **OAuth** - Sign in with Apple / Google
- [ ] **Hair profile quiz** - Hair type, porosity, density, and goals during onboarding
- [ ] **Settings & account** - Edit profile, dark mode, data export, delete account

### Phase 3 — Richer Diary
- [ ] **Product shelf** - Save the products you own and use
- [ ] **Products used** - Tag products on each entry
- [ ] **Richer entry fields** - Hair rating/mood, tags, routine steps, weather/humidity

### Phase 4 — Insights
- [ ] **Progress timeline** - Photo gallery w/ before & after comparisons
- [ ] **Stats & trends** - Wash frequency, streaks, products linked to Good Hair Days
- [ ] **Goals tracking** - Set journey goals and track progress
- [ ] **Reminders** - Push notifications for wash days, masks, and trims

### Phase 5 — Community
- [ ] **Good Hair Day posts** - Share posts w/ the products used
- [ ] **Community feed** - Browse posts from others
- [ ] **Likes & follows**
- [ ] **Reporting & moderation**

### Phase 6 — Smart Recommendations
- [ ] **Data consent & collection** - Opt-in data for training & recommendations
- [ ] **LLM recommendations** - Personalized routine/product advice via a Supabase Edge Function
- [ ] **Classic ML model** - Research & train a model on routine/product outcomes once enough data exists

### 🚀 Release
- [ ] **TestFlight beta** - EAS Build & submit, app icon, splash screen, privacy policy

## 🧑🏽‍💻 About me
Built by Hector Batista (a fellow curly head!) - Computer Science & Business Administration

I'm passionate about learning new things while also helping people easily achieve their goals through software solutions.

**Connect with me:**
- 🧳 LinkedIn: [Hector Batista Jr](https://www.linkedin.com/in/hectorbatistajr/)
- 📧 Email: [batista.h@northeastern.edu](mailto:batista.h@northeastern.edu)