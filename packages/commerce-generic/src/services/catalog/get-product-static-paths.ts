import { CommerceService } from '@composable/types'
import products from '@composable/data/src/products.json'

export const getProductStaticPaths: CommerceService['getProductStaticPaths'] =
  async () => {
    return products.map((product) => {
      return {
        params: {
          slug: product.slug,
        },
      }
    })
  }
