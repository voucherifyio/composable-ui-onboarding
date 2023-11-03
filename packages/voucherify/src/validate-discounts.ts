import { Cart } from '@composable/types'
import {
  PromotionsValidateResponse,
  StackableRedeemableResponse,
  ValidationValidateStackableResponse,
  VoucherifyServerSide,
} from '@voucherify/sdk'
import {
  getRedeemmablesForValidation,
  getRedeemmablesForValidationFromPromotions,
} from '../data/get-redeemmables-for-validation'
import { cartToVoucherifyOrder } from './cart-to-voucherify-order'

type ValidateDiscountsParam = {
  cart: Cart
  codes: string[]
  voucherify: ReturnType<typeof VoucherifyServerSide>
}

export type validateCouponsAndPromotionsResponse = {
  promotionsResult: PromotionsValidateResponse
  validationResult: ValidateStackableResult
}

export type ValidateStackableResult =
  | false
  | (ValidationValidateStackableResponse & {
      inapplicable_redeemables?: StackableRedeemableResponse[]
    })

export const validateCouponsAndPromotions = async (
  params: ValidateDiscountsParam
): Promise<validateCouponsAndPromotionsResponse> => {
  const { cart, codes, voucherify } = params

  const order = cartToVoucherifyOrder(cart)

  const promotionsResult = await voucherify.promotions.validate({ order })

  if (!codes.length && !promotionsResult.promotions?.length) {
    return { promotionsResult, validationResult: false }
  }

  const validationResult = await voucherify.validations.validateStackable({
    redeemables: [
      ...getRedeemmablesForValidation(codes),
      ...getRedeemmablesForValidationFromPromotions(promotionsResult),
    ],
    order,
    options: { expand: ['order'] },
  })

  return { promotionsResult, validationResult }
}
