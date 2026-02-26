# Database Migration Guide - Course Management System

## Issue Summary

The Course Management system is complete, but the Alembic migration needs a small configuration adjustment to handle the async/sync database driver conflict.

## What Needs to Be Fixed

### Current Issue
Alembic is trying to use the async database driver (`asyncpg`) which doesn't work in synchronous migration context.

### Solution
Update the database URL in `.env.development` to use `psycopg2` (sync) for migrations while keeping `asyncpg` for the application.

## Steps to Complete Migration

### 1. Check Your Database URL

Open `backend/.env.development` and check your `DATABASE_URL`:

**Current (async - won't work with Alembic):**
```
DATABASE_URL=postgresql+asyncpg://tuhs_user:[YOUR_DB_PASSWORD]@localhost:5432/tuhs_db
```

**For Migrations (sync - works with Alembic):**
```
DATABASE_URL=postgresql://tuhs_user:[YOUR_DB_PASSWORD]@localhost:5432/tuhs_db
```

### 2. Temporary Fix for Migration

For now, temporarily change the DATABASE_URL to use the sync driver:

```bash
# In backend/.env.development
DATABASE_URL=postgresql://tuhs_user:[YOUR_DB_PASSWORD]@localhost:5432/tuhs_db
```

### 3. Run the Migration

```bash
cd backend

# Generate migration
python -m alembic revision --autogenerate -m "Add enrollments table for course management"

# Review the generated migration file in alembic/versions/

# Apply migration
python -m alembic upgrade head
```

### 4. Restore Async Driver

After migration, restore the async driver for application use:

```bash
# In backend/.env.development
DATABASE_URL=postgresql+asyncpg://tuhs_user:[YOUR_DB_PASSWORD]@localhost:5432/tuhs_db
```

## Alternative: Better Long-term Solution

Create a separate configuration in `alembic.ini` or use an environment variable specifically for migrations:

### Option 1: Update alembic.ini

In `backend/alembic.ini`, you can directly set:

```ini
[alembic]
# ... other settings ...

# Use sync driver for migrations
sqlalchemy.url = postgresql://tuhs_user:[YOUR_DB_PASSWORD]@localhost:5432/tuhs_db
```

### Option 2: Environment Variable Override

Create a `MIGRATION_DATABASE_URL` environment variable:

```bash
# In backend/.env.development
DATABASE_URL=postgresql+asyncpg://tuhs_user:[YOUR_DB_PASSWORD]@localhost:5432/tuhs_db
MIGRATION_DATABASE_URL=postgresql://tuhs_user:[YOUR_DB_PASSWORD]@localhost:5432/tuhs_db
```

Then update `backend/alembic/env.py` line 36:

```python
# Before
config.set_main_option("sqlalchemy.url", settings.database_url)

# After
migration_url = os.getenv("MIGRATION_DATABASE_URL") or settings.database_url.replace("+asyncpg", "")
config.set_main_option("sqlalchemy.url", migration_url)
```

## Expected Migration Output

When you successfully run the migration, you'll see:

```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.autogenerate.compare] Detected added table 'enrollments'
INFO  [alembic.autogenerate.compare] Detected added index 'ix_enrollments_course_id' on '['course_id']'
INFO  [alembic.autogenerate.compare] Detected added index 'ix_enrollments_enrolled_at' on '['enrolled_at']'
INFO  [alembic.autogenerate.compare] Detected added index 'ix_enrollments_id' on '['id']'
INFO  [alembic.autogenerate.compare] Detected added index 'ix_enrollments_is_deleted' on '['is_deleted']'
INFO  [alembic.autogenerate.compare] Detected added index 'ix_enrollments_status' on '['status']'
INFO  [alembic.autogenerate.compare] Detected added index 'ix_enrollments_student_id' on '['student_id']'
  Generating /path/to/backend/alembic/versions/xxxx_add_enrollments_table_for_course_management.py ...  done
```

## Verifying the Migration

After running the migration, verify it worked:

```bash
# Connect to PostgreSQL
psql -U tuhs_user -d tuhs_db

# Check that enrollments table exists
\dt enrollments

# Check table structure
\d enrollments

# Should show all columns including:
# - id (UUID)
# - student_id (UUID with foreign key)
# - course_id (UUID with foreign key)
# - status (VARCHAR)
# - progress_percentage (NUMERIC)
# - completed_lessons (JSONB)
# - etc.
```

## Testing After Migration

Once the migration is complete:

1. **Start the Backend Server:**
```bash
cd backend
python main.py
```

2. **Visit API Docs:**
```
http://localhost:8000/docs
```

3. **Test Course Endpoints:**
   - Try creating a course (POST /api/v1/courses/)
   - List courses (GET /api/v1/courses/)
   - Enroll in a course (POST /api/v1/courses/{id}/enroll)
   - Get enrollments (GET /api/v1/courses/my-enrollments)

## What Was Already Fixed

✅ Fixed `metadata` reserved word issue in payment.py (renamed to `transaction_metadata`)
✅ Fixed model import names (Payment → Transaction, WalletTransaction → PaymentMethod)
✅ Updated foreign key reference in enrollment.py (payments → transactions)
✅ Updated alembic/env.py imports to match new model names
✅ Added Enrollment model to imports

## Files Modified

- `backend/app/models/payment.py` - Renamed metadata column
- `backend/app/models/enrollment.py` - Fixed foreign key reference
- `backend/app/models/__init__.py` - Updated imports
- `backend/alembic/env.py` - Updated model imports

---

**Next Step:** Choose one of the solutions above to fix the database URL issue, then run the migration!
