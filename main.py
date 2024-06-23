from database import Database

if __name__ == '__main__':
    database = Database('X-API-KEY.txt')

    database.close()
    # database.add_films()
