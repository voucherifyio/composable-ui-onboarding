import { CommerceService } from '@composable/types'
import { getCart as getCartFromStorage } from '../../data/mock-storage'

export const getCart: CommerceService['getCart'] = async ({ cartId }) => {
  if (!cartId) {
    return null
  }

  const cart = await getCartFromStorage(cartId)

  return cart || null
}
