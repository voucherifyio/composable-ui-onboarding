import { CommerceService } from '@composable/types'
import { getCart, saveCart } from '../../data/mock-storage'

import {
  calculateCartSummary,
  generateEmptyCart,
} from '../../data/generate-cart-data'
import { updateCartDiscount } from '@composable/voucherify'

export const updateCartItem: CommerceService['updateCartItem'] = async ({
  cartId,
  productId,
  quantity,
  user,
  channel,
  dontApplyCodes,
}) => {
  let cart = (await getCart(cartId)) || generateEmptyCart(cartId)

  cart.items = cart.items
    .map((item) => (item.id === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity)

  const cartWithDiscount = await updateCartDiscount(
    cart,
    user,
    channel,
    dontApplyCodes
  )

  cart.summary = calculateCartSummary(cart.items)

  return saveCart(cartWithDiscount)
}
