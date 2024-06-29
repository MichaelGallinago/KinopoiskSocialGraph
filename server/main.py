from database import Database
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from email_validator import validate_email, EmailNotValidError

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/ksg"
mongo = PyMongo(app)


@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data or not all(k in data for k in ("username", "email", "password")):
        return jsonify({"error": "Invalid input"}), 400

    username = data['username']
    email = data['email']
    password = data['password']

    if not username or not email or not password:
        return jsonify({"error": "Fields cannot be empty"}), 400

    try:
        validate_email(email)
    except EmailNotValidError:
        return jsonify({"error": "Invalid email"}), 400

    if mongo.db.users.find_one({"username": username}) or mongo.db.users.find_one({"email": email}):
        return jsonify({"error": "Username or email already exists"}), 400

    hashed_password = generate_password_hash(password)
    mongo.db.users.insert_one({
        "username": username,
        "email": email,
        "password": hashed_password
    })

    return jsonify({"message": "User registered successfully"}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not all(k in data for k in ("username", "password")):
        return jsonify({"error": "Invalid input"}), 400

    username = data['username']
    password = data['password']

    if not username or not password:
        return jsonify({"error": "Fields cannot be empty"}), 400

    user = mongo.db.users.find_one({"username": username})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid username or password"}), 400

    return jsonify({"message": "Login successful"}), 200


if __name__ == '__main__':
    app.run(debug=True)
    # database = Database()
    # 513, 110, 6141, 34549
    # graph = database.get_person_graph(34549, 3, 5, 10)
    # print(len(graph))
    # database.close()
