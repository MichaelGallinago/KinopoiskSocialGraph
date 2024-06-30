from database import Database

if __name__ == '__main__':
    database = Database()
    # 513, 110, 6141, 34549
    graph = database.get_person_graph(34549, 3, 5, 7)
    print(len(graph))
    database.close()
