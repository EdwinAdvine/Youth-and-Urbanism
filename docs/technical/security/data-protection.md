# Data Protection -- KDPA 2019 Compliance

> **Last updated**: 2026-02-15

## Overview

Urban Home School is designed to comply with the **Kenya Data Protection Act, 2019** (KDPA), which governs the processing of personal data in Kenya. As an educational platform serving Kenyan children, the platform has heightened obligations regarding the collection, processing, and storage of personal data -- particularly children's data.

---

## Kenya Data Protection Act 2019

### Key Principles

The KDPA establishes eight principles for personal data processing:

| Principle | Implementation in UHS |
|---|---|
| **Lawfulness** | Data collected only for educational purposes with consent |
| **Purpose limitation** | Data used only for tutoring, progress tracking, and parental oversight |
| **Data minimization** | Only essential data collected per role |
| **Accuracy** | Users can update their profiles; admins can correct records |
| **Storage limitation** | Soft deletes with configurable retention periods |
| **Integrity and confidentiality** | Encryption at rest (bcrypt, Fernet), in transit (HTTPS) |
| **Accountability** | Audit trails, admin logging, RBAC enforcement |
| **Transparency** | Privacy policy, data collection notices |

### Children's Data (Section 33)

The KDPA requires special protection for children's personal data:
- Parental consent must be obtained before processing a child's data
- Data collection must be appropriate to the child's age
- The platform must implement age-appropriate privacy protections
- Children's data must not be used for marketing or profiling

---

## Data Minimization Practices

### Per-Role Data Collection

| Role | Required Data | Optional Data |
|---|---|---|
| **Student** | Email, name, grade level | Learning preferences, avatar |
| **Parent** | Email, name, phone | Address, payment details |
| **Instructor** | Email, name, qualifications | Bio, profile photo |
| **Admin** | Email, name | None |
| **Partner** | Email, organization name | Contact details |
| **Staff** | Email, name, department | Internal notes |

### JSONB Profile Data

The `profile_data` JSONB column allows flexible, role-specific data storage without requiring schema migrations. This approach ensures:
- Only relevant fields are stored per role
- No empty columns for data that does not apply to a role
- Easy addition of new fields without database changes

```python
# Student profile_data example
{
    "full_name": "John Doe",
    "grade_level": 6,
    "learning_preferences": {"style": "visual"},
    "avatar_url": "/uploads/avatars/john.png"
}
```

---

## Soft Deletes for Data Recovery

### Implementation

All user records use soft deletes rather than hard deletes:

```python
class User(Base):
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime, nullable=True)
```

### Soft Delete Flow

1. User requests account deletion
2. System sets `is_deleted = True` and `deleted_at = current_timestamp`
3. User record remains in the database but is excluded from all queries
4. After a configurable retention period, the record can be permanently purged

### Query Filtering

All user queries include `is_deleted == False` as a filter:
```python
result = await db.execute(
    select(User).where(User.id == user_id, User.is_deleted == False)
)
```

### Benefits

- **Data recovery**: Accidentally deleted accounts can be restored
- **Legal compliance**: Data can be retained for the legally required period
- **Audit trail**: Deletion events are timestamped
- **Referential integrity**: Foreign keys to deleted users are preserved

---

## User Data Export

### Right of Access (KDPA Section 26)

Users have the right to access their personal data. The platform supports data export through:

1. **Profile data**: Users can view and download their profile information
2. **Activity data**: Students can export their learning history, quiz scores, and AI conversation history
3. **Transaction data**: Parents can export payment and subscription records
4. **API endpoint**: A data export endpoint generates a comprehensive JSON/CSV file

### Export Contents

| Data Category | Description |
|---|---|
| Profile information | Name, email, role, creation date |
| Learning data | Course enrollments, progress, completion status |
| Assessment data | Quiz scores, assignment grades |
| AI interactions | Conversation history with AI tutors |
| Payment history | Transaction records, receipts |
| Activity logs | Login history, feature usage |

---

## Consent Management

### Parent Dashboard

The parent dashboard provides consent management features:

1. **AI Tutor Consent**: Parents can enable/disable AI tutoring for their children
2. **Data Collection Consent**: Parents control what data is collected about their children
3. **Communication Preferences**: Parents manage notification and communication settings
4. **Third-Party Sharing**: Parents control whether data is shared with content partners

### Consent Records

Consent is recorded with timestamps and can be revoked at any time:

```python
{
    "ai_tutoring_consent": {
        "granted": true,
        "granted_at": "2026-01-15T10:00:00Z",
        "granted_by": "parent_user_id"
    },
    "data_collection_consent": {
        "granted": true,
        "granted_at": "2026-01-15T10:00:00Z",
        "scope": ["learning_analytics", "ai_interactions"]
    }
}
```

---

## Privacy Settings per Role

### Student Privacy

- AI conversation history is only accessible to the student and their parent
- Learning progress is shared with parents and assigned instructors
- Personal profile is not visible to other students
- AI interactions are not used for marketing

### Parent Privacy

- Can view only their own children's data
- Payment information is encrypted
- Contact information is not shared with other parents
- Ownership-based access control prevents cross-family data access

### Instructor Privacy

- Can see only students enrolled in their courses
- Cannot access student financial information
- Cannot access parent contact details unless explicitly shared
- Revenue data is private to the instructor and admins

### Admin Privacy

- Full access to all user data for platform management
- Actions are logged for audit purposes
- Admin accounts require stronger authentication
- Sensitive data access is logged

---

## Data Retention

### Retention Periods

| Data Type | Retention Period | After Expiry |
|---|---|---|
| Active user accounts | Indefinite (while active) | N/A |
| Soft-deleted accounts | 90 days (configurable) | Hard delete or anonymize |
| AI conversation history | 1 year | Archive or delete |
| Payment records | 7 years (tax compliance) | Archive |
| Audit logs | 2 years | Archive |
| Session tokens | Token TTL (30 min / 7 days) | Auto-expire in Redis |

### Data Anonymization

When data must be retained for analytics but the user has requested deletion:
- Personal identifiers are removed or replaced with pseudonyms
- Email addresses are hashed
- Names are replaced with generic identifiers
- Statistical data is preserved for platform analytics

---

## Security Measures for Data Protection

### Encryption

- **At rest**: Passwords (bcrypt), API keys (Fernet), sensitive JSONB fields
- **In transit**: HTTPS/TLS for all API communications, WSS for WebSocket connections
- **Database**: PostgreSQL SSL connections in production

### Access Control

- RBAC with 6 distinct roles
- Ownership-based access (parents can only access their children's data)
- Admin override with audit logging
- Token-based API authentication

### Audit Trail

- User creation and modification timestamps (`created_at`, `updated_at`)
- Login history (`last_login`)
- Soft delete timestamps (`deleted_at`)
- Payment transaction history with timestamps
- AI interaction logs with provider tracking

---

## Breach Notification

Under KDPA Section 43, data breaches must be reported to the Office of the Data Protection Commissioner (ODPC) within 72 hours. The platform supports this through:

1. **Monitoring**: Real-time WebSocket alerts for security events (`ai.safety_violation`, `safety.incident`)
2. **Logging**: Comprehensive audit logs for forensic analysis
3. **Admin notifications**: Immediate admin alerts for suspicious activity
4. **Sentry integration**: Optional error tracking for security-related exceptions
