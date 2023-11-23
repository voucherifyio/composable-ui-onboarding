import { CommerceService } from '@composable/types'
import { getCart as getCartFromStorage } from '../../data/mock-storage'

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

  // todo delete voucher from cart (mock + voucherify)

  return cart
}
