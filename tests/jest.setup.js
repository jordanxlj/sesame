// Jest 测试环境设置文件

// Mock console 方法以减少测试输出
global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
};

// Mock SharedTimeScale 全局对象
global.SharedTimeScale = {
    registerChart: jest.fn(),
    unregisterChart: jest.fn(),
    setPrimaryChart: jest.fn(),
    syncAllCharts: jest.fn(),
    forceSync: jest.fn(),
    getAllCharts: jest.fn().mockReturnValue([]),
    getPrimaryChart: jest.fn().mockReturnValue(null),
    destroy: jest.fn(),
    updateDomain: jest.fn(),
    updateLogicalRange: jest.fn()
};

// Mock globalTimeScale for backwards compatibility
global.globalTimeScale = global.SharedTimeScale;

// 增强 LightweightCharts Mock
const createMockTimeScale = () => ({
    subscribeVisibleTimeRangeChange: jest.fn(),
    unsubscribeVisibleTimeRangeChange: jest.fn(),
    subscribeCrosshairMove: jest.fn(),
    unsubscribeCrosshairMove: jest.fn(),
    subscribeVisibleLogicalRangeChange: jest.fn(),
    setVisibleRange: jest.fn(),
    getVisibleRange: jest.fn().mockReturnValue({ from: 1672531200, to: 1704067199 }),
    setVisibleLogicalRange: jest.fn(),
    getVisibleLogicalRange: jest.fn().mockReturnValue({ from: 0, to: 100 }),
    fitContent: jest.fn(),
    scrollToPosition: jest.fn(),
    options: jest.fn().mockReturnValue({
        barSpacing: 10,
        rightOffset: 5,
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: true
    }),
    applyOptions: jest.fn()
});

const createMockChart = () => ({
    addSeries: jest.fn().mockReturnValue({
        setData: jest.fn(),
        update: jest.fn(),
        setMarkers: jest.fn(),
        applyOptions: jest.fn(),
        priceScale: jest.fn().mockReturnValue({
            applyOptions: jest.fn()
        })
    }),
    addCandlestickSeries: jest.fn().mockReturnValue({
        setData: jest.fn(),
        applyOptions: jest.fn(),
        priceFormatter: jest.fn()
    }),
    addLineSeries: jest.fn().mockReturnValue({
        setData: jest.fn(),
        applyOptions: jest.fn()
    }),
    addHistogramSeries: jest.fn().mockReturnValue({
        setData: jest.fn(),
        applyOptions: jest.fn()
    }),
    removeSeries: jest.fn(),
    timeScale: jest.fn().mockImplementation(() => createMockTimeScale()),
    priceScale: jest.fn().mockImplementation((id) => ({
        applyOptions: jest.fn(),
        options: jest.fn().mockReturnValue({
            scaleMargins: { top: 0.1, bottom: 0.1 }
        })
    })),
    resize: jest.fn(),
    remove: jest.fn(),
    takeScreenshot: jest.fn()
});

// 全局 LightweightCharts Mock
global.LightweightCharts = {
    createChart: jest.fn().mockImplementation(() => createMockChart()),
    version: '4.0.0'
};

// 确保在 window 对象上也可用
global.window = global.window || {};
global.window.LightweightCharts = global.LightweightCharts;
global.window.addEventListener = jest.fn();
global.window.removeEventListener = jest.fn();
global.window.getComputedStyle = jest.fn().mockReturnValue({
    getPropertyValue: jest.fn().mockReturnValue('')
});
global.window.toggleStock = jest.fn();

// Mock DOM 元素创建
global.document = global.document || {};
global.document.createElement = jest.fn().mockImplementation((tagName) => ({
    tagName: tagName.toUpperCase(),
    style: {},
    innerHTML: '',
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    remove: jest.fn(),
    click: jest.fn(),
    id: '',
    className: '',
    textContent: '',
    getBoundingClientRect: jest.fn().mockReturnValue({
        width: 1000,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 1000
    }),
    parentNode: {
        removeChild: jest.fn()
    }
}));

global.document.getElementById = jest.fn().mockReturnValue(null);

// Mock methods on existing document.body instead of replacing it
if (global.document.body) {
    global.document.body.appendChild = jest.fn();
    global.document.body.removeChild = jest.fn();
} else {
    // If body doesn't exist, create a mock one
    Object.defineProperty(global.document, 'body', {
        value: {
            appendChild: jest.fn(),
            removeChild: jest.fn(),
            getBoundingClientRect: jest.fn().mockReturnValue({
                width: 1000,
                height: 600,
                top: 0,
                left: 0,
                bottom: 600,
                right: 1000
            })
        },
        writable: true,
        configurable: true
    });
}

// Mock requestAnimationFrame 和 cancelAnimationFrame (immediate execution)
global.requestAnimationFrame = jest.fn().mockImplementation(cb => {
    setImmediate(cb);
    return 1;
});
global.cancelAnimationFrame = jest.fn();

// Mock performance API
global.performance = {
    now: jest.fn().mockReturnValue(Date.now())
};

// Mock fetch API
global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([
        {
            time: '2023-01-01',
            open: 100,
            high: 110,
            low: 90,
            close: 105,
            volume: 1000
        }
    ])
});

// Reset all mocks before each test and restore the default LightweightCharts mock
beforeEach(() => {
    jest.clearAllMocks();
    
    // Restore the default LightweightCharts mock to ensure fresh chart instances
    global.LightweightCharts.createChart.mockImplementation(() => createMockChart());
});

// Global test utilities
global.createMockContainer = () => {
    return {
        style: {},
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        getBoundingClientRect: jest.fn().mockReturnValue({
            width: 1000,
            height: 400
        })
    };
};

global.createMockOHLCData = (count = 5) => {
    const data = [];
    const startDate = new Date('2023-01-01');
    
    for (let i = 0; i < count; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const open = 100 + Math.random() * 10;
        const close = open + (Math.random() - 0.5) * 5;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        
        data.push({
            time: date.toISOString().split('T')[0],
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: Math.floor(Math.random() * 10000)
        });
    }
    
    return data;
};

global.createMockIndicatorData = (count = 5) => {
    const data = [];
    const startDate = new Date('2023-01-01');
    
    for (let i = 0; i < count; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        data.push({
            time: date.toISOString().split('T')[0],
            value: 100 + Math.random() * 20
        });
    }
    
    return data;
};

// Export for use in tests
module.exports = {
    createMockChart,
    createMockTimeScale,
    SharedTimeScale: global.SharedTimeScale,
    LightweightCharts: global.LightweightCharts
}; 