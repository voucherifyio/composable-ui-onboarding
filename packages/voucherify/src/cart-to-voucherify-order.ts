import { toCent } from '@composable/commerce-generic'
import { Cart } from '@composable/types'
import { OrdersCreate } from '@voucherify/sdk'

export const cartToVoucherifyOrder = (cart: Cart): OrdersCreate => {
  return {
    amount: toCent(cart.summary.priceBeforeDiscount),
    items: cart.items.map((item) => ({
      quantity: item.quantity,
      product_id: item.id,
      sku_id: item.sku,
      price: item.price * 100,
    })),
  }
}
