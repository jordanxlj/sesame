import pandas as pd
import numpy as np
from scipy import stats

class TechAnalysis:
    @staticmethod
    def supertrend(df, period=10, multiplier=3.0):
        src = (df['high'] + df['low']) / 2
        tr = pd.concat([
            df['high'] - df['low'],
            (df['high'] - df['close'].shift(1)).abs(),
            (df['low'] - df['close'].shift(1)).abs()
        ], axis=1).max(axis=1)
        atr = tr.rolling(window=period, min_periods=period).mean()
        up = src - multiplier * atr
        dn = src + multiplier * atr
        trend = np.ones(len(df))
        up_adj = up.copy()
        dn_adj = dn.copy()
        for i in range(1, len(df)):
            up_adj.iloc[i] = up.iloc[i] if (df['close'].iloc[i-1] <= up_adj.iloc[i-1]) else max(up.iloc[i], up_adj.iloc[i-1])
            dn_adj.iloc[i] = dn.iloc[i] if (df['close'].iloc[i-1] >= dn_adj.iloc[i-1]) else min(dn.iloc[i], dn_adj.iloc[i-1])
            if trend[i-1] == -1 and df['close'].iloc[i] > dn_adj.iloc[i-1]:
                trend[i] = 1
            elif trend[i-1] == 1 and df['close'].iloc[i] < up_adj.iloc[i-1]:
                trend[i] = -1
            else:
                trend[i] = trend[i-1]
        trend_series = pd.Series(trend, index=df.index)
        buy_signal = (trend_series == 1) & (trend_series.shift(1) == -1)
        sell_signal = (trend_series == -1) & (trend_series.shift(1) == 1)
        st_line = np.where(trend_series == 1, up_adj, dn_adj)
        return pd.DataFrame({
            'time': df['time'],
            'supertrend': pd.Series(st_line).where(pd.notnull(st_line), None),
            'trend': trend_series.astype(int),
            'buy': buy_signal.astype(int),
            'sell': sell_signal.astype(int)
        })
    
    @staticmethod
    def squeeze_momentum(df, bb_length=20, bb_mult=2.0, kc_length=20, kc_mult=1.5, use_true_range=True):
        """
        Squeeze Momentum Indicator [LazyBear]
        
        参数:
        bb_length: 布林带长度 (默认20)
        bb_mult: 布林带倍数 (默认2.0)
        kc_length: 肯特纳通道长度 (默认20)
        kc_mult: 肯特纳通道倍数 (默认1.5)
        use_true_range: 是否使用真实波幅 (默认True)
        """
        source = df['close']
        
        # 计算布林带 (Bollinger Bands)
        bb_basis = source.rolling(window=bb_length).mean()
        bb_dev = bb_mult * source.rolling(window=bb_length).std()
        upper_bb = bb_basis + bb_dev
        lower_bb = bb_basis - bb_dev
        
        # 计算肯特纳通道 (Keltner Channel)
        kc_ma = source.rolling(window=kc_length).mean()
        
        if use_true_range:
            # 计算真实波幅 (True Range)
            tr = pd.concat([
                df['high'] - df['low'],
                (df['high'] - df['close'].shift(1)).abs(),
                (df['low'] - df['close'].shift(1)).abs()
            ], axis=1).max(axis=1)
            range_ma = tr.rolling(window=kc_length).mean()
        else:
            # 使用简单的高低价差
            range_val = df['high'] - df['low']
            range_ma = range_val.rolling(window=kc_length).mean()
        
        upper_kc = kc_ma + range_ma * kc_mult
        lower_kc = kc_ma - range_ma * kc_mult
        
        # 判断挤压状态
        sqz_on = (lower_bb > lower_kc) & (upper_bb < upper_kc)  # 挤压开启
        sqz_off = (lower_bb < lower_kc) & (upper_bb > upper_kc)  # 挤压关闭
        no_sqz = ~sqz_on & ~sqz_off  # 无挤压
        
        # 计算动量值 (使用线性回归)
        def linear_regression(y, length, offset=0):
            """计算线性回归值"""
            result = pd.Series(index=y.index, dtype=float)
            for i in range(length - 1, len(y)):
                if i - length + 1 >= 0:
                    y_slice = y.iloc[i - length + 1:i + 1]
                    x = np.arange(len(y_slice))
                    if len(y_slice) == length and not y_slice.isna().any():
                        slope, intercept, _, _, _ = stats.linregress(x, y_slice)
                        result.iloc[i] = slope * (length - 1 - offset) + intercept
            return result
        
        # 计算动量源数据
        highest_high = df['high'].rolling(window=kc_length).max()
        lowest_low = df['low'].rolling(window=kc_length).min()
        avg_hl = (highest_high + lowest_low) / 2
        avg_close = source.rolling(window=kc_length).mean()
        momentum_source = source - (avg_hl + avg_close) / 2
        
        # 计算线性回归值作为动量
        momentum = linear_regression(momentum_source, kc_length, 0)
        
        # 计算颜色信号
        momentum_prev = momentum.shift(1)
        
        # 动量柱状图颜色 (绿色系列表示上涨，红色系列表示下跌)
        bar_color = pd.Series(index=df.index, dtype=str)
        bar_color = np.where(
            momentum > 0,
            np.where(momentum > momentum_prev, 'lime', 'green'),  # 正值：浅绿/深绿
            np.where(momentum < momentum_prev, 'red', 'maroon')   # 负值：红色/深红
        )
        
        # 挤压状态颜色
        squeeze_color = pd.Series(index=df.index, dtype=str)
        squeeze_color = np.where(
            no_sqz, 'blue',      # 无挤压：蓝色
            np.where(sqz_on, 'black', 'gray')  # 挤压开启：黑色，挤压关闭：灰色
        )
        
        return pd.DataFrame({
            'momentum': momentum,
            'squeeze_on': sqz_on.astype(int),
            'squeeze_off': sqz_off.astype(int),
            'no_squeeze': no_sqz.astype(int),
            'bar_color': bar_color,
            'squeeze_color': squeeze_color,
            'upper_bb': upper_bb,
            'lower_bb': lower_bb,
            'upper_kc': upper_kc,
            'lower_kc': lower_kc
        }) 