export interface Profile {
  id: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  address: string | null
  points: number
  role: "customer" | "admin"
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  points_value: number
  stock: number
  is_limited: boolean
  is_featured: boolean
  is_active: boolean
  product_type: "customizable" | "premade"
  created_at: string
  updated_at: string
  images?: ProductImage[]
  customization_fields?: ProductCustomizationField[]
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface ProductCustomizationField {
  id: string
  product_id: string
  field_name: string
  field_type: "text" | "textarea" | "select" | "number" | "color"
  field_label: string
  field_options?: string[]
  is_required: boolean
  sort_order: number
  created_at: string
}

export interface CustomizationOption {
  id: string
  type: "size" | "material"
  name: string
  price_modifier: number
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Order {
  id: string
  user_id: string | null
  first_name: string
  last_name: string
  phone: string
  address: string
  notes: string | null
  status: "pending" | "ongoing" | "completed" | "cancelled"
  total_amount: number
  points_earned: number
  is_custom: boolean
  created_at: string
  updated_at: string
  items?: OrderItem[]
  custom_order?: CustomOrder
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  quantity: number
  price: number
  size_option: string | null
  material_option: string | null
  created_at: string
  product?: Product
}

export interface CustomOrder {
  id: string
  order_id: string
  description: string
  size_option: string | null
  material_option: string | null
  reference_images: string[]
  reference_product?: string | null
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string | null
  sender_role: "customer" | "admin"
  content: string | null
  image_url: string | null
  is_read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  customer_id: string
  last_message_at: string
  created_at: string
  customer?: Profile
  messages?: Message[]
}

export interface FeaturedGallery {
  id: string
  title: string | null
  image_url: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface SiteSettings {
  id: string
  instagram: string
  about_text: string
  founder_name: string
  created_at: string
  updated_at: string
}

export interface RedeemableItem {
  id: string
  name: string
  description: string | null
  points_required: number
  stock: number
  is_active: boolean
  created_at: string
  updated_at: string
  image_url?: string
  images?: RedeemableImage[]
}

export interface RedeemableImage {
  id: string
  redeemable_id: string
  image_url: string
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface Redemption {
  id: string
  user_id: string
  redeemable_id: string | null
  points_spent: number
  status: "pending" | "processing" | "completed"
  first_name: string
  last_name: string
  phone: string
  address: string
  created_at: string
  redeemable?: RedeemableItem
}

export interface UserCollection {
  id: string
  user_id: string
  product_id: string
  order_id: string | null
  created_at: string
  product?: Product
}
