# Universal Payment Checkout - Usage Guide

The `CheckoutScreen` is now a universal payment screen that can be used across all services in the app.

## Features

- ✅ Universal for all services (ESIM, Tours, Hotels, etc.)
- ✅ Success/Failure URLs defined in backend
- ✅ Returns `orderId` and `status` from payment gateway
- ✅ Supports custom success/failure callbacks
- ✅ Flexible navigation after payment

## Navigation Parameters

```typescript
interface PaymentCheckoutParams {
  amount: number;                    // Required: Payment amount
  clientId: string;                  // Required: Client identifier
  description?: string;              // Optional: Payment description
  currency?: string;                 // Optional: ISO currency code (defaults to "MAD")
  onSuccess?: (orderId: string, status: string) => void;  // Optional: Success callback
  onFailure?: (orderId?: string, status?: string) => void; // Optional: Failure callback
  successRoute?: keyof RootStackParamList;  // Optional: Route to navigate after success
  successParams?: any;               // Optional: Params for success route
}
```

## Basic Usage Examples

### Example 1: Simple Payment (Navigate Back on Success)

```typescript
navigation.navigate('PaymentCheckout', {
  amount: 50.00,
  clientId: 'user-123',
  description: 'Hotel Booking Payment'
});
```

### Example 2: Payment with Success Route

```typescript
navigation.navigate('PaymentCheckout', {
  amount: 100.00,
  clientId: user.id,
  description: 'eSIM Purchase',
  currency: 'MAD',
  successRoute: 'ESIM',
  successParams: { purchaseSuccess: true }
});
```

### Example 3: Payment with Custom Callbacks

```typescript
const handlePaymentSuccess = async (orderId: string, status: string) => {
  console.log('Payment successful:', orderId, status);
  
  // Call your backend to finalize the purchase
  await api.finalizePurchase({ orderId, userId: user.id });
  
  // Update local state
  await loadUserData();
};

const handlePaymentFailure = (orderId?: string, status?: string) => {
  console.log('Payment failed:', orderId, status);
  // Log analytics or show custom error
};

navigation.navigate('PaymentCheckout', {
  amount: 250.00,
  clientId: user.id,
  description: 'Tour Package - 7 Days Morocco',
  currency: 'MAD',
  onSuccess: handlePaymentSuccess,
  onFailure: handlePaymentFailure,
  successRoute: 'Tours',
  successParams: { bookingConfirmed: true }
});
```

### Example 4: ESIM Purchase (Complete Implementation)

```typescript
import { useEsim } from '../../hooks/useEsim';

const ESIMPurchaseButton = ({ operatorId, amount, offer }) => {
  const navigation = useNavigation();
  const { purchaseEsim } = useEsim();
  const { user } = useAuth();

  const handlePurchase = () => {
    const handleSuccess = async (orderId: string, status: string) => {
      try {
        // Finalize ESIM purchase with your backend
        await purchaseEsim(operatorId, amount, offer);
        console.log('ESIM purchased successfully:', orderId);
      } catch (error) {
        console.error('Failed to finalize ESIM:', error);
        Alert.alert('Error', 'Payment succeeded but ESIM activation failed. Contact support.');
      }
    };

    navigation.navigate('PaymentCheckout', {
      amount,
      clientId: user.id,
      description: `ESIM Purchase - ${offer}`,
      onSuccess: handleSuccess,
      successRoute: 'ESIM',
      successParams: { purchaseSuccess: true }
    });
  };

  return (
    <Button title="Buy ESIM" onPress={handlePurchase} />
  );
};
```

### Example 5: Entertainment/Tour Booking

```typescript
const bookTour = (tourId: string, price: number, tourTitle: string) => {
  const handleSuccess = async (orderId: string, status: string) => {
    try {
      // Save booking to backend
      await tourService.confirmBooking({
        tourId,
        userId: user.id,
        orderId,
        amount: price
      });
      
      // Track analytics
      trackEvent('tour_booking_success', { tourId, orderId });
    } catch (error) {
      console.error('Booking confirmation failed:', error);
    }
  };

  navigation.navigate('PaymentCheckout', {
    amount: price,
    clientId: user.id,
    description: `Tour Booking - ${tourTitle}`,
    onSuccess: handleSuccess,
    successRoute: 'Tours',
    successParams: { bookingId: tourId }
  });
};
```

## Payment Flow

1. **Navigate to `PaymentCheckout`** with required params
2. **Screen initializes** payment with backend
3. **WebView loads** payment gateway
4. **User completes** payment
5. **Backend redirects** to success/failure URL with `orderId` and `status`
6. **Screen parses** the response
7. **Callbacks execute** if provided (`onSuccess` or `onFailure`)
8. **Navigation happens** to `successRoute` or back

## Response Data

When payment completes, the following data is returned from the backend:

```typescript
interface PaywallOrderResult {
  orderId: string;      // Unique order identifier
  status: 'success' | 'failure'; // Normalized payment status
}
```

Example success URL from backend:
```
http://49.13.89.74:9090/paywall/success?orderId=2061d54a-0bd9-4de5-ad0d-752da9597ba2&status=SUCCESS&amount=10.00
```

## Error Handling

The checkout screen handles errors automatically:

- **Missing parameters**: Shows alert and navigates back
- **Payment initialization fails**: Shows error alert and navigates back
- **Payment fails**: Calls `onFailure` callback and navigates back
- **Success callback fails**: Shows alert but payment is still marked successful

## Notes

- ✅ Success and failure URLs are configured in the backend (no need to pass them)
- ✅ The screen handles loading states automatically
- ✅ All callbacks are optional - basic usage just requires `amount` and `clientId`
- ✅ Use `description` to help identify transactions in backend logs
- ✅ The screen is stateless - it resets when unmounted

