import { CommerceService, CartWithDiscounts } from '@composable/types'
import { cartToVoucherifyOrder } from '../cart-to-voucherify-order'
import { cartWithDiscount } from '../../data/cart-with-discount'
import { hasAtLeastOneRedeemable } from '../../data/has-at-least-one-redeemable'
import { VoucherifyServerSide } from '@voucherify/sdk'
import { getRedeemmablesForValidation } from '../../data/get-redeemmables-for-validation'
import { getCartDiscounts } from '../../data/persit'

export const updateCartItemFunction =
  (
    commerceService: CommerceService,
    voucherify: ReturnType<typeof VoucherifyServerSide>
  ) =>
  async (
    ...props: Parameters<CommerceService['updateCartItem']>
  ): Promise<CartWithDiscounts> => {
    const cart = await commerceService.updateCartItem(...props)
    if (!cart) {
      return cart
    }

    const validationResponse = (await hasAtLeastOneRedeemable(props[0].cartId))
      ? await voucherify.validations.validateStackable({
          redeemables: getRedeemmablesForValidation(
            await getCartDiscounts(props[0].cartId)
          ),
          order: cartToVoucherifyOrder(cart),
        })
      : false

    return cartWithDiscount(cart, validationResponse)
  }
