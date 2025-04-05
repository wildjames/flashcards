FROM node:22-alpine AS frontend-builder
WORKDIR /app

COPY flashcard-frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend code and build it
COPY flashcard-frontend/ .
RUN npm run build
# This builds the frontend and outputs it to the static folder

# Build the production image with the Flask backend
FROM python:3.12-slim AS backend-builder
WORKDIR /app

# Install any system dependencies required by Python packages
COPY flashcard-backend/requirements.txt requirements.txt

RUN apt-get update \
    && apt-get install -y git gcc libffi-dev \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --upgrade pip \
    && pip install --upgrade setuptools \
    && pip install -r requirements.txt

COPY flashcard-backend flashcard-backend

### RUNNER STAGE ###
FROM python:3.12-slim

# Install Nginx
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx default-libmysqlclient-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy the built React static files from the frontend-builder stage
COPY --from=frontend-builder /app/static /var/www/html

# Copy the installed dependencies from the backend-builder stage
COPY --from=backend-builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy the flask app from the backend-builder stage
WORKDIR /app
COPY --from=backend-builder /app/flashcard-backend /app/

# Copy in runner files
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY Makefile Makefile
COPY run_server.sh run_server.sh

# Set environment variables for Flask
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

EXPOSE 80 443

# Start the Nginx and Flask servers
CMD ["./run_server.sh"]

