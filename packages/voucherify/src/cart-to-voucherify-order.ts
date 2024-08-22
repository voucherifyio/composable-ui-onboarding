import { Cart } from '@composable/types'
import { CustomerRequest, OrdersCreate } from '@voucherify/sdk'
import { itemToVoucherifyItem } from './item-to-voucherify-item'

export const cartToVoucherifyOrder = (
  cart: Cart,
  customer?: CustomerRequest
): OrdersCreate => {
  return {
    amount: cart.summary.priceBeforeDiscount
      ? cart.summary.priceBeforeDiscount * 100
      : cart.summary.totalPrice
      ? cart.summary.totalPrice * 100
      : undefined,
    items: cart.items.map(itemToVoucherifyItem),
    customer: customer,
  }
}
