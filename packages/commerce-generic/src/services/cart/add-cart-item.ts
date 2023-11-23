import { CommerceService } from '@composable/types'
import {
  getCart,
  getCartDiscounts,
  saveCart,
  saveCartDiscounts,
} from '../../data/mock-storage'
import {
  calculateCartSummary,
  generateCartItem,
  generateEmptyCart,
} from '../../data/generate-cart-data'
import { validateDiscounts } from './discounts'

export const addCartItem: CommerceService['addCartItem'] = async ({
  cartId,
  productId,
  quantity,
}) => {
  const cart = (await getCart(cartId)) || generateEmptyCart(cartId)

  const isProductInCartAlready = cart.items.some(
    (item) => item.id === productId
  )

  if (isProductInCartAlready) {
    cart.items.find((item) => item.id === productId)!.quantity++
  } else {
    const newItem = generateCartItem(productId, quantity)
    cart.items.push(newItem)
  }
  cart.summary = calculateCartSummary(cart.items)

  const defaultPromotion = [
    {
      id: 'COMPOSABLE_PROMO',
      status: 'APPLICABLE',
      label: '10$ OFF',
      discount: '10',
      object: 'promotion_tier',
    },
  ]

  //Add default promotion
  await saveCartDiscounts(cartId, defaultPromotion)

  const discounts = await getCartDiscounts(cartId)

  console.log('discounts', discounts)

  cart.redeemables = await validateDiscounts({ cart, discounts })

  return saveCart(cart)
}
