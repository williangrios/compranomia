// components/order/RatingModal.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing } from '@/theme'
import { ratingService } from '@/services/rating.service'
import Toast from 'react-native-toast-message'
import { ErrorMessage } from '../ui/ErrorMessage'
import { getApiErrors } from '@/utils/getApiErrors'
import { ApiError } from '@/types'

interface RatingModalProps {
  visible: boolean
  onClose: () => void
  orderId: string
  sellerId: string
  sellerName: string
  onRatingSubmitted?: () => void
}

// Mapeamento de critérios para português
const CRITERIA_LABELS: Record<string, string> = {
  ProductQuality: 'Qualidade dos Produtos',
  DeliverySpeed: 'Rapidez na Entrega',
  Packaging: 'Embalagem',
  CustomerService: 'Atendimento',
  PriceValue: 'Custo-Benefício',
}

// Critérios
const COMPRANOMIA_CRITERIA = [
  'ProductQuality',
  'DeliverySpeed',
  'Packaging',
  'CustomerService',
  'PriceValue',
]

export function RatingModal({
  visible,
  onClose,
  orderId,
  sellerId,
  sellerName,
  onRatingSubmitted,
}: RatingModalProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)

  const handleStarPress = (criterion: string, star: number) => {
    setRatings((prev) => ({
      ...prev,
      [criterion]: star,
    }))
  }

  const isValid = () => {
    // Todos os critérios devem ter nota
    const allRated = COMPRANOMIA_CRITERIA.every(
      (criterion) => ratings[criterion] > 0,
    )
    // Comentário deve ter entre 3 e 150 caracteres
    const validComment =
      comment.trim().length >= 3 && comment.trim().length <= 150
    return allRated && validComment
  }

  const handleSubmit = async () => {
    setApiErrors(null)
    if (!isValid()) {
      Toast.show({
        type: 'error',
        text1: 'Avaliação incompleta',
        text2:
          'Avalie todos os critérios e escreva um comentário (3-150 caracteres)',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await ratingService.createRating({
        targetId: sellerId,
        orderId,
        text: comment.trim(),
        criteriaCount: COMPRANOMIA_CRITERIA.length,
        criteria: ratings,
      })

      Toast.show({
        type: 'success',
        text1: 'Avaliação enviada!',
        text2: 'Obrigado pelo seu feedback',
      })

      // Reset e fechar
      setRatings({})
      setComment('')
      onRatingSubmitted?.()
      onClose()
    } catch (error: any) {
      setApiErrors(getApiErrors(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (criterion: string) => {
    const currentRating = ratings[criterion] || 0
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(criterion, star)}
            disabled={isSubmitting}
          >
            <Ionicons
              name={star <= currentRating ? 'star' : 'star-outline'}
              size={32}
              color={star <= currentRating ? colors.primary : colors.disabled}
            />
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Avaliar {sellerName}</Text>
            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Critérios */}
            {COMPRANOMIA_CRITERIA.map((criterion) => (
              <View key={criterion} style={styles.criterionContainer}>
                <Text style={styles.criterionLabel}>
                  {CRITERIA_LABELS[criterion] || criterion}
                </Text>
                {renderStars(criterion)}
              </View>
            ))}

            {/* Comentário */}
            <View style={styles.commentContainer}>
              <Text style={styles.commentLabel}>
                Comentário ({comment.length}/150)
              </Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Conte como foi sua experiência (mínimo 3 caracteres)"
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={150}
                value={comment}
                onChangeText={setComment}
                editable={!isSubmitting}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Erros da API */}
          <ErrorMessage errors={apiErrors} />

          {/* Botão de Enviar */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isValid() || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isValid() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Enviar Avaliação</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
  },
  criterionContainer: {
    marginBottom: spacing.lg,
  },
  criterionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  commentContainer: {
    marginTop: spacing.sm,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    margin: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  submitButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
})
