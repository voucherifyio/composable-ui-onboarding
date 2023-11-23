import { Cart } from '@composable/types'
import { redeemables } from '../../../data/redeemables.json'

export interface Discount {
  id: string
  object: string
}
type ValidateDiscountsParam = {
  cart: Cart
  discounts: Discount[]
}

type ValidateDiscountsResponse = any

export const validateDiscounts = async (
  params: ValidateDiscountsParam
): Promise<ValidateDiscountsResponse> => {
  const { cart, discounts } = params

  const promotionsToValidate = discounts.filter(
    (promotion) => promotion.object === 'promotion'
  )
  const vouchersToValidate = discounts.filter(
    (promotion) => promotion.object === 'voucher'
  )

  const promotions = await validatePromotions(cart, promotionsToValidate)
  const vouchers = await validateVouchers(cart, vouchersToValidate)

  return { promotions, vouchers }
}

const validateVouchers = async (cart: Cart, vouchers: Discount[]) => {
  const applicableVouchers = redeemables.filter(
    (redeemable) =>
      vouchers.find((voucher) => voucher.id === redeemable.id) &&
      redeemable.object === 'voucher' &&
      redeemable.status === 'APPLICABLE'
  )
  return applicableVouchers
}

const validatePromotions = async (cart: Cart, promotions: Discount[]) => {
  const applicablePromotions = redeemables.filter(
    (redeemable) =>
      promotions.find((promotion) => promotion.id === redeemable.id) &&
      redeemable.object === 'promotion_tier' &&
      redeemable.status === 'APPLICABLE'
  )
  return applicablePromotions
}
