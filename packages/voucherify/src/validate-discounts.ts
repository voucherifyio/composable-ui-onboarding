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
import * as _ from 'lodash'
import { injectContentfulContent } from './contentful'

type ValidateDiscountsParam = {
  cart: Cart
  code?: string
  voucherify: ReturnType<typeof VoucherifyServerSide>
  user?: UserSession
  channel?: string
  dontApplyCodes?: string[]
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
  const { cart, code, voucherify, user, channel, dontApplyCodes } = params

  const appliedCodes =
    cart.vouchersApplied?.map((voucher) => voucher.code) || []

  const order = addChannelToOrder(
    cartToVoucherifyOrder(
      cart,
      user ? userSessionToVoucherifyCustomer(user) : undefined
    ),
    channel
  )

  const qualificationsResult = await voucherify.qualifications.checkEligibility(
    {
      order,
      customer: user ? userSessionToVoucherifyCustomer(user) : undefined,
      scenario: 'ALL',
      mode: 'BASIC',
      options: {
        sorting_rule: 'BEST_DEAL',
        filters: {
          resource_type: { conditions: { $in: ['promotion_tier', 'voucher'] } },
        },
        expand: ['redeemable'],
      },
    }
  )

  const vouchers = qualificationsResult.redeemables.data.filter(
    (redeemable) => redeemable.object === 'voucher'
  )
  const autoApplyCoupons = vouchers
    .filter((voucher) => voucher.metadata?.autoApply === true)
    .map((voucher) => voucher.id)
  const promotions = qualificationsResult.redeemables.data.filter(
    (redeemable) => redeemable.object === 'promotion_tier'
  )

  const contentfulPromotions = await injectContentfulContent(promotions)

  const codes = _.difference(
    _.uniq(_.compact([...autoApplyCoupons, ...appliedCodes, code])).filter(
      (code) => !(dontApplyCodes || []).includes(code)
    )
  )

  if (!codes.length && !contentfulPromotions?.length) {
    return { promotionsResult: contentfulPromotions, validationResult: false }
  }

  const validationResult = await voucherify.validations.validateStackable({
    redeemables: [
      ...getRedeemablesForValidationFromPromotions(
        contentfulPromotions.slice(0, 1)
      ),
      ...getRedeemablesForValidation(codes),
    ],
    order,
    customer: user ? userSessionToVoucherifyCustomer(user) : undefined,
    options: { expand: ['order'] },
  })

  return { promotionsResult: contentfulPromotions, validationResult }
}
