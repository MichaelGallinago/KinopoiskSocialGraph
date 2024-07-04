import socket

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

REQUIRED_KEYS = ['login', 'personId', 'depth', 'peopleLimit', 'movieLimitForPerson', 'movieMinForEdge', 'ageLeft',
                 'ageRight', 'isAlive', 'heightLeft', 'heightRight', 'awards', 'career', 'gender', 'countOfMovies']


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

    return db.register_user(login, email, password)


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not all(k in data for k in ("login", "password")):
        return jsonify({"error": "Invalid input"}), 400

    login = data['login']
    password = data['password']

    if not login or not password:
        return jsonify({"error": "Fields cannot be empty"}), 400

    user = db.get_user(login)
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid login or password"}), 400

    return jsonify({"message": "Login successful"}), 200


@app.route('/get_tokens', methods=['POST'])
def get_tokens():
    data = request.json

    if not data or not all(k in data for k in ("login",)):
        return jsonify({"error": "Invalid input"}), 400

    login = data["tokens"]
    if not login:
        return jsonify({"error": "Login cannot be empty"}), 400

    user = db.get_user(login)
    jsonify({"tokens": user["tokens"]}), 200


@app.route('/make_graph', methods=['POST'])
def make_graph():
    data = request.json

    if not data or not all(k in data for k in REQUIRED_KEYS):
        return jsonify({"error": "Invalid input"}), 400

    graph = db.get_person_graph(data)
    if db.decrement_token(data["login"]):
        return Response(stream_with_context(generate_graph_stream(graph)), mimetype='application/json')

    return jsonify({"error": "Not enough tokens"}), 400


@app.route('/get_person', methods=['POST'])
def get_person():
    data = request.json

    if not data or not all(k in data for k in ("personId",)):
        return jsonify({"error": "Invalid input"}), 400

    person_id = data['personId']

    if not person_id:
        return jsonify({"error": "Fields cannot be empty"}), 400

    file = db.get_person_main_info(int(person_id))
    return jsonify(file), 200


@app.route('/set_tokens', methods=['POST'])
def set_tokens():
    data = request.json

    if not data or not all(k in data for k in ("login", "password", "value", "target_login")):
        return jsonify({"error": "Invalid input"}), 400

    if check_password_hash(db.get_user(data["login"])["password"], data["password"]):
        db.set_token(data["target_login"], int(data["value"]))

    return jsonify({"error": "Admin passwords do not match"}), 400


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
