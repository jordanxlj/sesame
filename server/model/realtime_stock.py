import codecs
import sys
import time
from datetime import date
from pymongo import ASCENDING, DESCENDING

from current_query import StockCurrentQuery  
from util.db import *

def get_collection(day):
    db = DB('stock')
    collection = db.get_collection(day)
    if collection:
        collection.drop()
    collection = db.create_collection(day)
    collection.create_index([("code", ASCENDING)])
    return collection

def insert_into_db(collection, current_info):
    collection.insert(current_info)

def get_today_data():
    today = date.isoformat(date.today())
    query = StockCurrentQuery()
    collection = get_collection(today)

    code_file = open("../config/code.txt", "r")

    #out_file_name = "../data/%s_data.txt" % today
    #out_file = codecs.open(out_file_name, "wb", encoding='utf-8')  
    #out_file.write("id\tname\tprice\tupdown\tturnover\tvalue\n")

    for line in code_file.readlines():
        code = line.strip()
        if len(code):
            current_info = {}
            query.get_basic_data(code, current_info)
            query.get_flow_data(code, current_info)
            price = current_info['close_price']
            #turnover = current_info['turnover']
            if (price != '0.00' and price != '0.000'):
                insert_into_db(collection, current_info)
                #out_file.write("%s\t%s\t%s\t%s%%\t%s%%\t%s\n" %(code, name, price, updown, turnover, value))

    code_file.close()
    #out_file.close()

def get_history_data(day):
    collection = get_collection(day)
    data_file_name = "data/%s_data.txt" % day
    data_file = codecs.open(data_file_name, "r", 'utf-8')

    for line in data_file.readlines():
        data = line.strip().split('\t')
        code = data[0]
        name = data[1]
        price = data[2]
        updown = data[3]
        turnover = data[4]
        value = data[5]
        if code != "id":
            insert_into_db(collection, code, name, price, updown.strip('%'), turnover.strip('%'), value)

def main(argv):
    while True:
        try:
            if len(argv) <= 1:
                get_today_data()
            else:
                day = argv[1]
                get_history_data(day)
            break
        except e:
            print e
            time.sleep(10)
            print "retry."
    print "finished."

if __name__ == "__main__":
    main(sys.argv)

