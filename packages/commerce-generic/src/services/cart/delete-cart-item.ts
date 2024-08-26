import { CommerceService } from '@composable/types'
import { getCart, saveCart } from '../../data/mock-storage'

import {
  calculateCartSummary,
  generateEmptyCart,
} from '../../data/generate-cart-data'
import { updateCartDiscount } from '@composable/voucherify'

export const deleteCartItem: CommerceService['deleteCartItem'] = async ({
  cartId,
  productId,
  user,
  channel,
  dontApplyCodes,
}) => {
  const cart = (await getCart(cartId)) || generateEmptyCart(cartId)

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
