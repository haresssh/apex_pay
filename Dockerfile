FROM python:3.9-slim

# Install netcat (nc) - we need this for our entrypoint check
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh
RUN mkdir -p /app/scripts && chmod +x /app/scripts/*.sh

# This tells Docker to run our script before starting the service

ENTRYPOINT ["/app/entrypoint.sh"]