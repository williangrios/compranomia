import { StyleSheet } from 'react-native'
import { colors, spacing } from '@/theme'

export const orderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  actionButtonDisabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  actionButtonTextDisabled: {
    color: colors.textSecondary,
  },
  chipsRow: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chipsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 8,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },

  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  chipTextActive: {
    color: colors.textInverse,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemsSummary: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  itemsCount: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  total: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonChat: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
})
