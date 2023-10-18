import { CommerceService, Cart, CartItem } from '../commerce'
import { CartWithDiscounts } from './cart-with-discounts'

export interface CommerceServiceWithDiscounts extends CommerceService {
  // Extend exisiting commerce service methods to return cart with applied discount detasils

  addCartItem(
    ...params: Parameters<CommerceService['addCartItem']>
  ): Promise<CartWithDiscounts>
  createCart(): Promise<CartWithDiscounts>
  deleteCartItem(
    ...params: Parameters<CommerceService['deleteCartItem']>
  ): Promise<CartWithDiscounts>
  getCart(
    ...params: Parameters<CommerceService['getCart']>
  ): Promise<CartWithDiscounts | null>
  updateCartItem(
    ...params: Parameters<CommerceService['updateCartItem']>
  ): Promise<CartWithDiscounts>

  // Additional commerce endpoints to manage applied coupons

  addCoupon(props: {
    coupon: string
    cartId: string
  }): Promise<{ cart: CartWithDiscounts; result: boolean; errorMsg?: string }>
  deleteCoupon(props: {
    coupon: string
    cartId: string
  }): Promise<CartWithDiscounts>
}
