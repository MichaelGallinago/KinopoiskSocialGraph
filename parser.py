import requests


class Parser:
    @staticmethod
    def parse(film_id):
        url = 'https://kinopoiskapiunofficial.tech/api/v1/staff?filmId=' + film_id

        headers = {
            'X-API-KEY': '67a32af1-68cc-4115-b279-1950a15cc090',
            'Content-Type': 'application/json'
        }

        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            data = response.json()
            print(data)
        else:
            print(f"Ошибка: {response.status_code}")

    @staticmethod
    def get_films(page):
        url = 'https://kinopoiskapiunofficial.tech/api/v2.2/films?order=RATING&type=FILM&ratingFrom=0&ratingTo=10&yearFrom=1000&yearTo=3000&page=' + page

        headers = {
            'X-API-KEY': '67a32af1-68cc-4115-b279-1950a15cc090',
            'Content-Type': 'application/json'
        }

        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            data = response.json()
            print(data)
        else:
            print(f"Ошибка: {response.status_code}")

    def __init__(self, value):
        self.get_films('1')
        # self.parse('952236')
