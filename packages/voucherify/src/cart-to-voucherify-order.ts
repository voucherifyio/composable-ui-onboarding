import { Cart } from '@composable/types'
import { OrdersCreate } from '@voucherify/sdk'
import { toCent } from './to-cent'

export const cartToVoucherifyOrder = (cart: Cart): OrdersCreate => {
  return {
    amount: toCent(cart.summary.totalPrice),
    items: cart.items.map((item) => ({
      quantity: item.quantity,
      product_id: item.id,
      sku_id: item.sku,
      price: item.price * 100,
    })),
  }
}
