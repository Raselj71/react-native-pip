import { act, renderHook } from '@testing-library/react-native';

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
  addListener: jest.fn(),
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

import { useIsInPip } from '../useIsInPip';

beforeEach(() => {
  jest.clearAllMocks();
  mockModule = mockNative;
  mockNative.isInPip.mockReturnValue(false);
});

describe('useIsInPip', () => {
  it('follows isInPip(), flips on mode change events, and unsubscribes on unmount', () => {
    let modeHandler: ((event: { isInPip: boolean }) => void) | undefined;
    const remove = jest.fn();
    mockNative.addListener.mockImplementation((_eventName, listener) => {
      modeHandler = listener;
      return { remove };
    });

    const { result, unmount } = renderHook(() => {
      return useIsInPip();
    });
    expect(result.current).toBe(false);

    mockNative.isInPip.mockReturnValue(true);
    act(() => {
      modeHandler?.({ isInPip: true });
    });
    expect(result.current).toBe(true);

    unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
