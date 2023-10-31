import storage from 'node-persist'
import path from 'path'
import os from 'os'

const storageFolderPath = path.join(
  os.tmpdir(),
  'composable-ui-storage-voucherify'
)

const localStarege = storage.create()

localStarege.init({
  dir: storageFolderPath,
})

console.log(
  `[voucherify][persist] Local storage in folder ${storageFolderPath}`
)

export const getCartDiscounts = async (cartId: string): Promise<string[]> => {
  return (await localStarege.getItem(`cart-discounts-${cartId}`)) || []
}

export const saveCartDiscounts = async (
  cartId: string,
  discounts: string[]
) => {
  await localStarege.setItem(`cart-discounts-${cartId}`, discounts)
  return discounts
}

export const deleteCartDiscounts = async (cartId: string) => {
  const result = await localStarege.del(`cart-discounts-${cartId}`)
  return result.removed
}
