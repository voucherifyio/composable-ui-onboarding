import {
  Cart,
  CartWithDiscounts,
  CommerceService,
  CommerceServiceWithDiscounts,
} from '@composable/types'
import {
  ApplicableToResultList,
  StackableRedeemableResponse,
  ValidationValidateStackableResponse,
  VoucherifyServerSide,
} from '@voucherify/sdk'
import { cartWithDiscount } from './cart-with-discount'
import { cartToVoucherifyOrder } from './cart-to-voucherify-order'

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

type CartDiscountsStorage = {
  [cartId: string]: string[]
}

/**
 * In memory storage that presist coupons for specific cart
 */
const cartDiscountsStorage: CartDiscountsStorage = {
  '7a6dd462-24dc-11ed-861d-0242ac120002': ['10%OFF'], // example cart discount
}

const hasAtLeastOneRedeemable = (cartId: string) => {
  console.log({ cartId, cartDiscountsStorage })
  return cartDiscountsStorage[cartId] && cartDiscountsStorage[cartId].length
}

const getRedeemmablesForValidation = (couponCodes: string[]) =>
  couponCodes.map((couponCode) => ({
    id: couponCode,
    object: 'voucher' as const,
  }))

export const commerceWithDiscount = (
  commerceService: CommerceService
): CommerceServiceWithDiscounts => {
  console.log('[voucherify] wrapping commerce service', cartDiscountsStorage)

  const getCart = async (
    ...props: Parameters<CommerceService['getCart']>
  ): Promise<CartWithDiscounts | null> => {
    const cart = await commerceService.getCart(...props)

    if (!cart) {
      return cart
    }

    const validationResponse = hasAtLeastOneRedeemable(props[0].cartId)
      ? await voucherify.validations.validateStackable({
          redeemables: getRedeemmablesForValidation(
            cartDiscountsStorage[props[0].cartId]
          ),
          order: cartToVoucherifyOrder(cart),
        })
      : false

    return cartWithDiscount(cart, validationResponse)
  }

  const addCartItem = async (
    ...props: Parameters<CommerceService['addCartItem']>
  ): Promise<CartWithDiscounts> => {
    const cart = await commerceService.addCartItem(...props)
    if (!cart) {
      return cart
    }

    const validationResponse = hasAtLeastOneRedeemable(props[0].cartId)
      ? await voucherify.validations.validateStackable({
          redeemables: getRedeemmablesForValidation(
            cartDiscountsStorage[props[0].cartId]
          ),
          order: cartToVoucherifyOrder(cart),
        })
      : false

    return cartWithDiscount(cart, validationResponse)
  }

  const createCart = async (
    ...props: Parameters<CommerceService['createCart']>
  ): Promise<CartWithDiscounts> => {
    const cart = await commerceService.createCart(...props)

    return cartWithDiscount(cart, false)
  }

  const deleteCartItem = async (
    ...props: Parameters<CommerceService['deleteCartItem']>
  ): Promise<CartWithDiscounts> => {
    const cart = await commerceService.deleteCartItem(...props)
    if (!cart) {
      return cart
    }

    const validationResponse = hasAtLeastOneRedeemable(props[0].cartId)
      ? await voucherify.validations.validateStackable({
          redeemables: getRedeemmablesForValidation(
            cartDiscountsStorage[props[0].cartId]
          ),
          order: cartToVoucherifyOrder(cart),
        })
      : false

    return cartWithDiscount(cart, validationResponse)
  }

  const updateCartItem = async (
    ...props: Parameters<CommerceService['updateCartItem']>
  ): Promise<CartWithDiscounts> => {
    const cart = await commerceService.updateCartItem(...props)
    if (!cart) {
      return cart
    }

    const validationResponse = hasAtLeastOneRedeemable(props[0].cartId)
      ? await voucherify.validations.validateStackable({
          redeemables: getRedeemmablesForValidation(
            cartDiscountsStorage[props[0].cartId]
          ),
          order: cartToVoucherifyOrder(cart),
        })
      : false

    return cartWithDiscount(cart, validationResponse)
  }

  const addCoupon = async ({
    cartId,
    coupon,
  }: {
    cartId: string
    coupon: string
  }) => {
    let errorMsg: string | undefined

    if (!cartDiscountsStorage[cartId]) {
      cartDiscountsStorage[cartId] = []
    }

    const cart = await commerceService.getCart({ cartId })

    if (!cart) {
      throw new Error('[voucherify][addCoupon ] cart not found')
    }

    console.log(
      `[voucherify][addCoupon] Add coupon ${coupon} to cart ${cartId}`
    )

    const validationResponse:
      | false
      | (ValidationValidateStackableResponse & {
          inapplicable_redeemables?: StackableRedeemableResponse[]
        }) = hasAtLeastOneRedeemable(cartId)
      ? await voucherify.validations.validateStackable({
          redeemables: getRedeemmablesForValidation([
            ...cartDiscountsStorage[cartId],
            coupon,
          ]),
          order: cartToVoucherifyOrder(cart),
        })
      : false

    console.log(`[voucherify][addCoupon] valiadtion result`, validationResponse)

    const addedRedeembale =
      validationResponse && validationResponse.redeemables
        ? [
            ...validationResponse.redeemables,
            ...(validationResponse?.inapplicable_redeemables || []),
          ]?.find((redeemable) => redeemable.id === coupon)
        : false

    const result = addedRedeembale
      ? addedRedeembale.status === 'APPLICABLE'
      : false

    console.log({ result })
    if (result) {
      cartDiscountsStorage[cartId].push(coupon)
    } else {
      errorMsg = addedRedeembale
        ? addedRedeembale.result?.error?.message
        : 'Redeemable not found in response from Voucherify'
    }

    return {
      cart: cartWithDiscount(cart, validationResponse),
      result,
      errorMsg,
    }
  }

  const deleteCoupon = async ({
    cartId,
    coupon,
  }: {
    cartId: string
    coupon: string
  }) => {
    if (cartDiscountsStorage[cartId]) {
      cartDiscountsStorage[cartId] = cartDiscountsStorage[cartId].filter(
        (redeemable) => redeemable !== coupon
      )
    }
    const cart = await commerceService.getCart({ cartId })

    if (!cart) {
      throw new Error('[voucherify][deleteCoupon] cart not found')
    }

    console.log(
      `[voucherify][deleteCoupon] Delete coupon ${coupon} from cart ${cartId}`
    )

    const validationResponse = hasAtLeastOneRedeemable(cartId)
      ? await voucherify.validations.validateStackable({
          redeemables: getRedeemmablesForValidation(
            cartDiscountsStorage[cartId]
          ),
          order: cartToVoucherifyOrder(cart),
        })
      : false

    return cartWithDiscount(cart, validationResponse)
  }

  return {
    ...commerceService,
    getCart,
    addCartItem,
    createCart,
    deleteCartItem,
    updateCartItem,
    addCoupon,
    deleteCoupon,
  }
}
