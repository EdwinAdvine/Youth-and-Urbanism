# Urban Home School Backend Authentication System

This document provides comprehensive information about the new database-backed authentication system for the Urban Home School application.

## Overview

The authentication system has been upgraded from a mock-based approach to a full database-backed solution using MySQL and FastAPI with SQLAlchemy ORM. The system supports multiple user roles and provides secure JWT-based authentication.

## Architecture

### Database Schema

The system uses a hybrid approach with:
- **Users Table**: Core user information (email, password, role, etc.)
- **Role-Specific Tables**: Separate tables for each role with specific attributes

#### Tables Structure

1. **users** - Core user information
   - id (UUID)
   - email (unique)
   - password_hash
   - name
   - role
   - avatar
   - created_at
   - last_login
   - email_verified
   - is_active

2. **students** - Student-specific data
   - user_id (foreign key)
   - grade_level

3. **parents** - Parent-specific data
   - user_id (foreign key)
   - number_of_children

4. **instructors** - Instructor-specific data
   - user_id (foreign key)
   - subjects

5. **partners** - Partner-specific data
   - user_id (foreign key)
   - position

6. **admins** - Admin-specific data
   - user_id (foreign key)
   - position

### Authentication Flow

1. **Registration**: Creates user + role-specific profile
2. **Login**: Validates credentials, returns JWT token
3. **Authorization**: JWT tokens used for API access
4. **Profile Management**: Update user and role-specific information

## Setup Instructions

### 1. Database Setup

Ensure MySQL is running and create the database:

```sql
CREATE DATABASE home_school;
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
DATABASE_URL=mysql+pymysql://root:edwin3100DB@localhost:3306/home_school
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Run Database Migrations

```bash
# Create database tables
python migrations/create_tables.py

# Populate with mock users
python migrations/populate_users.py
```

### 5. Start the Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "grade_level": "Grade 4"
}
```

**Role-Specific Fields:**
- **Student**: `grade_level`
- **Parent**: `number_of_children`
- **Instructor**: `subjects`
- **Partner/Admin**: `position`

#### POST /api/auth/login
Authenticate user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "remember_me": false
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### GET /api/auth/me
Get current user information

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT /api/auth/profile
Update user profile

**Request Body:**
```json
{
  "name": "John Smith",
  "avatar": "https://example.com/avatar.jpg",
  "grade_level": "Grade 5"
}
```

### User Management (Admin Only)

#### GET /api/auth/users
Get all users (requires admin role)

#### DELETE /api/auth/users/{user_id}
Delete a user (requires admin role)

## User Roles

### Student
- Can access courses and assignments
- View progress and grades
- Participate in forums

### Parent
- Can view children's progress
- Access parent-specific resources
- Communicate with instructors

### Instructor
- Can create and manage courses
- Grade assignments and quizzes
- Monitor student progress

### Partner
- Can create partnerships
- Access partner resources
- Collaborate with school

### Admin
- Full system access
- User management
- System configuration

## Security Features

- **Password Hashing**: Using bcrypt
- **JWT Authentication**: Secure token-based auth
- **Role-Based Access**: Different permissions per role
- **Input Validation**: Pydantic models for data validation
- **SQL Injection Protection**: SQLAlchemy ORM

## Frontend Integration

The frontend has been updated to work with the new backend:

### Environment Variables
Add to `.env` file in frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Authentication Service
The `authService.ts` has been updated to:
- Make API calls to the backend
- Handle JWT tokens
- Support all user roles
- Provide profile management

## Testing

### Test Users
The migration script creates these test users:

1. **Student**: student@urbanhomeschool.com / password123
2. **Parent**: parent@urbanhomeschool.com / password123
3. **Instructor**: instructor@urbanhomeschool.com / password123
4. **Admin**: admin@urbanhomeschool.com / password123
5. **Partner**: partner@urbanhomeschool.com / password123

### Testing the API
Use tools like Postman or curl to test endpoints:

```bash
# Test login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "student@urbanhomeschool.com", "password": "password123"}'

# Test protected endpoint
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer <token>"
```

## Migration from Mock System

The new system maintains backward compatibility with the frontend while providing:
- Persistent user data
- Real authentication
- Role-based permissions
- Secure password storage

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL server is running
   - Verify database credentials
   - Ensure database exists

2. **Import Errors**
   - Check all dependencies installed
   - Verify Python path

3. **CORS Issues**
   - Ensure frontend URL is in CORS allow list
   - Check frontend environment variables

### Logs
Check console output for detailed error messages during development.

## Future Enhancements

- Email verification system
- Password reset via email
- Two-factor authentication
- OAuth integration (Google, Facebook)
- Rate limiting
- Audit logging

## Support

For issues or questions about the authentication system:
1. Check this README
2. Review the API documentation
3. Check console logs for errors
4. Test with the provided test users