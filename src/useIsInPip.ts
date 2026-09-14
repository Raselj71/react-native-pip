import { useSyncExternalStore } from 'react';

import { addModeListener, isInPip } from './pip';

const subscribe = (onChange: () => void) => {
  const subscription = addModeListener(() => {
    onChange();
  });
  return () => {
    subscription.remove();
  };
};

const getServerSnapshot = () => {
  return false;
};

export const useIsInPip = () => {
  return useSyncExternalStore(subscribe, isInPip, getServerSnapshot);
};
