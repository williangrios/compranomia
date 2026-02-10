// src/styles/home.styles.ts

import { StyleSheet } from 'react-native'
import { colors, spacing } from '@/theme'

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Seções
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  // Sem endereço
  noAddressContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  noAddressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  noAddressSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  // Loading
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },

  // ═══════════ PROMOÇÃO CARD (horizontal slider) ═══════════
  promoCard: {
    width: 180,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  nearbyCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },

  nearbyCardTag: {
    backgroundColor: '#FFF7ED', // laranja bem suave
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  promoCardSellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  promoCardSellerIcon: {
    color: colors.primary,
  },
  nearbyCardTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },

  promoCardImageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.border,
  },
  promoCardImage: {
    width: '100%',
    height: '100%',
  },
  promoCardBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promoCardBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  promoCardBody: {
    padding: spacing.sm,
  },
  promoCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  promoCardSeller: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  promoCardPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  promoCardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  promoCardPriceOriginal: {
    fontSize: 12,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },

  // ═══════════ SELLER CARD (nearby) ═══════════
  nearbyCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nearbyCardAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  nearbyCardContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nearbyCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  nearbyCardNick: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  nearbyCardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.md,
  },
  nearbyCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nearbyCardInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  nearbyCardFreeTag: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nearbyCardArrow: {
    marginLeft: spacing.sm,
  },

  // ═══════════ SEARCH PRODUCT CARD ═══════════
  searchCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
  },
  searchCardImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  searchCardContent: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  searchCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  searchCardSeller: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchCardPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  searchCardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  searchCardPriceOriginal: {
    fontSize: 12,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  searchCardDiscount: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
})
