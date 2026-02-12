"""
Security Utilities Tests

Tests for critical security functions:
- Password hashing and verification (bcrypt)
- JWT token creation and validation
- API key encryption/decryption (Fernet)
- Token expiration handling

Coverage target: 95%+ (critical security layer)
"""

import pytest
from datetime import timedelta, datetime
from jose import jwt

from app.utils.security import (
    create_access_token,
    create_refresh_token,
    verify_token,
    get_password_hash,
    verify_password,
    # Uncomment when encryption functions exist
    # encrypt_api_key,
    # decrypt_api_key,
)
from app.config import settings


@pytest.mark.unit
class TestPasswordHashing:
    """Test password hashing and verification functions."""

    def test_password_hash_and_verify_success(self):
        """Test password hashing and successful verification."""
        password = "MySecurePassword123!"
        hashed = get_password_hash(password)

        # Hash should be different from password
        assert hashed != password
        assert len(hashed) > len(password)

        # Verification should succeed
        assert verify_password(password, hashed) is True

    def test_password_verify_wrong_password_fails(self):
        """Test password verification fails with wrong password."""
        password = "CorrectPassword123!"
        hashed = get_password_hash(password)

        # Wrong password should not verify
        assert verify_password("WrongPassword123!", hashed) is False
        assert verify_password("different", hashed) is False
        assert verify_password("", hashed) is False

    def test_same_password_different_hashes(self):
        """Test same password produces different hashes (salt)."""
        password = "SamePassword123!"

        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        # Hashes should be different (bcrypt uses random salt)
        assert hash1 != hash2

        # But both should verify successfully
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True

    def test_hash_empty_password(self):
        """Test hashing empty password."""
        # Should still create a hash (though validation should prevent this)
        hashed = get_password_hash("")
        assert hashed is not None
        assert len(hashed) > 0

    def test_hash_long_password(self):
        """Test hashing very long password."""
        long_password = "A" * 200
        hashed = get_password_hash(long_password)

        assert hashed is not None
        assert verify_password(long_password, hashed) is True

    def test_hash_special_characters(self):
        """Test hashing password with special characters."""
        special_password = "P@ssw0rd!@#$%^&*()_+-={}[]|:;<>?,./~`"
        hashed = get_password_hash(special_password)

        assert verify_password(special_password, hashed) is True

    def test_hash_unicode_password(self):
        """Test hashing password with Unicode characters."""
        unicode_password = "Pāssw0rd123🔐"
        hashed = get_password_hash(unicode_password)

        assert verify_password(unicode_password, hashed) is True


@pytest.mark.unit
class TestJWTTokens:
    """Test JWT token creation and verification."""

    def test_create_access_token_success(self):
        """Test creating access token with user data."""
        user_id = "test-user-123"
        token = create_access_token(data={"sub": user_id})

        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

        # Decode token to verify contents
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        assert payload["sub"] == user_id
        assert "exp" in payload  # Expiration should be present

    def test_create_access_token_with_custom_expiry(self):
        """Test creating access token with custom expiration."""
        user_id = "test-user-123"
        expires_delta = timedelta(minutes=60)
        token = create_access_token(data={"sub": user_id}, expires_delta=expires_delta)

        # Decode and check expiration
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        exp_timestamp = payload["exp"]
        exp_datetime = datetime.fromtimestamp(exp_timestamp)
        now = datetime.utcnow()

        # Expiration should be approximately 60 minutes from now
        time_diff = (exp_datetime - now).total_seconds()
        assert 3500 < time_diff < 3700  # Allow 100 second margin

    def test_create_refresh_token_success(self):
        """Test creating refresh token."""
        user_id = "test-user-123"
        token = create_refresh_token(data={"sub": user_id})

        assert token is not None
        assert isinstance(token, str)

        # Decode to verify
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        assert payload["sub"] == user_id

    def test_verify_token_valid_token(self):
        """Test verifying valid token returns payload."""
        user_id = "test-user-123"
        token = create_access_token(data={"sub": user_id})

        payload = verify_token(token)

        assert payload is not None
        assert payload["sub"] == user_id
        assert "exp" in payload

    def test_verify_token_invalid_token_fails(self):
        """Test verifying invalid token returns None."""
        invalid_tokens = [
            "invalid.token.here",
            "not-a-jwt",
            "",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature"
        ]

        for invalid_token in invalid_tokens:
            payload = verify_token(invalid_token)
            assert payload is None, f"Invalid token '{invalid_token[:20]}...' was accepted"

    def test_verify_token_expired_token_fails(self):
        """Test verifying expired token returns None."""
        user_id = "test-user-123"
        # Create token that's already expired
        expired_token = create_access_token(
            data={"sub": user_id},
            expires_delta=timedelta(seconds=-1)  # Negative = already expired
        )

        payload = verify_token(expired_token)

        assert payload is None  # Should fail verification

    def test_verify_token_wrong_signature_fails(self):
        """Test verifying token with wrong signature fails."""
        # Create token with different secret
        wrong_token = jwt.encode(
            {"sub": "user-123", "exp": datetime.utcnow() + timedelta(hours=1)},
            "wrong-secret-key",
            algorithm=settings.algorithm
        )

        payload = verify_token(wrong_token)

        assert payload is None

    def test_token_contains_all_required_claims(self):
        """Test token contains all required JWT claims."""
        user_id = "test-user-123"
        token = create_access_token(data={"sub": user_id, "role": "student"})

        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])

        # Required claims
        assert "sub" in payload  # Subject (user ID)
        assert "exp" in payload  # Expiration
        # Optional: iat (issued at), iss (issuer)

    def test_token_payload_includes_custom_data(self):
        """Test token can include custom payload data."""
        custom_data = {
            "sub": "user-123",
            "role": "admin",
            "permissions": ["read", "write", "delete"]
        }

        token = create_access_token(data=custom_data)
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])

        assert payload["sub"] == "user-123"
        assert payload["role"] == "admin"
        assert payload["permissions"] == ["read", "write", "delete"]


@pytest.mark.unit
class TestAPIKeyEncryption:
    """Test API key encryption/decryption (if implemented)."""

    @pytest.mark.skip(reason="Encryption functions not yet implemented")
    def test_encrypt_and_decrypt_api_key(self):
        """Test API key encryption and decryption roundtrip."""
        # Uncomment when encryption is implemented
        # original_key = "sk_test_1234567890abcdefghijklmnop"
        # encrypted = encrypt_api_key(original_key)
        #
        # # Encrypted should be different
        # assert encrypted != original_key
        # assert len(encrypted) > len(original_key)
        #
        # # Decrypt should return original
        # decrypted = decrypt_api_key(encrypted)
        # assert decrypted == original_key
        pass

    @pytest.mark.skip(reason="Encryption functions not yet implemented")
    def test_decrypt_invalid_key_fails(self):
        """Test decrypting invalid encrypted key fails."""
        # Uncomment when encryption is implemented
        # with pytest.raises(Exception):
        #     decrypt_api_key("invalid-encrypted-key")
        pass

    @pytest.mark.skip(reason="Encryption functions not yet implemented")
    def test_encrypt_empty_key(self):
        """Test encrypting empty API key."""
        # Uncomment when encryption is implemented
        # encrypted = encrypt_api_key("")
        # decrypted = decrypt_api_key(encrypted)
        # assert decrypted == ""
        pass


@pytest.mark.unit
class TestTokenExpiration:
    """Test token expiration edge cases."""

    def test_token_just_before_expiration_valid(self):
        """Test token is valid just before expiration."""
        # Create token expiring in 10 seconds
        token = create_access_token(
            data={"sub": "user-123"},
            expires_delta=timedelta(seconds=10)
        )

        # Should be valid immediately
        payload = verify_token(token)
        assert payload is not None

    def test_token_different_users_different_tokens(self):
        """Test tokens for different users are different."""
        token1 = create_access_token(data={"sub": "user-1"})
        token2 = create_access_token(data={"sub": "user-2"})

        assert token1 != token2

        payload1 = jwt.decode(token1, settings.secret_key, algorithms=[settings.algorithm])
        payload2 = jwt.decode(token2, settings.secret_key, algorithms=[settings.algorithm])

        assert payload1["sub"] == "user-1"
        assert payload2["sub"] == "user-2"

    def test_refresh_token_has_longer_expiration(self):
        """Test refresh token has longer expiration than access token."""
        access_token = create_access_token(data={"sub": "user-123"})
        refresh_token = create_refresh_token(data={"sub": "user-123"})

        access_payload = jwt.decode(access_token, settings.secret_key, algorithms=[settings.algorithm])
        refresh_payload = jwt.decode(refresh_token, settings.secret_key, algorithms=[settings.algorithm])

        # Refresh token should expire later
        assert refresh_payload["exp"] > access_payload["exp"]


# Target: 95%+ coverage for security.py
