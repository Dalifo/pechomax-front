import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandLogo } from '../components/brand/BrandLogo';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Contact'>;

const reasons = ['Question', 'Bug', 'Suggestion', 'Ajout magasin', 'Signalement', 'Autre'];

export function ContactScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('Question');
  const [message, setMessage] = useState('');

  const valid = name.trim() && email.trim() && message.trim();

  const submit = () => {
    if (!valid) {
      return;
    }

    Alert.alert('Fonction bientot disponible', 'Le formulaire de contact sera ajoute apres la demo.');
  };

  return (
    <Screen avoidKeyboard padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack title="Contact" />
      <View style={styles.content}>
        <Card style={styles.heroCard}>
          <BrandLogo color={colors.primary} height={34} width={160} />
          <Text style={styles.heroTitle}>Nous contacter</Text>
          <Text style={styles.muted}>Le formulaire de contact sera disponible prochainement.</Text>
        </Card>

        <View style={styles.contactMethods}>
          <Card padding="md" style={styles.methodCard}>
            <Ionicons name="mail-outline" size={23} color={colors.primary} />
            <Text style={styles.methodTitle}>Email</Text>
            <Text style={styles.muted}>Contact bientot disponible</Text>
          </Card>
          <Card padding="md" style={styles.methodCard}>
            <Ionicons name="call-outline" size={23} color={colors.secondary} />
            <Text style={styles.methodTitle}>Telephone</Text>
            <Text style={styles.muted}>Contact bientot disponible</Text>
          </Card>
        </View>

        <Card style={styles.formCard}>
          <Input iconLeft="person-outline" label="Votre nom" onChangeText={setName} placeholder="Marc Dubois" value={name} />
          <Input
            autoCapitalize="none"
            iconLeft="mail-outline"
            keyboardType="email-address"
            label="Votre email"
            onChangeText={setEmail}
            placeholder="marc@email.fr"
            value={email}
          />
          <Text style={styles.label}>Motif de contact</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.reasonRow}>
              {reasons.map((item) => (
                <Pressable key={item} onPress={() => setReason(item)} style={[styles.reasonChip, item === reason && styles.reasonChipActive]}>
                  <Text style={[styles.reasonText, item === reason && styles.reasonTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <Input
            inputStyle={styles.messageInput}
            label="Votre message"
            multiline
            onChangeText={setMessage}
            placeholder="Decrivez votre demande..."
            textAlignVertical="top"
            value={message}
          />
          <Badge label={`Motif: ${reason}`} tone="secondary" />
        </Card>

        <Button disabled={!valid} onPress={submit} title="Envoyer le message" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  heroCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 21,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  successCard: {
    alignItems: 'center',
    backgroundColor: opacity.primary10,
    gap: spacing.sm,
  },
  contactMethods: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  methodCard: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  methodTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  formCard: {
    gap: spacing.lg,
  },
  label: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  reasonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  reasonChip: {
    backgroundColor: opacity.black06,
    borderRadius: radius.round,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  reasonChipActive: {
    backgroundColor: colors.primary,
  },
  reasonText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  reasonTextActive: {
    color: colors.background,
  },
  messageInput: {
    minHeight: 130,
  },
});
