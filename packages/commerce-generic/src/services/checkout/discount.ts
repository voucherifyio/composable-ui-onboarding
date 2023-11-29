import { Cart, Order } from '@composable/types'

export const addDiscountsToOrder = (cart: Cart, order: Order) => {
  order.redeemedVouchers = cart.vouchersApplied || []
  order.redeemedPromotions = cart.promotionsApplied || []
  return order
}
