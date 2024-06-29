from database import Database

if __name__ == '__main__':
    database = Database()
    # 513, 110, 6141, 34549
    graph = database.get_person_graph(513, 3, 5, 10)
    print(len(graph))
    database.close()
