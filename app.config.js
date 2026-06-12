// 開発ビルドを実アプリと同じ端末に共存させるための設定。
// eas.json の development プロファイルが APP_VARIANT=development を設定し、
// Bundle ID とアプリ名を切り替える(本番ビルドは app.json のまま)。
const IS_DEV = process.env.APP_VARIANT === 'development';

export default ({ config }) => ({
  ...config,
  name: IS_DEV ? 'はむ日記 (Dev)' : config.name,
  ios: {
    ...config.ios,
    bundleIdentifier: IS_DEV
      ? 'com.ryomasolid.hamuhamudiary.dev'
      : config.ios.bundleIdentifier,
    infoPlist: {
      ...config.ios.infoPlist,
      CFBundleDisplayName: IS_DEV
        ? 'はむ日記 Dev'
        : config.ios.infoPlist.CFBundleDisplayName,
    },
  },
});
