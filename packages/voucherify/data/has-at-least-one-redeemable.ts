import { getCartDiscounts } from './persit'

export const hasAtLeastOneRedeemable = async (cartId: string) => {
  const cartDiscountsStorage = await getCartDiscounts(cartId)
  return cartDiscountsStorage && cartDiscountsStorage.length > 0
}
