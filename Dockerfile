# Build the React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copy only package files first for caching
COPY flashcard-frontend/package*.json ./flashcard-frontend/
RUN cd flashcard-frontend && npm install

# Copy the rest of the frontend source code and build
COPY flashcard-frontend/ ./flashcard-frontend/
RUN cd flashcard-frontend && npm run build

# Set up the Flask backend
FROM python:3.10-slim
WORKDIR /app

# Copy the Flask API source code
COPY flashcard-api/ ./flashcard-api/

# Install system dependencies and Python requirements
RUN apt-get update && \
    apt-get install -y gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app/flashcard-api
RUN pip install --no-cache-dir -r requirements.txt

# Expose the ports that Flask and Next run on
EXPOSE 5000 3000

# Set environment variables for Flask
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

WORKDIR /app
