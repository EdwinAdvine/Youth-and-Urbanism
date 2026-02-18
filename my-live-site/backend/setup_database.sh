#!/bin/bash

# Urban Home School - Database Setup Script
# This script creates the database and user for the TUHS platform

echo "=================================="
echo "Urban Home School - Database Setup"
echo "=================================="
echo ""
echo "This script will create:"
echo "  - Database: tuhs_db"
echo "  - User: tuhs_user"
echo "  - Password: tuhs_dev_password_123"
echo ""
echo "You will be prompted for your PostgreSQL 'postgres' user password."
echo ""

# PostgreSQL binary path
PSQL="/Library/PostgreSQL/18/bin/psql"

# Check if psql exists
if [ ! -f "$PSQL" ]; then
    echo "ERROR: PostgreSQL psql command not found at $PSQL"
    echo "Please update the PSQL variable in this script with the correct path"
    exit 1
fi

# Create database and user
$PSQL -U postgres -h localhost <<EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'tuhs_user') THEN
        CREATE USER tuhs_user WITH PASSWORD 'tuhs_dev_password_123';
    ELSE
        ALTER USER tuhs_user WITH PASSWORD 'tuhs_dev_password_123';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE tuhs_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tuhs_db')\\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE tuhs_db TO tuhs_user;

-- Connect to the new database and grant schema privileges
\\c tuhs_db
GRANT ALL ON SCHEMA public TO tuhs_user;
ALTER SCHEMA public OWNER TO tuhs_user;

-- Show success message
SELECT 'Database setup completed successfully!' as status;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "Connection details:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  Database: tuhs_db"
    echo "  User: tuhs_user"
    echo "  Password: tuhs_dev_password_123"
    echo ""
    echo "You can now run: python -m alembic upgrade head"
else
    echo ""
    echo "❌ Database setup failed!"
    echo "Please check the error messages above."
    exit 1
fi
