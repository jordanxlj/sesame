import pandas as pd
import numpy as np

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