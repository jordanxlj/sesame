from pymongo import MongoClient, ASCENDING, DESCENDING

class InvalidDBException(Exception):
    pass

class CollectionIsExistException(Exception):
    def __init__(self, msg):
        print msg
    pass

class CollectionNotExistException(Exception):
    pass

class DB(object):
    def __init__(self, db, host='127.0.0.1', port=27017):
        self.__conn = MongoClient(host, port)
        self.__db = self.__conn[db]

    def get_collections(self):
        if self.__db:
            return self.__db.collection_names()
        return None

    def get_collection(self, collection):
        if self.__db:
            if collection in self.__db.collection_names():
                return self.__db[collection]
        return None

    def create_collection(self, collection):
        if not self.__db:
            raise InvalidDBException

        try:
            return self.__db.create_collection(collection)
        except:
            raise CollectionIsExistException('collection(%s) is already exists' % collection)

    def drop_collection(self, collection):
        if not self.__db:
            raise InvalidDBException
        try:
            self.__db.drop_collection(collection)
        except:
            raise CollectionNotExistException()

if __name__ == "__main__":
    db = DB('stock')
    print db.get_collections()
    print db.get_collection("hello")
    try:
        db.create_collection("hello")
    except:
        pass
    print db.get_collections()
    db.drop_collection("hello")
    print db.get_collections()
