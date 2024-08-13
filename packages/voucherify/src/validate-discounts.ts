import { Cart, UserSession } from '@composable/types'
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
import { userSessionToVoucherifyCustomer } from './user-session-to-voucherify-customer'

type ValidateDiscountsParam = {
  cart: Cart
  code?: string
  voucherify: ReturnType<typeof VoucherifyServerSide>
  user?: UserSession
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
  const { cart, code, voucherify, user } = params

  const appliedCodes =
    cart.vouchersApplied?.map((voucher) => voucher.code) || []

  const order = cartToVoucherifyOrder(cart)
  const codes = code ? [...appliedCodes, code] : appliedCodes

  const qualificationsResult = await voucherify.qualifications.checkEligibility(
    {
      order,
      customer: user ? userSessionToVoucherifyCustomer(user) : undefined,
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
      ...getRedeemablesForValidationFromPromotions(promotions.slice(0,1)),
    ],
    order,
    customer: user ? userSessionToVoucherifyCustomer(user) : undefined,
    options: { expand: ['order'] },
  })

  return { promotionsResult: promotions, validationResult }
}
