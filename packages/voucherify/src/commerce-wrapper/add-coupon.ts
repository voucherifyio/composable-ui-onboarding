import { CommerceService } from '@composable/types'
import { cartWithDiscount } from '../../data/cart-with-discount'
import { VoucherifyServerSide } from '@voucherify/sdk'
import { getCartDiscounts, saveCartDiscounts } from '../../data/persit'
import { validateCouponsAndPromotions } from '../validate-discounts'
import { isRedeemableApplicable } from './is-redeemable-applicable'

export const addCouponFunction =
  (
    commerceService: CommerceService,
    voucherify: ReturnType<typeof VoucherifyServerSide>
  ) =>
  async ({ cartId, coupon }: { cartId: string; coupon: string }) => {
    const cart = await commerceService.getCart({ cartId })

    if (!cart) {
      throw new Error(`[voucherify][addCoupon] cart not found by id: ${cartId}`)
    }

    const cartDiscounts = await getCartDiscounts(cartId)

    const { validationResult, promotionsResult } =
      await validateCouponsAndPromotions({
        cart,
        voucherify,
        codes: [...cartDiscounts, coupon],
      })

    const { isApplicable, error } = isRedeemableApplicable(
      coupon,
      validationResult
    )

    if (isApplicable) {
      await saveCartDiscounts(cartId, [...cartDiscounts, coupon])
    }

    return {
      cart: cartWithDiscount(cart, validationResult, promotionsResult),
      result: isApplicable,
      errorMsg: error,
    }
  }
