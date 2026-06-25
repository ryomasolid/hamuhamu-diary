import { Directory, File, Paths } from 'expo-file-system';

/**
 * 写真ファイルの永続化ユーティリティ。
 *
 * ImagePicker が返す URI はキャッシュ/一時ディレクトリを指しており、
 * iOS のアプリ更新やキャッシュパージで消える。さらに絶対パスには
 * アプリコンテナの UUID が含まれるため、保存しても再インストール等で
 * 無効になる。
 *
 * そのため:
 *  - 選択した画像は必ず Documents ディレクトリ配下へコピーして永続化する
 *  - ストアには「相対パス（photos/xxx.jpg）」だけを保存する
 *  - 表示時に、その時点の Documents パスと結合して file:// URI を組み立てる
 */

const PHOTO_DIR = 'photos';

function photosDir(): Directory {
  const dir = new Directory(Paths.document, PHOTO_DIR);
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/** スキーム付き/絶対パスかどうか（= 旧形式の保存値 or ピッカー直後の URI） */
function isAbsoluteUri(value: string): boolean {
  return value.startsWith('/') || value.includes('://');
}

/**
 * ピッカー等が返したソース URI を Documents へコピーし、
 * 保存用の相対パス（例: "photos/1750000000-ab12cd.jpg"）を返す。
 * 失敗した場合は元の URI をそのまま返す（その場では表示できるようにする）。
 */
export async function persistPhoto(srcUri: string): Promise<string> {
  try {
    const dir = photosDir();
    const src = new File(srcUri);
    const ext = src.extension !== '' ? src.extension : '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const dest = new File(dir, name);
    src.copy(dest);
    return `${PHOTO_DIR}/${name}`;
  } catch {
    return srcUri;
  }
}

/**
 * 保存値（相対パス、または旧形式の絶対パス）から表示用の file:// URI を組み立てる。
 * 旧形式の絶対パス・content://・ph:// 等はそのまま返す（後方互換）。
 */
export function resolvePhotoUri(stored: string | null | undefined): string | null {
  if (stored == null || stored === '') return null;
  if (isAbsoluteUri(stored)) return stored;
  return new File(Paths.document, stored).uri;
}

/**
 * base64 の写真データを Documents/photos へ保存し、相対パスを返す。
 * key（レコードID等）で決め打ちの名前にするため、同じバックアップを
 * 再取り込みしても上書きされ、ファイルが増え続けない。
 */
export function saveBase64Photo(base64: string, key: string): string {
  const dir = photosDir();
  const name = `restored-${key}.jpg`;
  const file = new File(dir, name);
  file.write(base64, { encoding: 'base64' });
  return `${PHOTO_DIR}/${name}`;
}

/** 保存済みの写真ファイルを削除する（相対パスのみ対象。失敗は無視）。 */
export function deletePhotoFile(stored: string | null | undefined): void {
  if (stored == null || stored === '' || isAbsoluteUri(stored)) return;
  try {
    const file = new File(Paths.document, stored);
    if (file.exists) file.delete();
  } catch {
    // ignore
  }
}

/**
 * 旧形式（絶対パス）の保存値を相対パスへ移行する。
 *  - すでに相対パスなら何もしない
 *  - 絶対パスでファイルが存在すれば Documents/photos へコピーして相対パスを返す
 *  - ファイルが存在しない（= 既に消えている）場合は元の値のまま返す
 * 同期・冪等。マイグレーション用。
 */
export function migratePhotoValue(stored: string | null | undefined): string | null {
  if (stored == null || stored === '') return stored ?? null;
  if (!isAbsoluteUri(stored)) return stored; // すでに相対パス
  try {
    const src = new File(stored);
    if (!src.exists) return stored; // 復元不可。そのまま
    const dir = photosDir();
    const ext = src.extension !== '' ? src.extension : '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const dest = new File(dir, name);
    src.copy(dest);
    return `${PHOTO_DIR}/${name}`;
  } catch {
    return stored;
  }
}
