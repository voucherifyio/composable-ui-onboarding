import { Cart, CheckoutInput, CommerceService, Order } from '@composable/types'
import { getCart } from '../../data/mock-storage'
import { saveOrder } from '../../data/mock-storage'
import shippingMethods from '../../data/shipping-methods.json'
import { randomUUID } from 'crypto'
import { addDiscountsToOrder } from './discount'

const generateOrderFromCart = (
  cart: Cart,
  checkoutInput: CheckoutInput,
  status: string,
  payment: string
): Order => {
  return {
    id: randomUUID(),
    payment: payment,
    status: status,
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
    redeemedVouchers: [],
    redeemedPromotions: [],
  }
}

export const createOrder: CommerceService['createOrder'] = async ({
  checkout,
  status,
  payment,
}) => {
  const cart = await getCart(checkout.cartId)

  if (!cart) {
    throw new Error(
      `[createOrder] Could not find cart by id: ${checkout.cartId}`
    )
  }

  const updatedOrder = generateOrderFromCart(cart, checkout, status, payment)

  if (
    updatedOrder.status === 'complete' &&
    (updatedOrder.payment === 'paid' ||
      updatedOrder.payment === 'pay-on-delivery') &&
    (cart?.vouchersApplied || cart?.promotionsApplied)
  ) {
    const orderWithDiscounts = await addDiscountsToOrder(cart, updatedOrder)
    return await saveOrder(orderWithDiscounts)
  }

  return await saveOrder(updatedOrder)
}
