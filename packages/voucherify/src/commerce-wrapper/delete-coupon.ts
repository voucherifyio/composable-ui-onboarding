import { CommerceService } from '@composable/types'
import { cartWithDiscount } from '../../data/cart-with-discount'
import { VoucherifyServerSide } from '@voucherify/sdk'
import { getCartDiscounts, saveCartDiscounts } from '../../data/persit'
import { validateDiscounts } from '../validate-discounts'

export const deleteCouponFunction =
  (
    commerceService: CommerceService,
    voucherify: ReturnType<typeof VoucherifyServerSide>
  ) =>
  async ({ cartId, coupon }: { cartId: string; coupon: string }) => {
    const cart = await commerceService.getCart({ cartId })

    if (!cart) {
      throw new Error('[voucherify][deleteCoupon] cart not found')
    }

    const codes = (await getCartDiscounts(cartId)).filter(
      (redeemable) => redeemable !== coupon
    )

    await saveCartDiscounts(cartId, codes)

    const validationResult = await validateDiscounts({
      voucherify,
      cart,
      codes,
    })

    return cartWithDiscount(cart, validationResult)
  }
