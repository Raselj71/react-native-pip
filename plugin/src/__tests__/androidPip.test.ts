/**
 * @jest-environment node
 */
import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  ICON_PREFIX,
  applyPipActivityAttributes,
  copyPipIcons,
  sanitizeIconName,
} from '../androidPip';

describe('sanitizeIconName', () => {
  it('lowercases and replaces anything outside a-z, 0-9 and _', () => {
    expect(sanitizeIconName('Mic-On.v2')).toBe('mic_on_v2');
  });
});

describe('applyPipActivityAttributes', () => {
  it('enables PiP and adds missing configChanges without duplicates', () => {
    const activity = { $: { 'android:configChanges': 'keyboard|screenSize|uiMode' } };
    applyPipActivityAttributes(activity);
    expect(activity.$['android:supportsPictureInPicture']).toBe('true');
    expect(activity.$['android:configChanges'].split('|').sort()).toEqual(
      ['keyboard', 'orientation', 'screenLayout', 'screenSize', 'smallestScreenSize', 'uiMode'].sort()
    );
  });

  it('works when configChanges is missing', () => {
    const activity: { $: Record<string, string> } = { $: {} };
    applyPipActivityAttributes(activity);
    expect(activity.$['android:configChanges'].split('|').sort()).toEqual(
      ['orientation', 'screenLayout', 'screenSize', 'smallestScreenSize'].sort()
    );
  });
});

describe('copyPipIcons', () => {
  let root: string;
  let drawableDir: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'rnpip-'));
    drawableDir = path.join(root, 'res', 'drawable');
    fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(root, 'assets', 'Mic-On.xml'), '<vector />');
    fs.writeFileSync(path.join(root, 'assets', 'end.png'), 'png');
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('copies icons with the prefix and removes stale ones', () => {
    fs.mkdirSync(drawableDir, { recursive: true });
    fs.writeFileSync(path.join(drawableDir, `${ICON_PREFIX}old.xml`), '<vector />');
    fs.writeFileSync(path.join(drawableDir, 'keep_me.xml'), '<vector />');
    copyPipIcons(root, drawableDir, ['./assets/Mic-On.xml', './assets/end.png']);
    expect(fs.readdirSync(drawableDir).sort()).toEqual(
      ['keep_me.xml', `${ICON_PREFIX}end.png`, `${ICON_PREFIX}mic_on.xml`].sort()
    );
  });

  it('rejects unsupported file types', () => {
    fs.writeFileSync(path.join(root, 'assets', 'bad.svg'), '<svg />');
    expect(() => {
      copyPipIcons(root, drawableDir, ['./assets/bad.svg']);
    }).toThrow(/png, webp or xml/);
  });
});
