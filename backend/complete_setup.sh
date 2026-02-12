#!/bin/bash

# Urban Home School - Complete Setup Script
# Run this AFTER running setup_database.sh

echo "======================================"
echo "Urban Home School - Complete Setup"
echo "======================================"
echo ""

# Change to backend directory
cd "$(dirname "$0")"

echo "Step 1: Generating initial database migration..."
python3 -m alembic revision --autogenerate -m "Initial schema with all models"

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate migration!"
    exit 1
fi

echo ""
echo "Step 2: Running migrations..."
python3 -m alembic upgrade head

if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations!"
    exit 1
fi

echo ""
echo "Step 3: Verifying database tables..."
python3 << 'PYEOF'
import asyncio
from app.database import engine
from sqlalchemy import text

async def check_tables():
    async with engine.begin() as conn:
        result = await conn.execute(text("""
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
        """))
        tables = [row[0] for row in result]

        print(f"✅ Found {len(tables)} tables:")
        for table in tables:
            print(f"   - {table}")

        expected_tables = ['users', 'students', 'ai_providers', 'ai_tutors', 'courses',
                          'assessments', 'assessment_submissions', 'payments', 'wallets',
                          'wallet_transactions', 'alembic_version']

        missing = set(expected_tables) - set(tables)
        if missing:
            print(f"⚠️  Missing tables: {missing}")
        else:
            print("✅ All expected tables created!")

asyncio.run(check_tables())
PYEOF

echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Start the backend server:"
echo "   python main.py"
echo ""
echo "2. Open API docs:"
echo "   http://localhost:8000/docs"
echo ""
echo "3. Check health:"
echo "   http://localhost:8000/health"
echo ""
