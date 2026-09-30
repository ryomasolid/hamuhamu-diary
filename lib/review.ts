import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

/**
 * App Store のレビュー依頼。
 *
 * 記録が一定数たまった「アプリを気に入っていそうな」タイミングで
 * iOS 標準の評価ダイアログを出す。iOS 側でも年3回までに制限されるが、
 * しつこくならないようアプリ側でも間隔を空ける。
 */

const STORAGE_KEY = 'hamu-review-requested-at';
const RECORD_MILESTONES = [3, 15, 50];
const MIN_INTERVAL_DAYS = 60;

export async function maybeRequestReview(recordCount: number): Promise<void> {
  if (__DEV__) return;
  if (!RECORD_MILESTONES.some((m) => recordCount >= m)) return;

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const history: { at: string; count: number }[] = raw ? JSON.parse(raw) : [];
    const last = history[history.length - 1];

    // 前回依頼時からマイルストーンを1つ以上越えていなければ出さない
    const reached = RECORD_MILESTONES.filter((m) => recordCount >= m).length;
    const reachedAtLast = last
      ? RECORD_MILESTONES.filter((m) => last.count >= m).length
      : 0;
    if (reached <= reachedAtLast) return;

    if (last) {
      const days = (Date.now() - new Date(last.at).getTime()) / 86_400_000;
      if (days < MIN_INTERVAL_DAYS) return;
    }

    if (!(await StoreReview.hasAction())) return;
    await StoreReview.requestReview();
    history.push({ at: new Date().toISOString(), count: recordCount });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // レビュー依頼の失敗はアプリ動作に影響させない
  }
}
