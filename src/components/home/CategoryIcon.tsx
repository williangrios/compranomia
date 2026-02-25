import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Icon } from '@/components/ui/Icon'
import { IconName } from '@/components/ui/Icon'

const CARD_WIDTH = 85
const CARD_HEIGHT = 85
const CARD_GAP = 6

export enum StoreCategory {
  Grocery = 'Grocery',
  Pharmacy = 'Pharmacy',
  Butcher = 'Butcher',
  Greengrocer = 'Greengrocer',
  Food = 'Food',
  PetShop = 'PetShop',
  ConvenienceStore = 'ConvenienceStore',
  AgricultureStore = 'AgricultureStore',
  Services = 'Services',
  WaterAndGasSupplier = 'WaterAndGasSupplier',
}

type CategoryConfig = {
  id: StoreCategory
  label: string
  colorBase: string
  colorOverlay: string
  iconLib: 'mci' | 'lucide'
  icon: string
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: StoreCategory.Grocery,
    label: 'Mercado',
    colorBase: '#43A047',
    colorOverlay: '#81C784',
    iconLib: 'lucide',
    icon: 'ShoppingCart',
  },
  {
    id: StoreCategory.Pharmacy,
    label: 'Farmácia',
    colorBase: '#1E88E5',
    colorOverlay: '#64B5F6',
    iconLib: 'lucide',
    icon: 'Pill',
  },
  {
    id: StoreCategory.Butcher,
    label: 'Açougue',
    colorBase: '#E53935',
    colorOverlay: '#EF9A9A',
    iconLib: 'lucide',
    icon: 'Beef',
  },
  {
    id: StoreCategory.Greengrocer,
    label: 'Hortifruti',
    colorBase: '#7CB342',
    colorOverlay: '#AED581',
    iconLib: 'lucide',
    icon: 'Salad',
  },
  {
    id: StoreCategory.Food,
    label: 'Comida',
    colorBase: '#FB8C00',
    colorOverlay: '#FFCC80',
    iconLib: 'lucide',
    icon: 'UtensilsCrossed',
  },
  {
    id: StoreCategory.PetShop,
    label: 'Pet Shop',
    colorBase: '#8E24AA',
    colorOverlay: '#CE93D8',
    iconLib: 'lucide',
    icon: 'PawPrint',
  },
  {
    id: StoreCategory.ConvenienceStore,
    label: 'Conveniência',
    colorBase: '#00ACC1',
    colorOverlay: '#80DEEA',
    iconLib: 'lucide',
    icon: 'Store',
  },
  {
    id: StoreCategory.AgricultureStore,
    label: 'Agropecuária',
    colorBase: '#6D4C41',
    colorOverlay: '#BCAAA4',
    iconLib: 'lucide',
    icon: 'Tractor',
  },
  {
    id: StoreCategory.Services,
    label: 'Serviços',
    colorBase: '#546E7A',
    colorOverlay: '#B0BEC5',
    iconLib: 'lucide',
    icon: 'Wrench',
  },
  {
    id: StoreCategory.WaterAndGasSupplier,
    label: 'Água e Gás',
    colorBase: '#039BE5',
    colorOverlay: '#B3E5FC',
    iconLib: 'lucide',
    icon: 'Droplets',
  },
]

function CategoryIcon({ item }: { item: CategoryConfig }) {
  return <Icon icon={item.icon as IconName} size={30} color="#fff" />
}

function splitIntoRows(
  items: CategoryConfig[],
): [CategoryConfig[], CategoryConfig[]] {
  const row1: CategoryConfig[] = []
  const row2: CategoryConfig[] = []
  items.forEach((item, i) => {
    if (i % 2 === 0) row1.push(item)
    else row2.push(item)
  })
  return [row1, row2]
}

type Props = {
  onSelect?: (category: StoreCategory) => void
}

export function CategoryCards({ onSelect }: Props) {
  const [row1, row2] = splitIntoRows(CATEGORIES)

  const handlePress = (item: CategoryConfig) => {
    if (onSelect) {
      onSelect(item.id)
    } else {
      Alert.alert('Categoria selecionada', item.label)
    }
  }

  const renderCard = (item: CategoryConfig) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handlePress(item)}
      activeOpacity={0.8}
      style={styles.cardWrapper}
    >
      <View style={[styles.card, { backgroundColor: item.colorBase }]}>
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: 16,
              backgroundColor: item.colorOverlay,
              opacity: 0.35,
              top: '40%',
              left: '40%',
            },
          ]}
        />
        <CategoryIcon item={item} />
        <Text style={styles.label} numberOfLines={2}>
          {item.label}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        <View style={styles.rows}>
          <View style={styles.row}>{row1.map(renderCard)}</View>
          <View style={styles.row}>{row2.map(renderCard)}</View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 32,
  },
  rows: {
    flexDirection: 'column',
    gap: CARD_GAP,
  },
  row: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  label: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
})
