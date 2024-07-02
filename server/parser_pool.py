import threading
import time
import asyncio

from parser import Parser


class ParserPool:
    __parsers = None
    __is_updating = False

    def __init__(self):
        with open('server/X-API-KEY.txt', 'r') as file:
            self.__api_keys = [line.strip() for line in file.readlines()]

        self.__index = 0

    def get_film(self, film_id):
        return self.__get_response(film_id, Parser.get_film)

    def get_staff(self, film_id):
        return self.__get_response(film_id, Parser.get_staff)

    def get_person(self, person_id):
        return self.__get_response(person_id, Parser.get_person)

    def get_quota(self):
        quota = []
        for parser in self.__parsers:
            quota.append(parser.get_quota())
            time.sleep(0.5)
        return quota

    def update(self):
        if self.__parsers is not None:
            return

        parsers = [Parser(key) for key in self.__api_keys]
        ready_parsers = []
        threads = []

        def thread_worker(index):
            parser = parsers[index]
            if parser.get_quota() > 0:
                ready_parsers.append(parser)

        for parser_id in range(len(parsers)):
            print(parser_id)
            thread = threading.Thread(target=thread_worker, args=(parser_id,))
            threads.append(thread)
            thread.start()
            time.sleep(0.5)

        for thread in threads:
            thread.join()

        self.__parsers = ready_parsers

    def __get_response(self, index, method):
        while True:
            parser_index = self.__index
            status, file = method(self.__parsers[parser_index], index)

            if status == 402:
                if parser_index == self.__index:
                    self.__index += 1

                if self.__index < len(self.__parsers):
                    continue

            return status, file
