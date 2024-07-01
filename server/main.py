import socket

from database import Database
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from email_validator import validate_email, EmailNotValidError

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/ksg"
mongo = PyMongo(app)
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


@app.route('/make_graph', methods=['POST'])
def make_graph():
    data = request.json
    required_keys = ['person_id', 'steps', 'staff_limit', 'film_limit']

    if not data or not all(key in data and isinstance(data[key], int) for key in required_keys):
        return jsonify({"error": "Invalid input"}), 400

    return jsonify({"message": "hello"})


if __name__ == '__main__':
    app.run(debug=True)
    # database = Database()
    # 513, 110, 6141, 34549
    # graph = database.get_person_graph(34549, 3, 5, 10)
    # print(len(graph))
    # database.close()


#добавила диана, надеюсь ничего не сломала

#обработка запроса на изменение токенов для пользователя и возврат JSON ответа
@app.route('/change_tokens', methods=['POST'])
def change_tokens():
    data = request.json
    if not data or not all(k in data for k in ("username", "new_tokens")):
        return jsonify({"error": "Invalid input"}), 400

    username = data['username']
    new_tokens = data['new_tokens']

    if not username or not new_tokens:
        return jsonify({"error": "Fields cannot be empty"}), 400

    user = mongo.db.users.find_one({"username": username})
    if not user:
        return jsonify({"error": "User not found"}), 404

    mongo.db.users.update_one({"username": username}, {"$set": {"tokens": new_tokens}})

    return jsonify({"message": "Tokens updated successfully"}), 200

### получение инфы о кол-ве новых пользователей за последние 7 дней (JSON)

from datetime import datetime, timedelta
@app.route('/get_new_users_stats', methods=['GET'])
def get_new_users_stats():
    stats = []
    today = datetime.utcnow().date()
    for i in range(7):
        date = today - timedelta(days=i)
        new_users_on_date = mongo.db.users.count_documents({"date_created": {"$gte": date, "$lt": date + timedelta(days=1)}})
        stats.append({"date": str(date), "new_users": new_users_on_date})

    return jsonify(stats), 200
### получение инфы о посещаемости страницы за последние 7 дней (JSON)
@app.route('/get_visits_stats', methods=['GET'])
def get_visits_stats():
    stats = []
    today = datetime.utcnow().date()
    for i in range(7):
        date = today - timedelta(days=i)
        start_time = datetime.combine(date, datetime.min.time())
        end_time = datetime.combine(date, datetime.max.time())
        visits_on_date = mongo.db.visits.count_documents({"timestamp": {"$gte": start_time, "$lt": end_time}})
        stats.append({"date": str(date), "visits": visits_on_date})

    return jsonify(stats), 200
###
@app.route('/get_db_size', methods=['GET'])
def get_db_size():
    db_size = mongo.db.command("collstats", "users")["size"]
    return jsonify({"db_size": db_size}), 200

