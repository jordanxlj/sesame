from datetime import *
import httplib2

class Util(object):
    @staticmethod
    def get_start_date():
        return 2015, 6, 1

    @staticmethod
    def get_today():
        today = datetime.today()
        return today.year, today.month-1, today.day

    @staticmethod
    def get_last_quarter():
        return 2015, 3

    @staticmethod
    def get_this_quarter():
        return 2015, 4

    @staticmethod
    def get_monthly_key():
        return ['1 Oct 2015', '1 Sep 2015', '3 Aug 2015', '1 Jul 2015']

    @staticmethod
    def http_get_content(url, headers=None, charset=None):
        try:
            http = httplib2.Http()
            request, content = http.request(uri=url, headers=headers)
            if request.status == 200 and content:
                if charset:
                    return content.decode(charset).encode('utf-8')
                else:
                    return content
        except Exception as e:
            raise e

if __name__ == "__main__":
    util = Util()
    print util.get_today()
    print util.get_year_start()
    print util.get_monthly_key()
    url = "http://money.finance.sina.com.cn/corp/go.php/vMS_MarketHistory/stockid/%s.phtml?year=%s&jidu=%s" \
          % ('300155', '2015', '1')
    print util.http_get_content(url)
