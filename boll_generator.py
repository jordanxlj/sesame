import matplotlib.pyplot as plot
import numpy
import sys

from boll import Boll
from history_collector import StockHistoryCollector

class BollGenerator(object):
    def __init__(self, code):
        self.__code = code
    
    def __collect_origin_data(self):
        history_collector = StockHistoryCollector()
        return history_collector.collect_history_data(self.__code)

    def __get_boll_data(self):
        datas = self.__collect_origin_data()
        boll = Boll(datas)
        price_list = boll.get_stock_data(self.__code)
        return boll.boll(price_list)

    def __draw_boll(self, pl, mb, up, dn):
        x = [v for v in range(0, len(pl))]
        plot.figure()

        plot.plot(x, pl, 'o', linewidth=3, color='blue', label='current', zorder=10) 
        plot.plot(x, mb, '-', linewidth=3, color='green', label='mean', zorder=1)        
        plot.plot(x, up, '-', linewidth=3, color='magenta', label='up', zorder=1)        
        plot.plot(x, dn, '-', linewidth=3, color='orange', label='down', zorder=1)        
        plot.axhline(0, linewidth=1, color='black')
        plot.title('boll of %s' % self.__code, fontsize=20)
        l= plot.legend(loc='upper right', shadow=True, fancybox=True)
        plot.grid(True)
        plot.show()

    def generate(self):
        pl, mb, up, dn = self.__get_boll_data()
        self.__draw_boll(pl, mb, up, dn)

def main(argv):
    if len(argv) <= 1:
        print "please input stock code"
        return

    code = argv[1]
    generator = BollGenerator(code)
    generator.generate()

if __name__ == "__main__":
    main(sys.argv)
