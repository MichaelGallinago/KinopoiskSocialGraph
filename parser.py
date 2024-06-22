import requests
from enum import Enum


class Status(Enum):
    NEXT = 1
    SKIP = 2
    REPEAT = 3
    FINISH = 4


def _get_status(status_code):
    error_code = f'Error {status_code}: '

    match status_code:
        case 200:
            return Status.NEXT
        case 401:
            print(error_code + 'Пустой или неправильный токен')
            return Status.SKIP
        case 402:
            print(error_code + 'Превышен лимит запросов(или дневной, или общий)')
            return Status.FINISH
        case 404:
            print(error_code + 'Фильм не найден')
            return Status.SKIP
        case 429:
            print(error_code + 'Слишком много запросов. Общий лимит - 20 запросов в секунду')
            return Status.REPEAT
        case _:
            print(error_code + 'Неизвестная ошибка')
            return Status.SKIP


class Parser:
    API_URL = 'https://kinopoiskapiunofficial.tech/api/'
    headers = {}

    def get_staff_data(self, film_id):
        return self.__send_request('v1/staff?filmId=' + str(film_id))

    def get_film_data(self, film_id):
        return self.__send_request('v2.2/films/' + str(film_id))

    def __send_request(self, endpoint):
        url = self.API_URL + endpoint
        while True:
            response = requests.get(url, headers=self.headers)
            status = _get_status(response)

            match status:
                case Status.NEXT:
                    return status, response.json()
                case Status.SKIP:
                    return status, None
                case Status.FINISH:
                    return status, None

    def __init__(self, api_key):
        self.headers = {
            'X-API-KEY': api_key,
            'Content-Type': 'application/json'
        }
