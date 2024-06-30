from pymongo import MongoClient
from database import Database

if __name__ == '__main__':
    client = MongoClient('mongodb://localhost:27017/')
    database = Database(client['ksg'])
    # 513, 110, 6141, 34549
    graph = database.get_person_graph_persons(513, 3, 5, 7)
    print(len(graph))
    client.close()
