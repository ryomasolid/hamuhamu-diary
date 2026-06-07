import { File, Paths } from 'expo-file-system';
import { Share } from 'react-native';
import { format } from 'date-fns';
import { useRecordStore } from '@/store/recordStore';
import { useProfileStore } from '@/store/profileStore';
import { useReminderStore } from '@/store/reminderStore';
import type {
  DailyRecord,
  HamsterProfile,
  Reminder,
  PresetMeal,
  SingleFood,
  CleaningOption,
} from '@/types';

// DailyRecord に写真の base64 データを付加したバックアップ用の型（ファイル内部のみで使用）
interface BackupRecord extends DailyRecord {
  photoData: string | null;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  records: BackupRecord[];
  profile: HamsterProfile | null;
  reminders: Reminder[];
  presetMeals: PresetMeal[];
  singleFoods: SingleFood[];
  cleaningOptions: CleaningOption[];
}

export interface MergeResult {
  addedCount: number;
  updatedCount: number;
  skippedCount: number;
}

async function readPhotoAsBase64(uri: string): Promise<string | null> {
  try {
    return await new File(uri).base64();
  } catch {
    return null;
  }
}

function saveBase64Photo(base64: string, recordId: string): string {
  const file = new File(Paths.document, `hamuhamu-photo-${recordId}.jpg`);
  file.write(base64, { encoding: 'base64' });
  return file.uri;
}

export async function exportAndShare(): Promise<void> {
  const { records } = useRecordStore.getState();
  const { profile, presetMeals, singleFoods, cleaningOptions } = useProfileStore.getState();
  const { reminders } = useReminderStore.getState();

  const backupRecords: BackupRecord[] = await Promise.all(
    records.map(async (record) => ({
      ...record,
      photoData: record.photoUri ? await readPhotoAsBase64(record.photoUri) : null,
    })),
  );

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    records: backupRecords,
    profile,
    reminders,
    presetMeals,
    singleFoods,
    cleaningOptions,
  };

  const json = JSON.stringify(backup, null, 2);
  const fileName = `hamuhamu-${format(new Date(), 'yyyyMMdd-HHmmss')}.json`;
  const file = new File(Paths.cache, fileName);
  file.write(json);

  await Share.share({ url: file.uri });
}

export async function pickBackupFile(): Promise<BackupData | null> {
  const picked = await File.pickFileAsync(undefined, 'application/json');
  if (!picked) return null;

  const pickedFile = Array.isArray(picked) ? picked[0] : picked;
  if (!pickedFile) return null;

  const content = await pickedFile.text();

  const data = JSON.parse(content) as BackupData;
  if (typeof data.version !== 'number' || !Array.isArray(data.records)) {
    throw new Error('invalid_format');
  }

  return data;
}

// base64 写真を端末に保存し、photoUri を更新した DailyRecord[] を返す
export async function restorePhotos(records: BackupRecord[]): Promise<DailyRecord[]> {
  return Promise.all(
    records.map(async (record) => {
      const { photoData, ...dailyRecord } = record;
      if (!photoData) return { ...dailyRecord, photoUri: null };
      try {
        const localUri = saveBase64Photo(photoData, record.id);
        return { ...dailyRecord, photoUri: localUri };
      } catch {
        return { ...dailyRecord, photoUri: null };
      }
    }),
  );
}

export function mergeRecords(
  existing: DailyRecord[],
  incoming: DailyRecord[],
): { records: DailyRecord[] } & MergeResult {
  const map = new Map(existing.map((r) => [r.date, r]));
  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const r of incoming) {
    const local = map.get(r.date);
    if (!local) {
      map.set(r.date, r);
      addedCount++;
    } else if (r.updatedAt > local.updatedAt) {
      map.set(r.date, r);
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  const records = Array.from(map.values()).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  return { records, addedCount, updatedCount, skippedCount };
}

export function mergeReminders(
  existing: Reminder[],
  incoming: Reminder[],
): Reminder[] {
  const map = new Map(existing.map((r) => [r.id, r]));
  for (const r of incoming) {
    const local = map.get(r.id);
    if (local && r.lastDate && (!local.lastDate || r.lastDate > local.lastDate)) {
      map.set(r.id, { ...local, lastDate: r.lastDate });
    }
  }
  return existing.map((r) => map.get(r.id) ?? r);
}
