# Personal Finance Tracker Mobile - Specification

## Overview

A cross-platform mobile application for personal finance management, built with Expo Router (React Native), TypeScript, and Supabase. The app provides comprehensive expense tracking, budgeting, goal management, and AI-powered features for receipt scanning and voice input.

## Target Platforms

- **iOS**: iPhone and iPad (iOS 13+)
- **Android**: Android 6.0+ (API 23+)
- **Web**: Progressive Web App (PWA) support via Expo Web

## Core Features

### 1. Authentication & User Management

- **Registration**: Email and password-based registration
- **Login**: Secure authentication with PKCE flow via Supabase Auth
- **Guest Mode**: Read-only demo account with pre-populated data
  - Guest User ID: `55e3b0e6-b683-4cab-aa5b-6a5b192bde7d`
  - All write operations blocked with informative messages
- **Profile Management**: User profile with avatar, name, and settings
- **Session Management**: Automatic token refresh on app foreground (mobile)

### 2. Account Management

- **Account Types**: Checking, Savings, Credit, Investment
- **Balance Tracking**: Real-time balance updates via database triggers
- **Multiple Accounts**: Support for unlimited accounts per user
- **Account Transfers**: Internal transfers between user's accounts
- **Account Details**: Account name, type, account number, status (active/inactive)

### 3. Transaction Management

**Universal Party System**:

- `from_party`: Source of money (account for expenses, employer/source for income, source account for transfers)
- `to_party`: Destination of money (merchant for expenses, account for income, destination account for transfers)

**Transaction Types**:

- **Expense**: Money leaving user's account to a merchant/service
- **Income**: Money entering user's account from a source
- **Transfer**: Money moving between user's accounts

**Features**:

- Full timestamp support (date + time)
- Category assignment (13 expense categories, 8 income categories)
- Transaction status (pending, completed, cancelled, failed)
- Filtering by category, date range, party, type
- Client-side filtering for performance (max 500 transactions on Android)
- Edit/delete transactions with automatic balance updates
- Bulk selection and operations

### 4. Budget Management

- **Budget Periods**: Weekly, Monthly, Quarterly, Yearly
- **Category-based**: One budget per expense category
- **Real-time Spending**: Server-side RPC calculation for accuracy
- **Budget Status**: Visual indicators (good, warning, over)
- **Bulk Edit**: Edit multiple budgets simultaneously
- **Progress Tracking**: Visual progress bars showing spent vs. budgeted
- **Yearly Analysis**: 12-month budget vs. actual spending comparison

### 5. Goal Management

- **Goal Types**: Savings goals with target amounts and dates
- **Priority Levels**: High, Medium, Low
- **Contributions**: Add funds toward goals
- **Progress Tracking**: Visual progress indicators
- **Status Management**: Active, Completed, Paused, Cancelled
- **Bulk Edit**: Edit multiple goals at once
- **Goal Categories**: Optional categorization for organization

### 6. AI-Powered Features

**Receipt Scanning** (Google Gemini):

- Camera or gallery image selection
- Max 10MB file size, supports JPEG, PNG, WebP, HEIC
- Extracts: merchant name, total amount, date, time, items, category
- Automatic expense creation with extracted data
- Error handling for blocked content, invalid images, API issues

**Voice Input** (Google Gemini):

- Record transaction details via voice
- Speech-to-text conversion
- Automatic parsing of amount, description, category
- Supports both expense and income entry
- Platform-specific audio recording (Expo Audio API)

### 7. Dashboard & Analytics

- **Account Summary**: Total balance, monthly change percentage
- **Recent Transactions**: Last 10 transactions with quick access
- **Budget Overview**: Current month budget status across all categories
- **Goals Progress**: Visual representation of savings goals
- **Quick Actions**: Add transaction, add income, scan receipt
- **Navigation**: Tab-based navigation with dashboard, transactions, budgets, goals

### 8. Reports & Insights

- **Category Spending**: Pie chart breakdown by category
- **Spending Trends**: Line chart showing spending over time
- **Budget vs. Actual**: Comparison charts for budget adherence
- **Monthly Analysis**: Month-over-month comparison
- **Export Functionality**: Export transaction data (CSV/Excel)

## Technical Specifications

### Architecture

- **Framework**: Expo SDK 54 with Expo Router (file-based routing)
- **Language**: TypeScript (strict mode)
- **State Management**: TanStack React Query v5 for server state
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **UI Components**: shadcn-inspired component library
- **Backend**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with PKCE flow
- **Storage**: Platform-aware (AsyncStorage for native, localStorage for web)

### Database Schema

**Tables**:

- `users`: User profiles (first_name, last_name, initials, avatar)
- `accounts`: User accounts with balance and type
- `transactions`: Universal party model with from_party/to_party
- `budgets`: Category-based budgets with period and amounts
- `goals`: Savings goals with progress tracking
- `summary`: Cached dashboard data for performance

**Key Constraints**:

- Row Level Security (RLS) enforced on all tables
- User ID foreign key relationships
- UUID primary keys
- Timestamp tracking (created_at, updated_at)
- Database triggers for automatic balance updates

### Performance Optimizations

- **Android Limit**: Max 500 transactions loaded to prevent crashes
- **Query Caching**: React Query with stale-time configuration
- **Guest Mode Caching**: Longer cache times for read-only data
- **Server-side RPC**: Complex calculations done in PostgreSQL
- **Client-side Filtering**: Preferred for smaller datasets
- **Lazy Loading**: Images and charts loaded on demand

### Security

- **Row Level Security**: All database queries filtered by authenticated user
- **PKCE Flow**: OAuth 2.0 PKCE for secure authentication
- **API Key Management**: Environment variables for sensitive keys
- **Guest Protection**: Write operations blocked for demo account
- **Session Validation**: Token validation on protected routes

## Design Principles

### User Experience

- **Consistency**: shadcn design system across all components
- **Accessibility**: ARIA labels, screen reader support
- **Feedback**: Toast notifications for all user actions
- **Error Handling**: Descriptive error messages with recovery suggestions
- **Loading States**: Skeleton screens during data fetching
- **Animations**: Disabled for Expo Go compatibility

### Code Quality

- **TypeScript**: Strict mode with explicit types
- **Centralized Keys**: React Query keys in `lib/query-keys.ts`
- **Path Aliases**: `@/*` for cleaner imports
- **Error Logging**: Console errors with context
- **Code Reusability**: Shared utilities in feature folders

## Environment Variables

Required for all environments:

```
EXPO_PUBLIC_SUPABASE_URL=<supabase-project-url>
EXPO_PUBLIC_SUPABASE_KEY=<supabase-anon-key>
EXPO_PUBLIC_GEMINI_API_KEY=<google-gemini-api-key>
```

## Deployment

- **Development**: Expo Go for rapid testing
- **Preview**: Internal distribution (APK for Android, TestFlight for iOS)
- **Production**: App Store (iOS), Google Play (Android), Web hosting
- **Build Service**: EAS Build with automatic versioning
- **Updates**: Over-the-air updates via Expo Updates

## Limitations & Constraints

- **Transaction Limit**: 500 transactions on Android for stability
- **File Size**: 10MB max for receipt images
- **Animations**: Reanimated disabled for Expo Go compatibility
- **Guest Mode**: Read-only, no data persistence for guest users
- **Offline Support**: Limited (requires network for Supabase queries)

## Success Metrics

- **Stability**: < 1% crash rate
- **Performance**: < 3s load time for dashboard
- **User Engagement**: Daily active usage for transaction logging
- **Feature Adoption**: > 50% users trying AI features (receipt scan, voice input)
- **Data Accuracy**: < 0.1% balance calculation errors (handled by database triggers)

## Future Considerations (Out of Scope)

- Recurring transactions/bills
- Multi-currency support
- Bank account integration (Plaid)
- Collaboration/shared accounts
- Advanced analytics/predictions
- Investment portfolio tracking
- Tax reporting features
