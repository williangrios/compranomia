import React from 'react'
import { View, Text } from 'react-native'
import { colors } from './colors'

export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View
      style={{
        backgroundColor: colors.success,
        padding: 16,
        borderRadius: 10,
        marginHorizontal: 16,
      }}
    >
      {text1 && (
        <Text
          style={{
            color: '#FFF',
            fontSize: 16,
            fontWeight: '700',
            marginBottom: text2 ? 6 : 0,
          }}
        >
          {text1}
        </Text>
      )}

      {text2 && (
        <Text
          style={{
            color: '#FFF',
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          {text2}
        </Text>
      )}
    </View>
  ),

  error: ({ text1, text2 }: any) => (
    <View
      style={{
        backgroundColor: colors.error,
        padding: 16,
        borderRadius: 10,
        marginHorizontal: 16,
      }}
    >
      {text1 && (
        <Text
          style={{
            color: '#FFF',
            fontSize: 16,
            fontWeight: '700',
            marginBottom: text2 ? 6 : 0,
          }}
        >
          {text1}
        </Text>
      )}

      {text2 && (
        <Text
          style={{
            color: '#FFF',
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          {text2}
        </Text>
      )}
    </View>
  ),
}
