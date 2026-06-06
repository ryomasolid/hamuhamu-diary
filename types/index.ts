import { StyleProp, ViewStyle, TextStyle } from 'react-native';

// ─── UI 基本型 ─────────────────────────────────────────────
export type ColorScheme = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';
export type Size = 'sm' | 'md' | 'lg';
export type Variant = 'solid' | 'outline' | 'ghost';
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'label';

export interface BaseComponentProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface TextComponentProps {
  style?: StyleProp<TextStyle>;
  testID?: string;
}

// ─── ドメイン型 ───────────────────────────────────────────
export type HamsterSpecies =
  | 'ゴールデンハムスター'
  | 'ジャンガリアンハムスター'
  | 'キャンベルハムスター'
  | 'ロボロフスキーハムスター'
  | 'チャイニーズハムスター'
  | 'その他';

export interface HamsterProfile {
  id: string;
  name: string;
  species: string;
  birthDate: string | null;
  welcomeDate: string | null;
  photoUri: string | null;
}

export interface DailyRecord {
  id: string;
  date: string;       // YYYY-MM-DD
  weight: number | null;
  food: string;
  cleaningTaskIds: string[];
  memo: string;
  photoUri: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyTask {
  id: string;
  label: string;
  emoji: string;
  completed: boolean;
}

export interface PresetMeal {
  id: string;
  name: string;
  text: string;
}

export interface SingleFood {
  id: string;
  name: string;
}

export interface CleaningOption {
  id: string;
  name: string;
  emoji: string;
}

export type ReminderCategory = 'food' | 'bedding' | 'equipment' | 'other';

export interface Reminder {
  id: string;
  name: string;
  lastDate: string | null;
  cycleDays: number;
  category: ReminderCategory;
  emoji: string;
}

// ─── フォーム型 ────────────────────────────────────────────
export interface RecordFormValues {
  date: string;
  weight: string;
  food: string;
  cleaningTaskIds: string[];
  memo: string;
  photoUri: string | null;
}

export interface ProfileFormValues {
  name: string;
  species: string;
  birthDate: string;
  welcomeDate: string;
}
