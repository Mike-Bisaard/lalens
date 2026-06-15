export type CardCondition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG'
export type CardStatus = 'available' | 'reserved' | 'sold' | 'removed'
export type OrderStatus = 'pending_payment' | 'verifying' | 'paid' | 'shipped' | 'completed' | 'cancelled'

export interface Shop {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  avatar_url: string | null
  bank_account_encrypted: string  // encrypted at rest — never expose to client
  bank_account_last4: string      // last 4 digits for safe client display
  bank_name: string
  created_at: string
}

export interface BatchUpload {
  id: string
  shop_id: string
  original_image_url: string
  caption: string | null
  is_active: boolean
  created_at: string
}

export interface Card {
  id: string
  batch_id: string
  shop_id: string
  name: string
  image_url: string
  crop_coords: { x: number; y: number; w: number; h: number } | null
  price: number
  condition: CardCondition
  status: CardStatus
  quantity: number
  sort_order: number
  created_at: string
}

export interface Order {
  id: string
  shop_id: string
  buyer_email: string | null
  buyer_user_id: string | null
  status: OrderStatus
  total_amount: number
  slip_url: string | null
  slip_verified_at: string | null
  tracking_number: string | null
  reserved_at: string | null
  slip_submitted_at: string | null
  expires_at: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  card_id: string
  price_snapshot: number
  card: Card
}

export interface CropBox {
  x: number
  y: number
  w: number
  h: number
}
