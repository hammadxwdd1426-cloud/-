export interface RestaurantProfile {
  nameArabic: string;
  nameLatin: string;
  description: string;
  logoUrl: string;
  heroImageUrl: string;
  isOpen: boolean;
  openingHoursText: string;
  restaurantWhatsapp: string;
  courierWhatsapp: string;
  deliveryFee: number;
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  branchMapUrl: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  prepTimeMinutes: number;
  isAvailable: boolean;
  order: number;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type FulfillmentType = 'pickup' | 'delivery';
export type OrderStatus = 'new' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItemRecord {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  pickupBranchInfo?: string;
  items: OrderItemRecord[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  estimatedReadyMinutes: number;
  notes?: string;
}

export const DEFAULT_RESTAURANT_PROFILE: RestaurantProfile = {
  nameArabic: 'رقيش',
  nameLatin: 'RGESH',
  description: 'مخبوزات طازجة يومياً بحب وشغف، نجمع بين عراقة المخبوزات ولمسات النكهة العصرية الراقية.',
  logoUrl: '/rgesh-logo.png',
  heroImageUrl: '',
  isOpen: true,
  openingHoursText: 'يومياً من ٧:٠٠ صباحاً حتى ١١:٠٠ مساءً',
  restaurantWhatsapp: '0538548964',
  courierWhatsapp: '+966538490563',
  deliveryFee: 15,
  branchName: 'فرع رقيش الرئيسي',
  branchAddress: 'المملكة العربية السعودية، الفرع الرئيسي لـ رقيش',
  branchPhone: '0538548964',
  branchMapUrl: 'https://maps.google.com'
};
