# @raselj5060/react-native-pip

Android picture-in-picture for Expo and React Native apps: custom actions, auto-enter, and a
leave-app fallback.

This package is **Android-only**. On iOS and web every function is a safe no-op —
`isSupported()` returns `false`, `enter()` resolves to `false`, and nothing throws.

## Install

```sh
pnpm add @raselj5060/react-native-pip
```

Add the config plugin to `app.config.ts` (or `app.json`), listing any custom action icons you
want to use:

```ts
export default {
  // ...
  plugins: [
    [
      '@raselj5060/react-native-pip',
      { icons: ['./assets/pip/mic.xml', './assets/pip/end.png'] },
    ],
  ],
};
```

Then rebuild the native project — `expo prebuild` followed by a native build (`expo run:android`
or an EAS build). This package is **not** available in Expo Go.

## Icons

Action icons must be white monochrome, since Android tints them for the system PiP overlay.
Supported formats: `.png`, `.webp`, or an XML vector drawable. Each icon listed in the plugin's
`icons` array is copied into `res/drawable` and referenced from `PipAction.icon` by file name,
**without the extension** — `./assets/pip/mic.xml` becomes `icon: 'mic'`.

## Quick start

```tsx
import { useEffect } from 'react';
import { View } from 'react-native';
import {
  addActionListener,
  enter,
  useIsInPip,
} from '@raselj5060/react-native-pip';

const CallScreen = () => {
  const isInPip = useIsInPip();

  useEffect(() => {
    enter({
      autoEnter: true,
      aspectRatio: { width: 4, height: 7 },
      actions: [
        { id: 'mute', icon: 'mic', title: 'Mute' },
        { id: 'speaker', icon: 'speaker', title: 'Speaker' },
        { id: 'end', icon: 'end', title: 'End' },
      ],
    });
    const subscription = addActionListener((id) => {
      if (id === 'end') {
        // hang up
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  if (isInPip) {
    return <View />;
  }

  return <View />;
};

export default CallScreen;
```

## API

| Export | Description |
| --- | --- |
| `isSupported()` | Whether Android PiP is available on this device and build. |
| `setParams(params)` | Stores and applies PiP params (aspect ratio, actions, auto-enter, seamless resize, title/subtitle). Re-applied on every foreground. `autoEnter` / `seamlessResize` need Android 12+ (API 31); `title` / `subtitle` need Android 13+ (API 33). |
| `clearParams()` | Applies "off" params once (no actions, auto-enter off) and stops managing PiP params — use this to hand PiP back to another library. |
| `setEnterOnLeave(enabled)` | Enables or disables entering PiP automatically from `onUserLeaveHint` (Android 8+, API 26). |
| `enter(params?)` | Optionally calls `setParams`, then enters PiP immediately. Resolves to whether PiP actually started. No-op below Android 8 (API 26). |
| `exit()` | Leaves PiP by sending the task to the back. |
| `isInPip()` | Whether the app is currently in PiP mode. |
| `getMaxActions()` | The maximum number of custom actions the current device accepts. |
| `addModeListener(listener)` | Subscribes to PiP mode changes: `listener(isInPip: boolean)`. Returns `{ remove() }`. |
| `addActionListener(listener)` | Subscribes to custom action taps: `listener(id: string)`. Returns `{ remove() }`. |
| `useIsInPip()` | React hook (`useSyncExternalStore`) mirroring PiP mode changes. |

## Behaviour notes

- Params set with `setParams` (or `enter`) are re-applied every time the activity comes back to
  the foreground, since another library (or the system) may have changed them while your app was
  backgrounded.
- `clearParams()` applies an "off" state once and then stops re-applying on foreground, so other
  PiP-aware libraries (e.g. `expo-video`) can manage their own params without this package
  fighting them.
- `setEnterOnLeave` is the fallback path for Android 8–11, where there is no system auto-enter —
  and it also covers devices where another library has turned its own auto-enter off.
- A JS reload (or the activity being destroyed) clears all stored params and disables
  `enterOnLeave` — nothing carries over across reloads.
- React Native apps are single-activity: entering PiP shrinks the whole activity, not just one
  screen. Render your compact PiP layout only while `useIsInPip()` is `true`, and your normal
  layout otherwise.
- `exit()` does not restore focus by itself — it sends the task to the back, matching how Android
  expects apps to leave PiP.

## Limitations

- Android only. iOS and web builds always see `isSupported() === false`.
- Requires a native rebuild after adding the plugin — it does not work in Expo Go.
- The number of custom actions the system will show varies by device; check `getMaxActions()`
  rather than assuming a fixed count.
- Icons must be `.png`, `.webp`, or `.xml`; any other extension makes the config plugin throw
  during prebuild.
- Below Android 8 (API 26), PiP-related calls are safe no-ops.

## Credits

Structure inspired by [`expo-pip`](https://github.com/mounirdhahri/expo-pip).
