# Personal Finance Tracker Mobile - AI Coding Agent Instructions

## Project Overview

React Native mobile app built with Expo Router, TypeScript, NativeWind (Tailwind), React Query, and Supabase. Cross-platform finance tracker with guest mode, AI receipt scanning, and voice input.

## Architecture & Key Patterns

### Tech Stack

- **Framework**: Expo SDK 54 with Expo Router (file-based routing)
- **Language**: TypeScript with strict mode, path aliases (`@/*`)
- **Styling**: NativeWind v4 (Tailwind for React Native) + CSS variables
- **State Management**: TanStack React Query v5 for server state
- **Backend**: Supabase (PostgreSQL with RLS, Auth with PKCE flow)
- **AI Features**: Google Gemini API (direct client calls, no server required)

### Project Structure

```
app/                    # File-based routing (Expo Router)
  (tabs)/              # Protected tab navigation (dashboard, transactions, budgets, goals)
  _layout.tsx          # Root layout with QueryProvider + ToastProvider
  index.tsx            # Landing page (redirects to dashboard or login)
  login.tsx, register.tsx  # Auth screens

components/
  ui/                  # shadcn-inspired components (button, dialog, card, etc.)
  transactions/        # Feature-specific components with utils
  budgets/, goals/, accounts/  # Feature modules with modals & utils

lib/
  supabase.ts          # Supabase client with auto-refresh
  storage.ts           # Platform-aware storage adapter (AsyncStorage/localStorage)
  query-keys.ts        # Centralized React Query keys
  types.ts             # Shared TypeScript interfaces
  guest-protection.ts  # Guest mode guards (GUEST_USER_ID constant)

hooks/
  queries/             # React Query hooks (useTransactions, useAuth, etc.)
  useReceiptScan.ts    # Direct Gemini API calls for receipt scanning
  useVoiceInput.ts     # Direct Gemini API calls for voice processing
  useGuestCheck.ts     # Guest mode protection hook
```

### Critical Patterns

#### 1. AI Features (Receipt Scanning & Voice Input)

**IMPORTANT**: AI features call Gemini API directly from client code, NOT through API routes.

- **Why**: Expo API routes only work in development mode. For mobile apps, direct client calls are simpler and work in all builds (dev, preview, production).
- **Implementation**: `useReceiptScan.ts` and `useVoiceInput.ts` use `@google/generative-ai` package directly
- **API Key**: Uses `EXPO_PUBLIC_GEMINI_API_KEY` environment variable (injected via EAS Secrets)
- **Security Note**: Client-side API calls are acceptable for Gemini because:
  - API key is scoped/restricted to specific APIs in Google Cloud Console
  - No sensitive user data is exposed
  - Rate limiting is handled by Google

#### 2. Data Layer Architecture

- **React Query for ALL server state** - no local state for API data
- **Centralized query keys** in `lib/query-keys.ts` - ALWAYS use these, never hardcode keys
- **Comprehensive cache invalidation** - when mutating, invalidate all related queries:
  ```typescript
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  ```

#### 2. Data Layer Architecture

- **React Query for ALL server state** - no local state for API data
- **Centralized query keys** in `lib/query-keys.ts` - ALWAYS use these, never hardcode keys
- **Comprehensive cache invalidation** - when mutating, invalidate all related queries:
  ```typescript
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  ```
- **Guest mode awareness** - queries have longer `staleTime` for guests, `refetchOnWindowFocus: !isGuest`

#### 3. Transaction System (Universal Party Model)

Transactions use `from_party` and `to_party` instead of merchant:

- **Expense**: `from_party` = account name, `to_party` = merchant/recipient
- **Income**: `from_party` = source (employer, client), `to_party` = account name
- **Transfer**: `from_party` = source account, `to_party` = destination account
- **Date field**: Stores full timestamp with time (`YYYY-MM-DDTHH:MM:SS`)
- **Database triggers handle balance updates** - no manual balance calculation needed

#### 4. Guest Mode Protection

- Guest user ID: `55e3b0e6-b683-4cab-aa5b-6a5b192bde7d` (read-only access)
- Use `checkGuestAndWarn('action description')` before write operations
- Returns `true` if guest (block action), `false` if authenticated user
- Example: `if (await checkGuestAndWarn('add transactions')) return;`

#### 5. Authentication & Storage

- **Supabase Auth** with PKCE flow, auto-refresh on app foreground (mobile only)
- **Platform-aware storage**: `lib/storage.ts` exports adapter that uses AsyncStorage (mobile) or localStorage (web)
- **Auth state**: Always use `useAuth()` hook, checks for valid session and user data

#### 6. Styling Conventions

- **NativeWind classes**: Use Tailwind utility classes (`className="flex-1 bg-white"`)
- **CSS variables**: Theme colors defined in `global.css` (e.g., `bg-primary`, `text-foreground`)
- **shadcn-style components**: Use `cn()` utility from `lib/utils.ts` for conditional classes
- **Animations disabled**: Reanimated commented out for Expo Go compatibility (see `app/_layout.tsx`)

#### 7. Environment Variables

Required variables (prefix with `EXPO_PUBLIC_` for client access):

- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_KEY` - Supabase anon key
- `EXPO_PUBLIC_GEMINI_API_KEY` - Google Gemini API key (receipt scan, voice input)

**CRITICAL SECURITY RULES**:

- ⚠️ **NEVER** include actual API keys, URLs, or credentials in documentation or code examples
- ⚠️ **NEVER** commit `.env`, `.env.local`, or files containing secrets to version control
- ✅ **ALWAYS** use placeholders like `"your-api-key"` or `"***"` in examples
- ✅ **USE** EAS Secrets for production/preview builds: `eas secret:create --scope project --name KEY_NAME --value "..." --force`
- ✅ Keep `.env.example` with placeholder values only
- ✅ Store actual values in `.env.local` (gitignored) for local development

#### 8. Database Interactions

- **NO direct SQL** - use Supabase client methods (`select()`, `insert()`, `update()`)
- **Row Level Security (RLS)** enforced - queries automatically filter by authenticated user
- **Server-side RPC functions** for complex operations (see `useTransactions.ts` - `get_current_month_spending_by_category`)
- **UUID handling**: Database uses `uuid` type, convert to string in TypeScript interfaces

## Development Workflows

### Running the App

```bash
npx expo start         # Start development server
npx expo start --android  # Android emulator
npx expo start --ios      # iOS simulator
npx expo start --web      # Web browser
```

### Key Commands

- `npm run lint` - ESLint check
- `npm run reset-project` - Clean project (removes starter code)
- Build development client: `npx expo run:ios` or `npx expo run:android` (needed for Reanimated)

### Common Tasks

1. **Adding a new query**: Create hook in `hooks/queries/`, add key to `lib/query-keys.ts`, use `useQuery` with guest-aware config
2. **Adding a mutation**: Use `useMutation`, invalidate related queries in `onSuccess`
3. **New screen**: Create in `app/` directory (auto-routes), add auth check if needed
4. **New component**: shadcn-style in `components/ui/`, feature-specific in `components/{feature}/`
5. **Write operations**: ALWAYS check guest mode with `checkGuestAndWarn()` first

### Category System

- **Expense categories**: Defined in `constants/categories.ts` (Food & Dining, Transportation, etc.)
- **Income categories**: Separate list in same file (Salary, Freelance, etc.)
- Use `getCategoryById()` or `getCategoryName()` helpers

### Android Performance Notes

- **Transaction limit**: Max 500 transactions loaded at once to prevent memory issues on Android
- **Image handling**: Receipt scan validates max 10MB file size, specific MIME types
- Client-side filtering preferred over server-side for smaller datasets (see `useFilteredTransactions`)

## Common Pitfalls

1. ❌ Hardcoding query keys → ✅ Use `queryKeys` from `lib/query-keys.ts`
2. ❌ Forgetting to invalidate related queries → ✅ Invalidate transactions, accounts, budgets, dashboard after mutations
3. ❌ Allowing write operations for guests → ✅ Add `checkGuestAndWarn()` guard
4. ❌ Using Reanimated animations → ✅ Disabled for Expo Go compatibility (use `animation: "none"`)
5. ❌ Manual balance updates → ✅ Database triggers handle account balance changes
6. ❌ Missing environment variables → ✅ Check `EXPO_PUBLIC_*` variables are set
7. ❌ Inconsistent date formats → ✅ Always use ISO strings with full timestamp for transaction dates

## Code Style

- **TypeScript**: Explicit return types for public functions, strict mode enabled
- **Components**: Functional components with hooks, extract logic to custom hooks
- **Error handling**: Try-catch with descriptive error messages, log to console
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Imports**: Use `@/` path alias, group imports (React, libraries, local)

## Security & Secrets Management

### EAS Secrets for Builds

Use EAS Secrets (not `eas.json` env sections) for all environment variables:

```bash
# Create/update secrets (do NOT show actual values in documentation)
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your-value" --force
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_KEY --value "your-value" --force
eas secret:create --scope project --name EXPO_PUBLIC_GEMINI_API_KEY --value "your-value" --force
```

**Benefits**:

- Secrets stored securely in EAS, not in version control
- Automatically injected during builds
- No need for `env` sections in `eas.json`
- Easy to update without code changes

### Local Development

- Use `.env.local` (gitignored) for actual values
- Reference `.env.example` for required variable names
- Never commit files with actual credentials

### Documentation Rules

When writing documentation or examples:

- ✅ Use: `"your-api-key"`, `"your-supabase-url"`, `"***"`, `"[REDACTED]"`
- ❌ Never: Include actual API keys, tokens, URLs with credentials, or identifiable information
- ✅ Sanitize: Remove all sensitive data before committing documentation
- ✅ Review: Check `.spec/` folder, README.md, and instruction files for leaks

### Gitignore Critical Files

Ensure these are in `.gitignore`:

```
.env
.env.local
.env.*.local
*.key
*.pem
google-services.json (if added)
GoogleService-Info.plist (if added)
```
