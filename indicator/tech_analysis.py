from futu import OpenQuoteContext
import pandas as pd
import numpy as np
import traceback
import os
import matplotlib.pyplot as plt
import mplfinance as mpf

class DataLoader:
    def __init__(self, code, csv_filename=None, futu_host='127.0.0.1', futu_port=11111):
        self.code = code  # 形如 'HK.09660'
        if csv_filename is None:
            self.csv_filename = f"{code.replace('.', '_')}_daily.csv"
        else:
            self.csv_filename = csv_filename
        self.futu_host = futu_host
        self.futu_port = futu_port

    def load(self, use_cache=True):
        """
        加载数据，优先使用本地缓存（csv），否则从富途下载。
        返回: pd.DataFrame
        """
        if use_cache and os.path.exists(self.csv_filename):
            print(f"[DataLoader] 使用本地缓存: {self.csv_filename}")
            return pd.read_csv(self.csv_filename)
        else:
            print(f"[DataLoader] 本地无缓存，尝试从富途下载: {self.code}")
            return self._download_from_futu()

    def _download_from_futu(self):
        quote_ctx = OpenQuoteContext(host=self.futu_host, port=self.futu_port)
        try:
            result = quote_ctx.request_history_kline(self.code, ktype='K_DAY')
            if isinstance(result, tuple) and len(result) >= 2:
                ret, data = result[0], result[1]
            else:
                raise RuntimeError(f"返回值格式异常: {result}")
            if ret == 0 and data is not None and not data.empty:
                print(f"[DataLoader] 下载成功，保存为 {self.csv_filename}")
                data.to_csv(self.csv_filename, index=False)
                return data
            else:
                print(f"[DataLoader] 获取数据失败: {data}")
                return None
        except Exception as e:
            print('[DataLoader] 获取或保存数据时发生异常:')
            print(e)
            traceback.print_exc()
            return None
        finally:
            quote_ctx.close()

class TechAnalysis:
    def __init__(self, data):
        self.data = data.copy()

    @staticmethod
    def _tr(high, low, close):
        prev_close = close.shift(1)
        tr = pd.concat([
            high - low,
            (high - prev_close).abs(),
            (low - prev_close).abs()
        ], axis=1).max(axis=1)
        return tr

    @staticmethod
    def _atr(high, low, close, period=10):
        tr = TechAnalysis._tr(high, low, close)
        atr = tr.rolling(window=period, min_periods=period).mean()
        return atr

    @staticmethod
    def _sma(series, period=10):
        return series.rolling(window=period, min_periods=1).mean()

    def supertrend(self, period=10, multiplier=3.0, change_atr=True):
        df = self.data.copy()
        src = (df['high'] + df['low']) / 2
        if change_atr:
            atr = self._atr(df['high'], df['low'], df['close'], period=period)
        else:
            tr = self._tr(df['high'], df['low'], df['close'])
            atr = self._sma(tr, period=period)
        up = src - multiplier * atr
        dn = src + multiplier * atr
        trend = np.ones(len(df))
        up_adj = up.copy()
        dn_adj = dn.copy()
        for i in range(1, len(df)):
            # 先继承前值
            up_adj.iloc[i] = up.iloc[i] if (df['close'].iloc[i-1] <= up_adj.iloc[i-1]) else max(up.iloc[i], up_adj.iloc[i-1])
            dn_adj.iloc[i] = dn.iloc[i] if (df['close'].iloc[i-1] >= dn_adj.iloc[i-1]) else min(dn.iloc[i], dn_adj.iloc[i-1])
            # 趋势切换
            if trend[i-1] == -1 and df['close'].iloc[i] > dn_adj.iloc[i-1]:
                trend[i] = 1
            elif trend[i-1] == 1 and df['close'].iloc[i] < up_adj.iloc[i-1]:
                trend[i] = -1
            else:
                trend[i] = trend[i-1]
        trend_series = pd.Series(trend, index=df.index)
        buy_signal = (trend_series == 1) & (trend_series.shift(1) == -1)
        sell_signal = (trend_series == -1) & (trend_series.shift(1) == 1)
        df['supertrend_up'] = up_adj
        df['supertrend_dn'] = dn_adj
        df['supertrend_trend'] = trend_series
        df['supertrend_buy'] = buy_signal
        df['supertrend_sell'] = sell_signal
        return df

    @staticmethod
    def plot_supertrend(df, show_signals=True, highlighting=True, save_path=None):
        df_plot = df.copy()
        # 保证index为datetime且升序
        if 'time_key' in df_plot.columns:
            df_plot.index = pd.to_datetime(df_plot['time_key'])
        df_plot = df_plot.sort_index()
        # 只保留一条supertrend曲线
        st_line = pd.Series(np.nan, index=df_plot.index)
        st_line[df_plot['supertrend_trend'] == 1] = df_plot['supertrend_up'][df_plot['supertrend_trend'] == 1]
        st_line[df_plot['supertrend_trend'] == -1] = df_plot['supertrend_dn'][df_plot['supertrend_trend'] == -1]

        # 用addplot分段画supertrend主线
        addplots = []
        if highlighting:
            mask_up = (df_plot['supertrend_trend'] == 1)
            mask_dn = (df_plot['supertrend_trend'] == -1)
            st_up = st_line.where(mask_up)
            st_dn = st_line.where(mask_dn)
            if not st_up.dropna().empty:
                addplots.append(mpf.make_addplot(st_up, color='green', width=2))
            if not st_dn.dropna().empty:
                addplots.append(mpf.make_addplot(st_dn, color='red', width=2))

        # 画K线和supertrend主线
        fig, axes = mpf.plot(
            df_plot[['open', 'high', 'low', 'close']],
            type='candle',
            style='yahoo',
            addplot=addplots if addplots else None,
            returnfig=True,
            volume=False,
            title='SuperTrend Indicator',
            ylabel='Price',
            savefig=save_path
        )
        # 获取主图ax
        ax_main = axes[0] if isinstance(axes, (list, tuple)) else axes['main']

        # 买卖信号文字
        if show_signals:
            for idx in df_plot.index[df_plot['supertrend_buy']]:
                ax_main.text(idx, df_plot.loc[idx, 'low']*0.98, 'Buy', color='green', fontsize=10, ha='center', va='bottom', fontweight='bold', bbox=dict(facecolor='white', edgecolor='green', boxstyle='round,pad=0.2'))
            for idx in df_plot.index[df_plot['supertrend_sell']]:
                ax_main.text(idx, df_plot.loc[idx, 'high']*1.02, 'Sell', color='red', fontsize=10, ha='center', va='top', fontweight='bold', bbox=dict(facecolor='white', edgecolor='red', boxstyle='round,pad=0.2'))

        plt.show()

# 用法示例
if __name__ == "__main__":
    loader = DataLoader('HK.02432')
    df = loader.load()
    if df is not None:
        # 需保证有open/high/low/close列，若是富途下载的需重命名
        rename_dict = {'open_price': 'open', 'high_price': 'high', 'low_price': 'low', 'close_price': 'close'}
        for k, v in rename_dict.items():
            if k in df.columns:
                df.rename(columns={k: v}, inplace=True)
        ta = TechAnalysis(df)
        st_df = ta.supertrend(period=10, multiplier=3.0, change_atr=True)
        print(st_df[['close', 'supertrend_up', 'supertrend_dn', 'supertrend_trend', 'supertrend_buy', 'supertrend_sell']].tail())
        TechAnalysis.plot_supertrend(st_df, show_signals=True, highlighting=True, save_path='supertrend.png')
    else:
        print("数据加载失败")
