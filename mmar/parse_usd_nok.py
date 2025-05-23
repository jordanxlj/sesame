import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import numpy as np
import matplotlib.dates as mdates
from scipy.stats import kstest, shapiro, norm, linregress

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

# 默认抽稀filter
def default_sparse_filter(qi):
    return (qi % 0.25 == 0 and qi < 6 and qi > 1 and qi != 3.5 and qi != 4.5)

def plot_partition_function(partition_results, delta_t, q, sparse_filter=None, legend_kwargs=None, title=None):
    """
    partition_results: DataFrame, 行为q，列为delta_t
    delta_t: delta_t列表
    q: q列表
    sparse_filter: callable, 传入q[i]，返回True则画，否则跳过。None表示画全部。
    legend_kwargs: dict, 传递给plt.legend的参数
    title: str, 图标题
    """
    plt.figure(figsize=(16, 9))
    for i in range(len(q)):
        if sparse_filter is not None and not sparse_filter(q[i]):
            continue
        lw = 1 if sparse_filter is not None else 0.5
        plt.plot(
            np.log(delta_t),
            np.log(list(partition_results.iloc[i]) / partition_results[1][q[i]]),
            color="red", linewidth=lw, label=str(q[i])
        )
    if legend_kwargs is not None:
        plt.legend(**legend_kwargs)
    else:
        plt.legend(
            bbox_to_anchor=(0., 1.02, 1., .102), loc=3,
            ncol=6, mode="expand", borderaxespad=0.
        )
    if title is not None:
        plt.title(title)
    plt.xlabel('ln (delta_t)\n(the natural log of time increments)')
    plt.ylabel('ln ( Sq(delta_t) )\n(the natural log of the partition function)')
    plt.show()

# 显示部分结果
plot_partition_function(partition_results, delta_t, q)

# 抽稀画法
plot_partition_function(
    partition_results, delta_t, q,
    sparse_filter=default_sparse_filter,
    legend_kwargs=dict(
        bbox_to_anchor=(0., -0.45, 1., .102), loc=3,
        ncol=5, mode="expand", borderaxespad=0., title="Raw moments"
    ),
    title="Partition function for Norway"
)

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

def scaling_function(partition_results, delta_t, q):
    """
    对每个q的分区函数曲线做OLS回归，返回tau(q)数组
    partition_results: DataFrame, 行为q，列为delta_t
    delta_t: delta_t列表
    q: q列表
    返回: tau_q数组（与q一一对应）
    """
    ln_delta_t = np.log(delta_t)
    tau_q = []
    for i in range(len(q)):
        y = np.log(partition_results.iloc[i])
        x = ln_delta_t
        slope, intercept, r_value, p_value, std_err = linregress(x, y)
        tau_q.append(slope)
    return np.array(tau_q)

tau_q = scaling_function(partition_results, delta_t, q)
plt.plot(q, tau_q, marker='o')
plt.xlabel('q')
plt.ylabel('tau(q)')
plt.title('Scaling function tau(q)')
plt.show()

def estimate_hurst(q, tau_q):
    # 找到tau_q为0的左右q值
    for i in range(1, len(q)):
        if tau_q[i-1] * tau_q[i] <= 0:
            q_left, tau_left = q[i-1], tau_q[i-1]
            q_right, tau_right = q[i], tau_q[i]
            # 线性插值求零点
            q_star = q_left - tau_left * (q_right - q_left) / (tau_right - tau_left)
            H = 1.0 / q_star
            return H, q_star, (q_left, tau_left, q_right, tau_right)
    return None, None, None

H, q_star, info = estimate_hurst(q, tau_q)
if H is not None:
    print(f'Hurst指数 H ≈ {H:.4f} (q* ≈ {q_star:.4f})')
    print(f'零点区间: q_left={info[0]}, tau_left={info[1]:.4f}; q_right={info[2]}, tau_right={info[3]:.4f}')
else:
    print('未找到 tau(q)=0 的零点，无法估算Hurst指数。')

def gradient_multifractal_spectrum(q, tau_q):
    """
    梯度计算估算多分形谱f(alpha)和alpha
    q: q值数组
    tau_q: tau(q)数组
    返回: alpha, f_alpha
    """
    # 数值微分求alpha
    alpha = np.gradient(tau_q, q)
    f_alpha = q * alpha - tau_q
    return alpha, f_alpha

def polyfit_multifractal_spectrum(TAU_Q, Q, MIN_Q, MAX_Q):
    """
    多项式拟合计算估算多分形谱f(alpha)和alpha
    """
    TAU_Q_ESTIMATED = np.polyfit(Q[MIN_Q:MAX_Q], TAU_Q[MIN_Q:MAX_Q], 2)
    print(TAU_Q_ESTIMATED)
    F_A = [0 for x in range(len(q)-10)]
    p = [0 for x in range(len(q)-10)]
    a = TAU_Q_ESTIMATED[0]
    b = TAU_Q_ESTIMATED[1]
    c = TAU_Q_ESTIMATED[2]
    for i in range(0, len(q)-10):
        p[i] = 2*a*Q[i]+b
        F_A[i] = ((p[i]-b)/(2*a))*p[i] - (a*((p[i]-b)/(2*a))**2 + b*((p[i]-b)/(2*a)) + c)
    print('polyfit_multifractal_spectrum F_A:', F_A)
    F_A = pd.DataFrame(F_A)
    F_A.rename(columns={F_A.columns[0]:"f(a)"}, inplace=True)
    F_A['p'] = p
    print("Using the range of q's from " + str(Q[MIN_Q]) + " to " + str(Q[MAX_Q]) + ":")
    print("The estimated parameters for tau(q) are: \n" + str(TAU_Q_ESTIMATED))
    print("\nThus, the estimated parameters for f(a) are: \n" + str(1/(4*a)) + ", \n"  + str((-2*b)/(4*a)) + ", \n"+ str((-4*a*c+b**2)/(4*a)))
    return F_A

# 方法1
alpha1, f_alpha1 = gradient_multifractal_spectrum(q[0:105], tau_q[0:105])
print("\nNORWAY's gradient estimated alpha zero = " + str(alpha1[0]))

# 方法2
f_a_NORWAY = polyfit_multifractal_spectrum(tau_q, q, 0, 105)
alpha2 = f_a_NORWAY['p']
f_alpha2 = f_a_NORWAY['f(a)']
print("\nNORWAY's polyfit estimated alpha zero = " + str(alpha2[0]))

plt.figure(figsize=(10, 6))
plt.plot(alpha1, f_alpha1, marker='o', label='Gradient (spectrum1)')
plt.plot(alpha2, f_alpha2, marker='x', label='Polyfit (spectrum2)')
plt.xlabel(r'$\alpha$')
plt.ylabel(r'$f(\alpha)$')
plt.title('Multifractal spectrum comparison')
plt.legend()
plt.show()

def estimate_lognormal_params(alpha, f_alpha, H, b=2):
    """
    根据多重分形谱顶点和Hurst指数估计对数正态分布参数lambda和sigma^2
    alpha: alpha数组
    f_alpha: f(alpha)数组
    H: Hurst指数
    b: 对数基底，默认2
    返回: lambda_hat, sigma2_hat, alpha_0
    """
    idx_max = np.argmax(f_alpha)
    alpha_0 = alpha[idx_max]
    lambda_hat = alpha_0 / H
    sigma2_hat = 2 * (lambda_hat - 1) / np.log(b)
    return lambda_hat, sigma2_hat, alpha_0

# 用法示例（以梯度法为例）
lambda_hat, sigma2_hat, alpha_0 = estimate_lognormal_params(alpha2, f_alpha2, H)
print(f"lambda_hat = {lambda_hat:.4f}")
print(f"sigma^2_hat = {sigma2_hat:.4f}")
print(f"alpha_0 = {alpha_0:.4f}")

def generate_lognormal_cascade(k, lambda_hat, sigma2_hat):
    """
    生成对数正态二分级联（m0和m1都独立从lognormal生成）
    k: 级数（总区间数为2^k）
    lambda_hat: 对数正态分布均值参数
    sigma2_hat: 对数正态分布方差参数
    返回: mass数组，长度2^k
    """
    n = 2 ** k
    mass = np.ones(n)
    for level in range(k):
        step = 2 ** (k - level - 1)
        for i in range(0, n, 2 * step):
            m0_val = np.random.lognormal(mean=lambda_hat, sigma=sigma2_hat)
            m1_val = np.random.lognormal(mean=lambda_hat, sigma=sigma2_hat)
            #total = m0_val + m1_val
            left = i
            right = i + step
            mass[left:left+step] *= m0_val #/ total
            mass[right:right+step] *= m1_val #/ total
    return mass

# 用法示例
generated_mass = generate_lognormal_cascade(k=13, lambda_hat=lambda_hat, sigma2_hat=sigma2_hat)
print(f"生成的对数正态二分级联质量数组长度: {len(generated_mass)}")
print(f"部分mass: {generated_mass[:10]}")

plt.figure(figsize=(12, 4))
plt.plot(generated_mass, color='purple')
plt.xlabel('Index')
plt.ylabel('Mass value')
plt.title('Generated lognormal cascade mass (sequence)')
plt.show()

def trading_time_cdf(k, mass):
    """
    将级联μ转换为交易时间CDF（累积和），归一化到总和为1
    k: 级数（总区间数为2^k）
    mass: 级联数组
    返回: cdf（与mass等长的数组）
    """
    cdf = np.cumsum(mass)
    cdf_normalized = 2**k * cdf / cdf[-1]  # 归一化到[0, 1]
    return cdf_normalized

# 用法示例
trading_time = trading_time_cdf(k=13, mass=generated_mass)
plt.figure(figsize=(10, 5))
plt.plot(trading_time)
plt.xlabel('Conventional time (days)')
plt.ylabel('Trading time (normalized to 1)')
plt.title('Trading time CDF (normalized to 1)')
plt.show()

def lognormal_cascade(k, v,ln_lambda, ln_theta):
    
    k = k - 1

    m0 = np.random.lognormal(ln_lambda,ln_theta)
    m1 = np.random.lognormal(ln_lambda,ln_theta)
    M = [m0, m1]
    #print("k:", k, "M:", M)
    
    if (k >= 0):
        d=[0 for x in range(0,2)]
        for i in range(0,2):
            d[i] = lognormal_cascade(k, (M[i]*v), ln_lambda, ln_theta)
        
        v = d

    return v

def MMAR(K, simulated_H, simulated_lambda, simulated_sigma, original_price_history, magnitude_parameter, GRAPHS, color):

    # --- VARIABLES ---
    # K
        # adjust K depending on how many days you want to simulate (e.g. if K=13, you'll simulate 2^13=8192 days)
    # simulated_H
        # the Hurst parameter for the fBm process
    # simulated_lambda
        # the mean for the lognormal cascade
    # simulated_sigma
        # the variance for the lognormal cascade
    # original_price_history
        # the price history of the market under study (used for starting the prices from the right time!)
    # magnitude_parameter
        # adjust this up or down to change the range of price changes (e.g. if prices are swinging too wildly every day, then adjust this downwards)
    # GRAPHS
        # Boolean - either True or False - use True if you want the MMAR to simulate graphs for you
        
    # --- MESSAGE ---
    if GRAPHS == True:
        print("Performing an MMAR simulation with parameters:\n\nH = " + str(simulated_H) + "\nlambda = " + str(simulated_lambda) + "\nsigma = " + str(simulated_sigma) + "\nfBm magnitude = " + str(magnitude_parameter)+ "\n")

    # --- CASCADE ---
    new_cascade = list(np.array(lognormal_cascade(k=K, v=1, ln_lambda = simulated_lambda, ln_theta = simulated_sigma)).flat)
    if GRAPHS == True:
#         plt.figure(figsize=(24,2))
        plt.xticks(np.arange(0, 2**(K)+1, 2**(K-3)))
        plt.title("Binomial Cascade")
        plt.xlabel("Conventional time\n(days)")
        plt.ylabel('"Mass"')
        plt.plot(new_cascade, color=color, linewidth=0.5)

wonderfullife1 = MMAR(13, H, lambda_hat, sigma2_hat, df['Price'], 0.15, True, "blue")
wonderfullife2 = MMAR(13, 0.43235420116535195, 1.118009759565887, 0.3405041898044085, df['Price'], 0.15, True, "crimson")
plt.show()