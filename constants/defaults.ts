import type { CleaningOption, DailyTask, PresetMeal, Reminder, SingleFood } from '@/types';

export const DEFAULT_DAILY_TASKS: Omit<DailyTask, 'completed'>[] = [
  { id: 'water', label: '水換え', emoji: '💧' },
  { id: 'food', label: 'えさやり', emoji: '🌾' },
  { id: 'toilet', label: 'トイレ確認', emoji: '🧹' },
  { id: 'health', label: '様子確認', emoji: '❤️' },
];

export const DEFAULT_CLEANING_OPTIONS: CleaningOption[] = [
  { id: 'partial', name: '部分掃除', emoji: '🧹' },
  { id: 'toilet_sand', name: 'トイレ砂交換', emoji: '🏖️' },
  { id: 'full_wash', name: 'ケージ丸洗い', emoji: '🚿' },
  { id: 'water_bottle', name: '給水器洗浄', emoji: '💧' },
  { id: 'wheel', name: '回し車洗浄', emoji: '🎡' },
  { id: 'bedding', name: '床材交換', emoji: '🌿' },
];

export const DEFAULT_PRESET_MEALS: PresetMeal[] = [
  { id: 'pellets', name: 'いつものペレット', text: 'いつものペレット 4g' },
  { id: 'seeds', name: 'シードミックス', text: 'シードミックス 5g' },
  { id: 'veggies', name: '野菜盛り合わせ', text: 'ブロッコリー・にんじん少々' },
];

export const DEFAULT_SINGLE_FOODS: SingleFood[] = [
  { id: 'broccoli', name: 'ブロッコリー' },
  { id: 'carrot', name: 'にんじん' },
  { id: 'sunflower', name: 'ひまわりの種' },
  { id: 'pumpkin_seed', name: 'かぼちゃの種' },
  { id: 'corn', name: 'コーン' },
  { id: 'cucumber', name: 'きゅうり' },
  { id: 'apple', name: 'りんご' },
  { id: 'mealworm', name: 'ミールワーム' },
  { id: 'boiled_egg', name: 'ゆで卵（少量）' },
  { id: 'tofu', name: '豆腐（少量）' },
];

export const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: 'pellet_open',
    name: 'ペレット開封',
    lastDate: null,
    cycleDays: 30,
    category: 'food',
    emoji: '🌾',
  },
  {
    id: 'bedding_change',
    name: '床材全面交換',
    lastDate: null,
    cycleDays: 14,
    category: 'bedding',
    emoji: '🌿',
  },
  {
    id: 'water_filter',
    name: '給水フィルター交換',
    lastDate: null,
    cycleDays: 7,
    category: 'equipment',
    emoji: '💧',
  },
  {
    id: 'wheel_clean',
    name: '回し車洗浄',
    lastDate: null,
    cycleDays: 30,
    category: 'equipment',
    emoji: '🎡',
  },
];

export const HAMSTER_SPECIES = [
  'ゴールデンハムスター',
  'ジャンガリアンハムスター',
  'キャンベルハムスター',
  'ロボロフスキーハムスター',
  'チャイニーズハムスター',
  'その他',
] as const;
