import { CommerceService } from '@composable/types'
import {
  getCart,
  getCartDiscounts,
  saveCartDiscounts,
} from '../../../data/mock-storage'
import { validateDiscounts } from './validate-discounts'

export const addCoupon: CommerceService['addCoupon'] = async ({
  cartId,
  coupon,
}) => {
  const cart = await getCart(cartId)

  if (!cart) {
    throw new Error(`[addCoupon] Cart not found by id: ${cartId}`)
  }

  const currentDiscounts = await getCartDiscounts(cartId)

  const couponToValidate = {
    id: coupon,
    object: 'voucher',
  }

  const discounts = [...currentDiscounts, couponToValidate]

  const { validationResult, error } = await validateDiscounts({
    cart,
    discounts,
  })

  if (validationResult) {
    await saveCartDiscounts(cartId, discounts)
    return {
      cart: cart,
      errorMsg: error,
    }
  }
  return {
    cart: cart,
    errorMsg: error,
  }
}
