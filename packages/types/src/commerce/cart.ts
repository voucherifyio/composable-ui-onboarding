export interface Cart {
  id: string
  items: CartItem[]
  couponApplied?: Coupon
  summary: {
    subtotalPrice?: string
    taxes?: string
    totalPrice?: string
    shipping?: string
  }
}

interface Coupon {
  id: string
  code: string
  discount: string
}

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

// Extended cart related types by  Voucherify discounts

type CartItemWithDiscounts = CartItem & {
  cartItemType: 'CartItemWithDiscounts'
  discounts: {
    subtotal_amount: string // Final order item amount after the applied item-level discount. If there are no item-level discounts applied
  }
}

type CartWithDiscounts = Cart & {
  cartType: 'CartWithDiscounts'
  redeemables: Redeemable[]
  summary: {
    discountAmount: string // Sum of all order-level discounts applied to the order.
    totalDiscountAmount: string // Sum of all order-level AND all product-specific discounts applied to the order.
    grandPrice: string // Order amount after applying all the discounts.
  }
}

type Redeemable = {
  id: string
  status: string
  object: string
}
