import { Cart, CartItem } from '../commerce'

export type CartItemWithDiscounts = CartItem & {
  cartItemType: 'CartItemWithDiscounts'
  discounts: {
    /**
     * Final order item amount after the applied item-level discount. If there are no item-level discounts applied
     */
    subtotalAmount: string
  }
}

export type CartWithDiscounts = Cart & {
  cartType: 'CartWithDiscounts'
  redeemables: Redeemable[]
  items: CartItemWithDiscounts[]
  summary: {
    /**
     * Sum of all order-level discounts applied to the order.
     */
    discountAmount: string
    /**
     * Sum of all order-level AND all product-specific discounts applied to the order.
     */
    totalDiscountAmount: string
    /**
     * Order amount after applying all the discounts.
     */
    grandPrice: string
  }
}

export type Redeemable = {
  id: string
  status: string
  object: 'voucher' | 'promotion_tier' | 'promotion_stack'
  label?: string
  discount: string
}
