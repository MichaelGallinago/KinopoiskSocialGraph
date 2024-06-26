from database import Database

if __name__ == '__main__':
    database = Database()
    print(database.get_person_graph(513, 1))
    database.close()
