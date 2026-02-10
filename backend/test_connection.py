from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError

def test_connection():
    try:
        engine = create_engine('mysql+pymysql://root:edwin3100DB@127.0.0.1:3307/home_school', pool_pre_ping=True)
        with engine.connect() as connection:
            result = connection.execute(text('SELECT 1')).scalar()
            print(f"Connection successful! Result: {result}")
            return True
    except Exception as e:
        print(f"Connection failed: {e}")
        return False

if __name__ == "__main__":
    test_connection()