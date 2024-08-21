import { CommerceService } from '@composable/types'
import { getCart, saveCart } from '../../data/mock-storage'

import { calculateCartSummary } from '../../data/generate-cart-data'
import { updateCartDiscount } from '@composable/voucherify'

export const deleteCartItem: CommerceService['deleteCartItem'] = async ({
  cartId,
  productId,
  user,
  channel,
  dontApplyCodes,
}) => {
  const cart = await getCart(cartId)

  if (!cart) {
    throw new Error(
      `[deleteCartItem] Could not found cart with requested cart id: ${cartId}`
    )
  }

  cart.items = cart.items.filter((item) => item.id !== productId)

  const cartWithDiscount = await updateCartDiscount(
    cart,
    user,
    channel,
    dontApplyCodes
  )

  cart.summary = calculateCartSummary(cart.items)

  return saveCart(cartWithDiscount)
}
