from flask import request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

from database.db_interface import db
from database.db_types import User


# User Registration Endpoint
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
@jwt_required(refresh=True)
def refresh_token():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({'access_token': access_token}), 200

# Protected Route Example
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    return jsonify({'message': f'Hello user {user_id}'}), 200


# Get user groups endpoint
@jwt_required()
def get_user_groups():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=uuid.UUID(user_id)).first()
    groups = user.subscribed_groups.all()
    groups_list = [{
        'group_name': group.group_name,
        'group_id': group.group_id,
        'creator_id': group.creator_id,
        'time_created': group.time_created,
        'time_updated': group.time_updated
    } for group in groups]
    return jsonify(groups_list), 200
