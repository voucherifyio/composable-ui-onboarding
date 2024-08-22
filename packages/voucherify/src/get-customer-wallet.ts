import { getVoucherify } from './voucherify-config'
import { ExtendedRedeemable, UserSession } from '@composable/types'
import { CustomerRedeemablesListItemResponse } from '@voucherify/sdk/dist/types/Customers'
import {
  injectContentfulContentToRedeemablesVouchers,
  injectContentfulContentToVoucher,
} from './contentful'
import { LoyaltiesListMemberRewardsResponseBody } from '@voucherify/sdk'
import { Reward, RewardAssignment } from '@voucherify/sdk/dist/types/Rewards'

export const getCustomerWallet = async ({ user }: { user: UserSession }) => {
  const customerId = user?.voucherifyId || user?.sourceId
  if (!customerId) {
    throw new Error('customerId not provided')
  }
  const redeemables = (
    (
      await getVoucherify().customers.listRedeemables(customerId, {
        limit: 100,
      })
    )?.data || []
  ).filter(
    (redeemable) =>
      redeemable?.redeemable?.voucher &&
      redeemable.redeemable.voucher.active !== false
  )

  const contentfulRedeemables =
    await injectContentfulContentToRedeemablesVouchers(redeemables)

  const redeemablesExtended: ExtendedRedeemable[] = await asyncMap(
    contentfulRedeemables,
    async (redeemable: CustomerRedeemablesListItemResponse) => {
      if (
        redeemable.voucher_type !== 'LOYALTY_CARD' ||
        !redeemable.redeemable?.voucher?.id
      ) {
        return redeemable
      }
      const rewards: LoyaltiesListMemberRewardsResponseBody['data'] =
        await asyncMap(
          (
            (
              await getVoucherify().loyalties.listMemberRewards(
                redeemable.redeemable?.voucher?.id,
                { limit: 100 }
              )
            )?.data || []
          ).filter((reward) => reward.reward.type === 'CAMPAIGN'),
          async (reward: {
            reward: Reward
            assignment: RewardAssignment
            object: 'loyalty_reward'
          }) => {
            if ('voucher' in reward.reward && reward.reward.voucher) {
              reward.reward.voucher = await injectContentfulContentToVoucher(
                reward.reward.voucher
              )
            }
            return reward
          }
        )
      return { ...redeemable, rewards }
    }
  )

  return { redeemables: redeemablesExtended }
}

export function asyncMap(
  arr: any[],
  asyncFn: (...args: any[]) => Promise<any>
) {
  return Promise.all(arr.map(asyncFn))
}
