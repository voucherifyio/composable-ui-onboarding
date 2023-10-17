import {
  Cart,
  CartItemWithDiscounts,
  CartWithDiscounts,
  CommerceService,
  CommerceServiceWithDiscounts,
  Redeemable,
} from '@composable/types'
import {
  OrdersCreate,
  ValidationValidateStackableResponse,
  VoucherifyServerSide,
} from '@voucherify/sdk'

if (
  !process.env.VOUCHERIFY_APPLICATION_ID ||
  !process.env.VOUCHERIFY_SECRET_KEY ||
  !process.env.VOUCHERIFY_API_URL
) {
  throw new Error('[voucherify] Missing configuration')
}

const voucherify = VoucherifyServerSide({
  applicationId: process.env.VOUCHERIFY_APPLICATION_ID,
  secretKey: process.env.VOUCHERIFY_SECRET_KEY,
  exposeErrorCause: true,
  apiUrl: process.env.VOUCHERIFY_API_URL,
  channel: 'ComposableUI',
})

const toCent = (amount: string | undefined | null): number => {
  if (!amount) {
    return 0
  }

  return Math.round(parseFloat(amount) * 100)
}

const centToString = (amount: number | null | undefined) => {
  if (!amount) {
    return ''
  }
  return Number(amount / 100).toString()
}

const cartWithDiscount = (
  cart: Cart,
  validationResponse: ValidationValidateStackableResponse | false
): CartWithDiscounts => {
  console.log(validationResponse)
  const redeemables: Redeemable[] = validationResponse
    ? validationResponse.redeemables || []
    : [] // todo filter onlyr equired attributes
  const items: CartItemWithDiscounts[] = cart.items.map((item) => ({
    ...item,
    cartItemType: 'CartItemWithDiscounts',
    discounts: {
      subtotalAmount: '', // todo item level discounts
    },
  }))

  const discountAmount = centToString(
    validationResponse ? validationResponse.order?.discount_amount : 0
  )
  const grandPrice = centToString(
    validationResponse
      ? validationResponse.order?.total_amount
      : toCent(cart.summary.totalPrice)
  )
  const totalDiscountAmount = centToString(
    validationResponse
      ? validationResponse.order?.total_applied_discount_amount
      : 0
  )

  return {
    ...cart,
    cartType: 'CartWithDiscounts',
    summary: {
      ...cart.summary,
      discountAmount,
      totalDiscountAmount,
      grandPrice,
    },
    redeemables,
    items,
  }
}

const cartToVoucherifyOrder = (cart: Cart): OrdersCreate => {
  return {
    amount: toCent(cart.summary.totalPrice),
    items: cart.items.map((item) => ({
      quantity: item.quantity,
      product_id: item.id,
      sku_id: item.sku,
      price: item.price,
    })),
  }
}

export const commerceWithDiscount = (
  commerceService: CommerceService
): CommerceServiceWithDiscounts => {
  console.log('[voucherify] wrapping commerce service')

  const getCart = async (
    ...props: Parameters<CommerceService['getCart']>
  ): Promise<CartWithDiscounts | null> => {
    const cart = await commerceService.getCart(...props)

    if (!cart) {
      return cart
    }

    const validationResponse = await voucherify.validations.validateStackable({
      redeemables: [{ object: 'voucher', id: '10%OFF' }],
      order: cartToVoucherifyOrder(cart),
    })

    return cartWithDiscount(cart, validationResponse)
  }

  const addCartItem = async (
    ...props: Parameters<CommerceService['addCartItem']>
  ): Promise<CartWithDiscounts> => {
    const cart = await commerceService.addCartItem(...props)
    if (!cart) {
      return cart
    }

    const validationResponse = await voucherify.validations.validateStackable({
      redeemables: [{ object: 'voucher', id: '10%OFF' }],
      order: cartToVoucherifyOrder(cart),
    })

    return cartWithDiscount(cart, validationResponse)
  }

  const createCart = async (
    ...props: Parameters<CommerceService['createCart']>
  ): Promise<CartWithDiscounts> => {
    const cart = await commerceService.createCart(...props)
    if (!cart) {
      return cart
    }

    const validationResponse = await voucherify.validations.validateStackable({
      redeemables: [{ object: 'voucher', id: '10%OFF' }],
      order: cartToVoucherifyOrder(cart),
    })

    return cartWithDiscount(cart, validationResponse)
  }

  const deleteCartItem = async (
    ...props: Parameters<CommerceService['deleteCartItem']>
  ): Promise<CartWithDiscounts> => {
    const cart = await commerceService.deleteCartItem(...props)
    if (!cart) {
      return cart
    }

    const validationResponse = await voucherify.validations.validateStackable({
      redeemables: [{ object: 'voucher', id: '10%OFF' }],
      order: cartToVoucherifyOrder(cart),
    })

    return cartWithDiscount(cart, validationResponse)
  }

  const updateCartItem = async (
    ...props: Parameters<CommerceService['updateCartItem']>
  ): Promise<CartWithDiscounts> => {
    const cart = await commerceService.updateCartItem(...props)
    if (!cart) {
      return cart
    }

    const validationResponse = await voucherify.validations.validateStackable({
      redeemables: [{ object: 'voucher', id: '10%OFF' }],
      order: cartToVoucherifyOrder(cart),
    })

    return cartWithDiscount(cart, validationResponse)
  }

  return {
    ...commerceService,
    getCart,
    addCartItem,
    createCart,
    deleteCartItem,
    updateCartItem,
  }
}
