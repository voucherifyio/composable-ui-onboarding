import { Cart, Promotion, Voucher } from '@composable/types'
import {
  PromotionsValidateResponse,
  QualificationsRedeemable,
  StackableRedeemableResponse,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk'
import { centToString, toCent } from './to-cent'

export const cartWithDiscount = (
  cart: Cart,
  validationResponse: ValidationValidateStackableResponse | false,
  promotions: QualificationsRedeemable[] | false
): Cart => {
  if (!validationResponse || !validationResponse.redeemables) {
    return {
      ...cart,
      summary: { ...cart.summary, totalDiscountAmount: undefined },
    }
  }

  const promotionsApplied: Promotion[] = validationResponse.redeemables
    .filter((redeemable) => redeemable.object === 'promotion_tier')
    .map((redeemable) => mapRedeemableToPromotion(redeemable, promotions))

  const vouchers: Voucher[] = validationResponse.redeemables
    .filter((redeemable) => redeemable.object === 'voucher')
    .map(mapRedeemableToVoucher)

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
    promotionsApplied,
  }
}

const mapRedeemableToPromotion = (
  redeemable: StackableRedeemableResponse,
  promotions: QualificationsRedeemable[] | false
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
      ? promotions
        ? promotions?.find((promotion) => promotion.id === redeemable.id)
            ?.banner ||
          promotions?.find((promotion) => promotion.id === redeemable.id)
            ?.name ||
          ''
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
