import { CommerceService, CartWithDiscounts } from '@composable/types'
import { cartWithDiscount } from '../../data/cart-with-discount'
import { VoucherifyServerSide } from '@voucherify/sdk'
import { getCartDiscounts } from '../../data/persit'
import { validateCouponsAndPromotions } from '../validate-discounts'

export const deleteCartItemFunction =
  (
    commerceService: CommerceService,
    voucherify: ReturnType<typeof VoucherifyServerSide>
  ) =>
  async (
    ...props: Parameters<CommerceService['deleteCartItem']>
  ): Promise<CartWithDiscounts> => {
    const cart = await commerceService.deleteCartItem(...props)

    const codes = await getCartDiscounts(props[0].cartId)

    const { validationResult, promotionsResult } =
      await validateCouponsAndPromotions({
        voucherify,
        cart,
        codes,
      })

    return cartWithDiscount(cart, validationResult, promotionsResult)
  }
