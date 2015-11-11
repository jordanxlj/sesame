from util import Util
from bs4 import BeautifulSoup
from collections import OrderedDict

class StockHistoryCollector(object):
    def __init__(self):
        self.__history_pattern = 'http://money.finance.sina.com.cn/corp/go.php/vMS_MarketHistory/stockid/%s.phtml?year=%d&jidu=%d'

    def __get_last_quarter_url(self, stock_id):
        year, last_quarter = Util.get_last_quarter()
        return self.__history_pattern %(stock_id, year, last_quarter)

    def __get_this_quarter_url(self, stock_id):
        year, this_quarter = Util.get_this_quarter()
        return self.__history_pattern %(stock_id, year, this_quarter)

    def __parse_data(self, table, result):
        if table:
            for i, tr in enumerate(table.findAll('tr')[1:]):
                if i == 0:
                    continue
                close_price = 0
                tds = tr.select('td')

                day = tds[0].div.a.text.strip()
                close_price = float(tds[3].div.text.strip())
                result[day] = close_price

    def __collect_data(self, content, result):
        soap = BeautifulSoup(content, 'lxml')
        table = soap.find("table", {"id": "FundHoldSharesTable"})
        self.__parse_data(table, result)

    def __collect_last_quarter(self, stock_id, result):
        url = self.__get_last_quarter_url(stock_id)
        content = Util.http_get_content(url=url)
        self.__collect_data(content, result)

    def __collect_this_quarter(self, stock_id, result):
        url = self.__get_this_quarter_url(stock_id)
        content = Util.http_get_content(url=url)
        self.__collect_data(content, result)

    def collect_history_data(self, stock_id):
        history_datas = OrderedDict()
        history_datas['code'] = stock_id

        self.__collect_this_quarter(stock_id, history_datas)
        self.__collect_last_quarter(stock_id, history_datas)
        return history_datas

if __name__ == "__main__":
    collector = StockHistoryCollector()
    print collector.collect_history_data('300043')
