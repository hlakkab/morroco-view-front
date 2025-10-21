#!/bin/bash

# Test script for Morocco View lazy loading implementation
# Run this after implementation to verify everything works

echo "🚀 Morocco View - Lazy Loading Test Script"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check files exist
echo "📋 Step 1: Checking files..."
files=(
    "src/navigation/navigationConfig.ts"
    "src/navigation/LazyScreen.tsx"
    "src/navigation/usePrefetchScreens.ts"
    "src/navigation/AppNavigator.tsx"
    "src/screens/HomeScreen.tsx"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file exists"
    else
        echo -e "  ${RED}✗${NC} $file missing"
        all_exist=false
    fi
done

if [ "$all_exist" = false ]; then
    echo -e "\n${RED}ERROR: Some files are missing!${NC}"
    exit 1
fi

echo -e "\n${GREEN}✓ All files present${NC}\n"

# Step 2: Check TypeScript compilation
echo "📋 Step 2: Checking TypeScript..."
if npx tsc --noEmit 2>/dev/null; then
    echo -e "${GREEN}✓ TypeScript compilation successful${NC}\n"
else
    echo -e "${YELLOW}⚠ TypeScript errors detected (check output above)${NC}\n"
fi

# Step 3: Check for key imports
echo "📋 Step 3: Verifying key imports..."

# Check AppNavigator imports lazyScreen
if grep -q "import { lazyScreen } from './LazyScreen';" src/navigation/AppNavigator.tsx; then
    echo -e "  ${GREEN}✓${NC} AppNavigator imports lazyScreen"
else
    echo -e "  ${RED}✗${NC} AppNavigator missing lazyScreen import"
fi

# Check HomeScreen imports usePrefetchScreens
if grep -q "import { usePrefetchScreens } from '../navigation/usePrefetchScreens';" src/screens/HomeScreen.tsx; then
    echo -e "  ${GREEN}✓${NC} HomeScreen imports usePrefetchScreens"
else
    echo -e "  ${RED}✗${NC} HomeScreen missing usePrefetchScreens import"
fi

# Check HomeScreen calls the hook
if grep -q "usePrefetchScreens();" src/screens/HomeScreen.tsx; then
    echo -e "  ${GREEN}✓${NC} HomeScreen calls usePrefetchScreens()"
else
    echo -e "  ${RED}✗${NC} HomeScreen missing usePrefetchScreens() call"
fi

echo ""

# Step 4: Count lazy-loaded screens
echo "📋 Step 4: Analyzing screen distribution..."
eager_count=$(grep -c "^import.*Screen from" src/navigation/AppNavigator.tsx)
lazy_count=$(grep -c "^const.*= lazyScreen" src/navigation/AppNavigator.tsx)
total=$((eager_count + lazy_count))

echo "  Eager-loaded screens: $eager_count"
echo "  Lazy-loaded screens: $lazy_count"
echo "  Total screens: $total"

if [ $eager_count -eq 5 ]; then
    echo -e "  ${GREEN}✓${NC} Correct number of eager screens (5)"
else
    echo -e "  ${YELLOW}⚠${NC} Expected 5 eager screens, found $eager_count"
fi

if [ $lazy_count -ge 30 ]; then
    echo -e "  ${GREEN}✓${NC} Good number of lazy screens ($lazy_count)"
else
    echo -e "  ${YELLOW}⚠${NC} Expected ~35 lazy screens, found $lazy_count"
fi

echo ""

# Step 5: Build instructions
echo "📋 Step 5: Ready to test!"
echo -e "${GREEN}✓ Implementation verification complete!${NC}\n"

echo "Next steps:"
echo "==========="
echo ""
echo "1. Clean build:"
echo "   cd android && ./gradlew clean && cd .."
echo ""
echo "2. Clear Metro cache and start:"
echo "   npx react-native start --reset-cache"
echo ""
echo "3. In a new terminal, run the app:"
echo "   npx react-native run-android"
echo ""
echo "4. Watch for console output:"
echo "   - '📊 Navigation Config Stats' on app start"
echo "   - '🚀 Starting screen prefetch strategy...' after HomeScreen loads"
echo "   - '📦 Prefetching Tier 1...' after 2s"
echo "   - '📦 Prefetching Tier 2...' after 5s"
echo "   - '📦 Prefetching Tier 3...' after 8s"
echo ""
echo "5. Test navigation:"
echo "   - Bottom nav should be instant after 2s"
echo "   - Explore cards fast after 5s"
echo "   - Services fast after 8s"
echo "   - Detail screens show brief loading"
echo ""
echo -e "${GREEN}Happy testing! 🚀${NC}"

