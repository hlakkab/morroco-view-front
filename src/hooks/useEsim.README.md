# useEsim Hook

A custom React hook for managing ESIM operations in the application.

## Features

- **State Management**: Centralized ESIM state (esims, loading, error)
- **Authentication Integration**: Automatic authentication checks
- **Event Tracking**: Built-in Mixpanel analytics for all ESIM operations
- **Auto-fetching**: Automatically loads ESIMs when authenticated
- **Utility Functions**: Helper methods for common ESIM operations

## API

### State

```typescript
{
  esims: Esim[]           // Array of user's ESIMs
  loading: boolean        // Loading state for async operations
  error: string | null    // Error message if operation failed
  isAuthenticated: boolean // Current authentication status
}
```

### Actions

#### `loadEsims(): Promise<Esim[]>`
Fetches all ESIMs for the authenticated user.

```typescript
const { loadEsims } = useEsim();

// Manually refresh ESIMs
await loadEsims();
```

#### `purchaseEsim(operatorId: string, price: number, offer?: string): Promise<Esim>`
Creates a new ESIM purchase.

```typescript
const { purchaseEsim } = useEsim();

await purchaseEsim('orange', 120, 'Marhaba 20GB');
```

### Utility Functions

#### `findEsimById(id: string): Esim | undefined`
Find a specific ESIM by ID.

#### `findEsimsByOperator(operator: string): Esim[]`
Get all ESIMs from a specific operator.

#### `getActiveEsimsCount(): number`
Get total number of ESIMs.

#### `getTotalEsimsValue(): number`
Get total monetary value of all ESIMs.

#### `hasEsims(): boolean`
Check if user has any ESIMs.

#### `hasOperatorEsim(operator: string): boolean`
Check if user has ESIM from specific operator.

#### `getUniqueOperators(): string[]`
Get list of unique operators from user's ESIMs.

## Integration

### Files Modified

1. **`src/hooks/useEsim.ts`** - New hook implementation
2. **`src/hooks/index.ts`** - Export hook for easy imports
3. **`src/ESIM/screens/ESIMScreen.tsx`** - Refactored to use hook
4. **`src/ESIM/containers/BuyESIMModal.tsx`** - Cleaned up unused imports

### Before (Direct Redux)

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { fetchEsims, createEsim } from '../store/esimSlice';

const dispatch = useDispatch();
const { esims, loading, error } = useSelector((state) => state.esim);

// Fetch ESIMs
dispatch(fetchEsims());

// Purchase ESIM
await dispatch(createEsim(newEsim)).unwrap();
```

### After (Using Hook)

```typescript
import { useEsim } from '../../hooks/useEsim';

const { esims, loading, error, loadEsims, purchaseEsim } = useEsim();

// Fetch ESIMs
loadEsims();

// Purchase ESIM
await purchaseEsim(operatorId, price, offer);
```

## Benefits

1. **Cleaner Code**: Less boilerplate in components
2. **Built-in Tracking**: Analytics automatically tracked
3. **Type Safety**: Full TypeScript support
4. **Reusability**: Use in any component that needs ESIM data
5. **Auto-loading**: ESIMs fetched automatically when authenticated
6. **Error Handling**: Centralized error handling logic

## Usage in Components

```typescript
import { useEsim } from '../../hooks/useEsim';

const MyComponent = () => {
  const {
    esims,
    loading,
    error,
    purchaseEsim,
    getActiveEsimsCount
  } = useEsim();

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <View>
      <Text>Total ESIMs: {getActiveEsimsCount()}</Text>
      {esims.map(esim => (
        <EsimCard key={esim.id} esim={esim} />
      ))}
    </View>
  );
};
```

## Event Tracking

The hook automatically tracks the following events:

- `ESIM_Fetch_Started`
- `ESIM_Fetch_Success`
- `ESIM_Fetch_Failed`
- `ESIM_Purchase_Started`
- `ESIM_Purchase_Success`
- `ESIM_Purchase_Failed`

All events include relevant metadata (operator, price, error messages, etc.)

