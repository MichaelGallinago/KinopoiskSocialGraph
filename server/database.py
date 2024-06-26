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

    def get_person(self, person_id):
        document = self.__persons.find_one({"personId": person_id})

        if document is None:
            print('wait')
            status, document = self.__pool.get_person(person_id)
            if status == 200 and document is not None:
                self.__persons.insert_one(document)

        print(document)

    @staticmethod
    def __insert_files(files, collection):
        for file in files:
            try:
                if isinstance(file, list):
                    collection.insert_many(file, ordered=False)
                else:
                    collection.insert_one(file)
            except Exception as e:
                print(f"Ошибка вставки документа: {e}")

    def __init_collections(self):
        collection_names = self.__db.list_collection_names()

        films_exists = 'films' in collection_names
        self.__films = self.__db['films']
        if not films_exists:
            self.__films.create_index('kinopoiskId', unique=True)

        staff_exists = 'staff' in collection_names
        self.__staff = self.__db['staff']
        if not staff_exists:
            self.__staff.create_index('staffId', unique=True)

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
