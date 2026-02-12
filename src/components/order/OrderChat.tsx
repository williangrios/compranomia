import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { UserRole } from '@wrcb/cb-common'
import { orderService } from '@/services/order.service'
import { colors, spacing } from '@/theme'
import { translateError } from '@/utils/errorMessages'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Message {
  _id?: string
  senderId: string | { id?: string; _id?: string }
  senderRole: UserRole
  senderNickName?: string
  message: string
  imageUrl?: string | null
  isRead: boolean
  createdAt: string
}

interface OrderChatProps {
  orderId: string
  currentUserId: string
  currentUserRole: UserRole
  title: string
  backHref: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Hoje'
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem'
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

function getSenderId(msg: Message): string {
  if (typeof msg.senderId === 'string') return msg.senderId
  return msg.senderId?.id ?? msg.senderId?._id ?? ''
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderChat({
  orderId,
  currentUserId,
  currentUserRole,
  title,
  backHref,
}: OrderChatProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const listRef = useRef<FlatList>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [text, setText] = useState('')

  const loadMessages = useCallback(async () => {
    try {
      const data = await orderService.getOrder(orderId)
      setMessages(data.order.messages ?? [])
      // Marcar como lidas
      await orderService.markMessagesRead(orderId)
    } catch (error) {
      console.error('[CHAT] Error loading:', error)
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  // Scroll para última mensagem ao carregar
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: false })
      }, 100)
    }
  }, [messages.length])

  async function handleSendText() {
    const trimmed = text.trim()
    if (!trimmed || isSending) return

    try {
      setIsSending(true)
      setText('')
      const data = await orderService.sendMessage(orderId, trimmed)
      setMessages(data.order.messages ?? [])
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    } catch (error: any) {
      const key = error.normalizedErrors?.[0]?.message || 'GenericError'
      Alert.alert('Erro', translateError(key))
      setText(trimmed) // restaura texto em caso de erro
    } finally {
      setIsSending(false)
    }
  }

  async function handleSendImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    })

    if (result.canceled || !result.assets?.[0]) return

    const asset = result.assets[0]

    try {
      setIsSending(true)
      const image = {
        uri: asset.uri,
        name: asset.fileName ?? 'image.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      }
      const data = await orderService.sendMessage(orderId, undefined, image)
      setMessages(data.order.messages ?? [])
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    } catch (error: any) {
      const key = error.normalizedErrors?.[0]?.message || 'GenericError'
      Alert.alert('Erro', translateError(key))
    } finally {
      setIsSending(false)
    }
  }

  // ─── Render mensagem ──────────────────────────────────────────────────────

  function renderMessage({ item, index }: { item: Message; index: number }) {
    const senderId = getSenderId(item)
    const isMe = senderId === currentUserId
    const showDateSeparator =
      index === 0 ||
      formatDate(messages[index - 1].createdAt) !== formatDate(item.createdAt)

    return (
      <>
        {/* Separador de data */}
        {showDateSeparator && (
          <View style={s.dateSeparator}>
            <Text style={s.dateSeparatorText}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        )}

        <View style={[s.messageRow, isMe ? s.messageRowMe : s.messageRowThem]}>
          <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleThem]}>
            {/* Imagem */}
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                style={s.messageImage}
                resizeMode="cover"
              />
            )}
            {/* Texto */}
            {item.message ? (
              <Text
                style={[
                  s.messageText,
                  isMe ? s.messageTextMe : s.messageTextThem,
                ]}
              >
                {item.message}
              </Text>
            ) : null}
            {/* Timestamp */}
            <Text
              style={[
                s.messageTime,
                isMe ? s.messageTimeMe : s.messageTimeThem,
              ]}
            >
              {formatTime(item.createdAt)}
              {isMe && <Text> {item.isRead ? '✓✓' : '✓'}</Text>}
            </Text>
          </View>
        </View>
      </>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={[s.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.push(backHref as any)}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Mensagens */}
      {isLoading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item, idx) => item._id ?? String(idx)}
          renderItem={renderMessage}
          contentContainerStyle={s.listContent}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Ionicons
                name="chatbubble-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={s.emptyText}>Nenhuma mensagem ainda</Text>
              <Text style={s.emptySubtext}>
                Envie uma mensagem para o{' '}
                {currentUserRole === UserRole.Seller ? 'cliente' : 'vendedor'}
              </Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <View style={[s.inputBar, { paddingBottom: insets.bottom + 80 }]}>
        <TouchableOpacity
          style={s.imageButton}
          onPress={handleSendImage}
          disabled={isSending}
          activeOpacity={0.7}
        >
          <Ionicons name="image-outline" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TextInput
          style={s.input}
          value={text}
          onChangeText={setText}
          placeholder="Digite uma mensagem..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={1000}
          returnKeyType="default"
        />

        <TouchableOpacity
          style={[
            s.sendButton,
            (!text.trim() || isSending) && s.sendButtonDisabled,
          ]}
          onPress={handleSendText}
          disabled={!text.trim() || isSending}
          activeOpacity={0.8}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="send" size={18} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  listContent: { padding: spacing.md, paddingBottom: spacing.lg, gap: 4 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    gap: spacing.sm,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySubtext: { fontSize: 13, color: colors.textSecondary },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  messageRow: { flexDirection: 'row', marginVertical: 2 },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowThem: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    padding: spacing.sm,
    gap: 4,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 4,
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageTextMe: { color: '#FFF' },
  messageTextThem: { color: colors.textPrimary },
  messageTime: { fontSize: 11, alignSelf: 'flex-end' },
  messageTimeMe: { color: 'rgba(255,255,255,0.7)' },
  messageTimeThem: { color: colors.textSecondary },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  imageButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.disabled,
  },
})
