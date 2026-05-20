import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, opacity, radius, shadows, spacing, typography } from '../../theme/theme';

type InfoModalProps = {
  title: string;
  content: string;
  visible: boolean;
  onClose: () => void;
};

export function InfoModal({ title, content, visible, onClose }: InfoModalProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.overlay}>
        <Pressable style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable accessibilityLabel="Fermer" hitSlop={12} onPress={onClose} style={styles.closeBtn}>
              <Ionicons color={colors.textSoft} name="close" size={22} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.body}>{content}</Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: opacity.black56,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '75%',
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    ...shadows.card,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 18,
    fontWeight: typography.weights.bold,
  },
  closeBtn: {
    alignItems: 'center',
    backgroundColor: opacity.black08,
    borderRadius: radius.round,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  body: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 22,
  },
});