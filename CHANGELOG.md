# Changelog

## 1.0.0

Initial release.

- `isSupported()` — whether Android picture-in-picture is available on this device/build.
- `setParams(params)` — store and apply PiP params (aspect ratio, actions, auto-enter, seamless resize, title, subtitle); re-applied on every foreground.
- `clearParams()` — apply "off" params once and stop managing PiP params.
- `setEnterOnLeave(enabled)` — enter PiP automatically when the user leaves the app (Android 8+).
- `enter(params?)` — optionally set params, then enter PiP now.
- `exit()` — leave PiP by sending the task to the back.
- `isInPip()` — whether the app is currently in PiP mode.
- `getMaxActions()` — the maximum number of custom actions the current device supports.
- `addModeListener(listener)` / `addActionListener(listener)` — subscribe to PiP mode changes and custom action taps.
- `useIsInPip()` — React hook (`useSyncExternalStore`) mirroring PiP mode.
- Config plugin: enables `android:supportsPictureInPicture`, adds the required `configChanges`, and copies icon files into `res/drawable`.
