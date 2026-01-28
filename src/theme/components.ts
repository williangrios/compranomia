import { StyleSheet } from 'react-native'
import { colors } from './colors'
import { spacing } from './spacing'

/* ================= BUTTON ================= */
const button = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryPressed: {
    backgroundColor: colors.primaryDark,
  },

  disabled: {
    backgroundColor: colors.disabled,
  },
})

/* ================= INPUT ================= */
const input = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  focused: {
    borderColor: colors.primary,
  },
  error: {
    borderColor: colors.error,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  text: {
    fontSize: 16,
    color: colors.textPrimary,
  },
})

/* ================= CARD ================= */
const card = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
})

/* ================= HEADER ================= */
const header = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingTop: 48,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },

  notificationButton: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationIcon: {
    color: colors.primary,
  },
})

/* ================= FOOTER ================= */
const footer = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },

  item: {
    alignItems: 'center',
  },

  label: {
    color: colors.textInverse,
    fontSize: 12,
    marginTop: 4,
  },
})

/* ================= TABS ================= */
const tabBar = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderTopWidth: 0,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },

  label: {
    fontSize: 12,
    marginBottom: spacing.md,
  },

  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeIndicator: {
    height: 3,
    backgroundColor: colors.textInverse,
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
})

/* ================= AUTH ================= */
const auth = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  formContainer: {
    gap: spacing.md,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textInverse,
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  linkContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  linkTextSmall: {
    fontSize: 13,
    marginVertical: spacing.lg,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
  },
  successText: {
    fontSize: 12,
    color: colors.success,
    marginTop: spacing.xs,
  },
})

/* ================= EXPORT ================= */
export const components = {
  button,
  input,
  card,
  header,
  footer,
  tabBar: {
    ...tabBar,
    withSafeArea: (bottomInset: number) => ({
      paddingBottom: bottomInset + spacing.lg,
    }),
    active: {
      color: colors.textInverse,
      fontWeight: '700' as const,
      iconSize: 26,
    },
    inactive: {
      color: 'rgba(255,255,255,0.55)',
      fontWeight: '500' as const,
      iconSize: 22,
    },
  },
  auth,
}
