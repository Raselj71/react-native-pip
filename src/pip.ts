import nativeModule from './ReactNativePipModule';
import { type PipParams, type PipSubscription } from './ReactNativePip.types';

const noopSubscription: PipSubscription = {
  remove: () => {},
};

export const isSupported = () => {
  return nativeModule?.isSupported() ?? false;
};

export const setParams = (params: PipParams) => {
  nativeModule?.setParams(params);
};

export const clearParams = () => {
  nativeModule?.clearParams();
};

export const setEnterOnLeave = (enabled: boolean) => {
  nativeModule?.setEnterOnLeave(enabled);
};

export const enter = async (params?: PipParams) => {
  if (!nativeModule) {
    return false;
  }
  if (params) {
    nativeModule.setParams(params);
  }
  return nativeModule.enter();
};

export const exit = () => {
  nativeModule?.exit();
};

export const isInPip = () => {
  return nativeModule?.isInPip() ?? false;
};

export const getMaxActions = () => {
  return nativeModule?.getMaxActions() ?? 0;
};

export const addModeListener = (
  listener: (isInPip: boolean) => void
): PipSubscription => {
  if (!nativeModule) {
    return noopSubscription;
  }
  return nativeModule.addListener('onPipModeChange', (event) => {
    listener(event.isInPip);
  });
};

export const addActionListener = (
  listener: (id: string) => void
): PipSubscription => {
  if (!nativeModule) {
    return noopSubscription;
  }
  return nativeModule.addListener('onPipAction', (event) => {
    listener(event.id);
  });
};
