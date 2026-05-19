import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, opacity, radius, spacing, typography } from '../../theme/theme';
import { IconName } from '../../types/profile';

export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  iconLeft?: IconName;
  label?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  value: string | null;
};

export function Select({ iconLeft, label, onChange, options, placeholder = 'Choisir…', value }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = search.trim().length === 0
    ? options
    : options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setOpen(false);
    setSearch('');
  };

  const handleClose = () => {
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      <View style={styles.container}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <Pressable onPress={() => setOpen(true)} style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}>
          {iconLeft ? <Ionicons name={iconLeft} size={18} color={colors.textMuted} /> : null}
          <Text style={[styles.triggerText, !selected && styles.placeholderText]} numberOfLines={1}>
            {selected ? selected.label : placeholder}
          </Text>
          <Ionicons name="chevron-down-outline" size={16} color={colors.textMuted} />
        </Pressable>
      </View>

      <Modal animationType="slide" onRequestClose={handleClose} transparent visible={open}>
        <Pressable onPress={handleClose} style={styles.backdrop} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label ?? 'Sélectionner'}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close-outline" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={16} color={colors.textMuted} />
            <TextInput
              autoCorrect={false}
              onChangeText={setSearch}
              placeholder="Rechercher…"
              placeholderTextColor={colors.textSoft}
              style={styles.searchInput}
              value={search}
            />
            {search.length > 0 ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle-outline" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                style={({ pressed }) => [styles.option, item.value === value && styles.optionActive, pressed && styles.optionPressed]}
              >
                <Text style={[styles.optionText, item.value === value && styles.optionTextActive]}>{item.label}</Text>
                {item.value === value ? <Ionicons name="checkmark-outline" size={18} color={colors.primary} /> : null}
              </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Aucun résultat</Text>}
          />
        </View>
      </Modal>
    </>
  );
}

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
  trigger: {
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
  triggerPressed: {
    backgroundColor: opacity.black06,
  },
  triggerText: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 15,
  },
  placeholderText: {
    color: colors.textSoft,
  },
  backdrop: {
    backgroundColor: opacity.black40,
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.xxxl,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.xxl,
    paddingBottom: spacing.md,
  },
  sheetTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: opacity.black06,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    paddingVertical: spacing.xs,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  optionActive: {
    backgroundColor: opacity.primary10,
  },
  optionPressed: {
    backgroundColor: opacity.black06,
  },
  optionText: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 15,
  },
  optionTextActive: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.weights.bold,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    padding: spacing.xxl,
    textAlign: 'center',
  },
});
