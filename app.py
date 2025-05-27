from flask import Flask, render_template, request, jsonify
import pandas as pd
import os
import glob
from indicator.tech_analysis_web import TechAnalysis

app = Flask(__name__)

DATA_DIR = 'indicator'  # 假设csv都在indicator目录

def get_available_stocks():
    """获取可用的股票代码列表"""
    stocks = []
    csv_files = glob.glob(os.path.join(DATA_DIR, '*.csv'))
    
    for file_path in csv_files:
        filename = os.path.basename(file_path)
        # 解析文件名获取股票代码
        if filename.endswith('_daily.csv'):
            code = filename.replace('_daily.csv', '').replace('_', '.')
        elif filename.endswith('.csv'):
            code = filename.replace('.csv', '')
        else:
            continue
            
        # 生成股票名称（这里可以根据实际情况调整）
        name = f"股票{code}"
        stocks.append({'code': code, 'name': name})
    
    return stocks

def load_kline(code):
    # 支持两种命名
    for fname in [f'{code}.csv', f'{code.replace(".", "_")}_daily.csv']:
        fpath = os.path.join(DATA_DIR, fname)
        if os.path.exists(fpath):
            df = pd.read_csv(fpath)
            # 兼容不同列名
            rename_dict = {'open_price': 'open', 'high_price': 'high', 'low_price': 'low', 'close_price': 'close'}
            for k, v in rename_dict.items():
                if k in df.columns:
                    df.rename(columns={k: v}, inplace=True)
            # 生成time列
            if 'time_key' in df.columns:
                df['time'] = pd.to_datetime(df['time_key']).dt.strftime('%Y-%m-%d')
            elif 'time' in df.columns:
                df['time'] = pd.to_datetime(df['time']).dt.strftime('%Y-%m-%d')
            else:
                df['time'] = pd.date_range(start='2020-01-01', periods=len(df)).strftime('%Y-%m-%d')
            return df
    return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/test-v2')
def test_v2():
    """V2.1.0 核心系统测试页面"""
    return render_template('test_v2.html')

@app.route('/api/stocks')
def api_stocks():
    """获取股票代码列表"""
    query = request.args.get('q', '').strip()
    stocks = get_available_stocks()
    
    # 如果有查询参数，进行过滤
    if query:
        stocks = [stock for stock in stocks if query.lower() in stock['code'].lower() or query.lower() in stock['name'].lower()]
    
    return jsonify(stocks)

@app.route('/api/kline')
def api_kline():
    code = request.args.get('code')
    df = load_kline(code)
    if df is None:
        return jsonify([])
    fields = ['time', 'open', 'high', 'low', 'close']
    if 'volume' in df.columns:
        fields.append('volume')
    if 'turnover_rate' in df.columns:
        fields.append('turnover_rate')
    ohlc = df[fields].to_dict(orient='records')
    return jsonify(ohlc)

@app.route('/api/indicator')
def api_indicator():
    code = request.args.get('code')
    indicator = request.args.get('type')
    df = load_kline(code)
    if df is None:
        return jsonify([])
    if indicator == 'supertrend':
        st = TechAnalysis.supertrend(df)
        st = st.applymap(lambda x: None if pd.isna(x) else x)
        
        # 过滤掉SuperTrend值为0或无效的数据
        st['supertrend'] = st['supertrend'].apply(lambda x: None if x is None or x == 0 or not isinstance(x, (int, float)) else x)
        
        data = st.to_dict(orient='records')
        for row in data:
            for k, v in row.items():
                if isinstance(v, float) and (v != v):  # NaN检查
                    row[k] = None
                elif k == 'supertrend' and (v == 0 or v is None):  # 过滤0值
                    row[k] = None
        return jsonify(data)
    elif indicator == 'squeeze_momentum':
        # 获取参数，使用默认值
        bb_length = int(request.args.get('bb_length', 20))
        bb_mult = float(request.args.get('bb_mult', 2.0))
        kc_length = int(request.args.get('kc_length', 20))
        kc_mult = float(request.args.get('kc_mult', 1.5))
        use_true_range = request.args.get('use_true_range', 'true').lower() == 'true'
        
        sqz = TechAnalysis.squeeze_momentum(df, bb_length, bb_mult, kc_length, kc_mult, use_true_range)
        # 确保时间格式一致
        sqz['time'] = df['time']  # 使用处理后的时间格式
        sqz = sqz.applymap(lambda x: None if pd.isna(x) else x)
        data = sqz.to_dict(orient='records')
        for row in data:
            for k, v in row.items():
                if isinstance(v, float) and (v != v):
                    row[k] = None
        return jsonify(data)
    elif indicator == 'ma5':
        # 计算5日移动平均线
        ma5 = df['close'].rolling(window=5).mean()
        data = []
        for i, (time, ma) in enumerate(zip(df['time'], ma5)):
            data.append({
                'time': time,
                'ma': None if pd.isna(ma) else float(ma)
            })
        return jsonify(data)
    elif indicator == 'ma10':
        # 计算10日移动平均线
        ma10 = df['close'].rolling(window=10).mean()
        data = []
        for i, (time, ma) in enumerate(zip(df['time'], ma10)):
            data.append({
                'time': time,
                'ma': None if pd.isna(ma) else float(ma)
            })
        return jsonify(data)
    return jsonify([])

if __name__ == '__main__':
    app.run(debug=True) 