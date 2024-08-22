import {
  AlgoliaProduct,
  Cart,
  CartItem,
  Product,
  Promotion,
  Voucher,
} from '@composable/types'
import {
  PromotionsValidateResponse,
  QualificationsRedeemable,
  StackableRedeemableResponse,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk'
import { centToString, toCent } from './to-cent'
import { StackableRedeemableResultDiscountUnit } from '@voucherify/sdk/dist/types/Stackable'
import products from '@composable/data/src/products.json'
import * as _ from 'lodash'

const findProductById = (id: string) => {
  return products.find((product) => product.id === id) ?? products[0]
}

const generateCartItem = (
  productId: string | undefined,
  quantity: number,
  product?:
    | Omit<Product, 'updatedAt' | 'images'>
    | Omit<AlgoliaProduct, 'images'>
): CartItem => {
  const _product: any = product || findProductById(productId || '')
  return {
    brand: _product.brand,
    category: _product.category,
    id: _product.id,
    image: _product.images[0],
    name: _product.name,
    price: _product.price,
    tax: _product.price * 0, //0.07
    quantity: quantity ?? 1,
    sku: _product.sku,
    slug: _product.slug,
    type: _product.type,
  }
}

export const cartWithDiscount = (
  cart: Cart,
  validationResponse: ValidationValidateStackableResponse | false,
  promotions: QualificationsRedeemable[] | false,
  unitsToAdd?: StackableRedeemableResultDiscountUnit[],
  minimumProductUnits?: StackableRedeemableResultDiscountUnit[]
): Cart => {
  if (!validationResponse || !validationResponse.redeemables) {
    return {
      ...cart,
      items: cart.items.map((item) => ({ ...item, discount: 0 })),
      vouchersApplied: [],
      promotionsApplied: [],
      summary: { ...cart.summary, totalDiscountAmount: undefined },
      error: undefined,
    }
  }

  const promotionsApplied: Promotion[] = validationResponse.redeemables
    .filter((redeemable) => redeemable.object === 'promotion_tier')
    .map((redeemable) => mapRedeemableToPromotion(redeemable, promotions))

  const vouchers: Voucher[] = validationResponse.redeemables
    .filter(
      (redeemable) =>
        redeemable.object === 'voucher' && redeemable.status === 'APPLICABLE'
    )
    .map(mapRedeemableToVoucher)

  const totalDiscountAmount =
    validationResponse.order?.total_applied_discount_amount || 0
  const totalPrice = validationResponse.order?.total_amount || 0

  const getItemBySku = (
    sku: string,
    quantity: number
  ): CartItem | undefined => {
    const product = products.find((el) => el.sku === sku)
    if (!product) {
      console.log('no product')
      return
    }
    return generateCartItem(undefined, quantity, product)
  }
  const redeemables = validationResponse.redeemables.filter(
    (redeemable) => redeemable.status === 'APPLICABLE'
  )

  const mergeItems = (items: CartItem[]): CartItem[] =>
    Object.values(
      _.groupBy(
        items.filter((item) => item.sku),
        'sku'
      )
    ).map((sameItems: CartItem[]) =>
      sameItems.reduce((acc: undefined | CartItem, item: CartItem) => {
        if (!acc) {
          return item
        }
        acc.quantity += item.quantity
        return acc
      })
    )

  const unitsToItems = (
    units: StackableRedeemableResultDiscountUnit[] | undefined
  ): CartItem[] =>
    _.compact(
      units?.map((unit) =>
        unit.sku?.sku ? getItemBySku(unit.sku?.sku, unit.unit_off) : undefined
      )
    ) || []

  //cartItems with unitsToAdd
  const itemsAlreadyInCartAndNewItems = mergeItems([
    ...cart.items,
    ...unitsToItems(unitsToAdd),
  ])

  //check minimumProductUnits
  const itemsRequiredToBeInCart = mergeItems(unitsToItems(minimumProductUnits))

  let freeItemWasRemoved = false
  const cartItems = [
    ...itemsRequiredToBeInCart.map((item) => {
      const itemInCart = itemsAlreadyInCartAndNewItems.find(
        (_item) => _item.sku === item.sku
      )
      if (!itemInCart || itemInCart.quantity < item.quantity) {
        freeItemWasRemoved = true
        return item
      }
      return itemInCart
    }),
    ...itemsAlreadyInCartAndNewItems.filter(
      (item) =>
        !itemsRequiredToBeInCart.find(
          (minCartItem) => minCartItem.sku === item.sku
        )
    ),
  ]

  const discounts: { targetSku?: string; money: number }[] = []
  redeemables.forEach((coupon) => {
    let totalDiscountAmount =
      coupon?.order?.items_applied_discount_amount ||
      coupon.order?.applied_discount_amount ||
      0

    coupon.order?.items?.forEach((item) => {
      if (item.product_id === 'prod_5h1pp1ng') {
        return
      }

      if (
        item?.applied_discount_amount &&
        cartItems.find((cartItem) => cartItem.sku === item?.sku?.source_id)
      ) {
        discounts.push({
          targetSku: item?.sku?.source_id,
          money: item.applied_discount_amount,
        })
        totalDiscountAmount -= item.applied_discount_amount
      }
    })

    if (totalDiscountAmount) {
      discounts.push({
        money: totalDiscountAmount,
      })
    }
  })

  return {
    ...cart,
    items: cartItems.map((item) => {
      const itemDiscounts = discounts.filter(
        (discount) => discount.targetSku === item.sku
      )
      if (!itemDiscounts.length) {
        return { ...item, discount: 0 }
      }
      return {
        ...item,
        discount: itemDiscounts.reduce((acc, cur) => acc + cur.money, 0) / 100,
      }
    }),
    summary: {
      ...cart.summary,
      totalDiscountAmount: totalDiscountAmount / 100,
      totalPrice: totalPrice / 100,
    },
    vouchersApplied: vouchers,
    promotionsApplied,
    error: freeItemWasRemoved ? 'Free item cannot be removed' : undefined,
  }
}

const mapRedeemableToPromotion = (
  redeemable: StackableRedeemableResponse,
  promotions: QualificationsRedeemable[] | false
) => ({
  id: redeemable.id,
  discountAmount: centToString(
    redeemable.order?.total_applied_discount_amount ||
      redeemable.result?.discount?.amount_off ||
      redeemable.result?.discount?.percent_off ||
      0
  ),
  label:
    redeemable.object === 'promotion_tier'
      ? promotions
        ? promotions?.find((promotion) => promotion.id === redeemable.id)
            ?.banner ||
          promotions?.find((promotion) => promotion.id === redeemable.id)
            ?.name ||
          ''
        : redeemable.id
      : redeemable.id,
})

const mapRedeemableToVoucher = (redeemable: StackableRedeemableResponse) => ({
  code: redeemable.id,
  discountAmount: (redeemable.result?.discount?.amount_off || 0) / 100,
  label: redeemable.id,
})
