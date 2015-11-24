import codecs
import re
import urllib2  
from util.util import Util
from constants import Constants
  
class StockCurrentQuery(object):  
    def __init__(self):  
        self.__basic_url = Constants.CURRENT_BASIC_QUERY_URL
        self.__flow_url = Constants.CURRENT_FLOW_QUERY_URL

    def __get_stock_code(self, stock_id):
        if stock_id.startswith("00") or stock_id.startswith("300"):
            return 'sz' + stock_id
        return 'sh' + stock_id
  
    def get_basic_data(self, stock_id, stock_info):  
        print stock_id
        stock_info['code'] = stock_id
        try:  
            url = self.__basic_url % self.__get_stock_code(stock_id)
            #print url
            request = urllib2.Request(url)
            response = urllib2.urlopen(request)  
            contents = response.read()  
            match_result = re.findall(r'v_.*?="(.*?)";', contents)
            if len(match_result) == 0:
                return '', '', '', '', ''
            result = match_result[0].split('~')
            stock_info['name'] = result[1].decode('gbk')
            stock_info['close_price'] = float(result[3])
            stock_info['high_price'] = float(result[33])
            stock_info['low_price'] = float(result[34])
            stock_info['amplitude'] = float(result[43].strip('%'))
            stock_info['updown'] = float(result[32].strip('%'))
            stock_info['turnover'] = float(result[38].strip('%'))
            stock_info['volume'] = float(result[45])
            return stock_info
  
        except urllib2.URLError, e:  
            print e

    def get_flow_data(self, stock_id, stock_info):  
        try:  
            url = self.__flow_url % self.__get_stock_code(stock_id)
            #print url
            request = urllib2.Request(url)
            response = urllib2.urlopen(request)  
            contents = response.read()  
            match_result = re.findall(r'v_.*?="(.*?)";', contents)
            if len(match_result) == 0:
                return '', '', '', '', ''
            result = match_result[0].split('~')
            stock_info['main_inflow'] = float(result[1])
            stock_info['main_outflow'] = float(result[2])
            stock_info['main_net_inflow'] = float(result[3])
            stock_info['retail_inflow'] = float(result[5])
            stock_info['retail_outflow'] = float(result[6])
            stock_info['retail_net_inflow'] = float(result[7])
            stock_info['inflow_outlow_sum'] = float(result[9])
        except urllib2.URLError, e:  
            print e

if __name__=='__main__':  
    query = StockCurrentQuery()  

    code_file = open("code.txt","r")  
    out_file = codecs.open("current_data.txt","wb", encoding='utf-8')  
    out_file.write("id\tname\tprice\tupdown\tturnover\tvalue\n")

    for line in code_file.readlines():
        stock_code = line.strip()
        if len(stock_code):
            name, price, updown, turnover, value = query.get_basic_data('sz'+stock_code)
            if (price != '0.00' and price != '0.000') and len(turnover):
                out_file.write("%s\t%s\t%s\t%s%%\t%s%%\t%s\n" %(stock_code, name, price, updown, turnover, value))

    code_file.close()
    out_file.close()
