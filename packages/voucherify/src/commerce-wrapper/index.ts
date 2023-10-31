import {
  CommerceService,
  CommerceServiceWithDiscounts,
} from '@composable/types'
import { getCartFunction } from './get-cart'
import { VoucherifyServerSide } from '@voucherify/sdk'
import { addCartItemFunction } from './add-cart-item'
import { createCartFunction } from './create-cart'
import { deleteCartItemFunction } from './delete-cart-item'
import { updateCartItemFunction } from './update-cart-item'
import { addCouponFunction } from './add-coupon'
import { deleteCouponFunction } from './delete-coupon'

if (
  !process.env.VOUCHERIFY_APPLICATION_ID ||
  !process.env.VOUCHERIFY_SECRET_KEY ||
  !process.env.VOUCHERIFY_API_URL
) {
  throw new Error('[voucherify] Missing configuration')
}

const voucherify = VoucherifyServerSide({
  applicationId: process.env.VOUCHERIFY_APPLICATION_ID,
  secretKey: process.env.VOUCHERIFY_SECRET_KEY,
  exposeErrorCause: true,
  apiUrl: process.env.VOUCHERIFY_API_URL,
  channel: 'ComposableUI',
})

export const commerceWithDiscount = (
  commerceService: CommerceService
): CommerceServiceWithDiscounts => {
  console.log('[voucherify][commerceWithDiscount] wrapping commerce service')
  return {
    ...commerceService,
    getCart: getCartFunction(commerceService, voucherify),
    addCartItem: addCartItemFunction(commerceService, voucherify),
    createCart: createCartFunction(commerceService, voucherify),
    deleteCartItem: deleteCartItemFunction(commerceService, voucherify),
    updateCartItem: updateCartItemFunction(commerceService, voucherify),
    addCoupon: addCouponFunction(commerceService, voucherify),
    deleteCoupon: deleteCouponFunction(commerceService, voucherify),
  }
}
