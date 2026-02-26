FROM python:3.11-slim

WORKDIR /app

# Install system deps needed for psycopg2 and cryptography
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Production: Gunicorn with uvicorn workers (multi-process, uvloop)
# Override WEB_WORKERS env var to control worker count in containers
CMD ["gunicorn", "main:app", "-c", "gunicorn.conf.py"]
