import { CartItem } from '@composable/types'
import { OrdersItem } from '@voucherify/sdk/dist/types/Orders'

export const itemToVoucherifyItem = (item: CartItem): OrdersItem => ({
  quantity: item.quantity,
  product_id: item.id,
  sku_id: item.sku,
  price: (item.price + item.tax) * 100,
})
