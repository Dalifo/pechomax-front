import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { SectionTitle } from '../components/ui/SectionTitle';
import { useSpotDetail } from '../hooks/useSpotDetail';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SpotDetail'>;

export function SpotDetailScreen({ navigation, route }: Props) {
  const { data: spot, loading } = useSpotDetail(route.params.spotId);

  const showUnavailable = () => {
    Alert.alert('Fonction a venir', 'Cette action sera disponible prochainement.');
  };

  if (loading || !spot) {
    return (
      <Screen padded={false}>
        <AppHeader onBack={navigation.goBack} showBack title="Spot" />
        <EmptyState description="Chargement du spot." icon="location-outline" title="Chargement" />
      </Screen>
    );
  }

  return (
    <Screen padded={false} scroll>
      <AppHeader
        action={
          <IconButton
            accessibilityLabel="Ajouter aux favoris"
            icon="heart-outline"
            onPress={showUnavailable}
            variant="soft"
          />
        }
        onBack={navigation.goBack}
        showBack
        title="Spot"
      />

      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.hero}>
        <Ionicons name="camera-outline" size={64} color={opacity.surface88} />
      </LinearGradient>

      <View style={styles.content}>
        <View>
          <Text style={styles.title}>{spot.name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={17} color={colors.textMuted} />
            <Text style={styles.muted}>{spot.location}</Text>
          </View>
          <View style={styles.badgeRow}>
            <Badge label={`${spot.rating.toFixed(1)} / 5`} tone="earth" />
            <Badge label={`${spot.photos ?? 0} photos`} tone="neutral" />
            <Badge label={spot.waterType === 'freshwater' ? 'Eau douce' : 'Mer'} tone="secondary" />
          </View>
        </View>

        <SectionTitle icon="fish-outline" title="Poissons disponibles" />
        <View style={styles.badgeRow}>
          {spot.fish.map((fish) => (
            <Badge key={fish} label={fish} tone="secondary" />
          ))}
        </View>

        <Card>
          <Text style={styles.cardTitle}>Conditions</Text>
          <Text style={styles.bodyText}>{spot.conditions}</Text>
        </Card>

        {spot.bathymetry ? (
          <Card style={styles.cardGap}>
            <SectionTitle icon="layers-outline" title="Bathymetrie et hydrologie" />
            <View style={styles.depthGrid}>
              <View style={styles.depthCell}>
                <Text style={styles.muted}>Profondeur max</Text>
                <Text style={styles.depthValue}>{spot.bathymetry.maxDepth} m</Text>
              </View>
              <View style={styles.depthCell}>
                <Text style={styles.muted}>Profondeur moy.</Text>
                <Text style={styles.depthValue}>{spot.bathymetry.avgDepth} m</Text>
              </View>
            </View>
            <Text style={styles.bodyText}>Fond: {spot.bathymetry.bottom}</Text>
            <View style={styles.badgeRow}>
              {spot.bathymetry.structure.map((item) => (
                <Badge key={item} label={item} tone="primary" />
              ))}
            </View>
            {spot.hydrology ? (
              <View style={styles.hydroGrid}>
                <HydroItem icon="thermometer-outline" label="Temperature" value={`${spot.hydrology.waterTemp} C`} />
                <HydroItem icon="eye-outline" label="Clarte" value={spot.hydrology.clarity} />
                <HydroItem icon="pulse-outline" label="Oxygenation" value={spot.hydrology.oxygenation} />
                <HydroItem icon="water-outline" label="Debit" value={spot.hydrology.flow} />
              </View>
            ) : null}
          </Card>
        ) : null}

        <SectionTitle icon="chatbubble-outline" title={`Commentaires (${spot.comments?.length ?? 0})`} />
        {spot.comments?.length ? (
          <View style={styles.listGap}>
            {spot.comments.map((comment) => (
              <Card key={`${comment.user}-${comment.date}`} padding="md" style={styles.commentCard}>
                <Avatar initials={comment.user.slice(0, 2)} size="sm" />
                <View style={styles.textFill}>
                  <Text style={styles.commentName}>{comment.user}</Text>
                  <Text style={styles.bodyText}>{comment.text}</Text>
                  <Text style={styles.muted}>{comment.date}</Text>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <EmptyState description="Soyez le premier a commenter ce spot." icon="chatbubble-outline" title="Aucun commentaire" />
        )}

        <Button onPress={showUnavailable} title="Ajouter un commentaire" />
        <Button onPress={showUnavailable} title="Ajouter une photo" variant="outline" />
      </View>
    </Screen>
  );
}

function HydroItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.hydroItem}>
      <Ionicons name={icon} size={17} color={colors.primary} />
      <View style={styles.textFill}>
        <Text style={styles.muted}>{label}</Text>
        <Text numberOfLines={1} style={styles.hydroValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    height: 190,
    justifyContent: 'center',
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 25,
    fontWeight: typography.weights.bold,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  bodyText: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  cardGap: {
    gap: spacing.md,
  },
  depthGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  depthCell: {
    backgroundColor: opacity.primary10,
    borderRadius: radius.md,
    flex: 1,
    padding: spacing.md,
  },
  depthValue: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 22,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xs,
  },
  hydroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  hydroItem: {
    alignItems: 'center',
    backgroundColor: opacity.black06,
    borderRadius: radius.md,
    flexBasis: '46%',
    flexDirection: 'row',
    flexGrow: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  hydroValue: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  listGap: {
    gap: spacing.md,
  },
  commentCard: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  textFill: {
    flex: 1,
    minWidth: 0,
  },
  commentName: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
});
