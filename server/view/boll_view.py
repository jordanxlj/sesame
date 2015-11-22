import matplotlib.pyplot as plot
import numpy
import sys

from model.boll import Boll
from model.history_collector import StockHistoryCollector

class BollView(object):
    def __init__(self, code):
        self.__code = code
    
    def draw(self, pl, mb, up, dn):
        x = [v for v in range(0, len(pl))]
        plot.figure()

        plot.plot(x, pl, 'o', linewidth=3, color='blue', label='current', zorder=10) 
        plot.plot(x, mb, '-', linewidth=3, color='green', label='mean', zorder=1)        
        plot.plot(x, up, '-', linewidth=3, color='magenta', label='up', zorder=1)        
        plot.plot(x, dn, '-', linewidth=3, color='orange', label='down', zorder=1)        
        plot.axhline(0, linewidth=1, color='black')
        plot.title('boll of %s' % self.__code, fontsize=20)
        l= plot.legend(loc='lower right', shadow=True, fancybox=True)
        plot.grid(True)
        plot.show()

def main(argv):
    if len(argv) <= 1:
        print "please input stock code"
        return

    code = argv[1]

    history_collector = StockHistoryCollector()
    datas = history_collector.collect_history_data(code)

    boll = Boll(datas)
    price_list = boll.get_stock_data(code)
    pl, mb, up, dn = boll.boll(price_list)

    view = BollView(code)
    view.draw(pl, mb, up, dn)

if __name__ == "__main__":
    main(sys.argv)
