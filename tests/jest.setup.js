// Jest 测试环境设置文件

// Mock LightweightCharts library
const mockLightweightCharts = {
    createChart: jest.fn().mockImplementation((container, options) => ({
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
        remove: jest.fn(),
        resize: jest.fn(),
        timeScale: jest.fn().mockReturnValue({
            setVisibleRange: jest.fn(),
            getVisibleRange: jest.fn().mockReturnValue({ 
                from: '2023-01-01', 
                to: '2023-12-31' 
            }),
            subscribeVisibleTimeRangeChange: jest.fn(),
            subscribeVisibleLogicalRangeChange: jest.fn(),
            options: jest.fn().mockReturnValue({
                barSpacing: 6,
                rightOffset: 12,
                fixLeftEdge: false,
                fixRightEdge: false,
                lockVisibleTimeRangeOnResize: false
            }),
            applyOptions: jest.fn(),
            getVisibleLogicalRange: jest.fn().mockReturnValue({ 
                from: 0, 
                to: 100 
            }),
            setVisibleLogicalRange: jest.fn(),
            fitContent: jest.fn()
        }),
        priceScale: jest.fn().mockReturnValue({
            applyOptions: jest.fn(),
            options: jest.fn().mockReturnValue({
                scaleMargins: { top: 0.1, bottom: 0.1 }
            })
        }),
        subscribeCrosshairMove: jest.fn()
    }))
};

// Set up both global and window LightweightCharts
global.LightweightCharts = mockLightweightCharts;

// Mock DOM elements
global.document = {
    createElement: jest.fn().mockImplementation((tagName) => ({
        tagName: tagName.toUpperCase(),
        style: {},
        innerHTML: '',
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        getBoundingClientRect: jest.fn().mockReturnValue({
            width: 1000,
            height: 400,
            top: 0,
            left: 0,
            bottom: 400,
            right: 1000
        }),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    })),
    body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
    }
};

global.window = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getComputedStyle: jest.fn().mockReturnValue({
        getPropertyValue: jest.fn().mockReturnValue('')
    }),
    requestAnimationFrame: jest.fn((callback) => setTimeout(callback, 16)),
    cancelAnimationFrame: jest.fn(),
    LightweightCharts: mockLightweightCharts
};

// Mock console methods for cleaner test output
const originalConsole = global.console;
global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
};

// Mock fetch for API calls
global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
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
    })
);

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
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