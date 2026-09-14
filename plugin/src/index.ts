import path from 'path';
import {
  AndroidConfig,
  type ConfigPlugin,
  withAndroidManifest,
  withDangerousMod,
} from 'expo/config-plugins';

import { applyPipActivityAttributes, copyPipIcons } from './androidPip';

type ReactNativePipPluginProps = {
  icons?: string[];
};

const withReactNativePip: ConfigPlugin<ReactNativePipPluginProps | void> = (
  config,
  props
) => {
  const icons = props?.icons ?? [];

  const withManifest = withAndroidManifest(config, (modConfig) => {
    const activity = AndroidConfig.Manifest.getMainActivityOrThrow(modConfig.modResults);
    applyPipActivityAttributes(activity as unknown as { $: Record<string, string> });
    return modConfig;
  });

  return withDangerousMod(withManifest, [
    'android',
    async (modConfig) => {
      const drawableDir = path.join(
        modConfig.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'drawable'
      );
      copyPipIcons(modConfig.modRequest.projectRoot, drawableDir, icons);
      return modConfig;
    },
  ]);
};

export default withReactNativePip;
