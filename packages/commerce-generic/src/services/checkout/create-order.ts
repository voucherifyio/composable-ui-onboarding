import { orderPaid } from '@composable/voucherify'
import { Cart, CheckoutInput, CommerceService, Order } from '@composable/types'
import { getCart } from '../../data/mock-storage'
import { saveOrder } from '../../data/mock-storage'
import shippingMethods from '../../data/shipping-methods.json'
import { randomUUID } from 'crypto'
import Analitycs from '@segment/analytics-node'

const getAnalitycs = () => {
  if (!process.env.SEGMENTIO_SOURCE_WRITE_KEY) {
    throw new Error('SEGMENTIO_SOURCE_WRITE_KEY not defined in env variables')
  }

  return new Analitycs({ writeKey: process.env.SEGMENTIO_SOURCE_WRITE_KEY })
}

const generateOrderFromCart = (
  cart: Cart,
  checkoutInput: CheckoutInput
): Order => {
  return {
    id: randomUUID(),
    status: 'complete',
    payment: 'unpaid',
    shipping: 'unfulfilled',
    customer: {
      email: checkoutInput.customer.email,
    },
    shipping_address: {
      phone_number: '',
      city: '',
      ...checkoutInput.shipping_address,
    },
    billing_address: {
      phone_number: '',
      city: '',
      ...checkoutInput.billing_address,
    },
    shipping_method: shippingMethods[0],
    created_at: Date.now(),
    items: cart.items,
    summary: cart.summary,
    vouchers_applied: cart.vouchersApplied || [],
    promotions_applied: cart.promotionsApplied || [],
  }
}

export const createOrder: CommerceService['createOrder'] = async ({
  checkout,
  user,
  channel,
}) => {
  const cart = await getCart(checkout.cartId)

  if (!cart) {
    throw new Error(
      `[createOrder] Could not find cart by id: ${checkout.cartId}`
    )
  }

  const updatedOrder = generateOrderFromCart(cart, checkout)
  /* Redemptions using Voucherify should only be performed when we receive information that the payment was successful.
    In this situation, the ‘payment’ property is always set as 'unpaid' (in 'generateOrderFromCart'),
    so to simulate the correct behavior, the ‘payment’ value was changed here to 'paid' and the ‘orderPaid’ function was called to trigger the redemptions process.*/
  /* Redemptions using Voucherify should only be performed when we receive information that the payment was successful.
    In this situation, the ‘payment’ property is always set as 'unpaid' (in 'generateOrderFromCart'),
    so to simulate the correct behavior, the ‘payment’ value was changed here to 'paid' and the ‘orderPaid’ function was called to trigger the redemptions process.*/
  updatedOrder.payment = 'paid'
  const voucherifyOrderId = await orderPaid(updatedOrder, user, channel)

  if (user?.email) {
    const analitycs = getAnalitycs()
    analitycs.track({
      userId: user.email,
      event: 'Order placed',
      properties: {
        voucherifyOrderId,
        channel,
      },
    })
  }

  // return await saveOrder(updatedOrder)
  return { ...(await saveOrder(updatedOrder)), voucherifyOrderId }
}
