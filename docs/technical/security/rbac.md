# Role-Based Access Control (RBAC)

> **Source files**: `backend/app/utils/security.py`, `backend/app/models/user.py`
> **Last updated**: 2026-02-15

## Overview

Urban Home School implements a role-based access control system with six distinct roles, each with specific permissions and access to dedicated dashboard interfaces. The system uses JWT claims for role identification and a `@require_role()` decorator for endpoint protection.

---

## Roles

| Role | Description | Dashboard |
|---|---|---|
| `student` | Enrolled learners using the AI tutoring platform | `DashboardStudent.tsx` |
| `parent` | Parents/guardians managing children's education | `DashboardParent.tsx` |
| `instructor` | External educators and content creators | `DashboardInstructor.tsx` |
| `admin` | Platform administrators with full system access | `DashboardAdmin.tsx` |
| `partner` | External partners and organizations | `DashboardPartner.tsx` |
| `staff` | Internal staff members (support, content review) | `DashboardStaff.tsx` |

---

## Permission Matrix

| Endpoint Group | student | parent | instructor | admin | partner | staff |
|---|---|---|---|---|---|---|
| **Authentication** | | | | | | |
| POST /auth/register | Yes | Yes | Yes | Yes | Yes | Yes |
| POST /auth/login | Yes | Yes | Yes | Yes | Yes | Yes |
| GET /auth/me | Yes | Yes | Yes | Yes | Yes | Yes |
| **Student Features** | | | | | | |
| AI Tutor Chat | Yes | -- | -- | Yes | -- | -- |
| View own courses | Yes | -- | -- | Yes | -- | -- |
| Submit assignments | Yes | -- | -- | Yes | -- | -- |
| Take quizzes | Yes | -- | -- | Yes | -- | -- |
| **Parent Features** | | | | | | |
| View children's progress | -- | Yes | -- | Yes | -- | -- |
| Manage subscriptions | -- | Yes | -- | Yes | -- | -- |
| M-Pesa payments | -- | Yes | -- | Yes | -- | -- |
| Consent management | -- | Yes | -- | Yes | -- | -- |
| **Instructor Features** | | | | | | |
| Create/edit courses | -- | -- | Yes | Yes | -- | -- |
| View enrollments | -- | -- | Yes | Yes | -- | -- |
| Grade assignments | -- | -- | Yes | Yes | -- | -- |
| Revenue dashboard | -- | -- | Yes | Yes | -- | -- |
| Live sessions (WebRTC) | -- | -- | Yes | Yes | -- | Yes |
| **Admin Features** | | | | | | |
| User management | -- | -- | -- | Yes | -- | -- |
| System configuration | -- | -- | -- | Yes | -- | -- |
| AI provider management | -- | -- | -- | Yes | -- | -- |
| Financial reports | -- | -- | -- | Yes | -- | -- |
| Content moderation | -- | -- | -- | Yes | -- | Yes |
| All WebSocket events | -- | -- | -- | Yes | -- | -- |
| **Partner Features** | | | | | | |
| Content submission | -- | -- | -- | Yes | Yes | -- |
| API access | -- | -- | -- | Yes | Yes | -- |
| Revenue reports | -- | -- | -- | Yes | Yes | -- |
| **Staff Features** | | | | | | |
| Support tickets | -- | -- | -- | Yes | -- | Yes |
| Content review | -- | -- | -- | Yes | -- | Yes |
| Collaborative editing | -- | -- | -- | Yes | -- | Yes |
| Live support chat | -- | -- | -- | Yes | -- | Yes |
| **Payments** | | | | | | |
| Initiate payments | Yes | Yes | -- | Yes | -- | -- |
| View transactions | Yes | Yes | Yes | Yes | Yes | Yes |
| Process refunds | -- | -- | -- | Yes | -- | Yes |

---

## `@require_role()` Decorator

### Usage

```python
from app.utils.security import require_role, get_current_user

@router.get("/admin/users")
@require_role(["admin", "staff"])
async def get_all_users(current_user: User = Depends(get_current_user)):
    return {"users": [...]}
```

### Implementation

```python
def require_role(allowed_roles: List[str]) -> Callable:
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')

            if not current_user:
                raise HTTPException(
                    status_code=401,
                    detail="Authentication required"
                )

            user_role = getattr(current_user, 'role', None) or \
                        current_user.get('role') if isinstance(current_user, dict) \
                        else current_user.role

            if user_role not in allowed_roles:
                raise HTTPException(
                    status_code=403,
                    detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
                )

            return await func(*args, **kwargs)
        return wrapper
    return decorator
```

### Behavior

- Extracts the `current_user` from keyword arguments (injected by FastAPI dependency)
- Supports both ORM User objects and dictionaries
- Returns HTTP 401 if no user is found
- Returns HTTP 403 if the user's role is not in the allowed list

---

## JWT Claims

### Access Token Structure

```json
{
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "role": "student",
    "email": "student@example.com",
    "is_active": true,
    "exp": 1708012200,
    "iat": 1708010400,
    "type": "access"
}
```

### Key Claims

| Claim | Purpose |
|---|---|
| `sub` | User UUID -- primary identifier |
| `role` | User role for RBAC decisions |
| `exp` | Token expiration (Unix timestamp) |
| `iat` | Token issuance time (Unix timestamp) |
| `type` | Distinguishes access from refresh tokens |

---

## `check_permissions()` Function

A utility function for fine-grained permission checks that combines role-based and ownership-based access:

```python
def check_permissions(
    user_role: str,
    required_roles: List[str],
    resource_owner_id: Optional[str] = None,
    user_id: Optional[str] = None
) -> bool:
```

### Decision Logic

1. **Role check**: If `user_role` is in `required_roles`, grant access
2. **Ownership check**: If `resource_owner_id == user_id`, grant access
3. **Admin override**: If `user_role == "admin"`, always grant access
4. Otherwise, deny access

### Example

```python
has_permission = check_permissions(
    user_role="parent",
    required_roles=["parent", "admin"],
    resource_owner_id=student.parent_id,
    user_id=str(current_user.id)
)
```

---

## Protected Route Middleware (Frontend)

### ProtectedRoute Component

```typescript
// frontend/src/components/ProtectedRoute.tsx
const ProtectedRoute: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
    const { user, token } = useUserStore();

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" />;
    }

    return <Outlet />;
};
```

### Route Protection in App.tsx

```typescript
<Route element={<ProtectedRoute allowedRoles={['admin']} />}>
    <Route path="/dashboard/admin" element={<DashboardAdmin />} />
</Route>

<Route element={<ProtectedRoute allowedRoles={['student']} />}>
    <Route path="/dashboard/student" element={<DashboardStudent />} />
</Route>
```

---

## User Model Role Properties

The `User` model provides convenience properties for role checking:

```python
class User(Base):
    @property
    def is_student(self) -> bool:
        return self.role == 'student'

    @property
    def is_admin(self) -> bool:
        return self.role == 'admin'

    @property
    def is_parent(self) -> bool:
        return self.role == 'parent'

    @property
    def is_instructor(self) -> bool:
        return self.role == 'instructor'

    @property
    def is_partner(self) -> bool:
        return self.role == 'partner'

    @property
    def is_staff(self) -> bool:
        return self.role == 'staff'
```

---

## Role-Specific Sidebar Components

Each role has a dedicated sidebar component:

| Role | Sidebar Component |
|---|---|
| Student | Default sidebar |
| Parent | `components/parent/ParentSidebar.tsx` |
| Instructor | `components/instructor/InstructorSidebar.tsx` |
| Admin | Default sidebar |
| Partner | `components/partner/PartnerSidebar.tsx` |
| Staff | Default sidebar |
