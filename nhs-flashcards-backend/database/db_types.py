from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

from llm.llm import get_incorrect_answer

# Initialize the SQLAlchemy object without an app
db = SQLAlchemy(
    engine_options={
        "pool_recycle": 3600,
    }
)

# Association table for the many-to-many relationship between Users and Groups
user_group = db.Table('user_group',
    db.Column('user_id', db.UUID, db.ForeignKey('user.id'), primary_key=True),
    db.Column('group_id', db.UUID, db.ForeignKey('group.group_id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.UUID, primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(256), unique=True, nullable=False)
    email = db.Column(db.String(256), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    time_created = db.Column(db.DateTime, default=lambda: datetime.now().isoformat())
    time_updated = db.Column(db.DateTime, default=lambda: datetime.now().isoformat(), onupdate=lambda: datetime.now().isoformat())

    # Relationships
    cards_created = db.relationship('Card', backref='creator', lazy=True, foreign_keys='Card.creator_id')
    groups_created = db.relationship('Group', backref='creator', lazy=True)
    subscribed_groups = db.relationship('Group', secondary=user_group, backref='subscribers', lazy='dynamic')
    card_data = db.relationship('UserCardData', backref='user', lazy='dynamic')

class Group(db.Model):
    __tablename__ = 'group'
    group_id = db.Column(db.UUID, primary_key=True, default=uuid.uuid4)
    creator_id = db.Column(db.UUID, db.ForeignKey('user.id'), nullable=False)
    time_created = db.Column(db.DateTime, default=lambda: datetime.now().isoformat())
    time_updated = db.Column(db.DateTime, default=lambda: datetime.now().isoformat(), onupdate=lambda: datetime.now().isoformat())
    group_name = db.Column(db.String(256), nullable=False)

    # Relationships
    # cards = db.relationship('Card', backref='group', lazy=True)
    cards = db.relationship('Card', backref='group', lazy='dynamic', cascade='all, delete-orphan')

class Card(db.Model):
    __tablename__ = 'card'
    card_id = db.Column(db.UUID, primary_key=True, default=uuid.uuid4)
    question = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.Text, nullable=False)
    # incorrect_answer = db.Column(db.Text)
    group_id = db.Column(db.UUID, db.ForeignKey('group.group_id'), nullable=False)
    creator_id = db.Column(db.UUID, db.ForeignKey('user.id'), nullable=False)
    time_created = db.Column(db.DateTime, default=lambda: datetime.now().isoformat())
    time_updated = db.Column(db.DateTime, default=lambda: datetime.now().isoformat(), onupdate=lambda: datetime.now().isoformat())
    updated_by_id = db.Column(db.UUID, db.ForeignKey('user.id'))

    # Relationships
    updated_by = db.relationship('User', foreign_keys=[updated_by_id], backref='cards_updated')
    user_data = db.relationship('UserCardData', backref='card', lazy='dynamic')

    # Property to generate incorrect_answer dynamically
    @property
    def incorrect_answer(self):
        try:
            return get_incorrect_answer(self.question, self.correct_answer)
        except Exception as e:
            return ""

class UserCardData(db.Model):
    __tablename__ = 'user_card_data'
    user_id = db.Column(db.UUID, db.ForeignKey('user.id'), primary_key=True, default=uuid.uuid4)
    card_id = db.Column(db.UUID, db.ForeignKey('card.card_id'), primary_key=True)
    times_answered = db.Column(db.UUID, default=0)
    times_answered_incorrectly = db.Column(db.UUID, default=0)
    last_seen = db.Column(db.DateTime)

class SheetSyncJob(db.Model):
    __tablename__ = 'sheet_sync_job'

    job_id = db.Column(db.UUID, primary_key=True, default=uuid.uuid4)
    group_id = db.Column(db.UUID, db.ForeignKey('group.group_id'), nullable=False)
    creator_id = db.Column(db.UUID, db.ForeignKey('user.id'), nullable=False)

    sheet_id = db.Column(db.Text, nullable=False)
    sheet_range = db.Column(db.Text, nullable=False)

    cron_string = db.Column(db.Text, nullable=True)

    time_created = db.Column(db.DateTime, default=lambda: datetime.now().isoformat())
