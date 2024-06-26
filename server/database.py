﻿import threading
import time

from pymongo import MongoClient
from parser_pool import ParserPool
import multiprocessing

num_cpus = multiprocessing.cpu_count()


class Database:
    def __init__(self):
        self.__client = MongoClient('mongodb://localhost:27017/')
        self.__db = self.__client['ksg']
        self.__pool = ParserPool()
        self.__init_collections()

    def close(self):
        self.__client.close()

    @staticmethod
    def _worker(parser, lock, shared_num):
        files = []
        for i in range(parser.get_quota()):
            start_time = time.time()
            with lock:
                film_id = shared_num.value
                shared_num.value += 1

            status, data = parser.get_data(film_id)

            if data is not None:
                files.append(data)

            if status == 402:
                return files

            time.sleep(max(0.0, 0.05 * num_cpus - time.time() + start_time))

        return files

    def get_person_graph(self, root_person_id, steps=1):
        person_ids = set()
        new_person_ids = {root_person_id}

        for i in range(steps):
            search_person_ids = new_person_ids.copy()
            new_person_ids = set()

            for person_id in search_person_ids:
                films = self.get_films(person_id)
                film_ids = [film['filmId'] for film in films]
                staff_groups = Database.__find_files(
                    'kinopoiskId', film_ids, self.__staff, self.__pool.get_staff, Database.__append_staff)
                persons = self.get_persons_from_staff(staff_groups)
                new_person_ids.update([person['personId'] for person in persons])

            new_person_ids.difference_update(person_ids)
            person_ids.update(new_person_ids)

        return person_ids

    def get_person(self, person_id):
        document = self.__persons.find_one({"personId": person_id})

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

    def get_persons_from_staff(self, staff_groups):
        if staff_groups is None:
            # TODO: exception
            return

        person_ids = [person['personId'] for person in (group for group in staff_groups['staff'])]
        return Database.__find_files(
            'personId', person_ids, self.__persons, self.__pool.get_person, Database.__append_document)

    def get_films(self, person_id):
        person_document = self.get_person(person_id)

        if person_document is None:
            # TODO: exception
            return

        film_ids = [film['filmId'] for film in person_document['films']]
        return Database.__find_files(
            'kinopoiskId', film_ids, self.__films, self.__pool.get_film, Database.__append_document)

    @staticmethod
    def __find_files(key, ids, collection, get_method, append_method):
        found_files = collection.find({key: {'$in': ids}})
        found_files_ids = [file[key] for file in found_files]
        missing_ids = [index for index in found_files_ids if index not in ids]

        if len(missing_ids) <= 0:
            return found_files

        new_staff = Database.__get_files_multithread(get_method, missing_ids, append_method)
        collection.insert_many(new_staff, ordered=False)
        found_files = collection.find({key: {'$in': ids}})
        return found_files

    @staticmethod
    def __get_files_multithread(get_method, search_ids, append_method):
        threads = []
        files = []

        def thread_worker(index):
            status, document = get_method(index)
            if status == 200:
                append_method(files, document, index)
            # TODO: exceptions

        for search_id in search_ids:
            thread = threading.Thread(target=thread_worker, args=(search_id,))
            threads.append(thread)
            thread.start()
            time.sleep(0.05)

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

    def _check_status(status_code):
        error_code = f'Error {status_code}: '

        match status_code:
            case 200:
                print('')
            case 401:
                print(error_code + 'Пустой или неправильный токен')
            case 402:
                print(error_code + 'Превышен лимит запросов(или дневной, или общий)')
            case 404:
                print(error_code + 'Фильм не найден')
            case _:
                print(error_code + 'Неизвестная ошибка')
