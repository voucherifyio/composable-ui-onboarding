import { CommerceService, CartWithDiscounts } from '@composable/types'
import { cartWithDiscount } from '../../data/cart-with-discount'
import { VoucherifyServerSide } from '@voucherify/sdk'

export const createCartFunction =
  (
    commerceService: CommerceService,
    voucherify: ReturnType<typeof VoucherifyServerSide>
  ) =>
  async (
    ...props: Parameters<CommerceService['createCart']>
  ): Promise<CartWithDiscounts> => {
    const cart = await commerceService.createCart(...props)

    return cartWithDiscount(cart, false, false)
  }
