import { getVoucherify } from './voucherify-config'
import { UserSession } from '@composable/types'
import { LoyaltiesRedeemRewardResponse } from '@voucherify/sdk'

export const redeemVoucherifyReward = async ({
  user,
  reward,
}: {
  user: UserSession
  reward: {
    campaignId: string
    voucherId: string
    rewardId: string
    points?: number
  }
}): Promise<LoyaltiesRedeemRewardResponse | undefined> => {
  const customerId = user?.voucherifyId || user?.sourceId
  if (!customerId) {
    throw new Error('customerId not provided')
  }
  const result = await getVoucherify().loyalties.redeemReward(
    reward.campaignId,
    reward.voucherId,
    {
      reward: { id: reward.rewardId },
      metadata: { autoRedeem: true },
    }
  )

  if (
    result.result !== 'SUCCESS' ||
    result.reward.type !== 'CAMPAIGN' ||
    !result.reward?.voucher
  ) {
    return
  }

  const voucher = result.reward.voucher
  const metadata = (
    await getVoucherify().vouchers.update({
      code: voucher.code,
      metadata: { autoApply: true },
    })
  )?.metadata
  if (!metadata) {
    return result
  }
  result.reward.voucher.metadata = metadata

  return result
}
