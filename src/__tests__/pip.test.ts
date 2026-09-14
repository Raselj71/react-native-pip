const mockNative = {
  isSupported: jest.fn(() => {
    return true;
  }),
  setParams: jest.fn(),
  clearParams: jest.fn(),
  setEnterOnLeave: jest.fn(),
  enter: jest.fn(async () => {
    return true;
  }),
  exit: jest.fn(),
  isInPip: jest.fn(() => {
    return false;
  }),
  getMaxActions: jest.fn(() => {
    return 3;
  }),
  addListener: jest.fn(() => {
    return { remove: jest.fn() };
  }),
};

let mockModule: typeof mockNative | null = mockNative;

jest.mock('../ReactNativePipModule', () => {
  return {
    __esModule: true,
    get default() {
      return mockModule;
    },
  };
});

import {
  addActionListener,
  addModeListener,
  clearParams,
  enter,
  exit,
  getMaxActions,
  isInPip,
  isSupported,
  setEnterOnLeave,
  setParams,
} from '../pip';

beforeEach(() => {
  jest.clearAllMocks();
  mockModule = mockNative;
});

describe('with the native module', () => {
  it('passes params through', () => {
    const params = {
      aspectRatio: { width: 4, height: 7 },
      actions: [{ id: 'mute', icon: 'mic', title: 'Mute' }],
      autoEnter: true,
    };
    setParams(params);
    expect(mockNative.setParams).toHaveBeenCalledWith(params);
  });

  it('forwards the simple calls', async () => {
    clearParams();
    setEnterOnLeave(true);
    exit();
    expect(mockNative.clearParams).toHaveBeenCalledTimes(1);
    expect(mockNative.setEnterOnLeave).toHaveBeenCalledWith(true);
    expect(mockNative.exit).toHaveBeenCalledTimes(1);
    expect(isSupported()).toBe(true);
    expect(isInPip()).toBe(false);
    expect(getMaxActions()).toBe(3);
    await expect(enter()).resolves.toBe(true);
  });

  it('sets params before entering when given', async () => {
    await enter({ autoEnter: false });
    expect(mockNative.setParams).toHaveBeenCalledWith({ autoEnter: false });
    expect(mockNative.enter).toHaveBeenCalledTimes(1);
  });

  it('unwraps event payloads', () => {
    const onMode = jest.fn();
    const onAction = jest.fn();
    addModeListener(onMode);
    addActionListener(onAction);
    const [modeEvent, modeHandler] = mockNative.addListener.mock.calls[0] as unknown as [
      string,
      (event: { isInPip: boolean }) => void,
    ];
    const [actionEvent, actionHandler] = mockNative.addListener.mock.calls[1] as unknown as [
      string,
      (event: { id: string }) => void,
    ];
    modeHandler({ isInPip: true });
    actionHandler({ id: 'mute' });
    expect(modeEvent).toBe('onPipModeChange');
    expect(actionEvent).toBe('onPipAction');
    expect(onMode).toHaveBeenCalledWith(true);
    expect(onAction).toHaveBeenCalledWith('mute');
  });
});

describe('without the native module (iOS, web, old builds)', () => {
  beforeEach(() => {
    mockModule = null;
  });

  it('is a safe no-op', async () => {
    expect(() => {
      setParams({ autoEnter: true });
      clearParams();
      setEnterOnLeave(true);
      exit();
    }).not.toThrow();
    expect(isSupported()).toBe(false);
    expect(isInPip()).toBe(false);
    expect(getMaxActions()).toBe(0);
    await expect(enter()).resolves.toBe(false);
    expect(() => {
      addModeListener(jest.fn()).remove();
      addActionListener(jest.fn()).remove();
    }).not.toThrow();
  });
});
