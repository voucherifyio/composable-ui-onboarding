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

  const totalDiscountAmount =
    validationResponse.order?.total_applied_discount_amount || 0
  const totalPrice =
    validationResponse.order?.total_amount ||
    (cart.summary.totalPrice || 0) * 100

  const redeemables = validationResponse.redeemables.filter(
    (redeemable) => redeemable.status === 'APPLICABLE'
  )
  const cartItems = cart.items

  const discounts: { targetSku?: string; money: number }[] = []
  redeemables.forEach((coupon) => {
    let totalDiscountAmount =
      coupon?.order?.items_applied_discount_amount ||
      coupon.order?.applied_discount_amount ||
      0

    coupon.order?.items?.forEach((item) => {
      if (item.product_id === 'prod_5h1pp1ng') {
        return
      }

      if (
        item?.applied_discount_amount &&
        cartItems.find((cartItem) => cartItem.sku === item?.sku?.source_id)
      ) {
        discounts.push({
          targetSku: item?.sku?.source_id,
          money: item.applied_discount_amount,
        })
        totalDiscountAmount -= item.applied_discount_amount
      }
    })

    if (totalDiscountAmount) {
      discounts.push({
        money: totalDiscountAmount,
      })
    }
  })

  return {
    ...cart,
    items: cartItems.map((item) => {
      const itemDiscounts = discounts.filter(
        (discount) => discount.targetSku === item.sku
      )
      if (!itemDiscounts.length) {
        return { ...item, discount: 0 }
      }
      return {
        ...item,
        discount: itemDiscounts.reduce((acc, cur) => acc + cur.money, 0) / 100,
      }
    }),
    summary: {
      ...cart.summary,
      totalDiscountAmount: totalDiscountAmount / 100,
      totalPrice: totalPrice / 100,
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
  discountAmount: redeemable.result?.discount?.amount_off || 0,
  label: redeemable.id,
})
