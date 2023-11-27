import { Cart } from '@composable/types'
import { validateCouponsAndPromotions } from './validate-discounts'
import { VoucherifyServerSide } from '@voucherify/sdk'
import { isRedeemableApplicable } from './is-redeemable-applicable'
import { saveCart } from '../../commerce-generic/src/data/mock-storage'
import { cartWithDiscount } from '../data/cart-with-discount'
import { centToString, toCent } from './to-cent'

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

export const deleteVoucherFromCart = async (
  cart: Cart,
  code: string
): Promise<{ cart: Cart; success: boolean; errorMessage?: string }> => {
  const success = true
  const errorMessage = undefined
  const cartAfterDeletion: Cart = {
    ...cart,
    vouchersApplied: cart.vouchersApplied?.filter(
      (voucher) => voucher.code !== code
    ),
  }
  const { validationResult, promotionsResult } =
    await validateCouponsAndPromotions({
      cart: cartAfterDeletion,
      voucherify,
    })

  const updatedCart = cartWithDiscount(
    cartAfterDeletion,
    validationResult,
    promotionsResult
  )

  await updateCartDiscount(updatedCart)

  return {
    cart: updatedCart,
    success,
    errorMessage,
  }
}

export const addVoucherToCart = async (
  cart: Cart,
  code: string
): Promise<{ cart: Cart; success: boolean; errorMessage?: string }> => {
  const { validationResult, promotionsResult } =
    await validateCouponsAndPromotions({
      cart,
      code,
      voucherify,
    })

  const { isApplicable, error } = isRedeemableApplicable(code, validationResult)

  if (isApplicable) {
    const updatedCart = cartWithDiscount(
      cart,
      validationResult,
      promotionsResult
    )
    await saveCart(updatedCart)
    return {
      cart: updatedCart,
      success: isApplicable,
      errorMessage: error,
    }
  }

  return {
    cart,
    success: false,
    errorMessage: 'Voucher not applicable',
  }
}

export const updateCartDiscount = async (cart: Cart): Promise<Cart> => {
  const { validationResult, promotionsResult } =
    await validateCouponsAndPromotions({
      cart,
      voucherify,
    })
  const updatedCart = cartWithDiscount(cart, validationResult, promotionsResult)
  await saveCart(updatedCart)

  const voucherDiscountsInCents =
    updatedCart.vouchersApplied?.reduce((sum, voucher) => {
      return sum + toCent(voucher.discountAmount)
    }, 0) || 0

  const promotionDiscountsInCents =
    updatedCart.promotionsApplied?.reduce((sum, voucher) => {
      return sum + toCent(voucher.discountAmount)
    }, 0) || 0

  const totalDiscountAmountInCents =
    promotionDiscountsInCents + voucherDiscountsInCents

  const totalPrice = centToString(
    toCent(cart.summary.priceBeforeDiscount) - totalDiscountAmountInCents
  )

  return {
    ...updatedCart,
    summary: {
      ...cart.summary,
      totalDiscountAmount: centToString(totalDiscountAmountInCents),
      totalPrice,
    },
  }
}
