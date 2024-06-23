from database import Database

if __name__ == '__main__':
    database = Database('X-API-KEY.txt')

    database.add_films()
