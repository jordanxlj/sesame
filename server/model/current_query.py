import codecs
import re
import urllib2  
from util.util import Util
from constants import Constants
  
class StockCurrentQuery(object):  
    def __init__(self):  
        self.__curent_url = Constants.CURRENT_QUERY_URL
  
    def get_rt_data(self, stock_id):  
        print stock_id
        try:  
            request = urllib2.Request(self.__curent_url % (stock_id))  
            response = urllib2.urlopen(request)  
            contents = response.read()  
            match_result = re.findall(r'v_.*?="(.*?)";', contents)
            if len(match_result) == 0:
                return '', '', '', '', ''
            result = match_result[0].split('~')
            return result[1].decode('gbk'), result[3], result[32], result[38], result[45]
  
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
