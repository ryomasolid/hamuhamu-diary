import { format, subDays } from 'date-fns';
import { DEFAULT_REMINDERS } from '@/constants/defaults';
import { useProfileStore } from '@/store/profileStore';
import { useRecordStore } from '@/store/recordStore';
import { useReminderStore } from '@/store/reminderStore';
import type { DailyRecord } from '@/types';

/**
 * ストア用スクショ撮影のためのデモデータ（SCREENSHOT_MODE のときだけ呼ばれる）。
 * 既存データは上書きされるので、撮影専用のシミュレーターで使うこと。
 */

const MEMOS = [
  '回し車でずっと走ってた🎡',
  'ひまわりの種をほっぺにぱんぱんに詰めてた',
  '手のひらでお昼寝してくれた😴',
  'はじめて名前を呼んだら出てきた！',
  '',
  '',
];
const FOODS = ['いつものペレット 4g', 'ペレット 4g・ブロッコリー少々', 'シードミックス 5g', 'ペレット 4g・にんじん'];
const CLEANING = [['partial'], ['toilet_sand'], [], ['partial', 'water_bottle'], [], ['full_wash', 'bedding']];

type PersistedStore = { persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => void } };

const waitHydration = (store: PersistedStore) =>
  store.persist.hasHydrated()
    ? Promise.resolve()
    : new Promise<void>((resolve) => store.persist.onFinishHydration(() => resolve()));

export async function seedDemoData() {
  // 永続化データの読み込み完了前に書き込むと上書きされるため待つ
  await Promise.all([useProfileStore, useRecordStore, useReminderStore].map(waitHydration));

  const today = new Date();
  const d = (n: number) => format(subDays(today, n), 'yyyy-MM-dd');

  useProfileStore.getState().setProfile({
    id: 'demo',
    name: 'もち',
    species: 'ジャンガリアンハムスター',
    birthDate: d(290),
    welcomeDate: d(230),
    photoUri: null,
  });

  const records: DailyRecord[] = [];
  for (let i = 0; i < 80; i++) {
    // 少しずつ増えて安定する体重カーブ + 日々のゆらぎ
    const base = 34 + 6 * (1 - Math.exp(-(80 - i) / 30));
    const weight = Math.round((base + Math.sin(i * 0.9) * 0.35) * 10) / 10;
    const at = subDays(today, i).toISOString();
    records.push({
      id: `demo-${i}`,
      date: d(i),
      weight: i % 3 === 2 ? null : weight,
      food: FOODS[i % FOODS.length] as string,
      cleaningTaskIds: CLEANING[i % CLEANING.length] as string[],
      memo: MEMOS[i % MEMOS.length] as string,
      photoUri: null,
      createdAt: at,
      updatedAt: at,
    });
  }
  useRecordStore.getState().setRecords(records);

  const lastDays = [22, 11, 2, 9];
  useReminderStore
    .getState()
    .setReminders(DEFAULT_REMINDERS.map((r, i) => ({ ...r, lastDate: d(lastDays[i] ?? 0) })));
}
