﻿from parser import Parser


class ParserPool:
    __parsers = None

    def __init__(self):
        with open('server/X-API-KEY.txt', 'r') as file:
            api_keys = [line.strip() for line in file.readlines()]

        if len(api_keys) <= 0:
            return

        self.__parsers = [Parser(key) for key in api_keys]
        self.__index = 0

    def get_film(self, film_id):
        return self.__get_response(film_id, Parser.get_film)

    def get_staff(self, film_id):
        return self.__get_response(film_id, Parser.get_staff)

    def get_person(self, person_id):
        return self.__get_response(person_id, Parser.get_person)

    def __get_response(self, index, method):
        if self.__parsers is None:
            return 402, None

        while True:
            status, file = method(self.__parsers[self.__index], index)

            if status == 402:
                self.__index += 1
                if self.__index < len(self.__parsers):
                    continue

            return status, file
