import {
  Cart,
  CartItemWithDiscounts,
  CartWithDiscounts,
  Redeemable,
} from '@composable/types'
import {
  PromotionsValidateResponse,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk'
import { centToString, toCent } from '../src/to-cent'

export const cartWithDiscount = (
  cart: Cart,
  validationResponse: ValidationValidateStackableResponse | false,
  promotionsResult: PromotionsValidateResponse | false
): CartWithDiscounts => {
  const redeemables: Redeemable[] = validationResponse
    ? validationResponse.redeemables?.map((redeemable) => ({
        id: redeemable.id,
        status: redeemable.status,
        object: redeemable.object,
        discount: centToString(
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
                )?.banner
              : redeemable.id
            : redeemable.id,
      })) || []
    : []
  const items: CartItemWithDiscounts[] = cart.items.map((item) => ({
    ...item,
    cartItemType: 'CartItemWithDiscounts',
    discounts: {
      subtotalAmount: '', // todo item level discounts
    },
  }))

  const discountAmount = centToString(
    validationResponse ? validationResponse.order?.discount_amount : 0
  )
  const grandPrice = centToString(
    validationResponse
      ? validationResponse.order?.total_amount
      : toCent(cart.summary.totalPrice)
  )
  const totalDiscountAmount = centToString(
    validationResponse
      ? validationResponse.order?.total_applied_discount_amount
      : 0
  )

  return {
    ...cart,
    cartType: 'CartWithDiscounts',
    summary: {
      ...cart.summary,
      discountAmount,
      totalDiscountAmount,
      grandPrice,
    },
    redeemables,
    items,
  }
}
