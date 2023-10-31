import { CommerceService, CartWithDiscounts } from '@composable/types'
import { cartToVoucherifyOrder } from '../cart-to-voucherify-order'
import { cartWithDiscount } from '../../data/cart-with-discount'
import { hasAtLeastOneRedeemable } from '../../data/has-at-least-one-redeemable'
import {
  VoucherifyServerSide,
  ValidationValidateStackableResponse,
  StackableRedeemableResponse,
} from '@voucherify/sdk'
import { getRedeemmablesForValidation } from '../../data/get-redeemmables-for-validation'
import { getCartDiscounts, saveCartDiscounts } from '../../data/persit'

export const addCouponFunction =
  (
    commerceService: CommerceService,
    voucherify: ReturnType<typeof VoucherifyServerSide>
  ) =>
  async ({ cartId, coupon }: { cartId: string; coupon: string }) => {
    let errorMsg: string | undefined

    const cartDiscounts = await getCartDiscounts(cartId)

    const cart = await commerceService.getCart({ cartId })

    if (!cart) {
      throw new Error('[voucherify][addCoupon ] cart not found')
    }

    console.log(
      `[voucherify][addCoupon] Add coupon ${coupon} to cart ${cartId}`,
      cartDiscounts
    )

    console.log(
      'xxxxxx',
      getRedeemmablesForValidation([...cartDiscounts, coupon])
    )

    const validationResponse: // it's calculated incorrectly
    | false
      | (ValidationValidateStackableResponse & {
          inapplicable_redeemables?: StackableRedeemableResponse[]
        }) = await voucherify.validations.validateStackable({
      redeemables: getRedeemmablesForValidation([...cartDiscounts, coupon]),
      order: cartToVoucherifyOrder(cart),
    })

    const addedRedeembale =
      validationResponse && validationResponse.redeemables
        ? [
            ...validationResponse.redeemables,
            ...(validationResponse?.inapplicable_redeemables || []),
          ]?.find((redeemable) => redeemable.id === coupon)
        : false

    const result = addedRedeembale
      ? addedRedeembale.status === 'APPLICABLE'
      : false

    if (result) {
      await saveCartDiscounts(cartId, [...cartDiscounts, coupon])
    } else {
      errorMsg = addedRedeembale
        ? addedRedeembale.result?.error?.message
        : 'Redeemable not found in response from Voucherify'
    }

    return {
      cart: cartWithDiscount(cart, validationResponse),
      result,
      errorMsg,
    }
  }
