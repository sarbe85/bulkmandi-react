# Onboarding Refactoring Plan

## Current Issues Identified

### 1. Dark Mode
- **Stepper Component**: Uses hardcoded colors instead of semantic tokens
  - `bg-green-500`, `bg-blue-500`, `bg-gray-300` don't adapt to dark mode
  - Text colors are hardcoded
  - **Fix**: Use semantic tokens like `bg-success`, `bg-primary`, `bg-muted`

### 2. Routing Structure
- **Current**: `/seller/*` and `/buyer/*` paths are role-specific
- **Issue**: Not scalable for additional roles (3PL, Admin, etc.)
- **Recommendation**: 
  - Generic routes: `/user/dashboard`, `/user/onboarding`
  - Role-specific content rendered within same routes
  - Keep admin routes separate (`/admin/*`) as they need different layouts

### 3. Dashboard Components
- **Current**: Separate `SellerDashboard` and `BuyerDashboard` 
- **Analysis**: Both dashboards likely show different data/widgets
- **Recommendation**: 
  - Create generic `UserDashboard` component
  - Use composition pattern with role-specific widgets
  - Keep single source of truth, render conditionally based on role

### 4. Folder Structure

#### Current Structure Issues:
```
src/features/
├── admin/          # ✅ Good - separate feature
├── auth/           # ✅ Good - separate feature
├── buyer/          # ❌ Role-specific
│   └── pages/
├── seller/         # ❌ Role-specific
│   └── pages/
├── common/         # ⚠️ Unclear purpose vs shared
└── shared/         # ⚠️ Unclear purpose vs common
```

#### Recommended Structure:
```
src/features/
├── admin/                    # Admin-specific features
│   ├── components/
│   ├── pages/
│   └── services/
├── auth/                     # Authentication
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   └── store/
├── onboarding/              # 🆕 Consolidated onboarding
│   ├── components/
│   │   ├── steps/          # All step components
│   │   └── Stepper.tsx
│   ├── config/
│   │   └── steps.config.ts
│   ├── hooks/
│   │   └── useOnboarding.ts
│   ├── pages/
│   │   └── OnboardingPage.tsx
│   ├── schemas/
│   ├── services/
│   ├── store/
│   └── types/
├── dashboard/               # 🆕 Consolidated dashboard
│   ├── components/
│   │   ├── widgets/        # Role-specific widgets
│   │   │   ├── BuyerWidgets.tsx
│   │   │   └── SellerWidgets.tsx
│   │   └── UserDashboard.tsx
│   └── pages/
└── shared/                  # Truly shared components
    ├── components/
    │   ├── layout/
    │   └── ui/
    └── hooks/
```

### 5. Context and Hooks

#### Current Issues:
- `useOnboarding` hook is well-designed ✅
- `ThemeContext` is properly implemented ✅
- `useAuth` wraps store correctly ✅
- OnboardingStore uses Zustand with persistence ✅

#### Recommendations:
- **Keep current hook/store pattern** - it's clean and maintainable
- Add `useUserRole` convenience hook for role checks
- Consider adding `useRoleBasedNavigation` for dynamic routing

## Implementation Plan

### Phase 1: Fix Dark Mode (Immediate)
1. Update `Stepper.tsx` to use semantic tokens
2. Update `OnboardingPage.tsx` background colors
3. Test all onboarding steps in dark mode

### Phase 2: Refactor Routing
1. Update `App.tsx` routes:
   - `/user/dashboard` → `UserDashboard` (role-aware)
   - `/user/onboarding` → `OnboardingPage` (role-aware)
   - Keep `/admin/*` separate
2. Add redirect from old routes to new ones (with deprecation notice)
3. Update navigation links across the app

### Phase 3: Consolidate Dashboards
1. Create `features/dashboard/components/UserDashboard.tsx`
2. Extract buyer-specific widgets to `BuyerWidgets.tsx`
3. Extract seller-specific widgets to `SellerWidgets.tsx`
4. Implement composition pattern in `UserDashboard`

### Phase 4: Folder Restructure
1. Move `features/shared/components/onboarding/*` → `features/onboarding/components/`
2. Move `features/shared/hooks/useOnboarding.ts` → `features/onboarding/hooks/`
3. Move dashboard files to new structure
4. Update all imports
5. Delete empty `buyer/` and `seller/` directories

### Phase 5: Polish
1. Add JSDoc comments to hooks
2. Update README with new structure
3. Add migration guide for developers

## Risk Assessment

### Low Risk ✅
- Dark mode fixes (isolated changes)
- Hook improvements (backward compatible)

### Medium Risk ⚠️
- Routing changes (requires testing all flows)
- Dashboard consolidation (needs role testing)

### High Risk ⚠️
- Folder restructure (many file moves, import updates)
- Should be done carefully with git tracking

## Testing Checklist

- [ ] Stepper displays correctly in light/dark mode
- [ ] Seller can complete onboarding via `/user/onboarding`
- [ ] Buyer can complete onboarding via `/user/onboarding`
- [ ] Seller dashboard shows correct widgets
- [ ] Buyer dashboard shows correct widgets
- [ ] Dark mode toggle works on all pages
- [ ] All navigation links work correctly
- [ ] Old routes redirect properly
- [ ] Mobile responsive on all pages

## Breaking Changes

None if done carefully - old routes can redirect to new ones temporarily.

## Timeline Estimate

- Phase 1 (Dark Mode): 30 minutes
- Phase 2 (Routing): 1 hour
- Phase 3 (Dashboards): 2 hours
- Phase 4 (Restructure): 3 hours
- Phase 5 (Polish): 1 hour

**Total**: ~7.5 hours

## Next Steps

1. Get approval on refactoring approach
2. Start with Phase 1 (dark mode) as quick win
3. Proceed through phases sequentially
4. Test thoroughly after each phase
