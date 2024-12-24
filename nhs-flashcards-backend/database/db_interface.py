from .db_types import db
import os

# Fetch database configuration from environment variables
DATABASE_ENGINE = os.getenv('DATABASE_ENGINE')
DATABASE_USERNAME = os.getenv('DATABASE_USERNAME')
DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD')
DATABASE_HOST = os.getenv('DATABASE_HOST')
DATABASE_PORT = os.getenv('DATABASE_PORT')
DATABASE_NAME = os.getenv('DATABASE_NAME')

if not all([DATABASE_ENGINE, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_PORT, DATABASE_NAME]):
    # Which one is missing?
    missing = [k for k, v in {
        'DATABASE_ENGINE': DATABASE_ENGINE,
        'DATABASE_USERNAME': DATABASE_USERNAME,
        'DATABASE_PASSWORD': DATABASE_PASSWORD,
        'DATABASE_HOST': DATABASE_HOST,
        'DATABASE_PORT': DATABASE_PORT,
        'DATABASE_NAME': DATABASE_NAME
    }.items() if not v]
    raise ValueError(f"One or more database environment variables are not set: {missing}")

# Construct the database URI
DATABASE_URI = f"{DATABASE_ENGINE}://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"
