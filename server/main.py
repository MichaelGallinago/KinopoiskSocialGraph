﻿import socket

from database import Database
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from email_validator import validate_email, EmailNotValidError
import json

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

    if not data or not all(k in data for k in required_keys):
        return jsonify({"error": "Invalid input"}), 400

    graph = db.get_person_graph(data['personId'], 1, 5, 3, 40)

    return Response(stream_with_context(generate_graph_stream(graph)), mimetype='application/json')


def generate_graph_stream(graph):
    yield '{"nodes":['
    first_item = True
    for node in graph['nodes']:
        if not first_item:
            yield ','
        yield json.dumps(node)
        first_item = False
    yield '],"edges":['
    first_item = True
    for edge in graph['edges']:
        if not first_item:
            yield ','
        yield json.dumps(edge)
        first_item = False
    yield ']}'


if __name__ == '__main__':
    app.run(debug=True)
