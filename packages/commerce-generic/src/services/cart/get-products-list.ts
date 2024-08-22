import { CommerceService } from '@composable/types'
import { getProducts } from '@composable/voucherify'

export const getProductsList: any = async () => {
  const productsList = await getProducts()

  return productsList?.filter((product) => product.metadata?.category)
}
