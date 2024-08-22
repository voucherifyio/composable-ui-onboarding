import { CustomerRedeemablesListItemResponse } from '@voucherify/sdk/dist/types/Customers'
import { Reward, RewardAssignment } from '@voucherify/sdk'

export type ExtendedRedeemable = CustomerRedeemablesListItemResponse & {
  rewards?: {
    reward: Reward
    assignment: RewardAssignment
    object: 'loyalty_reward'
  }[]
}
