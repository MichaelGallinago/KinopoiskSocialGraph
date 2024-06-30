import threading
import time
from collections import defaultdict

from parser_pool import ParserPool

is_limit_reached = False


class Database:

    def __init__(self, db):
        self.__db = db
        self.__pool = ParserPool()
        self.__init_collections()

    def get_person_graph(self, root_person_id, steps=3, staff_limit=5, film_limit=7):
        ids = self.get_person_graph_persons(root_person_id, steps, staff_limit, film_limit)
        cursor = self.__persons.find({'personId': {'$in': list(ids)}})

        # Обработка данных
        nodes = []
        edges = []
        actor_index = {}
        film_to_actors = defaultdict(list)

        # Создание узлов и построение карты актёров
        for doc in cursor:
            person_id = doc["personId"]
            name = doc["nameRu"] if doc["nameRu"] else doc["nameEn"]
            if person_id not in actor_index:
                nodes.append({"id": person_id, "name": name})
                actor_index[person_id] = name

            for film in doc["films"]:
                film_id = film["filmId"]
                film_name = film["nameRu"] if film["nameRu"] else film["nameEn"]
                film_to_actors[film_id].append((person_id, film_name))

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

        # Преобразование связей в нужный формат
        for source, targets in edges_dict.items():
            for target, movies_set in targets.items():
                movies = list(movies_set)
                edges.append({"source": source, "target": target, "movie": [len(movies)] + movies})

        # Формирование итогового JSON
        return {"nodes": nodes, "edges": edges}

    def get_person_graph_persons(self, root_person_id, steps, staff_limit, film_limit):
        person_ids = set()
        new_person_ids = {root_person_id}

        for i in range(steps):
            search_person_ids = new_person_ids.copy()
            new_person_ids = set()

            film_ids = set()
            for person_id in search_person_ids:
                film_ids.update(self.get_film_ids(person_id)[:film_limit])

            cursor = Database.__find_files(
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

        persons = Database.__find_files(
            'personId', list(staff_ids), self.__persons, self.__pool.get_person, Database.__append_document)
        return [person['personId'] for person in persons]

    def get_films(self, film_ids):
        return Database.__find_files(
            'kinopoiskId', film_ids, self.__films, self.__pool.get_film, Database.__append_document)

    def get_person(self, person_id):
        document = self.__persons.find_one({"personId": int(person_id)})

        if document is not None:
            return document

        status, document = self.__pool.get_person(person_id)
        if status == 200 and document is not None:
            self.__persons.insert_one(document)
        # TODO: exception

    def get_staff(self, film_id):
        document = self.__staff.find_one({"filmId": film_id})

        if document is not None:
            return document

        status, staff = self.__pool.get_staff(film_id)
        if status == 200 and staff is not None:
            document = {"filmId": film_id, "staff": staff}
            self.__staff.insert_one(document)
            return document
        # TODO: exception

    def get_film_ids(self, person_id):
        person_document = self.get_person(person_id)
        if person_document is None:
            # TODO: exception
            return None

        return list(set([film['filmId'] for film in person_document['films']]))

    @staticmethod
    def __find_files(key, ids, collection, get_method, append_method):
        ids_set = list(set(ids))
        found_files = collection.find({key: {'$in': ids_set}})
        found_files_ids = [file[key] for file in found_files]
        missing_ids = list(set([index for index in ids_set if index not in found_files_ids]))

        if len(missing_ids) > 0 and not is_limit_reached:
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
