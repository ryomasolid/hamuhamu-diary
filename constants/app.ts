export const APP_STORE_ID = '6777478295';
export const APP_STORE_URL = `https://apps.apple.com/jp/app/id${APP_STORE_ID}`;
export const APP_STORE_REVIEW_URL = `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`;
export const APP_SHARE_MESSAGE = `ハムスターの体重・ごはん・お掃除をかんたん記録できるアプリ「はむはむ日記」🐹\n${APP_STORE_URL}`;

/** ストア用スクショ撮影モード（開発ビルド + EXPO_PUBLIC_SCREENSHOT_MODE=1 のときだけ有効） */
export const SCREENSHOT_MODE = __DEV__ && process.env.EXPO_PUBLIC_SCREENSHOT_MODE === '1';
