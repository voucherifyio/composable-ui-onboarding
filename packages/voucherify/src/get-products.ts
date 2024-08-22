import { getVoucherify } from './voucherify-config'

export const getProducts = async () => {
  try {
    const { products } = await getVoucherify().products.list()
    return products
  } catch (err) {
    return []
  }
}
