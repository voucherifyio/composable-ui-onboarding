import { CommerceService, CartWithDiscounts } from '@composable/types'
import { cartWithDiscount } from '../../data/cart-with-discount'
import { VoucherifyServerSide } from '@voucherify/sdk'
import { getCartDiscounts } from '../../data/persit'
import { validateDiscounts } from '../validate-discounts'

export const updateCartItemFunction =
  (
    commerceService: CommerceService,
    voucherify: ReturnType<typeof VoucherifyServerSide>
  ) =>
  async (
    ...props: Parameters<CommerceService['updateCartItem']>
  ): Promise<CartWithDiscounts> => {
    const cart = await commerceService.updateCartItem(...props)

    const codes = await getCartDiscounts(props[0].cartId)

    const validationResult = await validateDiscounts({
      voucherify,
      cart,
      codes,
    })

    return cartWithDiscount(cart, validationResult)
  }
