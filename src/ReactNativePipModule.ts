import { requireOptionalNativeModule, type NativeModule } from 'expo';
import { Platform } from 'react-native';

import {
  type PipParams,
  type PipSubscription,
  type ReactNativePipEvents,
} from './ReactNativePip.types';

export type ReactNativePipNativeModule = NativeModule<ReactNativePipEvents> & {
  isSupported: () => boolean;
  setParams: (params: PipParams) => void;
  clearParams: () => void;
  setEnterOnLeave: (enabled: boolean) => void;
  enter: () => Promise<boolean>;
  exit: () => void;
  isInPip: () => boolean;
  getMaxActions: () => number;
  addListener: <EventName extends keyof ReactNativePipEvents>(
    eventName: EventName,
    listener: ReactNativePipEvents[EventName]
  ) => PipSubscription;
};

const nativeModule =
  Platform.OS === 'android'
    ? requireOptionalNativeModule<ReactNativePipNativeModule>('ReactNativePip')
    : null;

export default nativeModule;
