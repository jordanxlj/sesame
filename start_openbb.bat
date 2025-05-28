@echo off
chcp 65001 >nul
title 股票可视化应用 - OpenBB环境

echo.
echo ████████████████████████████████████████████████
echo █                                              █
echo █    🎯 股票可视化应用 - OpenBB环境启动器      █
echo █                                              █
echo ████████████████████████████████████████████████
echo.

REM 设置颜色
color 0A

echo [INFO] 正在检查环境...

REM 检查是否在正确的目录
if not exist "app.py" (
    echo [ERROR] 未找到app.py文件
    echo [INFO] 请确保在正确的项目目录中运行此脚本
    echo [INFO] 当前目录: %CD%
    pause
    exit /b 1
)

REM 设置Anaconda路径
set ANACONDA_PATH=D:\anaconda3

REM 检查Anaconda是否存在
if not exist "%ANACONDA_PATH%\Scripts\conda.exe" (
    echo [ERROR] 未找到Anaconda安装
    echo [INFO] 预期路径: %ANACONDA_PATH%
    echo [INFO] 请确认Anaconda安装路径是否正确
    pause
    exit /b 1
)

echo [INFO] ✅ 找到Anaconda: %ANACONDA_PATH%

REM 初始化conda环境
call "%ANACONDA_PATH%\Scripts\activate.bat" "%ANACONDA_PATH%"

echo.
echo [INFO] 🔄 激活OpenBB环境...

REM 尝试激活openbb环境
call conda activate openbb 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo [WARN] openbb环境不存在，尝试激活obb环境...
    call conda activate obb 2>nul
    
    if %ERRORLEVEL% NEQ 0 (
        echo [INFO] 未找到OpenBB环境，正在创建...
        echo [INFO] 这可能需要几分钟时间，请耐心等待...
        echo.
        
        REM 创建openbb环境
        echo [INFO] 步骤1/3: 创建Python环境...
        call conda create -n openbb python=3.10 -y
        
        if %ERRORLEVEL% NEQ 0 (
            echo [ERROR] 创建环境失败
            pause
            exit /b 1
        )
        
        echo [INFO] 步骤2/3: 激活环境...
        call conda activate openbb
        
        echo [INFO] 步骤3/3: 安装OpenBB Terminal...
        echo [INFO] 正在安装OpenBB，这可能需要10-15分钟...
        pip install openbb[all] --timeout 300
        
        if %ERRORLEVEL% NEQ 0 (
            echo [WARN] OpenBB完整安装可能失败，尝试安装核心版本...
            pip install openbb --timeout 300
        )
    )
)

echo [INFO] ✅ OpenBB环境已激活

echo.
echo [INFO] 📦 验证OpenBB安装...
python -c "import openbb; print('OpenBB版本:', openbb.__version__)" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo [WARN] OpenBB导入失败，但继续安装基础依赖...
)

echo.
echo [INFO] 📦 安装应用依赖...
pip install Flask==2.3.3 pandas>=2.0.0 numpy>=1.24.0 scipy>=1.11.0 --quiet

if %ERRORLEVEL% NEQ 0 (
    echo [WARN] 依赖安装可能有问题，但继续尝试启动...
)

echo [INFO] ✅ 依赖安装完成

echo.
echo [INFO] 🚀 启动股票可视化应用...
echo [INFO] 应用地址: http://localhost:5000
echo [INFO] 使用 Ctrl+C 停止应用
echo [INFO] 
echo [INFO] 📋 修复说明：
echo [INFO] ✅ 已修复多股票数据截断问题
echo [INFO] ✅ 01810股票现在显示完整历史数据
echo [INFO] ✅ 价格信息栏数据查找已优化
echo [INFO] ✅ 使用OpenBB环境提供更好的数据支持
echo.
echo ================================================

python app.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] 应用启动失败
    echo [INFO] 请检查上方的错误信息
    echo [INFO] 常见解决方案：
    echo [INFO] 1. 确保网络连接正常
    echo [INFO] 2. 检查端口5000是否被占用
    echo [INFO] 3. 重新运行此脚本
    pause
    exit /b 1
)

echo.
echo [INFO] 应用已停止
pause 