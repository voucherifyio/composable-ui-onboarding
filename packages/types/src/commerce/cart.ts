export interface Cart {
  id: string
  items: CartItem[]
  promotionsApplied?: Promotion[]
  vouchersApplied?: Voucher[]
  summary: {
    subtotalPrice?: number
    taxes?: number
    totalDiscountAmount?: number
    priceBeforeDiscount?: number
    /**
     * Order amount after applying all the discounts.
     */
    totalPrice?: number
    shipping?: number | string
  }
}

export interface Promotion {
  id: string
  label: string
  discountAmount: string
}

export interface Voucher {
  code: string
  label: string
  discountAmount: number
}

export interface CartItem {
  id: string
  category: string
  type: string
  brand: string
  image: { url: string; alt: string }
  name: string
  price: number
  discount?: number
  tax: number
  quantity: number
  sku: string
  slug: string
}
