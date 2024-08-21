import { CommerceService } from '@composable/types'
import products from '@composable/data/src/products.json'

export const getProductBy: CommerceService['getProductBy'] = async ({
  slug,
}) => {
  return products.find((el) => el.slug === slug) ?? null
}
