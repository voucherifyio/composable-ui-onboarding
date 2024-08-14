import { Cart } from '@composable/types'
import { OrdersCreate } from '@voucherify/sdk'
import { toCent } from './to-cent'
import { itemToVoucherifyItem } from './item-to-voucherify-item'

export const cartToVoucherifyOrder = (cart: Cart): OrdersCreate => {
  return {
    amount: toCent(cart.summary.priceBeforeDiscount),
    items: cart.items.map(itemToVoucherifyItem),
  }
}
