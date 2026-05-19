import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { BrandLogo } from '../components/brand/BrandLogo';
import { Screen } from '../components/layout/Screen';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { loading, register } = useAuth();
  const [name, setName] = useState('Marc Dubois');
  const [email, setEmail] = useState('marc@pechomax.fr');
  const [password, setPassword] = useState('pechomax');
  const [touched, setTouched] = useState(false);

  const nameError = touched && name.trim().length < 2 ? 'Nom trop court' : undefined;
  const emailError = touched && !email.includes('@') ? 'Email invalide' : undefined;
  const passwordError = touched && password.length < 6 ? '6 caractères minimum' : undefined;
  const canSubmit =
    !nameError &&
    !emailError &&
    !passwordError &&
    name.trim().length >= 2 &&
    email.length > 0 &&
    password.length >= 6;

  const submit = async () => {
    setTouched(true);

    if (!canSubmit) {
      return;
    }

    try {
      await register({ email, name, password });
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch {
      Alert.alert('Inscription impossible', 'Veuillez réessayer.');
    }
  };

  return (
    <Screen avoidKeyboard scroll>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <BrandLogo color={colors.primary} height={44} variant="picto" width={40} />
          <BrandLogo color={colors.text} height={31} width={148} />
        </View>
        <Text style={styles.title}>Créer votre espace pêche.</Text>
        <Text style={styles.subtitle}>Un compte local de démonstration suffit pour parcourir l’app.</Text>
      </View>

      <Card elevated padding="xl" style={styles.card}>
        <Input
          autoCapitalize="words"
          error={nameError}
          iconLeft="person-outline"
          label="Nom"
          onBlur={() => setTouched(true)}
          onChangeText={setName}
          value={name}
        />
        <Input
          autoCapitalize="none"
          autoComplete="email"
          error={emailError}
          iconLeft="mail-outline"
          keyboardType="email-address"
          label="Email"
          onBlur={() => setTouched(true)}
          onChangeText={setEmail}
          value={email}
        />
        <Input
          error={passwordError}
          iconLeft="lock-closed-outline"
          label="Mot de passe"
          onBlur={() => setTouched(true)}
          onChangeText={setPassword}
          secureTextEntry
          value={password}
        />
        <Button
          accessibilityLabel="Créer le compte"
          fullWidth
          loading={loading}
          onPress={submit}
          title="Créer le compte"
          variant="primary"
        />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Déjà inscrit ?</Text>
        <Button
          accessibilityLabel="Aller à la connexion"
          onPress={() => navigation.navigate('Login')}
          size="sm"
          title="Se connecter"
          variant="ghost"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xxl,
    paddingTop: spacing.xl,
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 26,
    fontWeight: typography.weights.bold,
    lineHeight: 32,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  card: {
    gap: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
});
