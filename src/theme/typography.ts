import { colors } from './colors'

export const typography = {
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },

  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },

  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },

  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textInverse,
  },
}
