import { Order } from './order'

export type OrderWithDiscounts = Order & {
  redeemables: []
}
