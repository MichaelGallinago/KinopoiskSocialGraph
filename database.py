from pymongo import MongoClient
from parser import StaffParser
from parser import FilmParser
from parser import Status
import multiprocessing


class Database:

    def __init__(self, keys_file_path):
        self.client = MongoClient('mongodb://localhost:27017/')
        self.db = self.client['ksg']

        self.__init_collections()

        with open(keys_file_path, 'r') as file:
            self.api_keys = file.readlines()

    def __del__(self):
        self.client.close()

    def add_films(self):
        self.__add_things('films_id', FilmParser, self.films)

    def add_staff(self):
        self.__add_things('staff_id', StaffParser, self.staff)

    @staticmethod
    def __worker(parser, shared_num, lock, collection):
        while True:
            with lock:
                film_id = shared_num.value
                shared_num.value += 1

            status, data = parser.get_data(film_id)
            if status == Status.FINISH:
                return

            if data is not None:
                try:
                    if isinstance(data, list):
                        collection.insert_many(data, ordered=False)
                    else:
                        collection.insert_one(data)
                except Exception as e:
                    print(f"Ошибка вставки документа для id={film_id}: {e}")

    @staticmethod
    def __run_parallel_processing(parsers, shared_num, lock, collection):
        with multiprocessing.Pool(processes=len(parsers)) as pool:
            tasks = [(parser, shared_num, lock, collection) for parser in parsers]
            results = pool.starmap(Database.__worker, tasks)
        return results

    def __add_things(self, id_name, parser_type, collection):
        progress = self.progress.find_one()
        print('Добавление начато на индексе: ' + progress[id_name])
        progress[id_name] = self.__run_processing(progress[id_name], parser_type, collection)
        print('Добавление завершено на индексе: ' + progress[id_name])
        self.progress.update_one({}, progress)

    def __init_collections(self):
        collection_names = self.db.list_collection_names()

        films_exists = 'films' in collection_names
        self.films = self.db['films']
        if not films_exists:
            self.films.create_index('kinopoiskId', unique=True)

        staff_exists = 'staff' in collection_names
        self.staff = self.db['staff']
        if not staff_exists:
            self.staff.create_index('staffId', unique=True)

        progress_exists = 'progress' in collection_names
        self.progress = self.db['progress']
        if not progress_exists:
            self.progress.insert_one({
                'films_id': 298,
                'staff_id': 298
            })

    def __run_processing(self, initial_num, parser_type, collection):
        shared_num = multiprocessing.Value('i', initial_num)
        lock = multiprocessing.Lock()

        parsers = [parser_type(key) for key in self.api_keys]
        Database.__run_parallel_processing(parsers, shared_num, lock, collection)

        return shared_num.value
