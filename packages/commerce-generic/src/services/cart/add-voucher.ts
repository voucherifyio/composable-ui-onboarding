import { CommerceService } from '@composable/types'
import { getCart as getCartFromStorage } from '../../data/mock-storage'

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

  // todo add voucher to cart (mock + voucherify)

  return {
    cart: cart,
    success: true,
    // errorMessage
  }
}
