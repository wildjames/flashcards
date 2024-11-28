from flask import Flask
from database.db_interface import db
import os

if os.path.exists("./.env"):
    from dotenv import load_dotenv
    load_dotenv()

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"
