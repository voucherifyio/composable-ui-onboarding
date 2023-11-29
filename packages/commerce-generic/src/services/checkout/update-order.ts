import { CommerceService } from '@composable/types'
import { getCart, getOrder, saveOrder } from '../../data/mock-storage'
import { addDiscountsToOrder } from './discount'

export const updateOrder: CommerceService['updateOrder'] = async (params: {
  id: string
  status: string
  payment: string
  cartId: string
}) => {
  const { id, status, cartId } = params
  const order = await getOrder(id)
  const cart = await getCart(cartId)
  if (!order) {
    throw new Error(`Cannot find order with id: ${id}`)
  }
  order.status = status

  if (
    order.status === 'complete' &&
    (cart?.vouchersApplied || cart?.promotionsApplied)
  ) {
    const orderWithDiscounts = addDiscountsToOrder(cart, order)
    return await saveOrder(orderWithDiscounts)
  }
  return await saveOrder(order)
}
