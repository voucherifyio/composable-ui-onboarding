import { CommerceService } from '@composable/types'
import { getCart as getCartFromStorage } from '../../data/mock-storage'
import { addVoucher as addVoucherToCart } from './discount'

export const addVoucher: CommerceService['addVoucher'] = async ({
  cartId,
  code,
}) => {
  const cart = await getCartFromStorage(cartId)

  if (!cart) {
    throw new Error(
      `[updateCartItem] Could not found cart with requested cart id: ${cartId}`
    )
  }

  const {
    cart: cartWithDiscount,
    errorMessage,
    success,
  } = await addVoucherToCart(cart, code)

  return {
    cart: cartWithDiscount,
    success,
    errorMessage,
  }
}
