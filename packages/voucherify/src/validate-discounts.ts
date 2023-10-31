import { Cart } from '@composable/types'
import {
  StackableRedeemableResponse,
  ValidationValidateStackableResponse,
  VoucherifyServerSide,
} from '@voucherify/sdk'
import { getRedeemmablesForValidation } from '../data/get-redeemmables-for-validation'
import { cartToVoucherifyOrder } from './cart-to-voucherify-order'

type ValidateDiscountsParam = {
  cart: Cart
  codes: string[]
  voucherify: ReturnType<typeof VoucherifyServerSide>
}

export type ValidationResponse =
  | false
  | (ValidationValidateStackableResponse & {
      inapplicable_redeemables?: StackableRedeemableResponse[]
    })

export const validateDiscounts = async (
  params: ValidateDiscountsParam
): Promise<ValidationResponse> => {
  const { cart, codes, voucherify } = params
  if (!codes.length) {
    return false
  }
  return voucherify.validations.validateStackable({
    redeemables: getRedeemmablesForValidation(codes),
    order: cartToVoucherifyOrder(cart),
  })
}
