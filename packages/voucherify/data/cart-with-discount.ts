import { Cart, CartItem, Promotion, Voucher } from '@composable/types'
import {
  PromotionsValidateResponse,
  StackableRedeemableResponse,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk'
import { centToString, toCent } from '../src/to-cent'

export const cartWithDiscount = (
  cart: Cart,
  validationResponse: ValidationValidateStackableResponse | false,
  promotionsResult: PromotionsValidateResponse | false
): Cart => {
  if (!validationResponse) {
    return cart
  }
  const promotions: Promotion[] = validationResponse
    ? validationResponse.redeemables
        ?.filter((redeemable) => redeemable.object === 'promotion_tier')
        .map((redeemable) =>
          mapRedeemableToPromotion(redeemable, promotionsResult)
        ) || []
    : []

  const vouchers: Voucher[] = validationResponse
    ? validationResponse.redeemables
        ?.filter((redeemable) => redeemable.object === 'voucher')
        .map((redeemable) => mapRedeemableToVoucher(redeemable)) || []
    : []

  const items: CartItem[] = cart.items.map((item) => ({
    ...item,
  }))

  const totalDiscountAmount = centToString(
    validationResponse.order?.total_applied_discount_amount ?? 0
  )

  const totalPrice = centToString(
    validationResponse.order?.total_amount ?? toCent(cart.summary.totalPrice)
  )

  return {
    ...cart,
    summary: {
      ...cart.summary,
      totalDiscountAmount,
      totalPrice,
    },
    vouchersApplied: vouchers,
    promotionsApplied: promotions,
    items,
  }
}

const mapRedeemableToPromotion = (
  redeemable: StackableRedeemableResponse,
  promotionsResult: PromotionsValidateResponse | false
) => ({
  id: redeemable.id,
  discountAmount: centToString(
    redeemable.order?.total_applied_discount_amount ||
      redeemable.result?.discount?.amount_off ||
      redeemable.result?.discount?.percent_off ||
      0
  ),
  label:
    redeemable.object === 'promotion_tier'
      ? promotionsResult
        ? promotionsResult.promotions?.find(
            (promotion) => promotion.id === redeemable.id
          )?.banner || ''
        : redeemable.id
      : redeemable.id,
})

const mapRedeemableToVoucher = (redeemable: StackableRedeemableResponse) => ({
  code: redeemable.id,
  discountAmount: centToString(
    redeemable.order?.total_applied_discount_amount ||
      redeemable.result?.discount?.amount_off ||
      redeemable.result?.discount?.percent_off ||
      0
  ),
  label: redeemable.id,
})
