import { CommerceService } from '@composable/types'
import { getCart as getCartFromStorage } from '../../data/mock-storage'
import { deleteVoucher as deleteVoucherFromCart } from './discount'

export const deleteVoucher: CommerceService['deleteVoucher'] = async ({
  cartId,
  code,
}) => {
  const cart = await getCartFromStorage(cartId)

  if (!cart) {
    throw new Error(
      `[updateCartItem] Could not found cart with requested cart id: ${cartId}`
    )
  }

  const { cart: cartWithDiscount } = await deleteVoucherFromCart(cart, code)

  return cartWithDiscount
}
