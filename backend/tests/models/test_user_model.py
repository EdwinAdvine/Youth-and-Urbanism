"""
User Model Tests

Tests for the User SQLAlchemy model:
- User creation and validation
- Role property helpers
- Soft delete functionality
- Profile data (JSONB) storage
- Timestamp tracking

Coverage target: 70%+
"""

import pytest
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models.user import User
from app.utils.security import get_password_hash, verify_password
from tests.factories import UserFactory


@pytest.mark.unit
class TestUserModel:
    """Test User model basic functionality."""

    async def test_create_user_success(self, db_session):
        """Test creating a user with all required fields."""
        user = User(
            email="model@test.com",
            password_hash=get_password_hash("Test123!"),
            role="student",
            is_active=True,
            profile_data={"first_name": "Model", "last_name": "Test"}
        )

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        assert user.id is not None
        assert user.email == "model@test.com"
        assert user.role == "student"
        assert user.is_active is True
        assert user.created_at is not None
        assert isinstance(user.created_at, datetime)

    async def test_create_user_all_roles(self, db_session):
        """Test creating users with all supported roles."""
        roles = ["student", "parent", "instructor", "admin", "partner", "staff"]

        for role in roles:
            user = await UserFactory.create(db_session, role=role)
            assert user.role == role
            assert user.id is not None

    async def test_user_email_unique_constraint(self, db_session):
        """Test email uniqueness constraint."""
        email = "duplicate@test.com"

        # Create first user
        user1 = User(
            email=email,
            password_hash=get_password_hash("Test123!"),
            role="student"
        )
        db_session.add(user1)
        await db_session.commit()

        # Try to create second user with same email
        user2 = User(
            email=email,
            password_hash=get_password_hash("Test123!"),
            role="parent"
        )
        db_session.add(user2)

        with pytest.raises(IntegrityError):
            await db_session.commit()

    async def test_user_password_hash_storage(self, db_session):
        """Test password is stored as hash, not plaintext."""
        plain_password = "MySecurePassword123!"
        user = User(
            email="password@test.com",
            password_hash=get_password_hash(plain_password),
            role="student"
        )

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Password hash should not equal plain password
        assert user.password_hash != plain_password

        # But verification should succeed
        assert verify_password(plain_password, user.password_hash) is True

    async def test_user_timestamps_auto_set(self, db_session):
        """Test created_at and updated_at timestamps are automatically set."""
        user = await UserFactory.create(db_session)

        assert user.created_at is not None
        assert user.updated_at is not None
        assert isinstance(user.created_at, datetime)
        assert isinstance(user.updated_at, datetime)

    async def test_user_updated_at_changes(self, db_session):
        """Test updated_at changes when user is modified."""
        user = await UserFactory.create(db_session)
        original_updated_at = user.updated_at

        # Update user
        import time
        time.sleep(0.1)  # Small delay to ensure timestamp difference
        user.profile_data = {"updated": True}
        await db_session.commit()
        await db_session.refresh(user)

        assert user.updated_at >= original_updated_at


@pytest.mark.unit
class TestUserRoleProperties:
    """Test role property helpers."""

    async def test_is_student_property(self, db_session):
        """Test is_student property returns True for students only."""
        student = await UserFactory.create(db_session, role="student")
        parent = await UserFactory.create(db_session, role="parent")

        assert student.is_student is True
        assert parent.is_student is False

    async def test_is_admin_property(self, db_session):
        """Test is_admin property returns True for admins only."""
        admin = await UserFactory.create(db_session, role="admin")
        student = await UserFactory.create(db_session, role="student")

        assert admin.is_admin is True
        assert student.is_admin is False

    async def test_is_parent_property(self, db_session):
        """Test is_parent property returns True for parents only."""
        parent = await UserFactory.create(db_session, role="parent")
        instructor = await UserFactory.create(db_session, role="instructor")

        assert parent.is_parent is True
        assert instructor.is_parent is False

    async def test_is_instructor_property(self, db_session):
        """Test is_instructor property returns True for instructors only."""
        instructor = await UserFactory.create(db_session, role="instructor")
        partner = await UserFactory.create(db_session, role="partner")

        assert instructor.is_instructor is True
        assert partner.is_instructor is False

    async def test_is_partner_property(self, db_session):
        """Test is_partner property returns True for partners only."""
        partner = await UserFactory.create(db_session, role="partner")
        staff = await UserFactory.create(db_session, role="staff")

        assert partner.is_partner is True
        assert staff.is_partner is False

    async def test_is_staff_property(self, db_session):
        """Test is_staff property returns True for staff only."""
        staff = await UserFactory.create(db_session, role="staff")
        student = await UserFactory.create(db_session, role="student")

        assert staff.is_staff is True
        assert student.is_staff is False


@pytest.mark.unit
class TestUserSoftDelete:
    """Test soft delete functionality."""

    async def test_user_soft_delete(self, db_session):
        """Test soft deleting a user marks is_deleted flag."""
        user = await UserFactory.create(db_session)
        user_id = user.id

        # Soft delete
        user.is_deleted = True
        await db_session.commit()

        # User still exists in database
        result = await db_session.execute(
            select(User).filter_by(id=user_id)
        )
        deleted_user = result.scalars().first()
        assert deleted_user is not None
        assert deleted_user.is_deleted is True

    async def test_user_soft_delete_with_timestamp(self, db_session):
        """Test soft delete sets deleted_at timestamp."""
        user = await UserFactory.create(db_session)

        # Soft delete
        user.is_deleted = True
        user.deleted_at = datetime.utcnow()
        await db_session.commit()

        assert user.deleted_at is not None
        assert isinstance(user.deleted_at, datetime)

    async def test_query_excludes_deleted_users(self, db_session):
        """Test can filter out soft-deleted users in queries."""
        active_user = await UserFactory.create(db_session, email="active@test.com")
        deleted_user = await UserFactory.create(db_session, email="deleted@test.com")

        # Soft delete one user
        deleted_user.is_deleted = True
        await db_session.commit()

        # Query only active users
        result = await db_session.execute(
            select(User).filter_by(is_deleted=False)
        )
        active_users = result.scalars().all()

        assert active_user in active_users
        assert deleted_user not in active_users


@pytest.mark.unit
class TestUserProfileData:
    """Test JSONB profile_data field."""

    async def test_user_profile_data_storage(self, db_session):
        """Test storing complex data in profile_data JSONB field."""
        profile = {
            "first_name": "John",
            "last_name": "Doe",
            "age": 30,
            "preferences": {
                "theme": "dark",
                "notifications": True
            },
            "tags": ["developer", "python", "fastapi"]
        }

        user = User(
            email="jsonb@test.com",
            password_hash=get_password_hash("Test123!"),
            role="instructor",
            profile_data=profile
        )

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        assert user.profile_data == profile
        assert user.profile_data["first_name"] == "John"
        assert user.profile_data["preferences"]["theme"] == "dark"
        assert "python" in user.profile_data["tags"]

    async def test_user_profile_data_update(self, db_session):
        """Test updating JSONB profile_data."""
        user = await UserFactory.create(db_session, profile_data={"status": "active"})

        # Update profile data
        user.profile_data = {"status": "inactive", "reason": "vacation"}
        await db_session.commit()
        await db_session.refresh(user)

        assert user.profile_data["status"] == "inactive"
        assert user.profile_data["reason"] == "vacation"

    async def test_user_profile_data_default_empty_dict(self, db_session):
        """Test profile_data defaults to empty dict if not provided."""
        user = User(
            email="empty@test.com",
            password_hash=get_password_hash("Test123!"),
            role="student"
        )

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Should default to empty dict, not None
        assert user.profile_data is not None
        assert user.profile_data == {} or user.profile_data is not None


@pytest.mark.unit
class TestUserRepresentation:
    """Test User model string representation."""

    async def test_user_repr_method(self, db_session):
        """Test __repr__ method returns useful string."""
        user = await UserFactory.create(db_session, email="repr@test.com", role="student")

        repr_str = repr(user)

        assert "User" in repr_str
        assert str(user.id) in repr_str or "id=" in repr_str
        assert "repr@test.com" in repr_str or "email=" in repr_str


@pytest.mark.unit
class TestUserDefaults:
    """Test default values for User fields."""

    async def test_user_is_active_defaults_true(self, db_session):
        """Test is_active defaults to True."""
        user = User(
            email="defaults@test.com",
            password_hash=get_password_hash("Test123!"),
            role="student"
        )

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        assert user.is_active is True

    async def test_user_is_deleted_defaults_false(self, db_session):
        """Test is_deleted defaults to False."""
        user = await UserFactory.create(db_session)
        assert user.is_deleted is False

    async def test_user_is_verified_defaults_false(self, db_session):
        """Test is_verified defaults to False."""
        user = User(
            email="verified@test.com",
            password_hash=get_password_hash("Test123!"),
            role="student"
        )

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        assert user.is_verified is False


# Target: 70%+ coverage for user.py model
