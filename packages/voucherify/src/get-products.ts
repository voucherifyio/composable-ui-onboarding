import { voucherify } from './voucherify-config'

export const getProducts = async () => {
  try {
    const { products } = await voucherify.products.list()
    return products
  } catch (err) {
    return []
  }
}
