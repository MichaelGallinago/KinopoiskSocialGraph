import requests
import time


class Parser:
    API_URL = 'https://kinopoiskapiunofficial.tech/api/'
    headers = {}

    def __init__(self, api_key):
        self.headers = {
            'X-API-KEY': api_key,
            'Content-Type': 'application/json'
        }

    def get_film(self, film_id):
        return self._send_request('v2.2/films/' + str(film_id))

    def get_staff(self, film_id):
        return self._send_request('v1/staff?filmId=' + str(film_id))

    def get_person(self, person_id):
        return self._send_request('v1/staff/' + str(person_id))

    def _send_request(self, endpoint):
        url = self.API_URL + endpoint
        while True:
            try:
                response = requests.get(url, headers=self.headers)
                status = response.status_code

                if status == 200:
                    return status, response.json()

                if status == 429:
                    print('Слишком много запросов. Общий лимит - 20 запросов в секунду')
                    time.sleep(1)
                    continue

                if status == 403:
                    print('403: ' + self.headers['X-API-KEY'])

                return status, None
            except requests.exceptions.Timeout:
                print("Превышено время ожидания: " + url)

    def get_quota(self):
        response = requests.get(self.API_URL + 'v1/api_keys/' + self.headers['X-API-KEY'], headers=self.headers)

        if response.status_code == 200:
            data = response.json()
            return max(data["dailyQuota"]["value"] - data["dailyQuota"]["used"], 0)
        else:
            return 0
