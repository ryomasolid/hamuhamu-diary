import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { differenceInDays, format, parseISO, subDays } from 'date-fns';
import { getColors, radii, spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { DailyRecord } from '@/types';

type Range = '30' | '90' | 'all';

const RANGES: { key: Range; label: string }[] = [
  { key: '30', label: '1ヶ月' },
  { key: '90', label: '3ヶ月' },
  { key: 'all', label: '全期間' },
];

const CHART_HEIGHT = 160;
const PAD = { top: 16, right: 12, bottom: 22, left: 36 };

interface Point {
  date: string;
  weight: number;
}

/** 同じ日に複数記録がある場合は最新（createdAt が新しい方）を採用する */
function toDailyPoints(records: DailyRecord[]): Point[] {
  const byDate = new Map<string, DailyRecord>();
  for (const r of records) {
    if (r.weight == null) continue;
    const prev = byDate.get(r.date);
    if (!prev || r.createdAt > prev.createdAt) byDate.set(r.date, r);
  }
  return [...byDate.values()]
    .map((r) => ({ date: r.date, weight: r.weight as number }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function WeightChart({ records }: { records: DailyRecord[] }) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const [range, setRange] = useState<Range>('30');
  const [width, setWidth] = useState(0);

  const allPoints = useMemo(() => toDailyPoints(records), [records]);

  const points = useMemo(() => {
    if (range === 'all') return allPoints;
    const from = format(subDays(new Date(), Number(range)), 'yyyy-MM-dd');
    return allPoints.filter((p) => p.date >= from);
  }, [allPoints, range]);

  if (allPoints.length < 2) return null;

  const latest = allPoints[allPoints.length - 1] as Point;
  const first = points[0];
  const diff = first && points.length >= 2 ? latest.weight - first.weight : null;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  let chart: React.ReactNode = null;
  if (width > 0 && points.length >= 2) {
    const weights = points.map((p) => p.weight);
    const rawMin = Math.min(...weights);
    const rawMax = Math.max(...weights);
    const margin = Math.max((rawMax - rawMin) * 0.2, 1);
    const min = Math.floor(rawMin - margin);
    const max = Math.ceil(rawMax + margin);

    const start = parseISO((points[0] as Point).date);
    const span = Math.max(differenceInDays(parseISO(latest.date), start), 1);
    const innerW = width - PAD.left - PAD.right;
    const innerH = CHART_HEIGHT - PAD.top - PAD.bottom;

    const xy = points.map((p) => ({
      x: PAD.left + (differenceInDays(parseISO(p.date), start) / span) * innerW,
      y: PAD.top + (1 - (p.weight - min) / (max - min)) * innerH,
    }));

    const line = xy.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const lastXY = xy[xy.length - 1] as { x: number; y: number };
    const area = `${line} L${lastXY.x},${PAD.top + innerH} L${PAD.left},${PAD.top + innerH} Z`;
    const ticks = [max, (max + min) / 2, min];

    chart = (
      <Svg width={width} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity={0.25} />
            <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {ticks.map((t) => {
          const y = PAD.top + (1 - (t - min) / (max - min)) * innerH;
          return (
            <React.Fragment key={t}>
              <Line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y}
                y2={y}
                stroke={colors.border}
                strokeDasharray="3,4"
              />
              <SvgText x={PAD.left - 6} y={y + 4} fontSize={10} fill={colors.textTertiary} textAnchor="end">
                {Number.isInteger(t) ? t : t.toFixed(1)}
              </SvgText>
            </React.Fragment>
          );
        })}
        <Path d={area} fill="url(#weightFill)" />
        <Path d={line} stroke={colors.primary} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {xy.length <= 40 &&
          xy.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={3} fill={colors.surface} stroke={colors.primary} strokeWidth={2} />)}
        <Circle cx={lastXY.x} cy={lastXY.y} r={5} fill={colors.primary} />
        <SvgText x={PAD.left} y={CHART_HEIGHT - 4} fontSize={10} fill={colors.textTertiary}>
          {format(start, 'M/d')}
        </SvgText>
        <SvgText x={width - PAD.right} y={CHART_HEIGHT - 4} fontSize={10} fill={colors.textTertiary} textAnchor="end">
          {format(parseISO(latest.date), 'M/d')}
        </SvgText>
      </Svg>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text variant="label" weight="semibold">
            ⚖️ 体重の推移
          </Text>
          <View style={styles.latestRow}>
            <Text variant="h3" weight="bold" color={colors.primary}>
              {latest.weight}
            </Text>
            <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 2 }}>
              g
            </Text>
            {diff != null && (
              <Text
                variant="caption"
                weight="semibold"
                color={colors.textSecondary}
                style={{ marginLeft: spacing.sm }}
              >
                {diff > 0 ? '+' : diff < 0 ? '−' : '±'}
                {Math.abs(Math.round(diff * 10) / 10)}g
              </Text>
            )}
          </View>
        </View>
        <View style={[styles.segment, { backgroundColor: colors.surfaceSecondary, borderRadius: radii.full }]}>
          {RANGES.map((r) => (
            <Pressable
              key={r.key}
              onPress={() => setRange(r.key)}
              style={[
                styles.segmentItem,
                { borderRadius: radii.full },
                range === r.key && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                variant="caption"
                weight="semibold"
                color={range === r.key ? colors.textInverse : colors.textSecondary}
              >
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View onLayout={onLayout} style={{ height: CHART_HEIGHT, justifyContent: 'center' }}>
        {points.length >= 2 ? (
          chart
        ) : (
          <Text variant="caption" color={colors.textSecondary} align="center">
            この期間の体重記録が2件以上たまるとグラフが表示されます
          </Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  latestRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  segment: {
    flexDirection: 'row',
    padding: 2,
  },
  segmentItem: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
});
