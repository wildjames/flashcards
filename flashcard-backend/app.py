# Imports for setting up the app
import os
from datetime import timedelta

from flask import Flask, send_from_directory
from flask_jwt_extended import (
    JWTManager
)
from flask_cors import CORS
from flask_migrate import Migrate


app = Flask(
    __name__,
    static_folder="./static",
    static_url_path="",
)

logger = app.logger

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

jwt_access_expires = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 15))
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=jwt_access_expires)

jwt_refresh_expires = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', 30))
app.config['JWT_REFRESH_TOKEN_EXPIRES'] =  timedelta(days=jwt_refresh_expires)

logger.info(f"JWT_ACCESS_TOKEN_EXPIRES: {app.config['JWT_ACCESS_TOKEN_EXPIRES']}")
logger.info(f"JWT_REFRESH_TOKEN_EXPIRES: {app.config['JWT_REFRESH_TOKEN_EXPIRES']}")


if not app.config['JWT_SECRET_KEY']:
    raise ValueError("JWT_SECRET_KEY environment variable not set")

jwt = JWTManager(app)


# CORS needs to allow traffic from the frontend dev instance, which is running on localhost:3000
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


# Further imports for database setup
from database.db_interface import db, DATABASE_URI


# Configuration for SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database with the Flask app
db.init_app(app)
migrate = Migrate(app, db)

# Create the database tables
with app.app_context():
    db.create_all()

# Start the scheduler
from scheduler import scheduler

with app.app_context():
    scheduler.init_app(app)
    scheduler.start()

# TODO: This implementation is broken - or my credentials are.
# I get missing fields client_id, refresh_token, client_secret.
# from data_imports.google_sheets import get_google_creds, get_data_from_sheet, SheetSyncJob
# import uuid

# with app.app_context():
#     job_id = uuid.UUID("2609d26d-8b5a-44a1-84ab-4c19d30ef7a0")
#     job = SheetSyncJob.query.filter_by(job_id=job_id).first()
#     creds = get_google_creds()
#     print("Credentials:")
#     print(creds)
#     print(f"\n\n\nGetting data for job: {job}")
#     rows = get_data_from_sheet(job, creds)
#     print(f"Rows:\n{rows}")


### USER ENDPOINTS ###
import routes.user_endpoints as user_endpoints

app.add_url_rule("/api/register", view_func=user_endpoints.register, methods=['POST'])
app.add_url_rule("/api/login", view_func=user_endpoints.login, methods=['POST'])
app.add_url_rule("/api/refresh", view_func=user_endpoints.refresh_token, methods=['POST'])
# app.add_url_rule("/api/logout", view_func=user_endpoints.logout, methods=['POST']) # TODO: Implement serverside logout & token revocation
app.add_url_rule("/api/protected", view_func=user_endpoints.protected, methods=['GET'])
app.add_url_rule("/api/user/groups", view_func=user_endpoints.get_user_groups, methods=['GET'])
# TODO: This should be a GET with a query parameter
app.add_url_rule("/api/user/details", view_func=user_endpoints.get_user_details, methods=['POST'])


### CARD ENDPOINTS ###
import routes.card_endpoints as card_endpoints

app.add_url_rule("/api/cards", view_func=card_endpoints.create_card, methods=['POST'])
app.add_url_rule("/api/cards/bulk", view_func=card_endpoints.create_bulk_cards, methods=['POST'])
app.add_url_rule("/api/cards", view_func=card_endpoints.get_cards, methods=['GET'])
app.add_url_rule("/api/cards/<uuid:card_id>", view_func=card_endpoints.get_card, methods=['GET'])
app.add_url_rule("/api/cards/<uuid:card_id>", view_func=card_endpoints.update_card, methods=['PUT'])
app.add_url_rule("/api/cards/<uuid:card_id>", view_func=card_endpoints.delete_card, methods=['DELETE'])
app.add_url_rule("/api/cards/flashcard", view_func=card_endpoints.get_random_card, methods=['GET'])


### GROUP ENDPOINTS ###
import routes.group_endpoints as group_endpoints

app.add_url_rule("/api/groups", view_func=group_endpoints.create_group, methods=['POST'])

# List all groups
app.add_url_rule("/api/groups", view_func=group_endpoints.get_groups, methods=['GET'])

# Get group
app.add_url_rule("/api/groups/<uuid:group_id>", view_func=group_endpoints.get_group_info, methods=['GET'])
# Update group
app.add_url_rule("/api/groups/<uuid:group_id>", view_func=group_endpoints.update_group, methods=['PUT'])
# Delete Group
app.add_url_rule("/api/groups/<uuid:group_id>", view_func=group_endpoints.delete_group, methods=['DELETE'])

# Search for groups
app.add_url_rule("/api/groups/search", view_func=group_endpoints.search_groups, methods=['GET'])
app.add_url_rule("/api/groups/<uuid:group_id>/join", view_func=group_endpoints.add_user_to_group, methods=['POST'])
app.add_url_rule("/api/groups/<uuid:group_id>/cards", view_func=group_endpoints.get_group_cards, methods=['GET'])

# WIP: Google sheets creation
app.add_url_rule("/api/groups/google-sheets", view_func=group_endpoints.create_group_from_google_sheet, methods=['POST'])


### DEV ENDPOINTS ###
import routes.dev_endpoints as dev_endpoints

app.add_url_rule("/api/dev/users", view_func=dev_endpoints.get_usernames, methods=['GET'])

@app.route('/api/dev/health')
def ping():
    return "ok", 200

### Static files
# Catch-all route to support client-side routing in React
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # If a static file exists for the requested path, serve it.
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)

    # Otherwise, serve index.html for React Router to handle routing.
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
