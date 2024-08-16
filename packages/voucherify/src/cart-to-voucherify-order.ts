import { Cart } from '@composable/types'
import { CustomerRequest, OrdersCreate } from '@voucherify/sdk'
import { toCent } from './to-cent'
import { itemToVoucherifyItem } from './item-to-voucherify-item'

export const cartToVoucherifyOrder = (
  cart: Cart,
  customer?: CustomerRequest
): OrdersCreate => {
  return {
    amount: toCent(cart.summary.priceBeforeDiscount),
    items: cart.items.map(itemToVoucherifyItem),
    customer: customer,
  }
}
