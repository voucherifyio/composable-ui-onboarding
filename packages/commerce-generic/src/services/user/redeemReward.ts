import { CommerceService, UserSession } from '@composable/types'
import { redeemVoucherifyReward } from '@composable/voucherify'

export const redeemReward: CommerceService['redeemReward'] = async ({
  user,
  reward,
}: {
  user?: UserSession
  reward: {
    campaignId: string
    voucherId: string
    rewardId: string
    points?: number
  }
}) => {
  if (!user) {
    throw new Error('user not provided')
  }
  return await redeemVoucherifyReward({ user, reward })
}
