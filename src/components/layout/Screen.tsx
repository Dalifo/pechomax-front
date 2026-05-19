import { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme/theme';

type ScreenProps = PropsWithChildren<{
  avoidKeyboard?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  padded?: boolean;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function Screen({
  avoidKeyboard = false,
  children,
  contentContainerStyle,
  padded = true,
  scroll = false,
  style,
}: ScreenProps) {
  const contentStyle = [padded && styles.padded, contentContainerStyle];
  const body = scroll ? (
    <ScrollView
      bounces
      contentContainerStyle={contentStyle}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={styles.fill}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, contentStyle]}>{children}</View>
  );

  const safeContent = <SafeAreaView style={[styles.root, style]}>{body}</SafeAreaView>;

  if (!avoidKeyboard) {
    return safeContent;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      {safeContent}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
});
