import { UserTags } from '@wrcb/cb-common'

export const userTagsLabels: Record<UserTags, string> = {
  // =========================
  // 🥩 CARNES / AÇOUGUE
  // =========================
  BeefMeat: 'Carne bovina',
  PorkMeat: 'Carne suína',
  ChickenMeat: 'Carne de frango',
  FishMeat: 'Peixes',
  Seafood: 'Frutos do mar',
  Sausages: 'Embutidos e linguiças',
  OrganicMeat: 'Carnes orgânicas',
  NoblesCuts: 'Cortes nobres',

  // =========================
  // 🥬 FRUTAS / VERDURAS
  // =========================
  Fruits: 'Frutas',
  Vegetables: 'Legumes e verduras',
  OrganicVegetables: 'Vegetais orgânicos',
  Herbs: 'Ervas e temperos',
  SeasonalProducts: 'Produtos da estação',

  // =========================
  // 🥖 PADARIA
  // =========================
  FreshBread: 'Pães frescos',
  Cakes: 'Bolos',
  Pastries: 'Salgados e folhados',
  ArtisanalBread: 'Pães artesanais',
  WholeMeal: 'Produtos integrais',
  GlutenFreeBakery: 'Padaria sem glúten',

  // =========================
  // 🧀 LATICÍNIOS
  // =========================
  Dairy: 'Laticínios',
  Cheese: 'Queijos',
  Yogurt: 'Iogurtes',
  LactoseFree: 'Sem lactose',

  // =========================
  // 🥤 BEBIDAS
  // =========================
  Beverages: 'Bebidas',
  ColdDrinks: 'Bebidas geladas',
  Juices: 'Sucos',
  SoftDrinks: 'Refrigerantes',
  AlcoholicDrinks: 'Bebidas alcoólicas',
  Water: 'Água',

  // =========================
  // 🍫 SNACKS / DOCES
  // =========================
  Snacks: 'Snacks e lanches',
  Candy: 'Balas e doces',
  Chocolate: 'Chocolates',
  IceCream: 'Sorvetes',
  ReadyToEat: 'Prontos para consumo',

  // =========================
  // 🧼 LIMPEZA / HIGIENE
  // =========================
  Cleaning: 'Produtos de limpeza',
  PersonalCare: 'Higiene pessoal',
  BabyCare: 'Cuidados com bebês',
  Perfumery: 'Perfumaria',
  Diapers: 'Fraldas',

  // =========================
  // 🐶 PET SHOP
  // =========================
  PetFood: 'Ração para pet',
  DogFood: 'Ração para cães',
  CatFood: 'Ração para gatos',
  BirdFood: 'Ração para aves',
  FishFood: 'Ração para peixes',
  PetToys: 'Brinquedos para pets',
  PetHygiene: 'Higiene para pets',
  PetAccessories: 'Acessórios para pets',
  VeterinaryProducts: 'Produtos veterinários',

  // =========================
  // ❄️ CONGELADOS / CONSERVAS
  // =========================
  FrozenFood: 'Congelados',
  CannedFood: 'Enlatados e conservas',
  InstantFood: 'Alimentos instantâneos',

  // =========================
  // ✏️ PAPELARIA / UTILIDADES
  // =========================
  Stationery: 'Papelaria',
  SchoolSupplies: 'Material escolar',
  HomeUtilities: 'Utilidades domésticas',
  Kitchenware: 'Utensílios de cozinha',

  // =========================
  // 💊 FARMÁCIA
  // =========================
  Medicines: 'Medicamentos',
  GenericMedicines: 'Medicamentos genéricos',
  Supplements: 'Suplementos',
  Vitamins: 'Vitaminas',
  FirstAid: 'Primeiros socorros',
  NaturalProducts: 'Produtos naturais',
  Cosmetics: 'Cosméticos',

  // =========================
  // 🌱 CARACTERÍSTICAS ESPECIAIS
  // =========================
  OrganicProducts: 'Produtos orgânicos',
  GlutenFree: 'Sem glúten',
  VeganProducts: 'Produtos veganos',
  ImportedProducts: 'Produtos importados',
  LocalProducts: 'Produtos locais',
  DietProducts: 'Produtos diet',
  Halal: 'Halal',
  Kosher: 'Kosher',

  // =========================
  // 🚜 AGROPECUÁRIA
  // =========================
  AnimalFeed: 'Ração animal',
  Seeds: 'Sementes',
  Fertilizers: 'Fertilizantes',
  Pesticides: 'Defensivos agrícolas',
  FarmTools: 'Ferramentas agrícolas',
  IrrigationEquipment: 'Equipamentos de irrigação',
  VeterinarySupplies: 'Insumos veterinários',
  Livestock: 'Criação de animais',

  // =========================
  // 🚚 SERVIÇOS
  // =========================
  FastDelivery: 'Entrega rápida',
  FreeDelivery: 'Entrega grátis',
  Open24Hours: 'Aberto 24 horas',

  [UserTags.CityTour]: '',
  [UserTags.CulturalTour]: '',
  [UserTags.GastronomicTour]: '',
  [UserTags.AdventureTour]: '',
  [UserTags.HistoricalTour]: '',
  [UserTags.NatureTour]: '',
  [UserTags.ReligiousTour]: '',
  [UserTags.ShoppingTour]: '',
  [UserTags.AquaticTour]: '',
  [UserTags.Photographer]: '',
  [UserTags.BrazilianLanguage]: '',
  [UserTags.SpanishLanguage]: '',
  [UserTags.EnglishLanguage]: '',
  [UserTags.FrenchLanguage]: '',
  [UserTags.ItalianLanguage]: '',
  [UserTags.Brazilian]: '',
  [UserTags.Italian]: '',
  [UserTags.Japanese]: '',
  [UserTags.Chinese]: '',
  [UserTags.FastFood]: '',
  [UserTags.LocalFood]: '',
  [UserTags.Mexican]: '',
  [UserTags.Arabic]: '',
  [UserTags.French]: '',
  [UserTags.Indian]: '',
  [UserTags.Mediterranean]: '',
  [UserTags.Vegetarian]: '',
  [UserTags.Air]: '',
  [UserTags.Sea]: '',
  [UserTags.Land]: '',
  [UserTags.Pop]: '',
  [UserTags.Rock]: '',
  [UserTags.Electronic]: '',
  [UserTags.Samba]: '',
  [UserTags.Sertanejo]: '',
  [UserTags.Forro]: '',
  [UserTags.Funk]: '',
  [UserTags.MPB]: '',
  [UserTags.CulturalFestival]: '',
  [UserTags.MusicEvent]: '',
  [UserTags.SportsEvent]: '',
  [UserTags.GastronomicEvent]: '',
  [UserTags.FairAndExhibition]: '',
  [UserTags.ReligiousEvent]: '',
  [UserTags.CorporateEvent]: '',
  [UserTags.FashionAndBeautyEvent]: '',
  [UserTags.FamilyAndKidsEvent]: '',
  [UserTags.AdventureAndEcoTourismEvent]: '',
  [UserTags.Anal]: '',
  [UserTags.Arab]: '',
  [UserTags.ASMR]: '',
  [UserTags.Asian]: '',
  [UserTags.Athletic]: '',
  [UserTags.BBW]: '',
  [UserTags.BDSM]: '',
  [UserTags.Black]: '',
  [UserTags.Blonde]: '',
  [UserTags.Brunette]: '',
  [UserTags.Cosplay]: '',
  [UserTags.Cuckold]: '',
  [UserTags.Curvy]: '',
  [UserTags.Dancing]: '',
  [UserTags.DirtyTalk]: '',
  [UserTags.Domination]: '',
  [UserTags.DP]: '',
  [UserTags.Ebony]: '',
  [UserTags.Feet]: '',
  [UserTags.Findom]: '',
  [UserTags.Fingering]: '',
  [UserTags.Gamer]: '',
  [UserTags.GILF]: '',
  [UserTags.Group]: '',
  [UserTags.Hairy]: '',
  [UserTags.InteractiveToys]: '',
  [UserTags.JOI]: '',
  [UserTags.Latina]: '',
  [UserTags.Lactating]: '',
  [UserTags.Maid]: '',
  [UserTags.Mature]: '',
  [UserTags.MILF]: '',
  [UserTags.Muscle]: '',
  [UserTags.Natural]: '',
  [UserTags.Nurse]: '',
  [UserTags.Nympho]: '',
  [UserTags.OilShow]: '',
  [UserTags.Oral]: '',
  [UserTags.Outdoor]: '',
  [UserTags.Petite]: '',
  [UserTags.Pierced]: '',
  [UserTags.Pregnant]: '',
  [UserTags.Redhead]: '',
  [UserTags.Roleplay]: '',
  [UserTags.Secretary]: '',
  [UserTags.Shaved]: '',
  [UserTags.Shower]: '',
  [UserTags.ShowerShow]: '',
  [UserTags.Slim]: '',
  [UserTags.Smoking]: '',
  [UserTags.SPH]: '',
  [UserTags.Squirt]: '',
  [UserTags.Striptease]: '',
  [UserTags.Student]: '',
  [UserTags.Submission]: '',
  [UserTags.Tattooed]: '',
  [UserTags.Teacher]: '',
  [UserTags.Teen18Plus]: '',
  [UserTags.Toys]: '',
  [UserTags.Voyeur]: '',
  [UserTags.White]: '',
  [UserTags.OfficeSupplies]: '',
}

export function sortByLabel<T extends string>(
  values: T[],
  labels: Record<T, string>,
): T[] {
  return [...values].sort((a, b) =>
    (labels[a] ?? a).localeCompare(labels[b] ?? b, 'pt-BR'),
  )
}
