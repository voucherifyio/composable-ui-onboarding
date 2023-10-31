import { CommerceService, CartWithDiscounts } from '@composable/types'
import { cartToVoucherifyOrder } from '../cart-to-voucherify-order'
import { cartWithDiscount } from '../../data/cart-with-discount'
import { hasAtLeastOneRedeemable } from '../../data/has-at-least-one-redeemable'
import { VoucherifyServerSide } from '@voucherify/sdk'
import { getRedeemmablesForValidation } from '../../data/get-redeemmables-for-validation'
import { getCartDiscounts } from '../../data/persit'

export const deleteCouponFunction =
  (
    commerceService: CommerceService,
    voucherify: ReturnType<typeof VoucherifyServerSide>
  ) =>
  async ({ cartId, coupon }: { cartId: string; coupon: string }) => {
    const cartDiscounts = (await getCartDiscounts(cartId)).filter(
      (redeemable) => redeemable !== coupon
    )

    const cart = await commerceService.getCart({ cartId })

    if (!cart) {
      throw new Error('[voucherify][deleteCoupon] cart not found')
    }

    console.log(
      `[voucherify][deleteCoupon] Delete coupon ${coupon} from cart ${cartId}`
    )

    const validationResponse = (await hasAtLeastOneRedeemable(cartId))
      ? await voucherify.validations.validateStackable({
          redeemables: getRedeemmablesForValidation(cartDiscounts),
          order: cartToVoucherifyOrder(cart),
        })
      : false

    return cartWithDiscount(cart, validationResponse)
  }
