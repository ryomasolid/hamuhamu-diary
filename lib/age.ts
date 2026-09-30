import { differenceInMonths, differenceInYears, parseISO } from 'date-fns';

/** 誕生日から「1歳2ヶ月」形式の年齢を返す。基準日を省略すると今日 */
export function calculateAge(birthDate: string, at: Date = new Date()): string {
  const birth = parseISO(birthDate);
  const years = differenceInYears(at, birth);
  const months = differenceInMonths(at, birth) - years * 12;
  if (years === 0 && months === 0) return '0ヶ月';
  if (years === 0) return `${months}ヶ月`;
  if (months === 0) return `${years}歳`;
  return `${years}歳${months}ヶ月`;
}
