import { Ionicons } from '@expo/vector-icons';
import { forwardRef } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, opacity, radius, spacing, typography } from '../../theme/theme';
import { IconName } from '../../types/profile';

type InputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  error?: string;
  helperText?: string;
  iconLeft?: IconName;
  inputStyle?: StyleProp<TextStyle>;
  label?: string;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { containerStyle, error, helperText, iconLeft, inputStyle, label, ...textInputProps },
  ref,
) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, error && styles.inputError]}>
        {iconLeft ? <Ionicons name={iconLeft} size={18} color={colors.textMuted} /> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textSoft}
          selectionColor={colors.primary}
          style={[styles.input, inputStyle]}
          {...textInputProps}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.earth,
    backgroundColor: opacity.earth10,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    paddingVertical: spacing.sm,
  },
  helper: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  error: {
    color: colors.earth,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
});
