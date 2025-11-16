# 🔍 Shared Onboarding Flow - Architecture Review

**Date:** 2025-11-16  
**Scope:** Unified Buyer/Seller/Logistics onboarding architecture  
**Status:** ⚠️ **Critical Issues Found**

---

## 📋 Executive Summary

### ✅ What's Working
- Shared service layer (`src/features/shared/services/onboarding.service.ts`)
- Unified types/schemas (`src/features/shared/types/onboarding.types.ts`)
- Role-based step configuration
- Zustand state management structure

### ❌ Critical Issues
1. **Duplicate onboarding implementations** (shared vs buyer-specific)
2. **Missing BuyerLayout** causing build errors
3. **Inconsistent context patterns** (seller has silentRefresh, shared doesn't)
4. **Orphaned OrgKYCStep** in wrong location
5. **Missing API methods** (fetchGSTIN, fetchPostOfficeDetails)
6. **Type mismatches** across buyer/seller schemas
7. **Race conditions** in data refresh logic

---

## 🏗️ Architecture Analysis

### 1. **Hook Layer** (`useOnboarding`)

**Location:** `src/features/shared/hooks/useOnboarding.ts`

#### Issues Found:
```typescript
// ❌ PROBLEM 1: Missing silentRefresh method
// Current implementation only has fetchData() which triggers loading states
// Seller implementation added silentRefresh but it's in seller context, not shared

// ❌ PROBLEM 2: Uses zustand store but seller uses context
// Inconsistent patterns across user types
```

#### Recommendations:
```typescript
// ✅ FIX: Add silentRefresh to shared hook
export function useOnboarding() {
  const store = useOnboardingStore();
  const { toast } = useToast();
  const isRefreshing = useRef(false);

  const fetchData = useCallback(async () => {
    store.setLoading(true);
    try {
      const data = await onboardingService.getData();
      store.setData(data);
      return data;
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  // ✅ NEW: Silent refresh without loading states
  const silentRefresh = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    try {
      const data = await onboardingService.getData();
      store.setData(data);
      return data;
    } catch (error: any) {
      console.error('Silent refresh failed:', error);
    } finally {
      isRefreshing.current = false;
    }
  }, [store]);

  return {
    data: store.data,
    isLoading: store.isLoading,
    isSaving: store.isSaving,
    error: store.error,
    fetchData,
    silentRefresh, // ✅ Add this
    submitStep,
    submit,
    uploadDocument,
    deleteDocument,
  };
}
```

---

### 2. **Context/Provider Layer**

#### Issues Found:

**PROBLEM: Duplicate Implementations**
```
├── src/features/buyer/context/onboarding.context.ts   ❌ OLD (unused)
├── src/features/buyer/hooks/useOnboardingData.ts     ❌ OLD (unused)
├── src/features/shared/store/onboarding.store.ts     ✅ NEW (Zustand)
└── src/features/shared/hooks/useOnboarding.ts        ✅ NEW (uses Zustand)
```

**Seller has context layer, Buyer doesn't:**
```
└── src/features/seller/context/onboarding.context.ts  ⚠️ Seller-specific
```

#### Race Condition Risk:
```typescript
// ❌ PROBLEM: In seller context, silentRefresh can be called while fetchData is running
const fetchData = useCallback(async () => {
  if (isLoading) return; // ❌ Checked but not locked
  setIsLoading(true);
  // ... API call
});

const silentRefresh = useCallback(async () => {
  if (isRefreshing.current) return; // ✅ Uses ref to lock
  // ... API call
});

// ❌ BUG: Both can run simultaneously if timing is unlucky
```

#### Recommendations:
1. **Remove buyer-specific context/hooks** (`src/features/buyer/context/`, `src/features/buyer/hooks/useOnboardingData.ts`)
2. **Standardize on Zustand** (no need for contexts if using Zustand globally)
3. **Add mutex lock** to prevent concurrent API calls:

```typescript
// ✅ FIX: Add mutex lock
const apiLock = useRef(false);

const safeApiCall = async (fn: () => Promise<any>, showLoading = true) => {
  if (apiLock.current) {
    console.warn('API call in progress, skipping duplicate request');
    return;
  }
  
  apiLock.current = true;
  if (showLoading) store.setLoading(true);
  
  try {
    return await fn();
  } finally {
    apiLock.current = false;
    if (showLoading) store.setLoading(false);
  }
};
```

---

### 3. **DTOs / Schema Layer**

#### Issues Found:

**PROBLEM: Schema Duplication**
```
├── src/features/shared/types/onboarding.types.ts        ✅ CORRECT (225 lines)
├── src/features/shared/schemas/onboarding.schema.ts     ✅ CORRECT (178 lines)
├── src/features/buyer/types/onboarding.types.ts         ❌ DUPLICATE (86 lines)
└── src/features/buyer/schemas/buyer-onboarding.schema.ts ❌ DUPLICATE (135 lines)
```

**Type Inconsistencies:**
```typescript
// ❌ SHARED uses string IDs
export type UserRole = \"SELLER\" | \"BUYER\" | \"LOGISTICS\";

// ❌ BUYER uses different step constants
export const ONBOARDING_STEPS = {
  ORG_KYC: 'org-kyc',
  BANK_DETAILS: 'bank-details',
  // ...
} as const;

// ✅ SHARED has proper step configuration
export const ONBOARDING_STEPS: Record<UserRole, OnboardingStep[]> = {
  SELLER: [...],
  BUYER: [...],
  LOGISTICS: [...],
};
```

**Schema Validation Differences:**
```typescript
// ❌ BUYER schema (buyer-onboarding.schema.ts)
incorporationDate: z.string().min(1, 'Incorporation date is required')

// ✅ SHARED schema (onboarding.schema.ts)
incorporationDate: z.string().optional()

// ❌ RESULT: Buyer validation stricter than seller, causes inconsistency
```

#### Recommendations:
1. **DELETE** `src/features/buyer/types/onboarding.types.ts`
2. **DELETE** `src/features/buyer/schemas/buyer-onboarding.schema.ts`
3. **UPDATE** all buyer imports to use shared schemas:

```typescript
// ❌ OLD
import { OrgKycFormData } from '@/features/buyer/schemas/buyer-onboarding.schema';

// ✅ NEW
import { OrgKycFormData } from '@/features/shared/schemas/onboarding.schema';
```

4. **Align validation rules** between user types (make incorporationDate consistent)

---

### 4. **Service Layer**

**Location:** `src/features/shared/services/onboarding.service.ts`

#### Issues Found:

**PROBLEM: Missing Methods**
```typescript
// ❌ Referenced in components but not implemented:
- fetchGSTIN(gstin: string)
- fetchPostOfficeDetails(query: string)
```

**PROBLEM: Inconsistent base URLs**
```typescript
// ✅ SHARED service
const API_BASE = '/user/onboarding';

// ❌ BUYER service (shouldn't exist!)
const BASE_URL = '/buyer/onboarding';

// ❌ CONFUSION: Which endpoint does buyer actually use?
```

#### Recommendations:

```typescript
// ✅ ADD missing helper methods to shared service

class OnboardingService {
  // ... existing methods

  /**
   * Fetch business details from GSTIN
   * @param gstin - 15-character GSTIN
   */
  async fetchGSTIN(gstin: string): Promise<{
    legalName: string;
    tradeName?: string;
    registeredAddress?: string;
    businessType?: string;
  }> {
    try {
      const response = await apiClient.get('/api/gstin/lookup', {
        params: { gstin }
      });
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch GSTIN details'
      );
    }
  }

  /**
   * Fetch post office details for plant location autocomplete
   * @param query - Search query (city/pincode)
   */
  async fetchPostOfficeDetails(query: string): Promise<Array<{
    Name: string;
    District: string;
    State: string;
    Pincode: string;
  }>> {
    try {
      const response = await apiClient.get('/api/postoffice/search', {
        params: { q: query }
      });
      return response.data?.data || [];
    } catch (error: any) {
      throw new Error('Failed to fetch post office details');
    }
  }
}
```

**DELETE:** `src/features/buyer/services/onboarding.service.ts` (118 lines of duplicate code)

---

### 5. **Component Layer**

#### Issues Found:

**PROBLEM: Orphaned Component**
```
src/features/components/onboarding/OrgKYCStep.tsx
└── ❌ Wrong location (should be in shared/components)
└── ❌ Imports non-existent hooks
└── ❌ Uses old service methods
```

**PROBLEM: Buyer-specific components in wrong place**
```
src/features/buyer/components/onboarding/
├── BankDetails.tsx              ❌ Should use shared BankDetailsStep
├── ComplianceDocs.tsx           ❌ Should use shared ComplianceDocsStep
├── OrgKYC.tsx                   ❌ Should use shared OrgKYCStep
├── Review.tsx                   ❌ Should use shared ReviewStep
└── UserPreferences.tsx          ✅ CORRECT (buyer-specific)
```

**PROBLEM: Duplicate OnboardingPage**
```
├── src/features/buyer/pages/OnboardingPage.tsx    ❌ 122 lines (duplicate logic)
└── src/features/shared/pages/Onboarding.tsx       ✅ 100 lines (unified)
```

#### Recommendations:

1. **MOVE** `src/features/components/onboarding/OrgKYCStep.tsx` to `src/features/shared/components/onboarding/OrgKYCStep.tsx`

2. **DELETE** buyer-specific copies:
   - `src/features/buyer/components/onboarding/BankDetails.tsx`
   - `src/features/buyer/components/onboarding/ComplianceDocs.tsx`
   - `src/features/buyer/components/onboarding/OrgKYC.tsx`
   - `src/features/buyer/components/onboarding/Review.tsx`

3. **DELETE** `src/features/buyer/pages/OnboardingPage.tsx` (use shared version)

4. **UPDATE** buyer routes:
```typescript
// ❌ OLD
import OnboardingPage from './pages/OnboardingPage';

// ✅ NEW
import OnboardingPage from '../shared/pages/Onboarding';
```

---

### 6. **Page-Level Logic**

#### Issues Found in `Onboarding.tsx`:

**PROBLEM 1: Duplicate stepper calculation**
```typescript
// src/features/shared/pages/Onboarding.tsx
const [currentStepIndex, setCurrentStepIndex] = useState(0);

// ❌ No logic to calculate initial step based on completedSteps
// ❌ Always starts at 0, even if user has completed steps

// src/features/seller/pages/Onboarding.tsx (old)
const currentStep = useMemo(() => {
  const firstIncomplete = STEPS.findIndex(s => !onboarding?.completedSteps?.includes(s.id));
  return firstIncomplete === -1 ? STEPS.length - 1 : firstIncomplete;
}, [onboarding]);
// ✅ Better: Calculates first incomplete step
```

**PROBLEM 2: Step navigation after save**
```typescript
// In step components:
const onSubmit = async (data) => {
  await service.updateOrgKyc(data);
  await fetchData(); // ❌ Causes re-render and useEffect recalculation
  onNext(); // ✅ But we've already moved manually
};

// In Onboarding.tsx:
useEffect(() => {
  if (data) {
    // ❌ This could override manual navigation
    const nextStep = calculateNextStep(data);
    setCurrentStepIndex(nextStep);
  }
}, [data]);
```

#### Recommendations:

```typescript
// ✅ FIX: Calculate initial step on mount only
export default function OnboardingPage() {
  const { data: onboarding, isLoading, fetchData } = useOnboarding();
  const userRole = user?.role as UserRole;
  const steps = getStepsForRole(userRole);
  
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(() => {
    if (!onboarding) return 0;
    
    // Find first incomplete step
    const firstIncomplete = steps.findIndex(
      step => !onboarding.completedSteps?.includes(step.id)
    );
    
    return firstIncomplete === -1 ? steps.length - 1 : firstIncomplete;
  });
  
  const hasInitialized = useRef(false);
  
  // ✅ Only recalculate on initial load
  useEffect(() => {
    if (!hasInitialized.current && onboarding) {
      const firstIncomplete = steps.findIndex(
        step => !onboarding.completedSteps?.includes(step.id)
      );
      setCurrentStepIndex(firstIncomplete === -1 ? steps.length - 1 : firstIncomplete);
      hasInitialized.current = true;
    }
  }, [onboarding, steps]);
  
  // ✅ Use silentRefresh in step handlers
  const handleNext = async () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      await silentRefresh(); // No re-render trigger
    }
  };
}
```

---

### 7. **Layout Components**

#### Issues Found:

**PROBLEM: Missing BuyerLayout**
```
src/features/buyer/routes.tsx imports:
import BuyerLayout from './components/layout/BuyerLayout';

But file doesn't exist!
└── src/features/buyer/layout/BuyerLayout.tsx ✅ NOW CREATED (but check location)
```

**PROBLEM: Inconsistent data loading**
```typescript
// Seller Layout: Uses shared useOnboarding hook
import { useOnboarding } from '../../hooks/useOnboarding';
const { data, isLoading, fetchData } = useOnboarding();

// ❌ But called \"SellerLayout\" when it should be generic
export default function SellerLayout() {
```

#### Recommendations:

1. **Rename** `src/features/shared/components/layout/Layout.tsx` to `BaseLayout.tsx`
2. **Create role-specific wrappers:**

```typescript
// src/features/seller/layout/SellerLayout.tsx
import BaseLayout from '@/features/shared/components/layout/BaseLayout';
export default BaseLayout;

// src/features/buyer/layout/BuyerLayout.tsx
import BaseLayout from '@/features/shared/components/layout/BaseLayout';
export default BaseLayout;
```

3. **OR** Make routes import shared layout directly:
```typescript
// src/features/buyer/routes.tsx
import Layout from '../shared/components/layout/Layout';

export const buyerRoutes = (
  <Route path="/buyer" element={<Layout />}>
    {/* ... */}
  </Route>
);
```

---

## 🐛 Logical Bugs & Race Conditions

### Bug 1: Concurrent API Calls
**Location:** `useOnboarding` hook + step components

**Scenario:**
```typescript
// User clicks \"Next\" quickly on a step:
1. Step component calls service.updateOrgKyc(data)
2. Step component calls fetchData()
3. User clicks \"Next\" again before fetchData() completes
4. New step starts, calls another API
5. fetchData() completes, triggers useEffect
6. useEffect recalculates step, moves user back
```

**Fix:** Use mutex lock (shown in Context section above)

---

### Bug 2: Type Coercion Masking Validation Failures
**Location:** `OrgKYCStep.tsx` line 290

```typescript
// ❌ Current code
await onboardingService.updateOrgKyc(orgKycData as any);

// ❌ PROBLEM: Silences all type errors, could send invalid data
```

**Fix:** Properly type the payload:
```typescript
// ✅ Fix the types properly
const orgKycData: OrgKycFormData = {
  legalName: formData.legalName,
  gstin: formData.gstin,
  pan: formData.pan,
  registeredAddress: formData.registeredAddress,
  businessType: formData.businessType,
  incorporationDate: formData.incorporationDate || new Date().toISOString(),
  primaryContact: {
    name: formData.primaryContact.name,
    email: formData.primaryContact.email,
    mobile: formData.primaryContact.mobile,
    role: formData.primaryContact.role || 'CEO',
  },
  tradeName: formData.tradeName,
  cin: formData.cin,
  plantLocations: plants.length > 0 ? plants : undefined,
};
```

---

### Bug 3: Empty String Handling
**Location:** Multiple step components

```typescript
// ❌ PROBLEM: Backend might reject empty strings
const payload = {
  tradeName: formData.tradeName || '', // ❌ Sends '' instead of undefined
  cin: formData.cin || '', // ❌ Sends '' instead of undefined
};

// ✅ FIX: Send undefined for optional fields
const payload = {
  tradeName: formData.tradeName || undefined,
  cin: formData.cin || undefined,
};
```

---

### Bug 4: Missing Edge Case Handling
**Location:** `UserPreferences.tsx`

```typescript
// ❌ PROBLEM: What if user unchecks all categories?
const onSubmit = async (formData) => {
  await service.updatePreferences(formData);
  // ❌ No validation for categories.length > 0
};

// ✅ FIX: Add client-side check
const onSubmit = async (formData) => {
  if (formData.categories.length === 0) {
    toast({
      title: 'Error',
      description: 'Select at least one category',
      variant: 'destructive',
    });
    return;
  }
  // ...
};
```

---

## 🧪 Test Cases Needed

### Unit Tests
```typescript
describe('useOnboarding', () => {
  it('should prevent concurrent fetchData calls', async () => {
    const { result } = renderHook(() => useOnboarding());
    
    const promise1 = act(() => result.current.fetchData());
    const promise2 = act(() => result.current.fetchData());
    
    await Promise.all([promise1, promise2]);
    
    // Should only make 1 API call
    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });
  
  it('should handle silentRefresh without triggering loading state', async () => {
    const { result } = renderHook(() => useOnboarding());
    
    await act(() => result.current.silentRefresh());
    
    expect(result.current.isLoading).toBe(false);
  });
});

describe('OnboardingService', () => {
  it('should handle 403 errors for role-restricted endpoints', async () => {
    apiClient.put.mockRejectedValueOnce({
      response: { status: 403, data: { message: 'Forbidden' } }
    });
    
    await expect(
      onboardingService.updateCatalog({})
    ).rejects.toThrow('Catalog is only available for SELLER');
  });
});

describe('Step Navigation', () => {
  it('should not reset step after data refresh', async () => {
    const { getByText } = render(<OnboardingPage />);
    
    // User is on step 2
    fireEvent.click(getByText('Next'));
    
    // Simulate data refresh
    await waitFor(() => {
      // Step should still be 2, not reset to 0
      expect(getCurrentStepIndex()).toBe(2);
    });
  });
});
```

### Integration Tests
```typescript
describe('Onboarding Flow - Buyer', () => {
  it('should complete all buyer steps and submit', async () => {
    // 1. Start onboarding
    render(<OnboardingPage />, { userRole: 'BUYER' });
    
    // 2. Fill org KYC
    await fillOrgKYC({ legalName: 'Test Corp', gstin: '...' });
    fireEvent.click(getByText('Next'));
    
    // 3. Fill bank details
    await fillBankDetails({ accountNumber: '123456789' });
    fireEvent.click(getByText('Next'));
    
    // 4. Upload compliance docs
    await uploadDocs(['GST_CERT', 'PAN_CERT']);
    fireEvent.click(getByText('Next'));
    
    // 5. Fill buyer preferences (buyer-specific step)
    await fillBuyerPreferences({ categories: ['HR Coils'] });
    fireEvent.click(getByText('Next'));
    
    // 6. Review and submit
    fireEvent.click(getByText('Submit for Review'));
    
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/user/onboarding/submit',
        expect.any(Object)
      );
    });
  });
});
```

---

## 🔨 Refactoring Recommendations

### 1. Consolidate Type Definitions
**Priority:** HIGH

```bash
# Delete duplicates
rm src/features/buyer/types/onboarding.types.ts
rm src/features/buyer/schemas/buyer-onboarding.schema.ts
rm src/features/buyer/context/onboarding.context.ts
rm src/features/buyer/hooks/useOnboardingData.ts
rm src/features/buyer/services/onboarding.service.ts

# Keep only:
# - src/features/shared/types/onboarding.types.ts
# - src/features/shared/schemas/onboarding.schema.ts
# - src/features/shared/hooks/useOnboarding.ts
# - src/features/shared/services/onboarding.service.ts
```

### 2. Extract Step Configuration
**Priority:** MEDIUM

Create dedicated config file:
```typescript
// src/features/shared/config/onboarding-steps.config.ts
export const STEP_CONFIGS = {
  'org-kyc': {
    component: OrgKYCStep,
    validate: (data) => !!data.orgKyc,
    roles: ['SELLER', 'BUYER', 'LOGISTICS'],
  },
  'buyer-preferences': {
    component: BuyerPreferencesStep,
    validate: (data) => !!data.buyerPreferences,
    roles: ['BUYER'],
  },
  // ...
};
```

### 3. Create API Response Normalizer
**Priority:** LOW

```typescript
// src/features/shared/utils/api-normalizer.ts
export function normalizeOnboardingResponse(raw: any): OnboardingResponse {
  return {
    organizationId: raw.organizationId || raw.orgId,
    orgId: raw.orgId || raw.organizationId,
    legalName: raw.legalName || raw.organizationName,
    // ... handle all backend inconsistencies
  };
}
```

---

## 📊 Summary & Action Items

### Critical (Fix Immediately)
- [ ] Fix BuyerLayout import path
- [ ] Remove duplicate buyer schemas/types
- [ ] Add silentRefresh to shared hook
- [ ] Add mutex lock to prevent concurrent API calls
- [ ] Move OrgKYCStep to shared folder
- [ ] Remove `as any` type coercion

### High Priority
- [ ] Delete duplicate buyer onboarding page
- [ ] Delete buyer-specific service
- [ ] Delete buyer-specific context/hooks
- [ ] Implement fetchGSTIN and fetchPostOfficeDetails
- [ ] Fix step navigation logic to use refs

### Medium Priority
- [ ] Add edge case validation (empty arrays, etc.)
- [ ] Standardize empty string vs undefined handling
- [ ] Add integration tests
- [ ] Create step configuration file

### Low Priority
- [ ] Add API response normalizer
- [ ] Add comprehensive error boundaries
- [ ] Add analytics tracking
- [ ] Add resume-from-draft functionality

---

## 🎯 Next Steps

1. **Run this command to see duplicate code:**
   ```bash
   find src/features/buyer -name "*.ts*" | xargs wc -l
   find src/features/shared -name "*.ts*" | xargs wc -l
   ```

2. **Review each buyer file and determine:**
   - Is this shared logic? → Move to /shared
   - Is this buyer-specific? → Keep in /buyer
   - Is this duplicate? → Delete

3. **Test the flow manually:**
   - Create test account with BUYER role
   - Complete onboarding end-to-end
   - Check network tab for duplicate API calls
   - Verify step navigation doesn't jump around

4. **Add monitoring:**
   ```typescript
   // In useOnboarding hook
   console.log('[Onboarding] fetchData called', { stack: new Error().stack });
   ```

---

**Reviewed by:** Lovable AI  
**Contact:** [User to fill in reviewer contact]
