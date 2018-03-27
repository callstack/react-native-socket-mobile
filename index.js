/* @flow */

import { NativeEventEmitter, NativeModules } from 'react-native';

const { ReactNativeSocketMobile } = NativeModules;
// Exported only for test purposes
export const emitter = new NativeEventEmitter(ReactNativeSocketMobile);

const DECODED_DATA_LISTENER = 'DecodedData';
const STATUS_DEVICE_LISTENER = 'StatusDeviceChanged';

export const STATUS_WAITING = 'Waiting for a scanner...';

type ParamsType = {
  bundleId: string,
  developerId: string,
  appKey: string,
};

type StatusType = 'connected' | 'disconnected';

const start = (params: ParamsType) => {
  const { bundleId, developerId, appKey } = params;
  return ReactNativeSocketMobile.start(bundleId, developerId, appKey);
};

const stop = () => ReactNativeSocketMobile.stop();

const updateStatusFromDevices = () =>
  ReactNativeSocketMobile.updateStatusFromDevices();

const setDataListener = (callback: (result: { data: string }) => void) => {
  emitter.addListener(DECODED_DATA_LISTENER, callback);
};

const setDeviceStatusListener = (callback: (status: StatusType) => void) => {
  emitter.addListener(STATUS_DEVICE_LISTENER, ({ status }) => {
    callback(status);
  });
};

const clearAllListeners = () => {
  emitter.removeAllListeners(DECODED_DATA_LISTENER);
  emitter.removeAllListeners(STATUS_DEVICE_LISTENER);
};

export default {
  clearAllListeners,
  start,
  stop,
  setDataListener,
  setDeviceStatusListener,
  updateStatusFromDevices,
};
