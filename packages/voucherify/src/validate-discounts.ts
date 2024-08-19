import { Cart, UserSession } from '@composable/types'
import {
  QualificationsRedeemable,
  ValidationValidateStackableResponse,
  VoucherifyServerSide,
} from '@voucherify/sdk'
import {
  getRedeemablesForValidation,
  getRedeemablesForValidationFromPromotions,
} from './get-redeemables-for-validation'
import { cartToVoucherifyOrder } from './cart-to-voucherify-order'
import { userSessionToVoucherifyCustomer } from './user-session-to-voucherify-customer'
import { addChannelToOrder } from './add-channel-to-voucherify-order'

type ValidateDiscountsParam = {
  cart: Cart
  code?: string
  voucherify: ReturnType<typeof VoucherifyServerSide>
  user?: UserSession
  channel?: string
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
  const { cart, code, voucherify, user, channel } = params

  const appliedCodes =
    cart.vouchersApplied?.map((voucher) => voucher.code) || []

  const order = addChannelToOrder(
    cartToVoucherifyOrder(
      cart,
      user ? userSessionToVoucherifyCustomer(user) : undefined
    ),
    channel
  )
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
      ...getRedeemablesForValidation(codes.slice(0, -1)),
      ...getRedeemablesForValidationFromPromotions(promotions.slice(0, 1)),
      ...getRedeemablesForValidation(codes.slice(-1)),
    ],
    order,
    customer: user ? userSessionToVoucherifyCustomer(user) : undefined,
    options: { expand: ['order'] },
  })

  return { promotionsResult: promotions, validationResult }
}
