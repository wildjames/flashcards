from flask import jsonify

from database.db_types import User

### DEV STUFF ###

# Get a list of all usernames
def get_usernames():
    users = User.query.all()
    usernames = [user.username for user in users]
    return jsonify(usernames), 200

