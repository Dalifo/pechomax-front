import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { useShops } from '../hooks/useShops';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { EntityId, Shop } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'Shops'>;
type ViewMode = 'list' | 'map';

const categories = ['Tous', 'Magasin', 'Appats', 'Occasion'];

export function ShopsScreen({ navigation }: Props) {
  const [category, setCategory] = useState('Tous');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [favorites, setFavorites] = useState<EntityId[]>([]);
  const { filteredShops, loading } = useShops(category);
  const showUnavailable = () => {
    Alert.alert('Fonction bientot disponible', 'Cette action sera ajoutee prochainement.');
  };

  if (selectedShop) {
    const favorite = favorites.includes(selectedShop.id);
    return (
      <Screen padded={false} scroll>
        <AppHeader
          action={
            <IconButton
              accessibilityLabel="Ajouter aux favoris"
              icon={favorite ? 'heart' : 'heart-outline'}
              onPress={() => setFavorites((current) => (favorite ? current.filter((id) => id !== selectedShop.id) : [...current, selectedShop.id]))}
              variant={favorite ? 'earth' : 'soft'}
            />
          }
          onBack={() => setSelectedShop(null)}
          showBack
          title="Magasin"
        />
        <LinearGradient colors={[colors.earth, colors.secondary]} style={styles.shopHero}>
          <Ionicons name="storefront-outline" size={64} color={colors.background} />
        </LinearGradient>
        <View style={styles.content}>
          <Badge label={selectedShop.type} tone="earth" />
          <Text style={styles.detailTitle}>{selectedShop.name}</Text>
          <Text style={styles.muted}>{selectedShop.address}</Text>
          <View style={styles.metaRow}>
            <Badge label={`${selectedShop.rating.toFixed(1)} / 5`} tone="primary" />
            <Badge label={`${selectedShop.reviews} avis`} tone="neutral" />
            <Badge label={selectedShop.distance} tone="secondary" />
          </View>
          <Card>
            <Text style={styles.cardTitle}>Specialites</Text>
            <View style={styles.badgeRow}>
              {selectedShop.specialties.map((item) => <Badge key={item} label={item} tone="secondary" />)}
            </View>
          </Card>
          <Card>
            <Text style={styles.cardTitle}>Services</Text>
            {selectedShop.services.map((item) => (
              <View key={item} style={styles.serviceRow}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.bodyText}>{item}</Text>
              </View>
            ))}
          </Card>
          <Button iconLeft="call-outline" onPress={showUnavailable} title="Appeler" />
          <Button iconLeft="navigate-outline" onPress={showUnavailable} title="Itineraire" variant="outline" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack subtitle="Magasins et ateliers proches" title="Magasins" />
      <View style={styles.content}>
        <View style={styles.segment}>
          <SegmentButton active={viewMode === 'list'} icon="list-outline" label="Liste" onPress={() => setViewMode('list')} />
          <SegmentButton active={viewMode === 'map'} icon="map-outline" label="Carte" onPress={() => setViewMode('map')} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {categories.map((item) => (
              <Pressable key={item} onPress={() => setCategory(item)} style={[styles.filterChip, item === category && styles.filterChipActive]}>
                <Text style={[styles.filterText, item === category && styles.filterTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {viewMode === 'map' ? (
          <View style={styles.mapMock}>
            <Ionicons name="map-outline" size={50} color={colors.secondary} />
            <Text style={styles.mapText}>Carte des magasins</Text>
            <Text style={styles.muted}>{filteredShops.length} magasins affiches</Text>
          </View>
        ) : null}

        {loading ? <EmptyState description="Chargement des magasins." icon="storefront-outline" title="Chargement" /> : null}
        {!loading && filteredShops.map((shop) => (
          <Card key={shop.id} onPress={() => setSelectedShop(shop)} style={styles.shopCard}>
            <View style={styles.shopIcon}>
              <Ionicons name="storefront-outline" size={28} color={colors.earth} />
            </View>
            <View style={styles.textFill}>
              <Text style={styles.title}>{shop.name}</Text>
              <Text style={styles.muted}>{shop.type}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.smallStrong}>{shop.rating.toFixed(1)}</Text>
                <Text style={styles.muted}>{shop.distance}</Text>
              </View>
            </View>
            <IconButton
              accessibilityLabel="Favori"
              icon={favorites.includes(shop.id) ? 'heart' : 'heart-outline'}
              onPress={() => setFavorites((current) => (current.includes(shop.id) ? current.filter((id) => id !== shop.id) : [...current, shop.id]))}
              size="sm"
              variant="soft"
            />
          </Card>
        ))}
      </View>
    </Screen>
  );
}

function SegmentButton({ active, icon, label, onPress }: { active: boolean; icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.segmentButton, active && styles.segmentButtonActive]}>
      <Ionicons name={icon} size={17} color={active ? colors.background : colors.textMuted} />
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  segment: {
    backgroundColor: opacity.black06,
    borderRadius: radius.md,
    flexDirection: 'row',
    padding: 3,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  segmentButtonActive: {
    backgroundColor: colors.earth,
  },
  segmentText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  segmentTextActive: {
    color: colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: opacity.black06,
    borderRadius: radius.round,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.secondary,
  },
  filterText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
  },
  filterTextActive: {
    color: colors.background,
  },
  mapMock: {
    alignItems: 'center',
    backgroundColor: opacity.secondary10,
    borderRadius: radius.xl,
    gap: spacing.sm,
    minHeight: 210,
    justifyContent: 'center',
  },
  mapText: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
  shopCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  shopIcon: {
    alignItems: 'center',
    backgroundColor: opacity.earth10,
    borderRadius: radius.md,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  textFill: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.weights.bold,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  smallStrong: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  shopHero: {
    alignItems: 'center',
    height: 190,
    justifyContent: 'center',
  },
  detailTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 26,
    fontWeight: typography.weights.bold,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  serviceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  bodyText: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
});
