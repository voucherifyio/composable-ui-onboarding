import { Cart, Order, UserSession } from '@composable/types'
import { validateCouponsAndPromotions } from './validate-discounts'
import { isRedeemableApplicable } from './is-redeemable-applicable'
import { cartWithDiscount } from './cart-with-discount'
import { voucherify } from './voucherify-config'
import { orderToVoucherifyOrder } from './order-to-voucherify-order'
import { userSessionToVoucherifyCustomer } from './user-session-to-voucherify-customer'

export const deleteVoucherFromCart = async (
  cart: Cart,
  code: string,
  user?: UserSession
): Promise<{ cart: Cart; success: boolean; errorMessage?: string }> => {
  const cartAfterDeletion: Cart = {
    ...cart,
    vouchersApplied: cart.vouchersApplied?.filter(
      (voucher) => voucher.code !== code
    ),
  }
  const updatedCart = await updateCartDiscount(cartAfterDeletion, user)
  return {
    cart: updatedCart,
    success: true,
  }
}

export const updateCartDiscount = async (cart: Cart, user?: UserSession): Promise<Cart> => {
  const { validationResult, promotionsResult } =
    await validateCouponsAndPromotions({
      cart,
      voucherify,
      user,
    })
  return cartWithDiscount(cart, validationResult, promotionsResult)
}

export const addVoucherToCart = async (
  cart: Cart,
  code: string,
  user?: UserSession,
): Promise<{ cart: Cart; success: boolean; errorMessage?: string }> => {
  if (cart.vouchersApplied?.some((voucher) => voucher.code === code)) {
    return {
      cart,
      success: false,
      errorMessage: 'Voucher is already applied',
    }
  }
  const { validationResult, promotionsResult } =
    await validateCouponsAndPromotions({
      cart,
      code,
      voucherify,
      user,
    })

  const { isApplicable, error } = isRedeemableApplicable(code, validationResult)

  if (isApplicable) {
    const updatedCart = cartWithDiscount(
      cart,
      validationResult,
      promotionsResult
    )
    return {
      cart: updatedCart,
      success: isApplicable,
    }
  }

  return {
    cart,
    success: isApplicable,
    errorMessage: error || 'This voucher is not applicable',
  }
}

export const orderPaid = async (order: Order, user?: UserSession) => {
  const voucherifyOrder = orderToVoucherifyOrder(order, user)

  const vouchers = order.vouchers_applied?.map((voucher) => ({
    id: voucher.code,
    object: 'voucher' as const,
  }))
  const promotions = order.promotions_applied?.map((promotion) => ({
    id: promotion.id,
    object: 'promotion_tier' as const,
  }))
  const redeemables = [...(vouchers || []), ...(promotions || [])]
  if(redeemables.length === 0) {
    return await voucherify.orders.create(voucherifyOrder)
  }

  //TODO if no discount, create order/do not redeem
  return await voucherify.redemptions.redeemStackable({
    redeemables,
    order: voucherifyOrder,
    customer: voucherifyOrder.customer,
    options: { expand: ['order'] },
  })
}
