import { CommerceService } from '@composable/types'
import { getCart as getCartFromStorage } from '../../data/mock-storage'
import { updateCartDiscount } from '@composable/voucherify'

export const getCart: CommerceService['getCart'] = async ({ cartId, user, channel }) => {
  if (!cartId) {
    return null
  }

  const cart = await getCartFromStorage(cartId)

  if (!cart) {
    return null
  }

  const cartWithDiscount = await updateCartDiscount(cart, user, channel)

  return cartWithDiscount || null
}
