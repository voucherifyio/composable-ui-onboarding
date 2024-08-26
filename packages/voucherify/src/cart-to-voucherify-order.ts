import { Cart } from '@composable/types'
import { CustomerRequest, OrdersCreate } from '@voucherify/sdk'
import { itemToVoucherifyItem } from './item-to-voucherify-item'

export const cartToVoucherifyOrder = (
  cart: Cart,
  customer?: CustomerRequest
): OrdersCreate => {
  const amount =
    cart.items.reduce((acc, cur) => {
      acc += cur.quantity * cur.price
      return acc
    }, 0) * 100

  return {
    amount,
    items: cart.items.map(itemToVoucherifyItem),
    customer: customer,
  }
}
