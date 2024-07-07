import datetime
import threading
import time
from collections import defaultdict, deque

from flask import jsonify
from werkzeug.security import generate_password_hash

from parser_pool import ParserPool

is_limit_reached = False


class Database:

    def __init__(self, db):
        self.__db = db
        self.__pool = ParserPool()
        self.__init_collections()

    def get_person_graph(self, data):
        root_person_id = int(data['personId'])
        steps = int(data['depth'])
        staff_limit = int(data['peopleLimit'])
        film_limit = int(data['movieLimitForPerson'])
        min_edges = int(data['movieMinForEdge'])

        ids = self.get_person_graph_persons(root_person_id, steps, staff_limit, film_limit)

        cursor = self.__persons.find(Database.__get_filter_from_data(data, list(ids))).limit(1000)
        root_person = self.__persons.find_one({"personId": root_person_id})

        nodes = []
        actor_index = {}
        film_to_actors = defaultdict(list)

        # Создание узлов и построение графа актёров
        self.__add_node(root_person, actor_index, nodes, film_to_actors)
        for doc in cursor:
            self.__add_node(doc, actor_index, nodes, film_to_actors)

        # Построение связей
        edges_dict = defaultdict(lambda: defaultdict(set))

        for film_id, actors in film_to_actors.items():
            for i in range(len(actors)):
                for j in range(i + 1, len(actors)):
                    source = actors[i][0]
                    target = actors[j][0]
                    film_name = actors[i][1]

                    edges_dict[source][target].add(film_name)
                    edges_dict[target][source].add(film_name)

        person_edges = set()
        edges = []

        # Преобразование связей в нужный формат
        for source, targets in edges_dict.items():
            for target, movies_set in targets.items():
                movies = list(movies_set)
                count = len(movies)
                if count >= min_edges:
                    person_edges.add(source)
                    person_edges.add(target)
                    edges.append({"source": source, "target": target, "movie": [count] + movies})

        # Найти все узлы, которые связаны с корневым узлом
        def bfs_connected_component(graph, root):
            visited = set()
            queue = deque([root])
            while queue:
                node = queue.popleft()
                if node not in visited:
                    visited.add(node)
                    neighbors = graph[node] - visited
                    queue.extend(neighbors)
            return visited

        # Построить граф в виде словаря для обхода
        graph = defaultdict(set)
        for edge in edges:
            source = edge['source']
            target = edge['target']
            graph[source].add(target)
            graph[target].add(source)

        # Найти все узлы, которые связаны с корневым узлом
        connected_nodes = bfs_connected_component(graph, root_person_id)

        nodes = [person for person in nodes if (person["id"] in connected_nodes)]
        edges = [edge for edge in edges if edge["source"] in connected_nodes and edge["target"] in connected_nodes]
        return {"nodes": nodes, "edges": edges}

    def __add_node(self, doc, actor_index, nodes, film_to_actors):
        person_id = doc["personId"]
        name = doc["nameRu"] if doc["nameRu"] else doc["nameEn"]
        if person_id not in actor_index:
            nodes.append({"id": person_id, "name": name})
            actor_index[person_id] = name

            film_ids = [film["filmId"] for film in doc["films"]]
            cursor = self.__films.find({
                "kinopoiskId": {"$in": film_ids},
                "type": "FILM"
            })

            for film in cursor:
                film_id = film["kinopoiskId"]
                film_name = film["nameRu"] if film["nameRu"] else film["nameEn"]
                film_to_actors[film_id].append((person_id, film_name))

    @staticmethod
    def __get_filter_from_data(data, ids):
        age_min = data.get('ageLeft')
        age_max = data.get('ageRight')
        is_alive = data.get('isAlive')
        has_awards = data.get('awards')
        growth_min = data.get('heightLeft')
        growth_max = data.get('heightRight')
        sex = data.get('gender')
        films_count = data.get('countOfMovies')
        profession = data.get('career')

        query = {}

        if ids:
            query['personId'] = {'$in': ids}

        if age_min is not None and age_max is not None:
            query['age'] = {'$gte': int(age_min), '$lte': int(age_max)}
        elif age_min is not None:
            query['age'] = {'$gte': int(age_min)}
        elif age_max is not None:
            query['age'] = {'$lte': int(age_max)}

        if is_alive is not None and is_alive != 'Все':
            if is_alive == 'Да':
                query['death'] = {'$eq': None}
            else:
                query['death'] = {'$ne': None}

        if has_awards is not None:
            query['hasAwards'] = {'$gte': int(has_awards)}

        if growth_min is not None and growth_max is not None:
            query['growth'] = {'$gte': int(growth_min), '$lte': int(growth_max)}
        elif growth_min is not None:
            query['growth'] = {'$gte': int(growth_min)}
        elif growth_max is not None:
            query['growth'] = {'$lte': int(growth_max)}

        match sex:
            case 'Мужской':
                query['sex'] = 'MALE'
            case 'Женский':
                query['sex'] = 'FEMALE'

        if films_count is not None and int(films_count) > 1:
            query['films'] = {'$exists': True}
            query['$expr'] = {'$gte': [{'$size': '$films'}, int(films_count)]}

        if profession and profession != 'Все':
            if profession == 'Актер':
                query['profession'] = {'$regex': 'Актер|Актриса'}
            else:
                query['profession'] = {'$regex': profession}

        return query

    def get_person_graph_persons(self, root_person_id, steps, staff_limit, film_limit):
        person_ids = set()
        new_person_ids = {root_person_id}

        for i in range(steps):
            search_person_ids = new_person_ids.copy()
            new_person_ids = set()

            film_ids = set()
            for person_id in search_person_ids:
                film_ids.update(self.get_film_ids(person_id)[:film_limit])

            cursor = self.__find_files(
                'kinopoiskId', film_ids, self.__staff, self.__pool.get_staff, Database.__append_staff)

            new_person_ids.update(self.add_persons_ids_from_staff(cursor, staff_limit))

            new_person_ids.difference_update(person_ids)
            person_ids.update(new_person_ids)

        return person_ids

    def add_persons_ids_from_staff(self, staff_groups_cursors, staff_limit):
        if staff_groups_cursors is None:
            # TODO: exception
            return

        groups = [group['staff'] for group in staff_groups_cursors]

        staff_ids = set()
        for group in groups:
            staff_ids.update([person["staffId"] for person in group][:staff_limit])

        persons = self.__find_files(
            'personId', list(staff_ids), self.__persons, self.__pool.get_person, Database.__append_document)
        return [person['personId'] for person in persons]

    def get_films(self, film_ids):
        return self.__find_files(
            'kinopoiskId', film_ids, self.__films, self.__pool.get_film, Database.__append_document)

    def get_person(self, person_id):
        document = self.__persons.find_one({"personId": int(person_id)})

        if document is not None:
            return document

        self.__pool.update()
        status, document = self.__pool.get_person(person_id)
        if status == 200 and document is not None:
            self.__persons.insert_one(document)
        # TODO: exception

    def get_person_main_info(self, person_id):
        file = self.get_person(person_id)
        del file['_id']
        del file['facts']

        file['films'] = len(file['films'])
        file['spouses'] = len(file['spouses'])
        return file

    def get_staff(self, film_id):
        document = self.__staff.find_one({"filmId": film_id})

        if document is not None:
            return document

        self.__pool.update()
        status1, staff = self.__pool.get_staff(film_id)
        status2, film = self.__pool.get_film(film_id)
        if status1 == 200 and status2 == 200 and staff is not None and film is not None:
            document = {"filmId": film_id, "staff": staff}
            self.__staff.insert_one(document)
            self.__films.insert_one(film)
            return document
        # TODO: exception

    def get_film_ids(self, person_id):
        person_document = self.get_person(person_id)
        if person_document is None:
            # TODO: exception
            return None

        return list(set([film['filmId'] for film in person_document['films']]))

    def __find_files(self, key, ids, collection, get_method, append_method):
        ids_set = list(set(ids))
        found_files = collection.find({key: {'$in': ids_set}})
        found_files_ids = [file[key] for file in found_files]
        missing_ids = list(set([index for index in ids_set if index not in found_files_ids]))

        if len(missing_ids) > 0 and not is_limit_reached:
            self.__pool.update()
            new_files = Database.__get_files_multithread(get_method, missing_ids, append_method)
            Database.__insert_files(new_files, collection)

        return collection.find({key: {'$in': ids_set}})

    @staticmethod
    def __insert_files(file, collection):
        try:
            if isinstance(file, list):
                collection.insert_many(file, ordered=False)
            else:
                collection.insert_one(file)
        except Exception as e:
            print(f"Ошибка вставки документа: {file}, {collection}, {e}")

    @staticmethod
    def __get_files_multithread(get_method, search_ids, append_method):
        global is_limit_reached

        threads = []
        files = []

        if is_limit_reached:
            return files

        def thread_worker(index):
            if is_limit_reached:
                return

            status, document = get_method(index)
            if status == 200:
                append_method(files, document, index)
            else:
                Database._check_status(status, index)
            # TODO: exceptions

        for search_id in search_ids:
            if is_limit_reached:
                break
            thread = threading.Thread(target=thread_worker, args=(search_id,))
            threads.append(thread)
            thread.start()
            time.sleep(0.055)

        for thread in threads:
            thread.join()

        return files

    @staticmethod
    def __append_document(files, document, index):
        files.append(document)

    @staticmethod
    def __append_staff(files, document, index):
        files.append({"kinopoiskId": index, "staff": document})

    def __init_collections(self):
        collection_names = self.__db.list_collection_names()

        films_exists = 'films' in collection_names
        self.__films = self.__db['films']
        if not films_exists:
            self.__films.create_index('kinopoiskId', unique=True)

        staff_exists = 'staff' in collection_names
        self.__staff = self.__db['staff']
        if not staff_exists:
            self.__staff.create_index('kinopoiskId', unique=True)

        persons_exists = 'persons' in collection_names
        self.__persons = self.__db['persons']
        if not persons_exists:
            self.__persons.create_index('personId', unique=True)

        progress_exists = 'progress' in collection_names
        self.__progress = self.__db['progress']
        if not progress_exists:
            self.__progress.insert_many([{'films_id': 298}, {'staff_id': 298}])

        users_exists = 'users' in collection_names
        self.__users = self.__db['users']
        if not users_exists:
            self.__users.create_index('login', unique=True)
            self.__users.create_index('email', unique=True)

        self.__registrations = self.__db['registrations']
        self.__logins = self.__db['logins']

    @staticmethod
    def _check_status(status_code, index):
        error_code = f'Error on id={index}: {status_code}: '

        match status_code:
            case 200:
                pass
            case 401:
                print(error_code + 'Пустой или неправильный токен')
            case 402:
                print(error_code + 'Превышен лимит запросов(или дневной, или общий)')
                global is_limit_reached
                is_limit_reached = True
            case 404:
                print(error_code + 'Фильм не найден')
            case _:
                print(error_code + 'Неизвестная ошибка')

    def update_films_by_staff(self):
        cursor = self.__staff.find()
        ids = [staff['kinopoiskId'] for staff in cursor]
        self.get_films(ids)

    def get_user(self, login):
        return self.__users.find_one({"login": login})

    def register_user(self, login, email, password):
        if self.__users.find_one({"login": login}) or self.__users.users.find_one({"email": email}):
            return jsonify({"error": "Login or email already exists"}), 400

        hashed_password = generate_password_hash(password)
        self.__users.insert_one({
            "login": login,
            "email": email,
            "password": hashed_password,
            "tokens": 10,
            "isAdmin": False
        })

        self.__registrations.insert_one({"login": login, "time": datetime.datetime.now()})
        self.login_user(login)

        return jsonify({"message": "User registered successfully"}), 201

    def login_user(self, login):
        self.__logins.insert_one({"login": login, "time": datetime.datetime.now()})

    def decrement_token(self, login):
        if self.get_user(login)['tokens'] <= 0:
            return False

        result = self.__users.update_one(
            {"login": login},
            {"$inc": {"tokens": -1}})
        return result.modified_count > 0

    def set_token(self, login, value):
        self.__users.update_one(
            {"login": login},
            {"set": {"tokens": value}})

    def get_statistics(self):
        return {
            "films": self.__films.count_documents({}),
            "persons": self.__persons.count_documents({}),
            "staff": self.__staff.count_documents({}),
            "users": self.__users.count_documents({}),
            "registrations": self.__registrations.count_documents({}),
            "logins": self.__logins.count_documents({})
        }

    def count_logins(self, start_time, interval_length):
        return {'counts': Database.__count_in_intervals(start_time, interval_length, self.__logins)}

    def count_registrations(self, start_time, interval_length):
        return {'counts': Database.__count_in_intervals(start_time, interval_length, self.__registrations)}

    @staticmethod
    def __count_in_intervals(start_time, interval_length, collection):
        end_time = datetime.datetime.now()
        counts = []

        current_start = start_time
        while current_start < end_time:
            current_end = current_start + interval_length
            count = collection.count_documents({
                "time": {
                    "$gte": current_start,
                    "$lt": current_end
                }
            })

            counts.append(count)
            current_start = current_end

        return counts

