# my-expo-template

iOSアプリを爆速で量産するためのExpoひな型です。

---

## 新しいアプリを作るとき

### Step 1: テンプレートをコピーする

このフォルダをコピーして新しいフォルダ名に変更します。  
`node_modules` フォルダは削除してください（次のステップで再インストールします）。

### Step 2: アプリ情報を書き換える

**`app.json`** の以下3箇所を変更します。

```json
{
  "expo": {
    "name": "新しいアプリ名(日本語名)",
    "slug": "new-app-slug(ローマ字)",
    "ios": {
      "bundleIdentifier": "com.yourcompany.newapp",
      "infoPlist": {
        "CFBundleDisplayName": "短縮名"
      }
    }
  }
}
```

**`package.json`** の `name` を変更します。

```json
{
  "name": "new-app-name"
}
```

### Step 3: 依存パッケージをインストールする

```bash
npm install --legacy-peer-deps
```

---

## EAS Buildのセットアップ（初回のみ）

> EAS CLIとExpoアカウントのセットアップは、**このPC上で1回だけ**行います。

### PC全体の初期設定（1回のみ）

```bash
# EAS CLIをグローバルインストール
npm install -g eas-cli

# Expoアカウントでログイン（ブラウザが開く）
eas login
```

### アプリごとの初期設定（新しいアプリを作るたびに）

コピー先のプロジェクトフォルダで実行します。

```bash
# EASプロジェクトを登録（app.json に projectId が自動追記される）
eas build:configure

# 開発用クライアントアプリをビルド（初回15〜30分）
npm run build:dev
```

ビルド完了後、EASから発行されるQRコードをiPhoneカメラで読み取るとインストールできます。

> **必要なアカウント**
> - Expo アカウント（無料）← EAS Build の利用
> - Apple Developer Program（$99/年）← iPhoneへのインストール・App Store申請

---

## 日常の開発フロー

開発用クライアントアプリをiPhoneにインストール済みの状態で実行します。

```bash
# 開発サーバーを起動（トンネルモード）
npm start
```

ターミナルに表示されるQRコードをExpo Go（開発クライアント）でスキャンすると、ホットリロードで開発できます。

---

## ビルドコマンド一覧

| コマンド | 用途 |
|---|---|
| `npm run build:dev` | 開発用ビルド（expo-dev-client入り） |
| `npm run build:preview` | 社内テスト配布用ビルド |
| `npm run build:prod` | App Store申請用ビルド |
| `npm run submit:prod` | App Storeへ提出 |

---

## App Storeに申請するとき

**`eas.json`** の `submit.production.ios` を実際の情報に書き換えてから実行します。

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-apple-id@example.com",
      "ascAppId": "App Store Connect の数字ID",
      "appleTeamId": "XXXXXXXXXX"
    }
  }
}
```

```bash
npm run build:prod   # 本番ビルド
npm run submit:prod  # App Storeへ提出
```
