import matplotlib.pyplot as plot
import numpy
import sys

from model.boll import Boll
from model.history_collector import StockHistoryCollector

class CompositeView(object):
    def __init__(self, code):
        self.__code = code
    
    def draw(self, dates, pl, mb, up, dn, to):
        #x = dates[20:]
        x = [v for v in range(0, len(pl))]
        fig = plot.figure()
        ax1 = fig.add_subplot(111)

        ax1.plot(x, pl, 'o', linewidth=3, color='blue', label='current', zorder=10) 
        ax1.plot(x, mb, '-', linewidth=3, color='green', label='mean', zorder=1)        
        ax1.plot(x, up, '-', linewidth=3, color='magenta', label='up', zorder=1)        
        ax1.plot(x, dn, '-', linewidth=3, color='orange', label='down', zorder=1)        
        ax1.legend(loc='best', shadow=True, fancybox=True)
        ax1.set_ylim(-10, max(pl+mb+up+dn)+5)
        ax1.set_ylabel('stock price');

        ax2 = ax1.twinx() # this is the important function
        ax2.plot(x, to, '-', linewidth=3, color='black', label='turnover', zorder=1)        
        ax2.set_ylim(0, 50)
        ax2.set_ylabel('turnover(%)');
        #plot.axhline(0, linewidth=1, color='black')
        plot.title('boll of %s' % self.__code, fontsize=20)
        plot.grid(True)
        plot.show()

def main(argv):
    if len(argv) <= 1:
        print "please input stock code"
        return

    code = argv[1]

    history_collector = StockHistoryCollector()
    datas = history_collector.collect_history_data(code)

    date_list = []
    turnover_list = []
    for date, value in datas[20:]:
        date_list.append(date)
        turnover_list.append(value['turnover'])
    boll = Boll(datas)
    price_list = boll.get_stock_data(code)
    pl, mb, up, dn = boll.boll(price_list)

    view = CompositeView(code)
    view.draw(date_list, pl, mb, up, dn, turnover_list)

if __name__ == "__main__":
    main(sys.argv)
