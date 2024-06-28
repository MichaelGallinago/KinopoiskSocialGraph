from database import Database
from server import parser_pool

if __name__ == '__main__':
    # pool = parser_pool.ParserPool()
    # print(pool.get_quota())
    database = Database()
    print(database.get_person_graph(513, 2, 5, 20))
    database.close()
