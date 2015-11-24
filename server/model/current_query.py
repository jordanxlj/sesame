import codecs
import re
import urllib2  
from util.util import Util
from constants import Constants
  
class StockCurrentQuery(object):  
    def __init__(self):  
        self.__current_url = Constants.CURRENT_QUERY_URL

    def __get_stock_code(self, stock_id):
        if stock_id.startswith("00") or stock_id.startswith("300"):
            return 'sz' + stock_id
        return 'sh' + stock_id
  
    def get_rt_data(self, stock_id):  
        print stock_id
        stock_map = {}
        stock_map['code'] = stock_id
        try:  
            url = self.__current_url % self.__get_stock_code(stock_id)
            #print url
            request = urllib2.Request(url)
            response = urllib2.urlopen(request)  
            contents = response.read()  
            match_result = re.findall(r'v_.*?="(.*?)";', contents)
            if len(match_result) == 0:
                return '', '', '', '', ''
            result = match_result[0].split('~')
            stock_map['name'] = result[1].decode('gbk')
            stock_map['close_price'] = float(result[3])
            stock_map['high_price'] = float(result[33])
            stock_map['low_price'] = float(result[34])
            stock_map['amplitude'] = float(result[43].strip('%'))
            stock_map['updown'] = float(result[32].strip('%'))
            stock_map['turnover'] = float(result[38].strip('%'))
            stock_map['value'] = float(result[45])
            return stock_map
  
        except urllib2.URLError, e:  
            print "BadxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxBad"  

if __name__=='__main__':  
    query = StockCurrentQuery()  

    code_file = open("code.txt","r")  
    out_file = codecs.open("current_data.txt","wb", encoding='utf-8')  
    out_file.write("id\tname\tprice\tupdown\tturnover\tvalue\n")

    for line in code_file.readlines():
        stock_code = line.strip()
        if len(stock_code):
            name, price, updown, turnover, value = query.get_rt_data('sz'+stock_code)
            if (price != '0.00' and price != '0.000') and len(turnover):
                out_file.write("%s\t%s\t%s\t%s%%\t%s%%\t%s\n" %(stock_code, name, price, updown, turnover, value))

    code_file.close()
    out_file.close()
