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

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const emailError = touched && !email.includes('@') ? 'Email invalide' : undefined;
  const passwordError = touched && password.length < 9 ? '9 caracteres minimum' : undefined;
  const canSubmit = !emailError && !passwordError && email.length > 0 && password.length >= 9;

  const submit = async (credentials = { email, password }) => {
    setTouched(true);

    if (credentials.email === email && !canSubmit) {
      return;
    }

    try {
      await login(credentials);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch {
      Alert.alert('Connexion impossible', 'Veuillez réessayer.');
    }
  };

  return (
    <Screen avoidKeyboard scroll>
      <View style={styles.header}>
        <View style={styles.picto}>
          <BrandLogo color={colors.primary} height={72} variant="picto" width={64} />
        </View>
        <BrandLogo color={colors.text} height={36} width={172} />
        <Text style={styles.title}>Bon retour au bord de l’eau.</Text>
      </View>

      <Card elevated padding="xl" style={styles.card}>
        <Input
          autoCapitalize="none"
          autoComplete="email"
          error={emailError}
          iconLeft="mail-outline"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          onBlur={() => setTouched(true)}
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
          accessibilityLabel="Se connecter"
          fullWidth
          loading={loading}
          onPress={() => submit()}
          title="Se connecter"
        />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Pas encore de compte ?</Text>
        <Button
          accessibilityLabel="Créer un compte"
          onPress={() => navigation.navigate('Register')}
          size="sm"
          title="Créer un compte"
          variant="ghost"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingTop: spacing.xl,
  },
  picto: {
    alignItems: 'center',
    backgroundColor: opacity.primary10,
    borderRadius: radius.xl,
    height: 108,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: 108,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 25,
    fontWeight: typography.weights.bold,
    lineHeight: 31,
    marginTop: spacing.xl,
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
