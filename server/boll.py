from datetime import datetime
import numpy
import sys

from db import *

def data_cmp(data1, data2):
    day1 = datetime.strptime(data1[0], '%Y-%m-%d')
    day2 = datetime.strptime(data2[0], '%Y-%m-%d')
    if day1 > day2:
        return 1
    elif day1 < day2:
        return -1
    else:
        return 0

def get_collection():
    db = DB('history_stock')
    collection = db.get_collection('history')
    return collection
    
class Boll(object):
    BOLL_N = 20
    def __init__(self, history_data):
        self.__history_data = history_data

    def get_stock_data(self, stock_code):
        data = list((k, v) for (k, v) in self.__history_data.iteritems() if k.startswith('2015'))
        data.sort(data_cmp)

        if len(data) < self.BOLL_N*2:
            return None

        result = []
        for k, v in data:
            result.append(v)
        return result

    def boll(self, price_list):
        pl_result = []
        mb_result = []
        up_result = []
        dn_result = []
        for i in range(0, len(price_list)-self.BOLL_N):
            data = price_list[i:i+self.BOLL_N]
            mean = numpy.mean(data)
            std = numpy.std(data)
            up = mean + 2*std 
            down = mean - 2*std

            pl_result.append(price_list[i+self.BOLL_N])
            mb_result.append(float('%0.3f' % mean))
            up_result.append(float('%0.3f' % up))
            dn_result.append(float('%0.3f' % down))
        return pl_result, mb_result, up_result, dn_result

def main(argv):
    if len(argv) <= 1:
        print "please input stock code"
        return

    code = argv[1]

    collection = get_collection()
    datas = collection.find({"code" : code})
    boll = Boll(datas[0])
    price_list = boll.get_stock_data(code)
    out_file_name = "data/boll_%s.txt" % code
    out_file = open(out_file_name, 'wb')
    out_file.write("mean, high, low\n")

    pl, mb, up, dn = boll.boll(price_list)
    out_file.write('current\t'+'\t'.join(str(i) for i in pl)+'\n')
    out_file.write('mean\t'+'\t'.join(str(i) for i in mb)+'\n')
    out_file.write('up\t'+'\t'.join(str(i) for i in up)+'\n')
    out_file.write('down\t'+'\t'.join(str(i) for i in dn)+'\n')

if __name__ == "__main__":
    main(sys.argv)

