// EventEmitter 单元测试
const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const { EventEmitter } = require('../static/lightweight-charts.js');

describe('EventEmitter', () => {
    let emitter;

    beforeEach(() => {
        emitter = new EventEmitter();
    });

    describe('constructor', () => {
        it('should initialize with empty events object', () => {
            expect(emitter.events).toEqual({});
        });
    });

    describe('on()', () => {
        it('should register event listener', () => {
            const callback = jest.fn();
            emitter.on('test', callback);
            
            expect(emitter.events.test).toBeDefined();
            expect(emitter.events.test).toContain(callback);
        });

        it('should register multiple listeners for same event', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            emitter.on('test', callback1);
            emitter.on('test', callback2);
            
            expect(emitter.events.test).toHaveLength(2);
            expect(emitter.events.test).toContain(callback1);
            expect(emitter.events.test).toContain(callback2);
        });

        it('should not add duplicate listeners', () => {
            const callback = jest.fn();
            
            emitter.on('test', callback);
            emitter.on('test', callback);
            
            expect(emitter.events.test).toHaveLength(1);
        });
    });

    describe('off()', () => {
        it('should remove specific event listener', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            emitter.on('test', callback1);
            emitter.on('test', callback2);
            emitter.off('test', callback1);
            
            expect(emitter.events.test).toHaveLength(1);
            expect(emitter.events.test).toContain(callback2);
            expect(emitter.events.test).not.toContain(callback1);
        });

        it('should remove all listeners if no callback specified', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            emitter.on('test', callback1);
            emitter.on('test', callback2);
            emitter.off('test');
            
            expect(emitter.events.test).toBeUndefined();
        });

        it('should handle removing from non-existent event', () => {
            const callback = jest.fn();
            expect(() => emitter.off('nonexistent', callback)).not.toThrow();
        });

        it('should handle removing non-existent callback', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            emitter.on('test', callback1);
            expect(() => emitter.off('test', callback2)).not.toThrow();
            expect(emitter.events.test).toContain(callback1);
        });
    });

    describe('emit()', () => {
        it('should call all registered listeners', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            emitter.on('test', callback1);
            emitter.on('test', callback2);
            emitter.emit('test', 'arg1', 'arg2');
            
            expect(callback1).toHaveBeenCalledWith('arg1', 'arg2');
            expect(callback2).toHaveBeenCalledWith('arg1', 'arg2');
        });

        it('should pass correct arguments to listeners', () => {
            const callback = jest.fn();
            
            emitter.on('test', callback);
            emitter.emit('test', 'data', { key: 'value' }, 123);
            
            expect(callback).toHaveBeenCalledWith('data', { key: 'value' }, 123);
        });

        it('should handle emitting non-existent event', () => {
            expect(() => emitter.emit('nonexistent')).not.toThrow();
        });

        it('should handle errors in listeners gracefully', () => {
            const errorCallback = jest.fn(() => {
                throw new Error('Test error');
            });
            const normalCallback = jest.fn();
            
            emitter.on('test', errorCallback);
            emitter.on('test', normalCallback);
            
            // Should not throw and should still call other listeners
            expect(() => emitter.emit('test')).not.toThrow();
            expect(errorCallback).toHaveBeenCalled();
            expect(normalCallback).toHaveBeenCalled();
        });
    });

    describe('once()', () => {
        it('should call listener only once', () => {
            const callback = jest.fn();
            
            emitter.once('test', callback);
            emitter.emit('test', 'data1');
            emitter.emit('test', 'data2');
            
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith('data1');
        });

        it('should automatically remove listener after first call', () => {
            const callback = jest.fn();
            
            emitter.once('test', callback);
            emitter.emit('test');
            
            expect(emitter.events.test).toBeUndefined();
        });

        it('should work with multiple once listeners', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            emitter.once('test', callback1);
            emitter.once('test', callback2);
            emitter.emit('test', 'data');
            
            expect(callback1).toHaveBeenCalledWith('data');
            expect(callback2).toHaveBeenCalledWith('data');
            expect(emitter.events.test).toBeUndefined();
        });

        it('should allow manual removal of once listener', () => {
            const callback = jest.fn();
            
            emitter.once('test', callback);
            emitter.off('test', callback);
            emitter.emit('test');
            
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('mixed on/once usage', () => {
        it('should handle combination of on and once listeners', () => {
            const onCallback = jest.fn();
            const onceCallback = jest.fn();
            
            emitter.on('test', onCallback);
            emitter.once('test', onceCallback);
            
            emitter.emit('test', 'data1');
            expect(onCallback).toHaveBeenCalledWith('data1');
            expect(onceCallback).toHaveBeenCalledWith('data1');
            
            emitter.emit('test', 'data2');
            expect(onCallback).toHaveBeenCalledWith('data2');
            expect(onceCallback).toHaveBeenCalledTimes(1); // Still only called once
        });
    });
}); 