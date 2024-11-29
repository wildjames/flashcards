# Imports for setting up the app
import os
from flask import Flask, request, jsonify
from datetime import timedelta


app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = os.getenv("JWT_ACCESS_TOKEN_EXPIRES", timedelta(minutes=15))
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = os.getenv("JWT_REFRESH_TOKEN_EXPIRES", timedelta(days=30))

if not app.config['JWT_SECRET_KEY']:
    raise ValueError("JWT_SECRET_KEY environment variable not set")


# Further imports
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from flask_migrate import Migrate

from database.db_interface import db, DATABASE_URI
from database.db_types import User, Card, Group, UserCardData

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

# User Registration Endpoint
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        return jsonify({'message': 'Missing required fields'}), 400

    # Check if user already exists
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 409

    # Hash the password
    password_hash = generate_password_hash(password)

    # Create new user
    new_user = User(
        username=username,
        email=email,
        password_hash=password_hash,
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'user_id': new_user.id}), 201

# User Login Endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username_or_email = data.get('username') or data.get('email')
    password = data.get('password')

    if not all([username_or_email, password]):
        return jsonify({'message': 'Missing required fields'}), 400

    # Find user by username or email
    user = User.query.filter(
        (User.username == username_or_email) | (User.email == username_or_email)
    ).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    # Create JWT tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

# Token Refresh Endpoint
@app.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({'access_token': access_token}), 200

# Protected Route Example
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    return jsonify({'message': f'Hello user {user_id}'}), 200

# Create Card Endpoint
@app.route('/cards', methods=['POST'])
@jwt_required()
def create_card():
    data = request.get_json()
    question = data.get('question')
    correct_answer = data.get('correct_answer')
    incorrect_answer = data.get('incorrect_answer')
    group_id = data.get('group_id')

    if not all([question, correct_answer, group_id]):
        return jsonify({'message': 'Missing required fields'}), 400

    user_id = get_jwt_identity()

    # Check if group exists and user has access
    group = Group.query.filter_by(group_id=group_id).first()
    if not group:
        return jsonify({'message': 'Group not found'}), 404

    # Create new card
    new_card = Card(
        question=question,
        correct_answer=correct_answer,
        incorrect_answer=incorrect_answer,
        group_id=group_id,
        creator_id=user_id,
        updated_by_id=user_id
    )
    db.session.add(new_card)
    db.session.commit()

    return jsonify({'card_id': new_card.card_id}), 201

# Get Cards Endpoint
@app.route('/cards', methods=['GET'])
@jwt_required()
def get_cards():
    user_id = get_jwt_identity()
    cards = Card.query.all()
    cards_list = [{
        'card_id': card.card_id,
        'question': card.question,
        'correct_answer': card.correct_answer,
        'incorrect_answer': card.incorrect_answer,
        'group_id': card.group_id,
        'creator_id': card.creator_id,
        'time_created': card.time_created,
        'time_updated': card.time_updated,
        'updated_by_id': card.updated_by_id
    } for card in cards]
    return jsonify(cards_list), 200

# Update Card Endpoint
@app.route('/cards/<int:card_id>', methods=['PUT'])
@jwt_required()
def update_card(card_id):
    data = request.get_json()
    user_id = get_jwt_identity()

    card = Card.query.filter_by(card_id=card_id).first()
    if not card:
        return jsonify({'message': 'Card not found'}), 404

    # Update fields
    card.question = data.get('question', card.question)
    card.correct_answer = data.get('correct_answer', card.correct_answer)
    card.incorrect_answer = data.get('incorrect_answer', card.incorrect_answer)
    card.updated_by_id = user_id
    db.session.commit()

    return jsonify({'message': 'Card updated'}), 200

# Delete Card Endpoint
@app.route('/cards/<int:card_id>', methods=['DELETE'])
@jwt_required()
def delete_card(card_id):
    user_id = get_jwt_identity()

    card = Card.query.filter_by(card_id=card_id).first()
    if not card:
        return jsonify({'message': 'Card not found'}), 404

    db.session.delete(card)
    db.session.commit()

    return jsonify({'message': 'Card deleted'}), 200

# Create Card Group Endpoint
@app.route('/groups', methods=['POST'])
@jwt_required()
def create_group():
    data = request.get_json()
    user_id = get_jwt_identity()

    new_group = Group(
        creator_id=user_id
    )
    db.session.add(new_group)
    db.session.commit()

    return jsonify({'group_id': new_group.group_id}), 201

# Get Card Groups Endpoint
@app.route('/groups', methods=['GET'])
@jwt_required()
def get_groups():
    user_id = get_jwt_identity()
    groups = Group.query.all()
    groups_list = [{
        'group_id': group.group_id,
        'creator_id': group.creator_id,
        'time_created': group.time_created,
        'time_updated': group.time_updated
    } for group in groups]
    return jsonify(groups_list), 200

# Update Card Group Endpoint
@app.route('/groups/<int:group_id>', methods=['PUT'])
@jwt_required()
def update_group(group_id):
    data = request.get_json()
    user_id = get_jwt_identity()

    group = Group.query.filter_by(group_id=group_id).first()
    if not group:
        return jsonify({'message': 'Group not found'}), 404

    # Update fields if any (add fields as needed)
    # Example: group.name = data.get('name', group.name)

    group.time_updated = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Group updated'}), 200

# Delete Card Group Endpoint
@app.route('/groups/<int:group_id>', methods=['DELETE'])
@jwt_required()
def delete_group(group_id):
    user_id = get_jwt_identity()

    group = Group.query.filter_by(group_id=group_id).first()
    if not group:
        return jsonify({'message': 'Group not found'}), 404

    db.session.delete(group)
    db.session.commit()

    return jsonify({'message': 'Group deleted'}), 200

if __name__ == '__main__':
    app.run(debug=True)
