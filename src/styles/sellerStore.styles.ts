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

  // Categorias
  categoriesContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryChip: {
    height: 36, // 🔥 fixa de vez
    paddingHorizontal: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryChipActive: {
    height: 36,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 13, // 🔥 igual ao fontSize
    includeFontPadding: false, // 🔥 ANDROID FIX
    textAlignVertical: 'center',
  },
  categoryChipTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textInverse,
    lineHeight: 13,
    includeFontPadding: false,
    textAlignVertical: 'center',
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

  // ═══════════ HEADER EXPANDIDO ═══════════
  headerExpanded: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.primary,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: colors.border,
    marginLeft: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerMainInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerSellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerNickName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textInverse,
  },
  headerBio: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 3,
  },
  headerStars: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    gap: 2,
  },
  headerCartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  headerCartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.textInverse,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  headerCartBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },

  // ═══════════ INFO BADGES ═══════════
  headerInfoBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerBadgeOpen: {
    backgroundColor: '#DCFCE7',
  },
  headerBadgeClosed: {
    backgroundColor: '#FEE2E2',
  },
  headerBadgeOpenText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  headerBadgeClosedText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.error,
  },
  headerFreeTag: {
    fontSize: 12,
    fontWeight: '700',
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
    color: colors.textInverse,
    marginTop: 2,
  },
  promoCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textInverse,
  },
})
