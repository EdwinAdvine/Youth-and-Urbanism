"""
Pytest Configuration and Fixtures

This module provides shared test fixtures and configuration for all tests.
It includes:
- Test database setup (SQLite in-memory for speed)
- FastAPI TestClient configuration
- Authentication fixtures (mock users, tokens)
- Mock external service fixtures (AI providers, payment gateways)
"""

import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.utils.security import create_access_token, create_refresh_token, get_password_hash


# Test database URL (SQLite in-memory for speed)
TEST_DATABASE_URL = "sqlite:///:memory:"

# Create test engine with in-memory SQLite
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,  # Use StaticPool for in-memory database
)

# Create test session factory
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """
    Create a fresh database session for each test.

    This fixture:
    - Creates all tables before the test
    - Provides a clean database session
    - Drops all tables after the test

    Yields:
        Session: SQLAlchemy database session
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Create session
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()
        # Drop all tables
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """
    Create FastAPI test client with test database.

    This fixture overrides the database dependency to use the test database
    session instead of the production database.

    Args:
        db_session: Test database session

    Yields:
        TestClient: FastAPI test client
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    # Override database dependency
    app.dependency_overrides[get_db] = override_get_db

    # Create test client
    with TestClient(app) as test_client:
        yield test_client

    # Clear overrides
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session: Session) -> User:
    """
    Create a test user with student role.

    Args:
        db_session: Database session

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
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_admin(db_session: Session) -> User:
    """
    Create a test user with admin role.

    Args:
        db_session: Database session

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
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def test_instructor(db_session: Session) -> User:
    """
    Create a test user with instructor role.

    Args:
        db_session: Database session

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
    db_session.commit()
    db_session.refresh(instructor)
    return instructor


@pytest.fixture
def test_parent(db_session: Session) -> User:
    """
    Create a test user with parent role.

    Args:
        db_session: Database session

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
    db_session.commit()
    db_session.refresh(parent)
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
