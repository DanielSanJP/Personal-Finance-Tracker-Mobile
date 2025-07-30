# Personal Finance Tracker Mobile

A React Native mobile app built with Expo and NativeWind for personal finance management.

## Features

- **Dashboard**: Overview of account balances, monthly spending, and income
- **Transactions**: View and filter financial transactions
- **Budgets**: Monitor spending against budget categories with progress indicators
- **Goals**: Track financial goals with progress visualization

## Tech Stack

- React Native with Expo
- NativeWind (TailwindCSS for React Native)
- TypeScript
- Expo Router for navigation

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npx expo start
   ```

3. Use the Expo Go app on your mobile device to scan the QR code

## Project Structure

```
app/
  ├── index.tsx           # Dashboard screen
  ├── transactions.tsx    # Transactions screen
  ├── budgets.tsx        # Budgets screen
  ├── goals.tsx          # Goals screen
  └── _layout.tsx        # Tab navigation layout

data/                    # JSON data files
lib/                     # Data utilities and functions
components/              # Reusable components
global.css              # TailwindCSS styles
```

## Features Overview

### Dashboard

- Account balance summary
- Monthly income and expenses
- Budget remaining
- Quick action buttons

### Transactions

- Transaction list with search and filtering
- Category-based filtering
- Transaction details with merchant info

### Budgets

- Budget progress tracking
- Over-budget alerts
- Overall budget summary
- Category-wise spending visualization

### Goals

- Financial goal tracking
- Progress indicators
- Priority-based organization
- Target date monitoring

This mobile app mirrors the functionality of the Next.js web version while being optimized for mobile use with native components and gestures.
