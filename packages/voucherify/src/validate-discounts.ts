import { Cart } from '@composable/types'
import {
  PromotionsValidateResponse,
  QualificationsRedeemable,
  StackableRedeemableResponse,
  ValidationValidateStackableResponse,
  VoucherifyServerSide,
} from '@voucherify/sdk'
import {
  getRedeemablesForValidation,
  getRedeemablesForValidationFromPromotions,
} from './get-redeemables-for-validation'
import { cartToVoucherifyOrder } from './cart-to-voucherify-order'

type ValidateDiscountsParam = {
  cart: Cart
  code?: string
  voucherify: ReturnType<typeof VoucherifyServerSide>
  customer?: any
}

export type ValidateCouponsAndPromotionsResponse = {
  promotionsResult: QualificationsRedeemable[]
  validationResult: ValidateStackableResult
}

export type ValidateStackableResult =
  | false
  | ValidationValidateStackableResponse

export const validateCouponsAndPromotions = async (
  params: ValidateDiscountsParam
): Promise<ValidateCouponsAndPromotionsResponse> => {
  const { cart, code, voucherify } = params

  const appliedCodes =
    cart.vouchersApplied?.map((voucher) => voucher.code) || []

  const order = cartToVoucherifyOrder(cart)
  const codes = code ? [...appliedCodes, code] : appliedCodes

  const qualificationsResult = await voucherify.qualifications.checkEligibility(
    {
      order,
      customer: {},
      scenario: 'ALL',
      mode: 'BASIC',
      options: {
        sorting_rule: 'BEST_DEAL',
        filters: { resource_type: { conditions: { $is: ['promotion_tier'] } } },
        expand: ['redeemable'],
      },
    }
  )
  const promotions = qualificationsResult.redeemables.data
  if (!codes.length && !promotions?.length) {
    return { promotionsResult: promotions, validationResult: false }
  }

  const validationResult = await voucherify.validations.validateStackable({
    redeemables: [
      ...getRedeemablesForValidation(codes),
      ...getRedeemablesForValidationFromPromotions(promotions),
    ],
    order,
    options: { expand: ['order'] },
  })

  return { promotionsResult: promotions, validationResult }
}
