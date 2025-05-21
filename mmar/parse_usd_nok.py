import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import numpy as np
import matplotlib.dates as mdates
from scipy.stats import kstest, shapiro, norm

# 定义q值列表
q = [0.01,  0.1,   0.2,   0.3,   0.4,   0.5,   0.55,  0.6,   0.65,  0.7,
     0.75,  0.8,   0.85,  0.9,   0.95,  1.0,   1.05,  1.1,   1.15,  1.2,
     1.25,  1.3,   1.35,  1.4,   1.45,  1.5,   1.55,  1.6,   1.65,  1.7,
     1.75,  1.8,   1.81,  1.82,  1.83,  1.84,  1.85,  1.86,  1.87,  1.88,
     1.89,  1.9,   1.91,  1.92,  1.93,  1.94,  1.95,  1.96,  1.97,  1.98,
     1.985, 1.99,  1.991, 1.992, 1.993, 1.994, 1.995, 1.996, 1.997, 1.998,
     1.999, 2.0,   2.001, 2.002, 2.003, 2.004, 2.005, 2.006, 2.007, 2.008,
     2.009, 2.01,  2.015, 2.02,  2.025, 2.03,  2.04,  2.05,  2.06,  2.07,
     2.08,  2.09,  2.1,   2.15,  2.2,   2.25,  2.3,   2.35,  2.4,   2.45,
     2.5,   2.6,   2.7,   2.8,   2.9,   3.0,   3.1,   3.2,   3.3,   3.4,
     3.5,   3.6,   3.7,   3.8,   3.9,   4.0,   4.5,   5.0,   6.0,   7.0,
     8.0,   9.0,   10.0,  12.5,  15.0,  17.5,  20.0,  22.5,  25.0,  27.5,
     30.0]

# 绘制q值的分布直方图
plt.figure(figsize=(12, 6))
plt.hist(q, bins=50, edgecolor='black', alpha=0.7)
plt.title('Distribution of q Values', fontsize=14)
plt.xlabel('q Value', fontsize=12)
plt.ylabel('Frequency', fontsize=12)
plt.grid(True, alpha=0.3)
plt.show()

# 计算所有因子
def get_factors(n):
    factors = []
    for i in range(1, n + 1):
        if n % i == 0:
            factors.append(i)
    return sorted(factors)

# 计算并打印7560的所有因子
delta_t = get_factors(7560)
print("\n7560的所有因子（从小到大）：")
print(delta_t)
print(f"\n因子总数：{len(delta_t)}")

# 设置matplotlib的基本样式
plt.rcParams['figure.facecolor'] = 'white'
plt.rcParams['axes.facecolor'] = 'white'
plt.rcParams['axes.grid'] = True
plt.rcParams['grid.alpha'] = 0.3
plt.rcParams['grid.linestyle'] = '--'

# 读取CSV文件，使用分号作为分隔符
df = pd.read_csv('USD_NOK.csv', sep=';')

# 只保留时间和价格列
df = df[['TIME_PERIOD', 'OBS_VALUE']]

# 将时间列转换为datetime类型
df['TIME_PERIOD'] = pd.to_datetime(df['TIME_PERIOD'])

# 将价格列转换为float类型
df['OBS_VALUE'] = df['OBS_VALUE'].astype(float)

# 设置时间列为索引
df.set_index('TIME_PERIOD', inplace=True)

# 重命名列
df.columns = ['Price']

# 按时间排序
df.sort_index(inplace=True)

# 只保留指定时间范围的数据
start_date = pd.to_datetime('1989-01-25')
end_date = pd.to_datetime('2019-03-01')
df = df.loc[(df.index >= start_date) & (df.index <= end_date)]

# 去除无效或缺失的价格数据
df = df[df['Price'] > 0]
df = df.dropna(subset=['Price'])

# 只保留前7561个数据点
df = df.iloc[:7561]

# 重置索引，保证shift后能正常对齐
df = df.reset_index()

# 计算相对t0时刻的对数变化率
relative_log_returns = np.log(df['Price']) - np.log(df['Price'].iloc[0])
relative_log_returns_df = pd.DataFrame({'TIME_PERIOD': df['TIME_PERIOD'], 'Relative_Log_Returns': relative_log_returns})
relative_log_returns_df.set_index('TIME_PERIOD', inplace=True)

# 计算相邻时刻的对数差值
log_returns = np.log(df['Price']) - np.log(df['Price'].shift(1))
log_returns_df = pd.DataFrame({'TIME_PERIOD': df['TIME_PERIOD'], 'Log_Returns': log_returns})
log_returns_df = log_returns_df.dropna()
log_returns_df['Log_Returns'] = log_returns_df['Log_Returns'].astype(float)
log_returns_df.set_index('TIME_PERIOD', inplace=True)

# 放大对数差值100倍
df_log100 = log_returns_df['Log_Returns'] * 100
log_returns_df['Log_Returns_100x'] = df_log100

# Kolmogorov-Smirnov和Shapiro-Wilk正态性检验
log_returns_data = log_returns_df['Log_Returns']
ks_stat, ks_p = kstest(
    (log_returns_data - log_returns_data.mean()) / log_returns_data.std(),  # 标准化
    'norm'
)
shapiro_stat, shapiro_p = shapiro(log_returns_data)
print(f"Kolmogorov-Smirnov检验P值: {ks_p:.6f}")
print(f"Shapiro-Wilk检验P值: {shapiro_p:.6f}")
if ks_p < 0.05 and shapiro_p < 0.05:
    print("""结论：对数差值序列的P值均远小于0.05，拒绝正态性假设，说明其分布显著偏离正态分布（非正态分布）。""")
else:
    print("""结论：P值大于0.05，不能拒绝正态性假设。""")

# 分区函数实现
def calc_partition_function(relative_log_returns, delta_t_list, q_list):
    T = len(relative_log_returns)
    XT = relative_log_returns.values
    result_matrix = np.zeros((len(q_list), len(delta_t_list)))

    for j, dt in enumerate(delta_t_list):
        max_i = int(T / dt)
        idx1 = np.arange(max_i) * dt
        idx2 = idx1 + dt
        
        # 只保留 idx2 < T 的分区
        valid = idx2 < T
        idx1 = idx1[valid]
        idx2 = idx2[valid]
        diffs = XT[idx2] - XT[idx1]
        abs_diffs = np.abs(diffs)
        for k, qv in enumerate(q_list):
            result_matrix[k, j] = np.sum(abs_diffs ** qv)
    df = pd.DataFrame(result_matrix, index=q_list, columns=delta_t_list)
    return df

'''
def partition_function(SIGMA, DELTA, XT, Q):
    print("Calculating the partition function...\nThis step will take quite a while... so strap yourself in...\n")
    SIGMA=[[0 for x in range(len(DELTA))] for y in range(len(Q))]
    for k in range (0, len(Q)):
        if k%30==0:
            print("calculating i=" + str(k) + ' out of ' + str(len(Q)-1))
        for j in range (0,len(DELTA)):
            for i in range (0,len(XT)-1):
                if i < int(len(XT)/DELTA[j]):
                    SIGMA[k][j]=SIGMA[k][j] + abs(XT[i*DELTA[j]+DELTA[j]]-XT[i*DELTA[j]])**Q[k]

    SIGMA=pd.DataFrame(SIGMA)
    
    for i in range (0,len(Q)):
        SIGMA.rename(index={SIGMA.index[i]:Q[i]}, inplace=True)
    for i in range (len(DELTA)-1,-1,-1):
        SIGMA.rename(columns={SIGMA.columns[i]:DELTA[i]}, inplace=True)
    
    print("Done! Your partition function is ready!\n")
    return SIGMA
sigma = []
sigma = partition_function(sigma, delta_t, relative_log_returns_df['Relative_Log_Returns'], q)
print(len(sigma), sigma.iloc[0])

for i in range (0, len(q)):
    print(i, sigma.iloc[i])
    plt.plot(np.log(delta_t), np.log(list(sigma.iloc[i])/sigma[1][q[i]]), color="red",linewidth=0.5, label=str(q[i]))


plt.legend(bbox_to_anchor=(0., 1.02, 1., .102), loc=3,
           ncol=6, mode="expand", borderaxespad=0.)

plt.xlabel('ln (delta_t)\n(the natural log of time increments)')
plt.ylabel('ln ( Sq(delta_t) )\n(the natural log of the partition function)')

plt.show()
'''

# 计算分区函数
partition_results = calc_partition_function(relative_log_returns_df['Relative_Log_Returns'], delta_t, q)
print(partition_results.iloc[0])

for i in range (0, len(q)):
    #print(i, partition_results.iloc[i])
    plt.plot(np.log(delta_t), np.log(list(partition_results.iloc[i])/partition_results[1][q[i]]), color="red",linewidth=0.5, label=str(q[i]))


plt.legend(bbox_to_anchor=(0., 1.02, 1., .102), loc=3,
           ncol=6, mode="expand", borderaxespad=0.)

plt.xlabel('ln (delta_t)\n(the natural log of time increments)')
plt.ylabel('ln ( Sq(delta_t) )\n(the natural log of the partition function)')

plt.show()

# 打印部分结果
print("\n分区函数 S_q(T, delta_t) DataFrame 预览：")
print(partition_results.iloc[:5, :5])

# 创建三个子图
fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(12, 15), height_ratios=[1, 1, 1])
fig.subplots_adjust(hspace=0.3)  # 调整子图之间的间距

# 绘制原始价格图（上子图）
ax1.plot(df['TIME_PERIOD'], df['Price'], linewidth=1, color='red')
ax1.fill_between(df['TIME_PERIOD'], df['Price'], alpha=0.15, color='red')
ax1.set_title('USD/NOK Exchange Rate Over Time', fontsize=14)
ax1.set_xlabel('Date', fontsize=12)
ax1.set_ylabel('Price (NOK)', fontsize=12)
ax1.tick_params(axis='x', rotation=45)
ax1.yaxis.set_major_locator(ticker.MultipleLocator(1))
ax1.set_xlim(df['TIME_PERIOD'].iloc[0], df['TIME_PERIOD'].iloc[-1])

# 绘制对数差值图（中子图，放大100倍）
ax2.plot(log_returns_df.index, log_returns_df['Log_Returns_100x'], linewidth=1, color='blue')
ax2.fill_between(log_returns_df.index, log_returns_df['Log_Returns_100x'], 0, alpha=0.15, color='blue')
ax2.set_title('Log Returns of USD/NOK Exchange Rate (x100)', fontsize=14)
ax2.set_xlabel('Date', fontsize=12)
ax2.set_ylabel('Log Returns x100', fontsize=12)
ax2.tick_params(axis='x', rotation=45)
ax2.yaxis.set_major_locator(ticker.MultipleLocator(1))
ax2.set_xlim(log_returns_df.index[0], log_returns_df.index[-1])

# 绘制相对t0时刻的对数变化率图（下子图）
ax3.plot(relative_log_returns_df.index, relative_log_returns_df['Relative_Log_Returns'], linewidth=1, color='green')
ax3.fill_between(relative_log_returns_df.index, relative_log_returns_df['Relative_Log_Returns'], 0, alpha=0.15, color='green')
ax3.set_title('Relative Log Returns from t0', fontsize=14)
ax3.set_xlabel('Date', fontsize=12)
ax3.set_ylabel('Relative Log Returns', fontsize=12)
ax3.tick_params(axis='x', rotation=45)
ax3.set_xlim(relative_log_returns_df.index[0], relative_log_returns_df.index[-1])

# 标注开始和结束时间，只保留数据范围内的刻度
start_time = df['TIME_PERIOD'].iloc[0]
end_time = df['TIME_PERIOD'].iloc[-1]
for ax in [ax1, ax2, ax3]:
    xticks = list(ax.get_xticks())
    # 转换为datetime
    xticks_dt = [mdates.num2date(x).replace(tzinfo=None) for x in xticks]
    # 只保留在数据范围内的刻度
    xticks_filtered = [x for x in xticks_dt if (x >= start_time) and (x <= end_time)]
    # 保证开始和结束时间在刻度中
    if start_time not in xticks_filtered:
        xticks_filtered = [start_time] + xticks_filtered
    if end_time not in xticks_filtered:
        xticks_filtered = xticks_filtered + [end_time]
    ax.set_xticks([mdates.date2num(x) for x in xticks_filtered])
    # 标注
    ax.annotate(str(start_time.date()), xy=(start_time, ax.get_ylim()[0]), xytext=(0, 10),
                textcoords='offset points', ha='left', va='bottom', fontsize=10, color='green', rotation=45)
    ax.annotate(str(end_time.date()), xy=(end_time, ax.get_ylim()[0]), xytext=(0, 10),
                textcoords='offset points', ha='right', va='bottom', fontsize=10, color='green', rotation=45)

# 自动调整布局
plt.tight_layout()

# 显示图表
plt.show()

# 显示前几行数据
print("\n原始价格数据前5行:")
print(df.head())
print("\n对数差值数据前5行:")
print(log_returns_df.head())
print("\n相对t0时刻的对数变化率数据前5行:")
print(relative_log_returns_df.head())

# 显示数据基本信息
print("\n原始价格数据基本信息:")
print(df.info())
print("\n对数差值数据基本信息:")
print(log_returns_df.info())
print("\n相对t0时刻的对数变化率数据基本信息:")
print(relative_log_returns_df.info())

# 显示基本统计信息
print("\n原始价格数据基本统计信息:")
print(df.describe())
print("\n对数差值数据基本统计信息:")
print(log_returns_df.describe())
print("\n相对t0时刻的对数变化率数据基本统计信息:")
print(relative_log_returns_df.describe()) 