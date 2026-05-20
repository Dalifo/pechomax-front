import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, opacity, radius, spacing, typography } from '../../theme/theme';
import { MainTabParamList } from '../../navigation/types';
import { TabAssetIcon, TabAssetName } from '../brand/BrandLogo';

const tabMeta: Record<keyof MainTabParamList, { asset: TabAssetName; label: string }> = {
  Home: { asset: 'home', label: 'Accueil' },
  Map: { asset: 'map', label: 'Carte' },
  Community: { asset: 'community', label: 'Forum' },
  Messages: { asset: 'messages', label: 'Messages' },
  Profile: { asset: 'profile', label: 'Profil' },
};

export function BottomTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {state.routes.map((route, index) => {
        const routeName = route.name as keyof MainTabParamList;
        const focused = state.index === index;
        const meta = tabMeta[routeName];
        const options = descriptors[route.key]?.options;
        const label = options?.tabBarAccessibilityLabel ?? meta.label;
        const color = focused ? colors.primary : colors.textMuted;

        const onPress = () => {
          const event = navigation.emit({
            canPreventDefault: true,
            target: route.key,
            type: 'tabPress',
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            accessibilityLabel={label}
            accessibilityRole="tab"
            accessibilityState={focused ? { selected: true } : undefined}
            key={route.key}
            onPress={onPress}
            style={({ pressed }) => [
              styles.item,
              focused && styles.itemActive,
              pressed && styles.pressed,
            ]}
          >
            <TabAssetIcon color={color} height={23} name={meta.asset} width={23} />
            <Text numberOfLines={1} style={[styles.label, { color }]}>{meta.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderTopColor: opacity.black08,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.sm,
  },
  item: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 2,
    paddingVertical: spacing.xs,
  },
  itemActive: {
    backgroundColor: opacity.primary10,
  },
  pressed: {
    opacity: 0.72,
  },
  label: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0,
  },
});
