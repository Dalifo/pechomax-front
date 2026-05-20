import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Avatar } from '../components/ui/Avatar';
import { Badge as UiBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { InfoModal } from '../components/ui/InfoModal';
import { ListItem } from '../components/ui/ListItem';
import { SectionTitle } from '../components/ui/SectionTitle';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, shadows, spacing, typography } from '../theme/theme';
import { Badge, ProfileStat } from '../types/profile';
import { IconName } from '../types/profile';

const INFO_CONTENT: Record<string, string> = {
  'A propos': `Pechomax est une application dédiée aux passionnés de pêche. Elle vous permet de tenir votre journal de bord, d'explorer une base de données de poissons, de partager vos prises avec la communauté et de découvrir les meilleurs spots près de chez vous.\n\nNotre mission : connecter les pêcheurs et valoriser la pratique responsable de la pêche.\n\nVersion 1.0.0 — © 2025 Pechomax. Tous droits réservés.`,
  'Aide et support': `Besoin d'aide ? Plusieurs ressources sont à votre disposition :\n\n• Guide utilisateur : accédez au guide complet depuis les Paramètres pour découvrir toutes les fonctionnalités.\n\n• FAQ : consultez les questions fréquentes pour trouver rapidement une réponse.\n\n• Contact : notre équipe est disponible via le formulaire de contact pour toute question ou signalement.\n\nNous répondons sous 48 h en jours ouvrés.`,
  "Conditions d'utilisation": `En utilisant Pechomax, vous acceptez les conditions suivantes :\n\n1. Utilisation personnelle — L'application est réservée à un usage personnel et non commercial.\n\n2. Contenu partagé — Vous êtes responsable des contenus que vous publiez (photos, commentaires, spots). Tout contenu inapproprié sera supprimé.\n\n3. Données personnelles — Vos données sont traitées conformément à notre politique de confidentialité et au RGPD.\n\n4. Propriété intellectuelle — Le contenu de l'application (textes, images, icônes) est protégé par le droit d'auteur.\n\n5. Modifications — Pechomax se réserve le droit de modifier ces conditions à tout moment, avec notification préalable.`,
};

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

function ProfileStatCard({ stat }: { stat: ProfileStat }) {
  const tone = stat.id === 'catches' ? colors.primary : stat.id === 'spots' ? colors.secondary : colors.earth;

  return (
    <View style={[styles.statCard, { backgroundColor: tone }]}>
      <Ionicons name={stat.icon} size={20} color={colors.background} />
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );
}

function BadgeTile({ badge, selected, onPress }: { badge: Badge; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={badge.name}
      accessibilityRole="button"
      disabled={!badge.unlocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.badgeTile,
        !badge.unlocked && styles.badgeLocked,
        selected && styles.badgeSelected,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={badge.unlocked ? (badge.icon as IconName) : 'lock-closed-outline'}
        size={28}
        color={badge.unlocked ? colors.secondary : colors.textSoft}
      />
      <Text numberOfLines={2} style={styles.badgeName}>{badge.name}</Text>
    </Pressable>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<RootNavigation>();
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null);
  const [activeInfoItem, setActiveInfoItem] = useState<string | null>(null);
  const { logout } = useAuth();
  const { data: profile, error, loading, refresh } = useProfile();

  const confirmLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { style: 'cancel', text: 'Annuler' },
      {
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
        style: 'destructive',
        text: 'Se déconnecter',
      },
    ]);
  };

  if (loading) {
    return (
      <Screen padded={false}>
        <AppHeader title="Profil" />
        <EmptyState description="Chargement du profil." icon="person-outline" title="Chargement" />
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen padded={false}>
        <AppHeader title="Profil" />
        <View style={styles.content}>
          <EmptyState
            actionLabel="Réessayer"
            description={error ?? 'Connectez-vous pour afficher votre profil.'}
            icon="person-circle-outline"
            onActionPress={refresh}
            title="Profil indisponible"
          />
          <Button onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })} title="Se connecter" variant="outline" />
        </View>
      </Screen>
    );
  }

  const xpProgress = profile.xp.current / profile.xp.nextLevel;
  const unlockedBadges = profile.badges.filter((badge) => badge.unlocked).length;

  return (
    <Screen padded={false} scroll>
      <AppHeader
        action={<IconButton accessibilityLabel="Paramètres" icon="settings-outline" onPress={() => navigation.navigate('Settings')} variant="soft" />}
        title="Profil"
      />

      <LinearGradient colors={[colors.primary, colors.secondary]} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={styles.hero}>
        <View style={[styles.heroCircle, styles.heroCircleLeft]} />
        <View style={[styles.heroCircle, styles.heroCircleRight]} />
        <View style={styles.identity}>
          <View style={styles.avatarWrap}>
            <Avatar
              initials={profile.displayName}
              label={profile.displayName}
              size="xl"
              source={profile.profilePic ? { uri: profile.profilePic } : undefined}
              style={styles.heroAvatar}
            />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{profile.level}</Text>
            </View>
          </View>
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.rank}>{profile.rankTitle ?? profile.levelTitle ?? `Niveau ${profile.level}`}</Text>
          <Text style={styles.headline}>{profile.headline}</Text>
          <Button
            accessibilityLabel="Modifier le profil"
            onPress={() => navigation.navigate('EditProfile')}
            size="sm"
            title="Modifier le profil"
            variant="outline"
            style={styles.editButton}
            textStyle={styles.editButtonText}
          />
        </View>
        <View style={styles.statsRow}>
          {profile.stats.map((stat) => (
            <ProfileStatCard key={stat.id} stat={stat} />
          ))}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Card style={styles.xpCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.kicker}>Niveau {profile.level}</Text>
            <Text style={styles.primaryText}>{profile.xp.current} / {profile.xp.nextLevel} XP</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${xpProgress * 100}%` }]} />
          </View>
          <Text style={styles.muted}>Encore {profile.xp.nextLevel - profile.xp.current} XP pour le niveau {profile.level + 1}</Text>
        </Card>

        <SectionTitle icon="trophy-outline" title="Succès récents" />
        <View style={styles.achievementRow}>
          {profile.achievements.map((achievement) => (
            <Card key={achievement.id} padding="md" style={styles.achievementCard}>
              <Ionicons name={achievement.icon} size={20} color={achievement.color} />
              <Text style={styles.achievementValue}>{achievement.value}</Text>
              <Text numberOfLines={2} style={styles.achievementLabel}>{achievement.label}</Text>
            </Card>
          ))}
        </View>

        <SectionTitle
          action={<UiBadge label={`${unlockedBadges}/${profile.badges.length}`} tone="secondary" />}
          icon="ribbon-outline"
          title="Collection de badges"
        />
        <View style={styles.badgeGrid}>
          {profile.badges.map((badge) => (
            <BadgeTile
              badge={badge}
              key={badge.id}
              onPress={() => setSelectedBadgeId(badge.id)}
              selected={badge.id === selectedBadgeId}
            />
          ))}
        </View>

        <SectionTitle title="Mon compte" />
        <View style={styles.listGap}>
          <ListItem
            badgeLabel={profile.stats.find((stat) => stat.id === 'catches')?.value}
            icon="fish-outline"
            onPress={() => navigation.navigate('Logbook')}
            title="Historique des prises"
          />
          <ListItem
            badgeLabel={`${unlockedBadges}/${profile.badges.length}`}
            badgeTone="secondary"
            icon="trophy-outline"
            onPress={() => navigation.navigate('Trophies')}
            title="Trophées et badges"
          />
        </View>

        <SectionTitle title="Informations" />
        <View style={styles.listGap}>
          {profile.infoItems.map((item) => (
            <ListItem chevron key={item} onPress={() => setActiveInfoItem(item)} title={item} />
          ))}
        </View>

        <Button accessibilityLabel="Deconnexion" onPress={confirmLogout} title="Deconnexion" variant="earth" />
      </View>

      <InfoModal
        content={activeInfoItem ? (INFO_CONTENT[activeInfoItem] ?? '') : ''}
        onClose={() => setActiveInfoItem(null)}
        title={activeInfoItem ?? ''}
        visible={activeInfoItem !== null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  heroCircle: {
    backgroundColor: opacity.surface88,
    borderRadius: radius.round,
    opacity: 0.12,
    position: 'absolute',
  },
  heroCircleLeft: {
    height: 180,
    left: -60,
    top: 20,
    width: 180,
  },
  heroCircleRight: {
    bottom: -88,
    height: 220,
    right: -90,
    width: 220,
  },
  identity: {
    alignItems: 'center',
    zIndex: 1,
  },
  avatarWrap: {
    marginBottom: spacing.lg,
  },
  heroAvatar: {
    backgroundColor: colors.background,
    ...shadows.card,
  },
  levelBadge: {
    alignItems: 'center',
    backgroundColor: colors.earth,
    borderColor: colors.background,
    borderRadius: radius.round,
    borderWidth: 3,
    bottom: -2,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: -3,
    width: 34,
  },
  levelText: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  name: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontSize: 25,
    fontWeight: typography.weights.bold,
  },
  headline: {
    color: opacity.surface88,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  rank: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xs,
  },
  editButton: {
    borderColor: opacity.surface88,
  },
  editButtonText: {
    color: colors.background,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
    zIndex: 1,
  },
  statCard: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: radius.lg,
    borderWidth: 0,
    flex: 1,
    minHeight: 94,
    padding: spacing.md,
  },
  statValue: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontSize: 20,
    fontWeight: typography.weights.bold,
    marginTop: spacing.sm,
  },
  statLabel: {
    color: opacity.surface88,
    fontFamily: typography.fontFamilyBold,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  xpCard: {
    gap: spacing.md,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kicker: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  primaryText: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  progressTrack: {
    backgroundColor: opacity.black12,
    borderRadius: radius.round,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    height: '100%',
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  achievementRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  achievementCard: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    minHeight: 98,
  },
  achievementValue: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
  achievementLabel: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badgeTile: {
    alignItems: 'center',
    backgroundColor: opacity.secondary10,
    borderColor: opacity.black08,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexBasis: '30%',
    flexGrow: 1,
    gap: spacing.sm,
    minHeight: 104,
    padding: spacing.md,
  },
  badgeLocked: {
    backgroundColor: opacity.black06,
    opacity: 0.58,
  },
  badgeSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  badgeName: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    lineHeight: 13,
    textAlign: 'center',
  },
  listGap: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.72,
  },
});
