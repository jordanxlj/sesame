import json

from util.util import Util

class StockHistoryCollector(object):
    def __init__(self):
        self.__history_pattern = 'http://q.stock.sohu.com/hisHq/?code=cn_%s'

    def __get_history_url(self, stock_id):
        return self.__history_pattern % stock_id

    def __parse_data(self, content, result):
        if content is None:
            return None

        for data in json.loads(content)[0]['hq']:
            day = data[0]
            close_price = float(data[2])
            updown = float(data[4].strip('%'))
            turnover = float(data[9].strip('%'))
            result[day] = [close_price, updown, turnover]

    def collect_history_data(self, stock_id):
        history_datas = {}
        history_datas['code'] = stock_id

        url = self.__get_history_url(stock_id)
        print url
        content = Util.http_get_content(url=url)
        self.__parse_data(content, history_datas)
        return history_datas

if __name__ == "__main__":
    collector = StockHistoryCollector()
    print collector.collect_history_data('300043')
