from flask_sqlalchemy import SQLAlchemy
from datetime import timezone

# Initialize the SQLAlchemy object without an app
db = SQLAlchemy()

# Association table for the many-to-many relationship between Users and Groups
user_group = db.Table('user_group',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('group_id', db.Integer, db.ForeignKey('group.group_id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)  # Primary key
    username = db.Column(db.String(256), unique=True, nullable=False)
    email = db.Column(db.String(256), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    password_salt = db.Column(db.String(256), nullable=False)
    time_created = db.Column(db.DateTime, default=timezone.utc)
    time_updated = db.Column(db.DateTime, default=timezone.utc, onupdate=timezone.utc)

    # Relationships
    cards_created = db.relationship('Card', backref='creator', lazy=True, foreign_keys='Card.creator_id')
    groups_created = db.relationship('Group', backref='creator', lazy=True)
    subscribed_groups = db.relationship('Group', secondary=user_group, backref='subscribers', lazy='dynamic')
    card_data = db.relationship('UserCardData', backref='user', lazy='dynamic')

class Group(db.Model):
    __tablename__ = 'group'
    group_id = db.Column(db.Integer, primary_key=True)  # Primary key
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    time_created = db.Column(db.DateTime, default=timezone.utc)
    time_updated = db.Column(db.DateTime, default=timezone.utc, onupdate=timezone.utc)

    # Relationships
    cards = db.relationship('Card', backref='group', lazy=True)

class Card(db.Model):
    __tablename__ = 'card'
    card_id = db.Column(db.Integer, primary_key=True)  # Primary key
    question = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.Text, nullable=False)
    incorrect_answer = db.Column(db.Text)
    group_id = db.Column(db.Integer, db.ForeignKey('group.group_id'), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    time_created = db.Column(db.DateTime, default=timezone.utc)
    time_updated = db.Column(db.DateTime, default=timezone.utc, onupdate=timezone.utc)
    updated_by_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    # Relationships
    updated_by = db.relationship('User', foreign_keys=[updated_by_id], backref='cards_updated')
    user_data = db.relationship('UserCardData', backref='card', lazy='dynamic')

class UserCardData(db.Model):
    __tablename__ = 'user_card_data'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    card_id = db.Column(db.Integer, db.ForeignKey('card.card_id'), primary_key=True)
    times_answered = db.Column(db.Integer, default=0)
    times_answered_incorrectly = db.Column(db.Integer, default=0)
    last_seen = db.Column(db.DateTime)
