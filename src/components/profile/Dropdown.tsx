import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, components } from '@/theme'

interface DropdownProps {
  label: string
  placeholder?: string
  options: string[]
  value: string
  onChange: (value: string) => void
  error?: string
}

export function Dropdown({
  label,
  placeholder = 'Selecione uma opção',
  options,
  value,
  onChange,
  error,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={components.input.label}>{label}</Text>

      <TouchableOpacity
        style={[
          components.input.container,
          error && components.input.error,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        ]}
        onPress={() => setIsOpen(true)}
      >
        <Text
          style={[
            components.input.text,
            !value && { color: colors.textSecondary },
          ]}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {error && (
        <Text style={{ fontSize: 12, color: colors.danger, marginTop: 4 }}>
          {error}
        </Text>
      )}

      {/* Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '70%',
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.textPrimary,
                }}
              >
                {label}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => {
                    onChange(option)
                    setIsOpen(false)
                  }}
                >
                  <Text
                    style={{
                      color:
                        value === option ? colors.primary : colors.textPrimary,
                      fontWeight: value === option ? '600' : '400',
                      fontSize: 16,
                    }}
                  >
                    {option}
                  </Text>
                  {value === option && (
                    <Ionicons
                      name="checkmark"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
