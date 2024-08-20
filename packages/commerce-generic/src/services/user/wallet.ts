import { CommerceService, UserSession } from '@composable/types'
import { getCustomerWallet } from '@composable/voucherify'

export const wallet: CommerceService['wallet'] = async ({
  user,
}: {
  user: UserSession
}) => {
  if (!user) {
    throw new Error('user not provided')
  }
  return await getCustomerWallet({ user })
}
