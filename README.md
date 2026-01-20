# PT Sessions - Personal Trainer Management App

A mobile-first web application for personal trainers to manage their training sessions, students, and workout programmes.

## Features

- **Today View**: See today's and tomorrow's sessions at a glance
- **Schedule**: Agenda-style session list with create/edit capabilities
- **Students**: Full CRUD with profiles, goals, constraints, and emergency contacts
- **Programmes**: Create workout templates with exercises (sets, reps, duration, rest)
- **Locations**: Manage indoor/outdoor training locations
- **Quick Actions**: Fast session management (move time, change location, mark complete)
- **Mobile-First**: Bottom tab navigation, large tap targets, optimized for phones

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Forms**: react-hook-form + zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
cd trainer-app
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the schema SQL in Supabase SQL Editor:
   - Go to SQL Editor in your Supabase dashboard
   - Copy contents of `supabase/schema.sql`
   - Execute the SQL

3. (Optional) Run seed data:
   - Copy contents of `supabase/seed.sql`
   - Execute the SQL

### 3. Configure Environment

Create `.env.local` from the example:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Create a Trainer Account

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" > "Create new user"
3. Enter email and password
4. After user is created, go to SQL Editor and run:

```sql
-- Replace USER_ID with the UUID from the Users table
-- Replace ORG_ID with your organization ID (or use the seed data org)
UPDATE profiles
SET
  organization_id = '00000000-0000-0000-0000-000000000001',
  role = 'trainer'
WHERE id = 'YOUR_USER_UUID';
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── (app)/                 # Authenticated routes with bottom nav
│   │   ├── today/             # Today's sessions view
│   │   ├── schedule/          # Session list and creation
│   │   ├── sessions/[id]/     # Session detail and edit
│   │   ├── students/          # Student CRUD
│   │   ├── programmes/        # Programme CRUD
│   │   └── locations/         # Location CRUD
│   ├── (auth)/
│   │   └── login/             # Login page
│   └── auth/callback/         # OAuth callback
├── components/
│   ├── forms/                 # Form components
│   ├── layout/                # App shell, bottom nav, header
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── actions/               # Server actions
│   ├── supabase/              # Supabase client config
│   ├── validations/           # Zod schemas
│   └── utils.ts               # Utility functions
└── middleware.ts              # Auth middleware
```

## Database Schema

### Core Tables

- `organizations` - Gyms/teams (multi-tenant support)
- `profiles` - Extends Supabase auth.users
- `students` - Client information
- `locations` - Training venues (indoor/outdoor)
- `sessions` - Scheduled training sessions
- `session_students` - Session-student assignments (max 2)
- `programme_templates` - Workout templates
- `programme_blocks` - Exercises within programmes
- `session_programmes` - Programme assigned to a session (JSONB snapshot)

### Business Rules (Enforced at DB Level)

- Sessions are always 60 minutes
- Maximum 2 students per session
- No overlapping sessions for the same trainer
- All data scoped to organization via RLS

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Authentication |
| `/today` | Today + tomorrow sessions |
| `/schedule` | Session list (4 weeks) |
| `/schedule/new` | Create session |
| `/sessions/[id]` | Session detail |
| `/sessions/[id]/edit` | Edit session |
| `/students` | Student list |
| `/students/new` | Create student |
| `/students/[id]` | Student profile |
| `/students/[id]/edit` | Edit student |
| `/programmes` | Programme templates |
| `/programmes/new` | Create programme |
| `/programmes/[id]` | Programme detail + exercises |
| `/programmes/[id]/edit` | Edit programme |
| `/locations` | Location list |
| `/locations/new` | Create location |
| `/locations/[id]` | Location detail |
| `/locations/[id]/edit` | Edit location |

## Next Steps (Post-MVP)

1. **Student Portal**: Let students log in and view their sessions/programmes
2. **Weather Integration**: Show weather for outdoor locations
3. **Recurring Sessions**: Generate sessions from recurrence rules
4. **Notifications**: Email/push reminders for upcoming sessions
5. **Analytics**: Track completed sessions, student progress
6. **Multi-trainer**: Full team management features
7. **PWA**: Add service worker for home screen installation

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```

## License

Private - All rights reserved
