# Encryption

> **Source file**: `backend/app/utils/security.py`
> **Last updated**: 2026-02-15

## Overview

Urban Home School employs multiple layers of encryption to protect sensitive data at rest and in transit. This document covers password hashing, JWT signing, API key encryption, and token blacklisting.

---

## Password Hashing: bcrypt

### Algorithm

Passwords are hashed using bcrypt with auto-generated salts. The system uses the `bcrypt` library directly rather than through `passlib` to avoid version incompatibility issues.

### Hashing

```python
import bcrypt

def get_password_hash(password: str) -> str:
    if not password or not password.strip():
        raise ValueError("Password cannot be empty")

    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")
```

### Verification

```python
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False
```

### Properties

| Property | Value |
|---|---|
| Algorithm | bcrypt |
| Salt | Auto-generated (embedded in hash) |
| Work factor | Default (12 rounds) |
| Output | 60-character hash string |
| Timing-safe | Yes (bcrypt.checkpw is constant-time) |

### Password Strength Validation

Before hashing, passwords are validated via `is_strong_password()`:

```python
def is_strong_password(password: str) -> tuple[bool, List[str]]:
    errors = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    if not any(c.isupper() for c in password):
        errors.append("Must contain at least one uppercase letter")
    if not any(c.islower() for c in password):
        errors.append("Must contain at least one lowercase letter")
    if not any(c.isdigit() for c in password):
        errors.append("Must contain at least one digit")
    special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    if not any(c in special_chars for c in password):
        errors.append("Must contain at least one special character")
    return len(errors) == 0, errors
```

---

## JWT Signing: HS256

### Algorithm

JWTs are signed using HMAC-SHA256 (HS256) with a shared secret key.

### Token Creation

```python
from jose import jwt

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=30))
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
```

### Token Verification

```python
def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])

    if payload.get("type") != token_type:
        raise HTTPException(401, "Invalid token type")

    if payload.get("sub") is None:
        raise HTTPException(401, "Could not validate credentials")

    return payload
```

### Configuration

| Setting | Default | Production Requirement |
|---|---|---|
| `SECRET_KEY` | Required (min 32 chars) | Min 64 chars |
| `ALGORITHM` | `HS256` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Configurable |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Configurable |

### Token Types

| Type | Lifetime | Purpose |
|---|---|---|
| `access` | 30 minutes | API authentication |
| `refresh` | 7 days | Obtaining new access tokens |
| `email_verification` | Configurable | Email address verification |
| `password_reset` | Configurable | Password reset flow |

---

## API Key Encryption: Fernet

### Algorithm

AI provider API keys stored in the database are encrypted using Fernet symmetric encryption from the `cryptography` library.

### Key Derivation

The Fernet encryption key is derived from `settings.encryption_key`:

```python
def _get_fernet_key() -> bytes:
    encryption_key = getattr(settings, 'encryption_key', settings.secret_key)

    # If already a valid Fernet key (44 chars, base64-encoded)
    if len(encryption_key) == 44 and encryption_key.endswith('='):
        try:
            return base64.urlsafe_b64decode(encryption_key)
        except Exception:
            pass

    # Otherwise, derive via SHA-256
    key_bytes = encryption_key.encode('utf-8')
    derived_key = hashlib.sha256(key_bytes).digest()
    return base64.urlsafe_b64encode(derived_key)
```

### Encryption

```python
fernet = Fernet(_get_fernet_key())

def encrypt_api_key(api_key: str) -> str:
    if not api_key or not api_key.strip():
        raise ValueError("API key cannot be empty")
    encrypted_bytes = fernet.encrypt(api_key.encode('utf-8'))
    return encrypted_bytes.decode('utf-8')
```

### Decryption

```python
def decrypt_api_key(encrypted_key: str) -> str:
    if not encrypted_key or not encrypted_key.strip():
        raise ValueError("Encrypted key cannot be empty")
    try:
        decrypted_bytes = fernet.decrypt(encrypted_key.encode('utf-8'))
        return decrypted_bytes.decode('utf-8')
    except InvalidToken:
        raise ValueError("Invalid or corrupted encrypted key")
```

### Properties

| Property | Value |
|---|---|
| Algorithm | Fernet (AES-128-CBC + HMAC-SHA256) |
| Key size | 32 bytes (256 bits) |
| IV | Auto-generated per encryption |
| Authentication | HMAC-SHA256 (authenticated encryption) |
| Timestamp | Embedded in ciphertext (enables TTL) |

### Fallback Behavior

If the encryption key cannot be initialized (e.g., missing `ENCRYPTION_KEY` setting), the system falls back to a randomly generated Fernet key. This is acceptable for development but not for production, as encrypted data would not survive server restarts.

```python
try:
    fernet = Fernet(_get_fernet_key())
except Exception as e:
    print(f"WARNING: Using generated encryption key. Set encryption_key in production")
    fernet = Fernet(Fernet.generate_key())
```

---

## Token Blacklisting: Redis

### Purpose

Enables logout functionality by invalidating tokens before their natural expiration.

### Implementation

```python
# Blacklist a token
ttl = max(int(exp - time.time()), 1)
await redis.setex(f"blacklist:{token}", ttl, "1")

# Check if blacklisted
async def is_token_blacklisted(token: str) -> bool:
    return await redis.exists(f"blacklist:{token}") == 1
```

### Properties

| Property | Value |
|---|---|
| Storage | Redis |
| Key format | `blacklist:{full_jwt_token}` |
| TTL | Remaining token lifetime |
| Fail mode | Fail-open (allow if Redis unavailable) |

### TTL Strategy

The blacklist entry's TTL matches the token's remaining lifetime. Once the token would have expired naturally, the blacklist entry is automatically removed by Redis, preventing unbounded memory growth.

---

## Data Sanitization

The `sanitize_user_data()` function removes sensitive fields before returning user data in API responses:

```python
sensitive_fields = [
    'password',
    'hashed_password',
    'password_hash',
    'password_reset_token',
    'email_verification_token',
    '_sa_instance_state'
]
```

---

## Secure Token Generation

For password reset tokens and other one-time tokens:

```python
import secrets

def generate_secure_token(length: int = 32) -> str:
    return secrets.token_urlsafe(length)
```

Uses `secrets.token_urlsafe()` for cryptographically secure random generation.
