import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { SectionTitle } from '../components/ui/SectionTitle';
import { useTools } from '../hooks/useTools';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { FishingTool } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'Tools'>;

export function ToolsScreen({ navigation }: Props) {
  const { data, loading } = useTools();
  const [expandedId, setExpandedId] = useState<string | null>('conditions');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'Cannes et moulinets': true,
    'Leurres ou appâts': true,
    Épuisette: false,
    'Carte de pêche': true,
  });

  return (
    <Screen padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack subtitle="Préparation, conditions et aide locale" title="Outils" />
      <View style={styles.content}>
        <View style={styles.summaryGrid}>
          <SummaryCard icon="speedometer-outline" label="Pression" value="1015 hPa" />
          <SummaryCard icon="moon-outline" label="Lune" value="Quartier" />
          <SummaryCard icon="sunny-outline" label="Lever" value="07:30" />
          <SummaryCard icon="thermometer-outline" label="Eau" value="16 C" />
        </View>

        {loading ? <EmptyState description="Chargement des outils." icon="construct-outline" title="Chargement" /> : null}
        {!loading && data.map((tool) => (
          <ToolCard
            checkedItems={checkedItems}
            expanded={expandedId === tool.id}
            key={tool.id}
            onToggle={() => setExpandedId((current) => (current === tool.id ? null : tool.id))}
            setCheckedItems={setCheckedItems}
            tool={tool}
          />
        ))}
      </View>
    </Screen>
  );
}

function SummaryCard({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <Card padding="md" style={styles.summaryCard}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </Card>
  );
}

function ToolCard({
  checkedItems,
  expanded,
  onToggle,
  setCheckedItems,
  tool,
}: {
  checkedItems: Record<string, boolean>;
  expanded: boolean;
  onToggle: () => void;
  setCheckedItems: Dispatch<SetStateAction<Record<string, boolean>>>;
  tool: FishingTool;
}) {
  return (
    <Card onPress={onToggle} style={styles.toolCard}>
      <View style={styles.toolHeader}>
        <View style={styles.iconBox}>
          <Ionicons name={tool.icon} size={22} color={colors.secondary} />
        </View>
        <View style={styles.textFill}>
          <Text style={styles.title}>{tool.title}</Text>
          <Text style={styles.muted}>{tool.description}</Text>
        </View>
        {tool.value ? <Badge label={tool.value} tone="primary" /> : null}
      </View>
      {expanded ? (
        <View style={styles.expanded}>
          {tool.items?.map((item) => {
            const isChecklist = tool.id === 'checklist';
            const checked = checkedItems[item] ?? false;
            return (
              <Pressable
                accessibilityRole={isChecklist ? 'checkbox' : undefined}
                accessibilityState={isChecklist ? { checked } : undefined}
                key={item}
                onPress={() => {
                  if (isChecklist) {
                    setCheckedItems((current) => ({ ...current, [item]: !checked }));
                  }
                }}
                style={styles.toolItem}
              >
                <Ionicons
                  name={isChecklist ? (checked ? 'checkbox' : 'square-outline') : 'checkmark-circle-outline'}
                  size={18}
                  color={isChecklist && !checked ? colors.textMuted : colors.primary}
                />
                <Text style={styles.bodyText}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryCard: {
    flexBasis: '46%',
    flexGrow: 1,
    gap: spacing.xs,
  },
  summaryValue: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 17,
    fontWeight: typography.weights.bold,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  toolCard: {
    gap: spacing.md,
  },
  toolHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: opacity.secondary10,
    borderRadius: radius.md,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  textFill: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
  expanded: {
    borderTopColor: opacity.black08,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  toolItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bodyText: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
});
