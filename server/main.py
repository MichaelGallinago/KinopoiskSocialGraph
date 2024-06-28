from database import Database
from server import parser_pool

if __name__ == '__main__':
    # pool = parser_pool.ParserPool()
    # print(pool.get_quota())
    database = Database()
    graph = database.get_person_graph(513, 3, 5, 10)
    print(len(graph))
    database.close()
