import { CommerceService } from '@composable/types'
import { getCart, saveCart } from '../../data/mock-storage'
import {
  generateCartItem,
  calculateCartSummary,
  generateEmptyCart,
} from '../../data/generate-cart-data'
import { updateCartDiscount } from '@composable/voucherify'

export const addCartItem: CommerceService['addCartItem'] = async ({
  cartId,
  productId,
  quantity,
  user,
  channel,
  dontApplyCodes,
}) => {
  const cart = (await getCart(cartId)) || generateEmptyCart(cartId)

  const isProductInCartAlready = cart.items.some(
    (item) => item.id === productId
  )

  if (isProductInCartAlready) {
    cart.items.find((item) => item.id === productId)!.quantity++
  } else {
    const newItem = generateCartItem(productId, quantity)
    if (newItem) {
      cart.items.push(newItem)
    }
  }

  const cartWithDiscount = await updateCartDiscount(
    cart,
    user,
    channel,
    dontApplyCodes
  )
  cart.summary = calculateCartSummary(cart.items)

  return saveCart(cartWithDiscount)
}
