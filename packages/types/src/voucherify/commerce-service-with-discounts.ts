import { CommerceService, Cart, CartItem } from '../commerce'
import { CartWithDiscounts } from './cart-with-discounts'

export interface CommerceServiceWithDiscounts extends CommerceService {
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
}
