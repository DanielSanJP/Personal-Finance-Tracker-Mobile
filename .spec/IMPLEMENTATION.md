# Personal Finance Tracker Mobile - Implementation Details

## Project Structure

```
personal-finance-tracker-mobile/
├── app/                          # Expo Router - file-based routing
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Landing page (auth redirect)
│   ├── login.tsx                # Login screen
│   ├── register.tsx             # Registration screen
│   ├── accounts.tsx             # Account management screen
│   ├── profile.tsx              # User profile screen
│   ├── settings.tsx             # App settings
│   ├── preferences.tsx          # User preferences
│   ├── reports.tsx              # Analytics and reports
│   ├── help.tsx                 # Help and support
│   ├── (tabs)/                  # Protected tab navigation
│   │   ├── _layout.tsx          # Tab layout with auth guard
│   │   ├── dashboard.tsx        # Dashboard screen
│   │   ├── transactions.tsx     # Transaction list
│   │   ├── budgets.tsx          # Budget management
│   │   └── goals.tsx            # Goals management
│   └── api/                     # API routes
│       ├── receipt-scan+api.ts  # Receipt scanning endpoint
│       └── speech-to-text+api.ts # Voice input endpoint
├── components/
│   ├── ui/                      # shadcn-inspired UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ... (25+ components)
│   ├── transactions/            # Transaction feature components
│   │   ├── add-transaction-modal.tsx
│   │   ├── add-income-modal.tsx
│   │   ├── edit-transactions-modal.tsx
│   │   ├── transaction-detail-modal.tsx
│   │   ├── transaction-action-menu.tsx
│   │   └── transaction-utils.ts
│   ├── budgets/                 # Budget feature components
│   │   ├── add-budget-modal.tsx
│   │   ├── edit-budgets-modal.tsx
│   │   └── budget-utils.ts
│   ├── goals/                   # Goals feature components
│   │   ├── add-goal-modal.tsx
│   │   ├── contribution-modal.tsx
│   │   ├── edit-goals-modal.tsx
│   │   └── goal-utils.ts
│   ├── accounts/                # Account feature components
│   │   ├── add-account-modal.tsx
│   │   ├── edit-account-modal.tsx
│   │   └── transfer-modal.tsx
│   ├── nav.tsx                  # Navigation component
│   ├── pie-chart.tsx            # Spending breakdown chart
│   ├── bar-chart.tsx            # Budget comparison chart
│   ├── spending-chart.tsx       # Trend line chart
│   ├── category-select.tsx      # Category picker
│   ├── receipt-scanner-modal.tsx # Receipt scanning UI
│   └── voice-input-modal.tsx    # Voice input UI
├── hooks/
│   ├── queries/                 # React Query hooks
│   │   ├── useAuth.ts           # Authentication
│   │   ├── useTransactions.ts   # Transaction CRUD
│   │   ├── useBudgets.ts        # Budget management
│   │   ├── useGoals.ts          # Goals management
│   │   ├── useAccounts.ts       # Account management
│   │   ├── useDashboard.ts      # Dashboard data
│   │   └── useProfile.ts        # User profile
│   ├── useGuestCheck.ts         # Guest mode validation
│   ├── useReceiptScan.ts        # Receipt scanning logic
│   ├── useVoiceInput.ts         # Voice input logic
│   └── useAudioRecorder.ts      # Audio recording utilities
├── lib/
│   ├── supabase.ts              # Supabase client configuration
│   ├── storage.ts               # Platform-aware storage adapter
│   ├── query-keys.ts            # Centralized React Query keys
│   ├── query-client.ts          # Query client configuration
│   ├── query-provider.tsx       # Query provider wrapper
│   ├── types.ts                 # Shared TypeScript types
│   ├── utils.ts                 # Utility functions (cn, formatCurrency)
│   ├── guest-protection.ts      # Guest mode guards
│   └── export.ts                # Data export utilities
├── constants/
│   ├── categories.ts            # Expense/income categories
│   └── business-mapping.ts      # Business category mapping
├── .spec/                       # Spec-driven development docs
│   ├── SPECIFICATION.md         # Requirements and features
│   ├── PLAN.md                  # Development roadmap
│   ├── IMPLEMENTATION.md        # This file
│   └── TASKS.md                 # Task tracking
└── .github/
    └── copilot-instructions.md  # AI agent guidelines
```

## Key Implementation Patterns

### 1. Data Layer (React Query)

**Centralized Query Keys** (`lib/query-keys.ts`):

```typescript
export const queryKeys = {
  transactions: {
    all: ["transactions"] as const,
    lists: () => [...queryKeys.transactions.all, "list"] as const,
    detail: (id: string) =>
      [...queryKeys.transactions.all, "detail", id] as const,
  },
  // ... similar structure for accounts, budgets, goals, dashboard
};
```

**Custom Hooks Pattern**:

```typescript
// hooks/queries/useTransactions.ts
export function useTransactions() {
  return useQuery({
    queryKey: queryKeys.transactions.all,
    queryFn: getCurrentUserTransactions,
    staleTime: isGuest ? 10 * 60 * 1000 : 5 * 60 * 1000,
    refetchOnWindowFocus: !isGuest,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      // Invalidate ALL related queries for data consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
```

### 2. Universal Party Transaction System

**Database Schema**:

```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense', 'transfer')),
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  from_party TEXT NOT NULL,  -- Source of money
  to_party TEXT NOT NULL,    -- Destination of money
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  destination_account_id TEXT,  -- For transfers
  status TEXT DEFAULT 'completed'
);
```

**Transaction Creation Examples**:

```typescript
// Expense: Money FROM account TO merchant
createExpenseTransaction({
  accountId: "acc_123",
  amount: 50.0,
  description: "Grocery shopping",
  merchant: "Whole Foods", // Becomes to_party
  category: "Food & Dining",
  date: new Date(),
});
// from_party = "Checking Account", to_party = "Whole Foods"

// Income: Money FROM source TO account
createIncomeTransaction({
  accountId: "acc_123",
  amount: 2500.0,
  description: "Acme Corp", // Becomes from_party
  source: "Salary", // Category
  date: new Date(),
});
// from_party = "Acme Corp", to_party = "Checking Account"

// Transfer: Money FROM account TO account
createAccountTransfer({
  fromAccountId: "acc_123",
  toAccountId: "acc_456",
  amount: 1000.0,
  description: "Savings transfer",
  date: new Date(),
});
// from_party = "Checking", to_party = "Savings"
```

### 3. Guest Mode Protection

**Implementation** (`lib/guest-protection.ts`):

```typescript
export const GUEST_USER_ID = "55e3b0e6-b683-4cab-aa5b-6a5b192bde7d";

export const checkGuestAndWarn = async (action: string): Promise<boolean> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.id === GUEST_USER_ID) {
    Alert.alert(
      "Guest Mode - Read Only",
      `Guest users cannot ${action}. Please create an account.`
    );
    return true; // Block action
  }
  return false; // Allow action
};
```

**Usage in Components**:

```typescript
const handleAddTransaction = async () => {
  if (await checkGuestAndWarn("add transactions")) return;
  // Proceed with transaction creation
};
```

**Usage in Mutations**:

```typescript
export function useCreateBudget() {
  return useMutation({
    mutationFn: async (budgetData) => {
      const isGuest = await checkGuestAndWarn("create budget");
      if (isGuest) throw new Error("Guest users cannot create budgets");
      return createBudget(budgetData);
    },
  });
}
```

### 4. Platform-Aware Storage

**Implementation** (`lib/storage.ts`):

```typescript
interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

class WebStorage implements StorageAdapter {
  async getItem(key: string) {
    return window.localStorage.getItem(key);
  }
  // ... setItem, removeItem
}

class NativeStorage implements StorageAdapter {
  async getItem(key: string) {
    return await AsyncStorage.getItem(key);
  }
  // ... setItem, removeItem
}

export const storage =
  Platform.OS === "web" ? new WebStorage() : new NativeStorage();
```

**Supabase Integration** (`lib/supabase.ts`):

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage, // Platform-aware storage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
    flowType: "pkce",
  },
});

// Auto-refresh on app foreground (mobile only)
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
```

### 5. Database Triggers for Balance Updates

**PostgreSQL Triggers** (automatic balance updates):

```sql
-- Trigger automatically updates account balance when transaction is inserted/updated/deleted
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Update source account
    UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    -- Update destination account for transfers
    IF NEW.destination_account_id IS NOT NULL THEN
      UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.destination_account_id;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    -- Reverse the balance change
    UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    IF OLD.destination_account_id IS NOT NULL THEN
      UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.destination_account_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Developer Impact**:

- ✅ No manual balance calculation needed
- ✅ Atomic transactions ensure consistency
- ✅ Reduced client-side complexity
- ❌ Cannot preview balance before save

### 6. AI Feature Implementation

**Receipt Scanning** (`app/api/receipt-scan+api.ts`):

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: Request) {
  const formData = await req.formData();
  const imageFile = formData.get("image") as Blob;

  // Validate file size (max 10MB) and type
  if (imageFile.size > 10 * 1024 * 1024) {
    return Response.json({ error: "File too large" }, { status: 400 });
  }

  // Convert to base64
  const arrayBuffer = await imageFile.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString("base64");

  // Generate content with Gemini
  const result = await model.generateContent([
    { text: promptForReceiptExtraction },
    { inlineData: { data: base64Image, mimeType: imageFile.type } },
  ]);

  const parsedData = JSON.parse(result.response.text());
  return Response.json({ parsedData });
}
```

**Voice Input** (`hooks/useVoiceInput.ts`):

```typescript
export function useVoiceInput() {
  const startRecording = async () => {
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    setRecording(recording);
  };

  const stopRecording = async () => {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    // Send to speech-to-text API
    const formData = new FormData();
    formData.append("audio", { uri, type: "audio/m4a", name: "voice.m4a" });

    const response = await fetch("/api/speech-to-text", {
      method: "POST",
      body: formData,
    });

    const { text } = await response.json();
    parseTransactionFromText(text);
  };
}
```

### 7. Silent Mutations for Batch Operations

**Problem**: Multiple deletions show success message for each item.

**Solution** (`hooks/queries/useBudgets.ts`):

```typescript
export function useDeleteBudget(options?: { silent?: boolean }) {
  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      if (!options?.silent) {
        Alert.alert("Success", "Budget deleted successfully!");
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}
```

**Usage**:

```typescript
// Batch delete with silent mode
const deleteBudgetMutation = useDeleteBudget({ silent: true });

for (const budgetId of budgetsToDelete) {
  await deleteBudgetMutation.mutateAsync(budgetId);
}

// Show one consolidated message
toast({
  message: `${budgetsToDelete.length} budgets deleted`,
  type: "success",
});
```

## Testing Strategy

### Manual Testing Checklist

- [ ] Guest mode: All write operations blocked
- [ ] Authentication: Login, register, logout flows
- [ ] Transactions: Create, edit, delete (expense, income, transfer)
- [ ] Accounts: Add, edit, delete, transfer between accounts
- [ ] Budgets: Add, edit, delete, bulk operations
- [ ] Goals: Add, contribute, edit, delete, bulk operations
- [ ] Receipt scan: Camera, gallery, error handling
- [ ] Voice input: Recording, parsing, error handling
- [ ] Platform-specific: Android, iOS, Web differences

### Performance Testing

- Android: Test with 500+ transactions (should be stable)
- iOS: Test with 1000+ transactions (higher memory limit)
- Web: Test with large datasets (browser performance)

### Edge Cases

- Empty states (no transactions, budgets, goals)
- Network errors (offline, timeout, API errors)
- Invalid data (negative amounts, invalid dates)
- Guest mode edge cases (try to access write operations)

## Deployment Process

### Development

```bash
npx expo start
# Select platform: a (Android), i (iOS), w (Web)
```

### Preview Build

**Using EAS Secrets (Recommended)**:

EAS Secrets allow you to securely store environment variables without committing them to version control. The secrets are automatically injected during the build process.

```bash
# Create secrets once (use --force to update existing secrets)
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your-supabase-url" --force
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_KEY --value "your-supabase-key" --force
eas secret:create --scope project --name EXPO_PUBLIC_GEMINI_API_KEY --value "your-gemini-key" --force

# Build preview (secrets automatically injected)
eas build --profile preview --platform android
eas build --profile preview --platform ios
```

**Note**: The `eas.json` file does NOT need `env` sections when using EAS Secrets. Keep it clean:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

EAS will automatically load secrets and show them in the build logs:

```
Environment variables with visibility "Plain text" and "Sensitive" loaded from the "preview" environment on EAS:
EXPO_PUBLIC_GEMINI_API_KEY, EXPO_PUBLIC_SUPABASE_KEY, EXPO_PUBLIC_SUPABASE_URL
```

### Production Build

```bash
# Build for production
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Over-the-Air Updates

```bash
# Publish update to production channel
eas update --branch production --message "Bug fixes and improvements"
```

## Monitoring & Maintenance

### Error Logging

- Console errors logged with context
- Supabase query errors captured
- API errors from Gemini tracked

### Performance Monitoring

- React Query DevTools (development only)
- Transaction load times
- Image processing times (receipt scan)

### Database Maintenance

- Regular RLS policy audits
- Index optimization for query performance
- Backup and recovery procedures

## Known Issues & Workarounds

### 1. Reanimated Disabled

**Issue**: Native/JS version mismatch with Expo Go  
**Workaround**: Animations disabled, use development build for animations  
**Code**: `animation: "none"` in router config

### 2. Android Transaction Limit

**Issue**: Loading 1000+ transactions causes crashes  
**Workaround**: Limit to 500 transactions max  
**Code**: `limit: 500` in `useFilteredTransactions`

### 3. Date Picker Platform Differences

**Issue**: iOS and Android date pickers behave differently  
**Workaround**: Custom date-time-picker component wraps platform-specific implementations

### 4. Web Storage Limitations

**Issue**: localStorage not available in some browsers (incognito, limited storage)  
**Workaround**: WebStorage class checks availability, falls back gracefully

## Security Considerations

### Row Level Security (RLS) Policies

```sql
-- Example: Transactions table policy
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
ON transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
ON transactions FOR DELETE
USING (auth.uid() = user_id);
```

### API Key Management

- Environment variables for sensitive keys
- Never commit `.env` file
- Use EAS Secrets for production builds
- Validate API keys on server-side routes

### Client-Side Validation

- Input sanitization for all user inputs
- Amount validation (non-negative, reasonable limits)
- Date validation (not future dates for expenses)
- Category validation (must be in predefined list)
