# Migration Guide: Universal Checkout Screen

## What Changed?

The `CheckoutScreen` has been refactored from an ESIM-specific payment screen to a **universal payment screen** that works for all services.

### Key Changes:

1. ✅ **Removed**: `operatorId`, `offer` (service-specific params)
2. ✅ **Added**: `description` (generic description field)
3. ✅ **Added**: `onSuccess`, `onFailure` callbacks for custom logic
4. ✅ **Added**: `successRoute`, `successParams` for flexible navigation
5. ✅ **Removed**: Success/Failure URL parameters (now in backend)
6. ✅ **Returns**: `orderId` and `status` from payment gateway

## Before (ESIM-specific)

```typescript
// Old navigation params
navigation.navigate('PaymentCheckout', {
  amount: 100,
  clientId: user.id,
  operatorId: 'orange-maroc',  // ❌ Service-specific
  offer: '5GB-30days'          // ❌ Service-specific
});

// Old checkout screen handled ESIM purchase internally
// - Called purchaseEsim() automatically
// - Always navigated to ESIM screen
// - No flexibility for other services
```

## After (Universal)

```typescript
// New navigation params
navigation.navigate('PaymentCheckout', {
  amount: 100,
  clientId: user.id,
  description: 'ESIM Purchase - 5GB 30 days',  // ✅ Generic description
  onSuccess: async (orderId, status) => {
    // ✅ Custom success logic
    await purchaseEsim(operatorId, amount, offer);
  },
  successRoute: 'ESIM',                         // ✅ Flexible navigation
  successParams: { purchaseSuccess: true }
});

// Universal checkout screen:
// - Handles payment flow only
// - Calls your custom callbacks
// - Navigates to any route you specify
```

## Migration Examples

### 1. Migrating ESIM Purchase

**Before:**
```typescript
const handleBuyESIM = () => {
  navigation.navigate('PaymentCheckout', {
    amount: selectedPlan.price,
    clientId: user.id,
    operatorId: selectedOperator.id,
    offer: selectedPlan.code
  });
};
```

**After:**
```typescript
const handleBuyESIM = () => {
  const handleSuccess = async (orderId: string, status: string) => {
    try {
      await purchaseEsim(selectedOperator.id, selectedPlan.price, selectedPlan.code);
      console.log('ESIM purchased:', orderId);
    } catch (error) {
      Alert.alert('Error', 'Payment succeeded but ESIM activation failed.');
    }
  };

  navigation.navigate('PaymentCheckout', {
    amount: selectedPlan.price,
    clientId: user.id,
    description: `ESIM - ${selectedOperator.name} ${selectedPlan.code}`,
    onSuccess: handleSuccess,
    successRoute: 'ESIM',
    successParams: { purchaseSuccess: true }
  });
};
```

### 2. Adding Payment to New Service

**New Feature: Hotel Booking Payment**
```typescript
const bookHotel = (hotel: Hotel, checkIn: string, checkOut: string) => {
  const handleSuccess = async (orderId: string, status: string) => {
    // Save booking to backend
    await hotelService.confirmBooking({
      hotelId: hotel.id,
      userId: user.id,
      orderId,
      checkIn,
      checkOut
    });
    
    // Show success message
    Alert.alert('Success', 'Your hotel booking is confirmed!');
  };

  const handleFailure = (orderId?: string, status?: string) => {
    // Log analytics
    trackEvent('hotel_booking_failed', { hotelId: hotel.id, orderId });
  };

  navigation.navigate('PaymentCheckout', {
    amount: hotel.pricePerNight * calculateNights(checkIn, checkOut),
    clientId: user.id,
    description: `Hotel Booking - ${hotel.name}`,
    onSuccess: handleSuccess,
    onFailure: handleFailure,
    successRoute: 'Tickets',
    successParams: { newBooking: true }
  });
};
```

### 3. Tour Package Payment

```typescript
const purchaseTourPackage = (tourId: string, participants: number) => {
  const totalAmount = tourPrice * participants;

  navigation.navigate('PaymentCheckout', {
    amount: totalAmount,
    clientId: user.id,
    description: `Tour Package - ${tourName} (${participants} people)`,
    onSuccess: async (orderId, status) => {
      await tourService.bookTour({
        tourId,
        userId: user.id,
        orderId,
        participants,
        amount: totalAmount
      });
    },
    successRoute: 'Tours',
    successParams: { bookingConfirmed: true, tourId }
  });
};
```

## Updated Type Definitions

```typescript
// src/types/navigation.ts
PaymentCheckout: {
  amount: number;
  clientId: string;
  description?: string;
  currency?: string;
  onSuccess?: (orderId: string, status: string) => void;
  onFailure?: (orderId?: string, status?: string) => void;
  successRoute?: keyof RootStackParamList;
  successParams?: any;
} | undefined;
```

## Benefits of Universal Checkout

1. **Reusability**: Use same payment screen for all services
2. **Flexibility**: Custom callbacks for service-specific logic
3. **Maintainability**: Payment logic in one place
4. **Scalability**: Easy to add payment to new features
5. **Cleaner Code**: Separation of payment vs. business logic
6. **Better UX**: Consistent payment experience

## Checklist for Migration

- [ ] Replace `operatorId`, `offer` with `description`
- [ ] Move service-specific logic to `onSuccess` callback
- [ ] Specify `successRoute` and `successParams` if needed
- [ ] Handle errors in `onSuccess` callback
- [ ] Optional: Add `onFailure` callback for analytics/logging
- [ ] Test payment flow end-to-end
- [ ] Verify backend receives correct parameters

## Need Help?

See `USAGE_EXAMPLE.md` for complete working examples.

