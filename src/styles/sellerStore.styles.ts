// src/styles/sellerStore.styles.ts

import { StyleSheet } from 'react-native'
import { colors, spacing } from '@/theme'

export const sellerStoreStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Back button (loading state)
  backButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 10,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerSellerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerNick: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  headerPlaceholder: {
    width: 24,
  },

  // Categorias
  categoriesContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },

  categoryChip: {
    height: 36, // 🔥 altura fixa
    paddingHorizontal: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryChipActive: {
    backgroundColor: colors.primary,
  },

  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 16,
  },

  categoryChipTextActive: {
    fontSize: 13,
    color: colors.textInverse,
    fontWeight: '600',
    lineHeight: 16,
  },

  // Produtos
  productsContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },

  // Promo header
  promoHeader: {
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  promoHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },

  // HEADER EXPANDIDO
  headerExpanded: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatarLarge: {
    width: 70,
    height: 70,
    borderRadius: 28,
    backgroundColor: colors.border,
  },
  headerMainInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerNickLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textInverse,
  },
  headerBio: {
    fontSize: 13,
    color: '#FFEFE6',
    marginTop: 2,
  },
  headerStars: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    gap: 2,
  },
  headerInfoBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 0,
    gap: 4,
  },

  headerBadgeText: {
    fontSize: 12,
    color: colors.textInverse,
  },
  headerBadgeOpen: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  headerBadgeClosed: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  headerBadgeOpenText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1FAE5',
  },

  headerBadgeClosedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FECACA',
  },
  headerFreeTag: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  // Loading more
  loadingMore: {
    paddingVertical: spacing.md,
  },

  // card
  promoCardSellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promoCardSeller: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  promoCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
})
