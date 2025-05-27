#!/usr/bin/env python3
import pandas as pd
import os
from indicator.tech_analysis_web import TechAnalysis

def test_supertrend():
    # 加载测试数据
    code = 'HK.02432'
    
    # 尝试两种文件名格式
    for fname in [f'{code}.csv', f'{code.replace(".", "_")}_daily.csv']:
        fpath = os.path.join('indicator', fname)
        if os.path.exists(fpath):
            print(f"找到数据文件: {fpath}")
            df = pd.read_csv(fpath)
            
            # 显示原始数据结构
            print(f"原始数据列: {list(df.columns)}")
            print(f"数据行数: {len(df)}")
            print("前5行数据:")
            print(df.head())
            
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
            
            print(f"\n处理后数据列: {list(df.columns)}")
            
            # 计算SuperTrend
            print("\n计算SuperTrend指标...")
            st_result = TechAnalysis.supertrend(df)
            
            print(f"SuperTrend结果列: {list(st_result.columns)}")
            print(f"SuperTrend数据行数: {len(st_result)}")
            
            # 显示前10行和后10行
            print("\nSuperTrend前10行:")
            print(st_result.head(10))
            
            print("\nSuperTrend后10行:")
            print(st_result.tail(10))
            
            # 统计有效数据
            valid_supertrend = st_result['supertrend'].notna().sum()
            trend_1_count = (st_result['trend'] == 1).sum()
            trend_minus1_count = (st_result['trend'] == -1).sum()
            
            print(f"\n统计信息:")
            print(f"有效SuperTrend值: {valid_supertrend}/{len(st_result)}")
            print(f"上升趋势(trend=1): {trend_1_count}")
            print(f"下降趋势(trend=-1): {trend_minus1_count}")
            
            # 检查数据范围
            if valid_supertrend > 0:
                min_val = st_result['supertrend'].min()
                max_val = st_result['supertrend'].max()
                print(f"SuperTrend值范围: {min_val:.2f} - {max_val:.2f}")
            
            return st_result
    
    print("未找到数据文件")
    return None

if __name__ == '__main__':
    test_supertrend() 