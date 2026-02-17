# Service File Migration Guide

## Problem
78+ service files use `localStorage.getItem('access_token')` which is never set after migrating to cookie-based authentication. This causes all API calls to fail with 401 Unauthorized.

## Solution
Migrate all service files to use the shared `apiClient` from `services/api.ts`, which handles cookie-based authentication automatically via `withCredentials: true`.

## Migration Status

**Completed:** 2 files
- ✅ `services/student/studentDashboardService.ts`
- ✅ `services/courseService.ts`

**Remaining:** 26 files
```
./student/studentSupportService.ts
./student/studentCommunityService.ts
./student/studentAccountService.ts
./student/studentProgressService.ts
./student/studentWalletService.ts
./student/studentLearningService.ts
./admin/adminSystemHealthService.ts
./staff/staffDashboardService.ts
./staff/staffKnowledgeBaseService.ts
./staff/staffSessionService.ts
./staff/staffContentService.ts
./staff/staffTeamService.ts
./staff/staffModerationService.ts
./staff/staffReportService.ts
./staff/staffInsightsService.ts
./staff/staffSupportService.ts
./staff/staffAccountService.ts
./staff/staffAssessmentService.ts
./staff/staffNotificationService.ts
./instructor/instructorAssessmentService.ts
./instructor/instructorEarningsService.ts
./instructor/instructorMessageService.ts
./instructor/instructorSessionService.ts
./instructor/instructorDashboardService.ts
./instructor/instructorAccountService.ts
./instructor/instructorCourseService.ts
```

## Migration Pattern

### Before (Broken):
```typescript
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1/student/dashboard';

export const getData = async () => {
  const token = localStorage.getItem('access_token');  // ❌ Never set!
  const response = await axios.get(`${API_BASE}${API_PREFIX}/data`, {
    headers: {
      Authorization: `Bearer ${token}`  // ❌ Always undefined
    }
  });
  return response.data;
};
```

### After (Fixed):
```typescript
import apiClient from '../api';  // Relative path to services/api.ts

const API_PREFIX = '/api/v1/student/dashboard';

export const getData = async () => {
  const response = await apiClient.get(`${API_PREFIX}/data`);
  return response.data;
};
```

## Step-by-Step Migration

For each file:

1. **Replace import**:
   ```typescript
   // Change:
   import axios from 'axios';
   // To:
   import apiClient from '../api';  // or './api' if in services/ root
   ```

2. **Remove constants**:
   ```typescript
   // Delete these lines:
   const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
   ```

3. **Remove token retrieval**:
   ```typescript
   // Delete these lines:
   const token = localStorage.getItem('access_token');
   ```

4. **Replace axios calls**:
   ```typescript
   // Change:
   axios.get(`${API_BASE}${API_PREFIX}/path`, { headers: { Authorization: `Bearer ${token}` } })
   // To:
   apiClient.get(`${API_PREFIX}/path`)
   
   // Change:
   axios.post(`${API_BASE}${API_PREFIX}/path`, data, { headers: { Authorization: `Bearer ${token}` } })
   // To:
   apiClient.post(`${API_PREFIX}/path`, data)
   ```

5. **Remove API_BASE from URLs**:
   ```typescript
   // Change:
   `${API_BASE}${API_PREFIX}/endpoint`
   // To:
   `${API_PREFIX}/endpoint`
   ```

## Special Case: Custom Axios Instance

For files like `courseService.ts` that create their own axios instance:

### Before:
```typescript
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_V1_PREFIX}`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### After:
```typescript
import apiClient from './api';  // Use shared client
```

Remove the entire custom axios instance setup and use the shared client.

## Verification

After migrating each file:

```bash
# Check for TypeScript errors
cd frontend
npx tsc --noEmit

# Check for linting issues
npm run lint

# Verify no files still use access_token
grep -r "localStorage.getItem('access_token')" src/services/
# Should return 0 results
```

## Testing

After migration:
1. Start backend: `cd backend && python main.py`
2. Start frontend: `cd frontend && npm run dev`
3. Login as each role (student, instructor, admin, staff)
4. Verify dashboard loads without 401 errors
5. Check browser DevTools Network tab - all API calls should succeed

## Why This Fixes The Issue

The shared `apiClient` (in `services/api.ts`):
- Uses `withCredentials: true` to send httpOnly cookies automatically
- Has interceptors that handle 401 errors with automatic token refresh
- Manages authentication state consistently across all service files

The old pattern failed because:
- `localStorage.getItem('access_token')` reads a key that's never written
- After migrating to cookie-based auth, tokens are in httpOnly cookies (JavaScript can't read them)
- Each file creating its own axios instance bypassed the shared authentication logic
