import { getVoucherify } from './voucherify-config'

export const getProduct = async (productId: string) => {
  try {
    const product = await getVoucherify().products.get(productId)
    return product
  } catch (err) {
    return null
  }
}
