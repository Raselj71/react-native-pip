import fs from 'fs';
import path from 'path';

export const ICON_PREFIX = 'rnpip_';

const REQUIRED_CONFIG_CHANGES = [
  'screenSize',
  'smallestScreenSize',
  'screenLayout',
  'orientation',
];

const ICON_EXTENSIONS = ['.png', '.webp', '.xml'];

export const sanitizeIconName = (name: string) => {
  return name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
};

export const applyPipActivityAttributes = (activity: {
  $: Record<string, string>;
}) => {
  activity.$['android:supportsPictureInPicture'] = 'true';
  const current = (activity.$['android:configChanges'] ?? '')
    .split('|')
    .filter(Boolean);
  const merged = [...current];
  REQUIRED_CONFIG_CHANGES.forEach((change) => {
    if (!merged.includes(change)) {
      merged.push(change);
    }
  });
  activity.$['android:configChanges'] = merged.join('|');
};

export const copyPipIcons = (
  projectRoot: string,
  drawableDir: string,
  icons: string[]
) => {
  fs.mkdirSync(drawableDir, { recursive: true });
  fs.readdirSync(drawableDir)
    .filter((file) => {
      return file.startsWith(ICON_PREFIX);
    })
    .forEach((file) => {
      fs.unlinkSync(path.join(drawableDir, file));
    });
  const seenNames = new Map<string, string>();
  icons.forEach((icon) => {
    const source = path.resolve(projectRoot, icon);
    const extension = path.extname(source).toLowerCase();
    if (!ICON_EXTENSIONS.includes(extension)) {
      throw new Error(
        `@raselj5060/react-native-pip: icon "${icon}" must be a png, webp or xml file`
      );
    }
    const name = sanitizeIconName(path.basename(source, path.extname(source)));
    const previousIcon = seenNames.get(name);
    if (previousIcon) {
      throw new Error(
        `@raselj5060/react-native-pip: icons "${previousIcon}" and "${icon}" both sanitize to the drawable name "${name}" — rename one of them`
      );
    }
    seenNames.set(name, icon);
    fs.copyFileSync(source, path.join(drawableDir, `${ICON_PREFIX}${name}${extension}`));
  });
};
