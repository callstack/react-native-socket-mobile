/* @flow */

import { NativeModules } from 'react-native';
import SocketMobile, { emitter } from '../index';

const { ReactNativeSocketMobile } = NativeModules;

jest.mock('react-native', () => {
  const realReactNative = jest.requireActual('react-native');
  return {
    NativeEventEmitter: () => {
      const _listeners = [];
      return {
        addListener: jest.fn((name, callback) =>
          _listeners.push({ name, callback })
        ),
        removeAllListeners: jest.fn(),
        testTrigger: (name, param) => {
          _listeners.forEach(listener => {
            if (listener.name === name) {
              listener.callback(param);
            }
          });
        },
      };
    },
    NativeModules: {
      ...realReactNative.NativeModules,
      ReactNativeSocketMobile: {
        start: jest.fn(() => Promise.resolve(true)),
        stop: jest.fn(() => Promise.resolve(true)),
        updateStatusFromDevices: jest.fn(() =>
          Promise.resolve('Waiting for a scanner...')
        ),
      },
    },
  };
});

describe('Socket Mobile module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls starts and pass the right options', async () => {
    const bundleId = 'package.com';
    const developerId = '1234';
    const appKey = '5678';

    expect(ReactNativeSocketMobile.start).not.toBeCalled();

    const response = await SocketMobile.start({
      bundleId,
      developerId,
      appKey,
    });

    expect(response).toBe(true);
    expect(ReactNativeSocketMobile.start).toHaveBeenCalledTimes(1);
    expect(ReactNativeSocketMobile.start).toBeCalledWith(
      bundleId,
      developerId,
      appKey
    );
  });

  test('calls stop', async () => {
    expect(ReactNativeSocketMobile.stop).not.toBeCalled();

    const response = await SocketMobile.stop();

    expect(response).toBe(true);
    expect(ReactNativeSocketMobile.stop).toHaveBeenCalledTimes(1);
  });

  test('calls updateStatusFromDevices', async () => {
    expect(ReactNativeSocketMobile.updateStatusFromDevices).not.toBeCalled();

    const data = await SocketMobile.updateStatusFromDevices();

    expect(data).toEqual('Waiting for a scanner...');
    expect(
      ReactNativeSocketMobile.updateStatusFromDevices
    ).toHaveBeenCalledTimes(1);
  });

  test('sets data listener', async () => {
    expect(emitter.addListener).not.toBeCalled();

    const callback = jest.fn();
    SocketMobile.setDataListener(callback);

    expect(emitter.addListener).toHaveBeenCalledTimes(1);
    expect(emitter.addListener).toBeCalledWith('DecodedData', callback);
  });

  test('sets device status listener', async () => {
    expect(emitter.addListener).not.toBeCalled();

    const callback = jest.fn();
    SocketMobile.setDeviceStatusListener(callback);

    expect(emitter.removeAllListeners).toHaveBeenCalledTimes(0);

    emitter.testTrigger('StatusDeviceChanged', { status: 'disconnected' });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toBeCalledWith('disconnected');

    emitter.testTrigger('StatusDeviceChanged', { status: 'connected' });

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toBeCalledWith('connected');
  });

  it('removes all listeners', () => {
    expect(emitter.removeAllListeners).toHaveBeenCalledTimes(0);

    SocketMobile.clearAllListeners();

    expect(emitter.removeAllListeners).toHaveBeenCalledTimes(2);
    expect(emitter.removeAllListeners).toBeCalledWith('DecodedData');
    expect(emitter.removeAllListeners).toBeCalledWith('StatusDeviceChanged');
  });
});
