# Imports for setting up the app
import os
from flask import Flask, request, jsonify
from datetime import timedelta, datetime


app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = os.getenv("JWT_ACCESS_TOKEN_EXPIRES", timedelta(minutes=15))
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = os.getenv("JWT_REFRESH_TOKEN_EXPIRES", timedelta(days=30))

if not app.config['JWT_SECRET_KEY']:
    raise ValueError("JWT_SECRET_KEY environment variable not set")


# Further imports
from flask_jwt_extended import (
    JWTManager,
    jwt_required, get_jwt_identity
)
from flask_migrate import Migrate

from database.db_interface import db, DATABASE_URI
from database.db_types import User, Card, Group

jwt = JWTManager(app)

# Configuration for SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database with the Flask app
db.init_app(app)
migrate = Migrate(app, db)

# Create the database tables
with app.app_context():
    db.create_all()


### USER ENDPOINTS ###
import routes.user_endpoints as user_endpoints

app.add_url_rule("/register", view_func=user_endpoints.register, methods=['POST'])
app.add_url_rule("/login", view_func=user_endpoints.login, methods=['POST'])
app.add_url_rule("/refresh", view_func=user_endpoints.refresh_token, methods=['POST'])
# app.add_url_rule("/logout", view_func=user_endpoints.logout, methods=['POST']) # TODO: Implement logout
app.add_url_rule("/protected", view_func=user_endpoints.protected, methods=['GET'])
app.add_url_rule("/user/groups", view_func=user_endpoints.get_user_groups, methods=['GET'])


### CARD ENDPOINTS ###
import routes.card_endpoints as card_endpoints

app.add_url_rule("/cards", view_func=card_endpoints.create_card, methods=['POST'])
app.add_url_rule("/cards", view_func=card_endpoints.get_cards, methods=['GET'])
app.add_url_rule("/cards/<uuid:card_id>", view_func=card_endpoints.get_card, methods=['GET'])
app.add_url_rule("/cards/<uuid:card_id>", view_func=card_endpoints.update_card, methods=['PUT'])
app.add_url_rule("/cards/<uuid:card_id>", view_func=card_endpoints.delete_card, methods=['DELETE'])


### GROUP ENDPOINTS ###
import routes.group_endpoints as group_endpoints

app.add_url_rule("/groups", view_func=group_endpoints.create_group, methods=['POST'])
app.add_url_rule("/groups", view_func=group_endpoints.get_groups, methods=['GET'])
app.add_url_rule("/groups/<uuid:group_id>", view_func=group_endpoints.update_group, methods=['PUT'])
app.add_url_rule("/groups/<uuid:group_id>", view_func=group_endpoints.delete_group, methods=['DELETE'])
app.add_url_rule("/groups/<uuid:group_id>/join", view_func=group_endpoints.add_user_to_group, methods=['POST'])


@app.route('/')
def index():
    return "Hello, World!"


if __name__ == '__main__':
    app.run(debug=True)
