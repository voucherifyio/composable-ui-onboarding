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
import { StackableRedeemableResultDiscountUnit } from '@voucherify/sdk/dist/types/Stackable'
import { injectContentfulContentToQualificationsRedeemables } from './contentful'

type ValidateDiscountsParam = {
  cart: Cart
  newCode?: string
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
): Promise<{
  promotionsResult: QualificationsRedeemable[]
  validationResult: ValidationValidateStackableResponse | false
  unitsToAdd?: StackableRedeemableResultDiscountUnit[]
  minimumProductUnits?: StackableRedeemableResultDiscountUnit[]
}> => {
  const { cart, newCode, voucherify, user, channel, dontApplyCodes } = params

  const appliedPromotionsIds =
    cart.promotionsApplied?.map((promotion) => promotion.id) || []
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
  const codes = _.uniq(
    _.compact([...appliedCodes, newCode, ...autoApplyCoupons])
  ).filter((code) => !(dontApplyCodes || []).includes(code))

  const newCoupons = _.compact([
    newCode,
    ...autoApplyCoupons.filter((code) => codes.includes(code)),
  ])
  if (!codes.length && !promotions?.length) {
    return { promotionsResult: promotions, validationResult: false }
  }
  const potentiallyNewPromotions = (
    await injectContentfulContentToQualificationsRedeemables(promotions)
  ).slice(
    0,
    isNaN(parseInt(process.env.NEXT_PUBLIC_MAX_NUMBER_OF_PROMOTIONS || ''))
      ? 30
      : parseInt(process.env.NEXT_PUBLIC_MAX_NUMBER_OF_PROMOTIONS || '')
  )

  const newPromotionsIds = potentiallyNewPromotions
    .filter((promotion) => !appliedPromotionsIds.includes(promotion.id))
    .map((promotion) => promotion.id)

  const validationResult = await voucherify.validations.validateStackable({
    redeemables: [
      ...getRedeemablesForValidationFromPromotions(potentiallyNewPromotions),
      ...getRedeemablesForValidation(
        codes.slice(
          0,
          isNaN(parseInt(process.env.NEXT_PUBLIC_MAX_NUMBER_OF_COUPONS || ''))
            ? 30
            : parseInt(process.env.NEXT_PUBLIC_MAX_NUMBER_OF_COUPONS || '')
        )
      ),
    ],
    order,
    customer: user ? userSessionToVoucherifyCustomer(user) : undefined,
    options: { expand: ['order'] },
  })

  const defaultUnitTypeRedeemablesResult: {
    unitsToAdd: StackableRedeemableResultDiscountUnit[]
    minimumProductUnits: StackableRedeemableResultDiscountUnit[]
  } = {
    unitsToAdd: [],
    minimumProductUnits: [],
  }

  const getUnitOff = (
    unit: StackableRedeemableResultDiscountUnit
  ): StackableRedeemableResultDiscountUnit => {
    return _.pick(unit, ['effect', 'unit_off', 'unit_type', 'sku', 'product'])
  }

  const {
    unitsToAdd,
    minimumProductUnits,
  }: {
    unitsToAdd: StackableRedeemableResultDiscountUnit[]
    minimumProductUnits: StackableRedeemableResultDiscountUnit[]
  } =
    validationResult?.redeemables
      ?.filter((redeemable) => redeemable.status === 'APPLICABLE')
      ?.reduce((acc, redeemable) => {
        const isNew =
          redeemable.object === 'voucher'
            ? newCoupons.includes(redeemable.id)
            : newPromotionsIds.includes(redeemable.id)
        if (redeemable.result?.discount?.type !== 'UNIT') {
          return acc
        }
        const units = redeemable.result.discount.units
          ? redeemable.result.discount.units.map(getUnitOff)
          : [
              getUnitOff(
                redeemable.result
                  .discount as StackableRedeemableResultDiscountUnit
              ),
            ]
        if (isNew) {
          acc.unitsToAdd.push(
            ...units.filter((unit) => unit.effect === 'ADD_NEW_ITEMS')
          )
        }
        acc.minimumProductUnits.push(...units)
        return acc
      }, defaultUnitTypeRedeemablesResult) || defaultUnitTypeRedeemablesResult

  return {
    promotionsResult: promotions,
    validationResult,
    unitsToAdd,
    minimumProductUnits,
  }
}
