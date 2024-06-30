﻿import socket

from database import Database
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from email_validator import validate_email, EmailNotValidError

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/ksg"
mongo = PyMongo(app)
db = Database(mongo.db)
CORS(app)


@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data or not all(k in data for k in ("login", "email", "password")):
        return jsonify({"error": "Invalid input"}), 400

    login = data['login']
    email = data['email']
    password = data['password']

    if not login or not email or not password:
        return jsonify({"error": "Fields cannot be empty"}), 400

    try:
        validate_email(email)
    except EmailNotValidError:
        return jsonify({"error": "Invalid email"}), 400

    if mongo.db.users.find_one({"username": login}) or mongo.db.users.find_one({"email": email}):
        return jsonify({"error": "Username or email already exists"}), 400

    hashed_password = generate_password_hash(password)
    mongo.db.users.insert_one({
        "login": login,
        "email": email,
        "password": hashed_password
    })

    return jsonify({"message": "User registered successfully"}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not all(k in data for k in ("login", "password")):
        return jsonify({"error": "Invalid input"}), 400

    username = data['login']
    password = data['password']

    if not username or not password:
        return jsonify({"error": "Fields cannot be empty"}), 400

    user = mongo.db.users.find_one({"login": username})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid login or password"}), 400

    return jsonify({"message": "Login successful"}), 200


@app.route('/make_graph', methods=['POST'])
def make_graph():
    data = request.json
    # required_keys = ['personId', 'steps', 'staffLimit', 'filmLimit']
    required_keys = ['personId']
    print(data)
    if not data or not all(k in data for k in required_keys):
        return jsonify({"error": "Invalid input"}), 400
    graph = db.get_person_graph(data['personId'], 3, 3, 2)
    print(graph)
    return jsonify(graph)


if __name__ == '__main__':
    app.run(debug=True)
