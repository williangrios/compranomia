import { StyleSheet } from 'react-native'
import { colors, spacing } from '@/theme'

export const productStyles = StyleSheet.create({
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalButtonGap: {
    gap: spacing.sm,
  },

  // Scanner
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerCamera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scannerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 48,
  },
  scannerCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  scannerTypeButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  scannerTypeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  scannerGuide: {
    alignItems: 'center',
  },
  scannerFrame: {
    width: 260,
    height: 160,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
  },
  scannerHint: {
    color: '#fff',
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  scannerBottomBar: {
    alignItems: 'center',
    paddingBottom: 48,
  },

  // Barcode input
  barcodeInputContainer: {
    padding: spacing.lg,
  },
  barcodeInputTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // Search
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchResultImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  searchResultDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchResultCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchAdoptButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.sm,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // Form field wrapper
  fieldWrapper: {
    marginBottom: spacing.md,
  },

  // Switch row
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  switchLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },

  // Hint text
  hintText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // ═══════════ SELLER PRODUCT CARD ═══════════
  sellerCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
  },
  sellerCardImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  sellerCardContent: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  sellerCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sellerCardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sellerCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  sellerCardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  sellerCardPriceOriginal: {
    fontSize: 13,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  sellerCardStock: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sellerCardStockLow: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '600',
  },
  sellerCardBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  sellerCardBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sellerCardActions: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sellerCardCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sellerCardActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ═══════════ CONSUMER PRODUCT CARD ═══════════
  consumerCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  consumerCardImageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.border,
  },
  consumerCardImage: {
    width: '100%',
    height: '100%',
  },
  consumerCardBody: {
    padding: spacing.md,
  },
  consumerCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  consumerCardBrand: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  consumerCardPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  consumerCardPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  consumerCardPriceOriginal: {
    fontSize: 14,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  consumerCardDiscount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  consumerCardUnit: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  consumerCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  consumerCardQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  consumerCardQuantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consumerCardQuantityButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  consumerCardQuantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 48,
    textAlign: 'center',
  },
  consumerCardAddButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  consumerCardAddButtonText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
  consumerCardOutOfStock: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '600',
  },
})
