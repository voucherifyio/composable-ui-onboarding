import { Order, UserSession } from '@composable/types'
import { OrdersCreate } from '@voucherify/sdk'
import { toCent } from './to-cent'
import { userSessionToVoucherifyCustomer } from './user-session-to-voucherify-customer'

export const orderToVoucherifyOrder = (
  order: Order,
  user?: UserSession
): OrdersCreate => {
  return {
    amount: order.summary.priceBeforeDiscount,
    items: order.items.map((item) => ({
      quantity: item.quantity,
      product_id: item.id,
      sku_id: item.sku,
      price: (item.price + item.tax) * 100,
    })),
    customer: {
      ...(user ? userSessionToVoucherifyCustomer(user) : {}),
      address: {
        city: order.billing_address.city || order.shipping_address.city,
        state: order.billing_address.state || order.shipping_address.state,
        line_1:
          order.billing_address.address_line_1 ||
          order.shipping_address.address_line_1,
        country:
          order.billing_address.country || order.shipping_address.country,
        postal_code:
          order.billing_address.postcode || order.shipping_address.postcode,
      },
    },
    status: 'PAID',
  }
}
