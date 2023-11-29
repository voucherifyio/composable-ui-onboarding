import { Cart, Order } from '@composable/types'

export const addDiscountsToOrder = (cart: Cart, order: Order) => {
  const redeemedVouchers = cart.vouchersApplied
  const redeemedPromotions = cart.promotionsApplied
  order.redeemedVouchers = redeemedVouchers || []
  order.redeemedPromotions = redeemedPromotions || []
  return order
}
