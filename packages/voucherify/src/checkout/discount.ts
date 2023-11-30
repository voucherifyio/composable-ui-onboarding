import { Cart, Order } from '@composable/types'
import { cartToVoucherifyOrder } from '../../data/cart-to-voucherify-order'
import { voucherify } from '../voucherify-config'

export const addDiscountsToOrder = async (cart: Cart, order: Order) => {
  const redemptionResult = await redeemInVoucherify(cart)
  if (
    redemptionResult.redemptions.every(
      (redemption) => redemption.result === 'SUCCESS'
    )
  ) {
    order.redeemedPromotions = cart.promotionsApplied || []
    order.redeemedVouchers = cart.vouchersApplied || []
  } else {
    throw new Error('Redemption failed.')
  }
  return order
}

const redeemInVoucherify = async (cart: Cart) => {
  const voucherifyOrder = cartToVoucherifyOrder(cart)

  const vouchers = cart.vouchersApplied?.map((voucher) => ({
    id: voucher.code,
    object: 'voucher' as const,
  }))
  const promotions = cart.promotionsApplied?.map((promotion) => ({
    id: promotion.id,
    object: 'promotion_tier' as const,
  }))

  return await voucherify.redemptions.redeemStackable({
    redeemables: [...(vouchers || []), ...(promotions || [])],
    order: voucherifyOrder,
    options: { expand: ['order'] },
  })
}
