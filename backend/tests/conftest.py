"""
Pytest Configuration and Fixtures

This module provides shared test fixtures and configuration for all tests.
It includes:
- Test database setup (async SQLite in-memory via aiosqlite for speed)
- httpx AsyncClient configuration
- Authentication fixtures (mock users, tokens)
- Mock external service fixtures (AI providers, payment gateways)
"""

import pytest
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import UUID as pgUUID, JSONB as pgJSONB
from sqlalchemy.dialects.postgresql import ARRAY as pgARRAY

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.utils.security import create_access_token, create_refresh_token, get_password_hash


# ── SQLite compatibility: compile PostgreSQL-specific types ──

@compiles(pgUUID, "sqlite")
def compile_uuid_sqlite(type_, compiler, **kw):
    return "VARCHAR(36)"

@compiles(pgJSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

# ARRAY: add visit_ARRAY method to SQLite type compiler
from sqlalchemy.dialects.sqlite.base import SQLiteTypeCompiler

def _visit_array(self, type_, **kw):
    return "JSON"

SQLiteTypeCompiler.visit_ARRAY = _visit_array


# Test database URL (async SQLite in-memory)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create async test engine with in-memory SQLite
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,  # StaticPool ensures a single connection for in-memory DB
)

# Create async test session factory
TestingSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a fresh async database session for each test.

    This fixture:
    - Creates all tables before the test
    - Provides a clean async database session
    - Drops all tables after the test

    Yields:
        AsyncSession: SQLAlchemy async database session
    """
    # Create all tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Create and yield session
    async with TestingSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

    # Drop all tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create httpx AsyncClient with test database.

    This fixture overrides the database dependency to use the test database
    session instead of the production database.

    Args:
        db_session: Test async database session

    Yields:
        AsyncClient: httpx async test client
    """
    async def override_get_db():
        yield db_session

    # Override database dependency
    app.dependency_overrides[get_db] = override_get_db

    # Create async test client (no lifespan — we manage the DB ourselves)
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    # Clear overrides
    app.dependency_overrides.clear()


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """
    Create a test user with student role.

    Args:
        db_session: Async database session

    Returns:
        User: Created test user
    """
    user = User(
        email="test@example.com",
        password_hash=get_password_hash("Test123!@#"),
        role="student",
        is_active=True,
        is_verified=True,
        profile_data={
            "first_name": "Test",
            "last_name": "User",
            "grade_level": 5
        }
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_admin(db_session: AsyncSession) -> User:
    """
    Create a test user with admin role.

    Args:
        db_session: Async database session

    Returns:
        User: Created admin user
    """
    admin = User(
        email="admin@example.com",
        password_hash=get_password_hash("Admin123!@#"),
        role="admin",
        is_active=True,
        is_verified=True,
        profile_data={
            "first_name": "Admin",
            "last_name": "User"
        }
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


@pytest.fixture
async def test_instructor(db_session: AsyncSession) -> User:
    """
    Create a test user with instructor role.

    Args:
        db_session: Async database session

    Returns:
        User: Created instructor user
    """
    instructor = User(
        email="instructor@example.com",
        password_hash=get_password_hash("Instructor123!@#"),
        role="instructor",
        is_active=True,
        is_verified=True,
        profile_data={
            "first_name": "John",
            "last_name": "Instructor",
            "expertise": ["Mathematics", "Physics"]
        }
    )
    db_session.add(instructor)
    await db_session.commit()
    await db_session.refresh(instructor)
    return instructor


@pytest.fixture
async def test_parent(db_session: AsyncSession) -> User:
    """
    Create a test user with parent role.

    Args:
        db_session: Async database session

    Returns:
        User: Created parent user
    """
    parent = User(
        email="parent@example.com",
        password_hash=get_password_hash("Parent123!@#"),
        role="parent",
        is_active=True,
        is_verified=True,
        profile_data={
            "first_name": "Jane",
            "last_name": "Parent",
            "phone": "+254712345678"
        }
    )
    db_session.add(parent)
    await db_session.commit()
    await db_session.refresh(parent)
    return parent


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """
    Generate JWT authorization headers for test user.

    Args:
        test_user: Test user

    Returns:
        dict: Authorization headers with Bearer token
    """
    access_token = create_access_token(data={"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def admin_headers(test_admin: User) -> dict:
    """
    Generate JWT authorization headers for admin user.

    Args:
        test_admin: Test admin user

    Returns:
        dict: Authorization headers with Bearer token
    """
    access_token = create_access_token(data={"sub": str(test_admin.id)})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def instructor_headers(test_instructor: User) -> dict:
    """
    Generate JWT authorization headers for instructor user.

    Args:
        test_instructor: Test instructor user

    Returns:
        dict: Authorization headers with Bearer token
    """
    access_token = create_access_token(data={"sub": str(test_instructor.id)})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def parent_headers(test_parent: User) -> dict:
    """
    Generate JWT authorization headers for parent user.

    Args:
        test_parent: Test parent user

    Returns:
        dict: Authorization headers with Bearer token
    """
    access_token = create_access_token(data={"sub": str(test_parent.id)})
    return {"Authorization": f"Bearer {access_token}"}


# Mock AI Provider Responses
@pytest.fixture
def mock_gemini_response():
    """Mock Gemini AI API response."""
    return {
        "response": "This is a mock AI response from Gemini for testing purposes.",
        "model": "gemini-pro",
        "usage": {
            "input_tokens": 10,
            "output_tokens": 25,
            "total_tokens": 35
        }
    }


@pytest.fixture
def mock_claude_response():
    """Mock Claude AI API response."""
    return {
        "response": "This is a mock AI response from Claude for testing purposes.",
        "model": "claude-3.5-sonnet",
        "usage": {
            "input_tokens": 12,
            "output_tokens": 28,
            "total_tokens": 40
        }
    }


# Mock Payment Gateway Responses
@pytest.fixture
def mock_mpesa_response():
    """Mock M-Pesa STK Push response."""
    return {
        "MerchantRequestID": "29115-34620561-1",
        "CheckoutRequestID": "ws_CO_191220191020363925",
        "ResponseCode": "0",
        "ResponseDescription": "Success. Request accepted for processing",
        "CustomerMessage": "Success. Request accepted for processing"
    }


@pytest.fixture
def mock_mpesa_callback():
    """Mock M-Pesa callback data."""
    return {
        "Body": {
            "stkCallback": {
                "MerchantRequestID": "29115-34620561-1",
                "CheckoutRequestID": "ws_CO_191220191020363925",
                "ResultCode": 0,
                "ResultDesc": "The service request is processed successfully.",
                "CallbackMetadata": {
                    "Item": [
                        {"Name": "Amount", "Value": 1000.0},
                        {"Name": "MpesaReceiptNumber", "Value": "NLJ7RT61SV"},
                        {"Name": "TransactionDate", "Value": 20191219102115},
                        {"Name": "PhoneNumber", "Value": 254712345678}
                    ]
                }
            }
        }
    }


@pytest.fixture
def mock_stripe_payment_intent():
    """Mock Stripe payment intent."""
    return {
        "id": "pi_test_123456",
        "object": "payment_intent",
        "amount": 10000,
        "currency": "kes",
        "status": "succeeded",
        "client_secret": "pi_test_123456_secret_789",
        "payment_method": "pm_card_visa"
    }


@pytest.fixture
def mock_paypal_order():
    """Mock PayPal order response."""
    return {
        "id": "ORDER123456",
        "status": "CREATED",
        "links": [
            {
                "href": "https://sandbox.paypal.com/checkoutnow?token=ORDER123456",
                "rel": "approve",
                "method": "GET"
            }
        ]
    }


# Password for test users (for reference in tests)
TEST_PASSWORD = "Test123!@#"
ADMIN_PASSWORD = "Admin123!@#"
INSTRUCTOR_PASSWORD = "Instructor123!@#"
PARENT_PASSWORD = "Parent123!@#"
