#!/usr/bin/env python3
"""
测试 Squeeze Momentum 指标实现
"""

import pandas as pd
import numpy as np
from indicator.tech_analysis_web import TechAnalysis

def test_squeeze_momentum():
    # 创建测试数据
    dates = pd.date_range('2024-01-01', periods=100, freq='D')
    np.random.seed(42)
    
    # 生成模拟的OHLC数据
    close_prices = 100 + np.cumsum(np.random.randn(100) * 0.5)
    high_prices = close_prices + np.random.rand(100) * 2
    low_prices = close_prices - np.random.rand(100) * 2
    open_prices = close_prices + np.random.randn(100) * 0.3
    
    test_df = pd.DataFrame({
        'time': dates.strftime('%Y-%m-%d'),
        'open': open_prices,
        'high': high_prices,
        'low': low_prices,
        'close': close_prices,
        'volume': np.random.randint(1000000, 10000000, 100)
    })
    
    print("测试数据样本:")
    print(test_df.head())
    print("\n" + "="*50)
    
    # 测试 Squeeze Momentum 指标
    try:
        result = TechAnalysis.squeeze_momentum(test_df)
        print("Squeeze Momentum 指标计算成功!")
        print(f"返回数据形状: {result.shape}")
        print(f"列名: {list(result.columns)}")
        
        # 显示前几行结果
        print("\n前10行结果:")
        print(result.head(10))
        
        # 检查数据完整性
        print(f"\n数据统计:")
        print(f"总行数: {len(result)}")
        print(f"动量值非空数量: {result['momentum'].notna().sum()}")
        print(f"挤压开启次数: {result['squeeze_on'].sum()}")
        print(f"挤压关闭次数: {result['squeeze_off'].sum()}")
        print(f"无挤压次数: {result['no_squeeze'].sum()}")
        
        # 显示动量值范围
        momentum_values = result['momentum'].dropna()
        if len(momentum_values) > 0:
            print(f"动量值范围: {momentum_values.min():.4f} 到 {momentum_values.max():.4f}")
            print(f"动量值平均: {momentum_values.mean():.4f}")
        
        print("\n✅ Squeeze Momentum 指标测试通过!")
        return True
        
    except Exception as e:
        print(f"❌ Squeeze Momentum 指标测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_squeeze_momentum() 