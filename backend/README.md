# Urban Home School Backend API

A FastAPI-based backend for the Urban Home School application.

## Features

- FastAPI with automatic OpenAPI documentation
- CORS support for frontend integration
- Pydantic models for data validation
- Environment-based configuration
- In-memory storage (easily replaceable with database)

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Development Server

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Access the API

- API Root: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Alternative Documentation: http://localhost:8000/redoc

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Students Management
- `GET /api/students` - Get all students
- `GET /api/students/{id}` - Get specific student
- `POST /api/students` - Create new student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:
- `PORT=8000` - Server port
- `DEBUG=True` - Debug mode
- `SECRET_KEY=your-secret-key` - JWT secret

## Database Integration

The current implementation uses in-memory storage. To integrate with a database:

1. Uncomment the desired database dependencies in `requirements.txt`
2. Configure the database URL in `.env`
3. Update the models and endpoints in `main.py`

Supported databases:
- SQLite (built-in)
- PostgreSQL
- MongoDB

## Development

### Testing

```bash
pytest
```

### Code Formatting

```bash
# Install black for code formatting
pip install black

# Format code
black .
```

## Production Deployment

1. Set `DEBUG=False` in production
2. Use a production WSGI server (e.g., Gunicorn)
3. Configure proper database connection
4. Set up proper logging
5. Use environment variables for secrets

```bash
# Production server example
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker