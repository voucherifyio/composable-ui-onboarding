import { AlgoliaProduct, Cart, CartItem, Product } from '@composable/types'
import products from '@composable/data/src/products.json'
import { randomUUID } from 'crypto'

const findProductById = (id: string) => {
  return products.find((product) => product.id === id) ?? products[0]
}

export const generateEmptyCart = (cartId?: string): Cart => ({
  id: cartId || randomUUID(),
  items: [],
  promotionsApplied: [],
  vouchersApplied: [],
  summary: {},
})

export const generateCartItem = (
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

export const calculateCartSummary = (
  cartItems: CartItem[]
): Cart['summary'] => {
  const subtotal = cartItems.reduce((_subtotal, item) => {
    return _subtotal + item.price * (item.quantity ?? 1)
  }, 0)
  const taxes = subtotal * 0 //0.07
  const total = subtotal + taxes

  return {
    subtotalPrice: subtotal,
    taxes: taxes,
    priceBeforeDiscount: total,
    totalDiscountAmount: 0,
    totalPrice: total,
    shipping: 'Free',
  }
}
