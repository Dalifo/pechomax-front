import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { SectionTitle } from '../components/ui/SectionTitle';
import { usePosts } from '../hooks/usePosts';
import { useUserProfile } from '../hooks/useUserProfile';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;
type ViewMode = 'grid' | 'list';

export function UserProfileScreen({ navigation, route }: Props) {
  const { data: profile, loading } = useUserProfile(route.params.userId);
  const { data: posts } = usePosts();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const showUnavailable = () => {
    Alert.alert('Fonction bientot disponible', 'Cette action sera ajoutee prochainement.');
  };

  if (loading || !profile) {
    return (
      <Screen padded={false}>
        <AppHeader onBack={navigation.goBack} showBack title="Profil utilisateur" />
        <EmptyState description="Chargement du profil." icon="person-outline" title="Chargement" />
      </Screen>
    );
  }

  return (
    <Screen padded={false} scroll>
      <AppHeader
        action={<IconButton accessibilityLabel="Options" icon="ellipsis-vertical" onPress={showUnavailable} variant="soft" />}
        onBack={navigation.goBack}
        showBack
        title="Profil utilisateur"
      />

      <LinearGradient colors={[colors.secondary, colors.earth]} style={styles.hero}>
        <Avatar initials={profile.displayName} size="xl" source={profile.profilePic ? { uri: profile.profilePic } : undefined} />
        <View style={styles.heroText}>
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.bio}>{profile.headline}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={opacity.surface88} />
            <Text style={styles.metaText}>{profile.headline}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsRow}>
          {profile.stats.map((stat) => (
            <Card key={stat.id} padding="md" style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        <View style={styles.actionsRow}>
          <Button
            onPress={showUnavailable}
            title="S'abonner"
            variant="primary"
            fullWidth
          />
          <IconButton accessibilityLabel="Partager le profil" icon="share-outline" onPress={showUnavailable} variant="soft" />
        </View>

        <SectionTitle
          action={
            <View style={styles.segment}>
              <ModeButton active={viewMode === 'grid'} icon="grid-outline" onPress={() => setViewMode('grid')} />
              <ModeButton active={viewMode === 'list'} icon="list-outline" onPress={() => setViewMode('list')} />
            </View>
          }
          title={`Prises recentes (${posts.length})`}
        />

        {viewMode === 'grid' ? (
          <View style={styles.grid}>
            {posts.slice(0, 6).map((post) => (
              <Pressable
                accessibilityLabel={`Ouvrir ${post.fishName}`}
                accessibilityRole="button"
                key={post.id}
                onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                style={styles.gridTile}
              >
                <Ionicons name="fish-outline" size={30} color={colors.secondary} />
                <Text numberOfLines={1} style={styles.gridTitle}>{post.fishName}</Text>
                <Text style={styles.gridMeta}>{post.likes} likes</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.listGap}>
            {posts.map((post) => (
              <Card key={post.id} onPress={() => navigation.navigate('PostDetail', { postId: post.id })} style={styles.listPost}>
                <View style={styles.postThumb}>
                  <Ionicons name="fish-outline" size={24} color={colors.secondary} />
                </View>
                <View style={styles.textFill}>
                  <Text style={styles.postTitle}>{post.fishName}</Text>
                  <Text style={styles.muted}>{post.likes} j'aime - {post.spotName}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

function ModeButton({ active, icon, onPress }: { active: boolean; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.modeButton, active && styles.modeButtonActive]}>
      <Ionicons name={icon} size={18} color={active ? colors.background : colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontSize: 22,
    fontWeight: typography.weights.bold,
  },
  bio: {
    color: opacity.surface88,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  metaText: {
    color: opacity.surface88,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 22,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  actionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  segment: {
    backgroundColor: opacity.black06,
    borderRadius: radius.md,
    flexDirection: 'row',
    padding: 2,
  },
  modeButton: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridTile: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: opacity.black08,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexBasis: '30%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 116,
    padding: spacing.md,
  },
  gridTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  gridMeta: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 11,
  },
  listGap: {
    gap: spacing.md,
  },
  listPost: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  postThumb: {
    alignItems: 'center',
    backgroundColor: opacity.secondary10,
    borderRadius: radius.md,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  textFill: {
    flex: 1,
    minWidth: 0,
  },
  postTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
});
