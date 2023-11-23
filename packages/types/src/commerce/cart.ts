export interface Cart {
  id: string
  items: CartItem[]
  // couponApplied?: Coupon
  summary: {
    subtotalPrice?: string
    taxes?: string
    totalPrice?: string
    shipping?: string
  }
  redeemables?: Discount
}

export type Discount = {
  promotions?: Promotion[]
  vouchers?: Voucher[]
}

export interface Promotion {
  id: string
  status: string
  label?: string
  discount: string
  object: 'promotion_tier'
}

export interface Voucher {
  id: string
  status: string
  label?: string
  discount: string
  object: 'voucher'
}

export interface AddCouponResponse {
  cart: Cart
  errorMsg: string
}

// interface Coupon {
//   id: string
//   code: string
//   discount: string
// }

export interface CartItem {
  id: string
  category: string
  type: string
  brand: string
  image: { url: string; alt: string }

  name: string
  price: number
  quantity: number
  sku: string
  slug: string
}
