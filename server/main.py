from database import Database

if __name__ == '__main__':
    database = Database()
    database.get_person(6141)
    database.close()
